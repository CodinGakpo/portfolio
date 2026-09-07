---
project: shieldstream
label: Architecture
title: The Request Path and the Event Fan-Out
description: One atomic Lua script, one stream feeding two independent consumers, and a tenant-isolation guarantee the database enforces rather than the programmer.
order: 2
---

## The Request Path

![ShieldStream request path and event fan-out](asset:shieldstream-request-path)

Authentication, policy lookup and rate limiting are **FastAPI dependencies, not middleware** — and that is a correction, not a preference. Starlette's middleware chain runs *before* FastAPI resolves a route's `Depends()` parameters, so middleware that reads `request.state.tenant` finds nothing there. Wired as middleware, the rate limiter raises `AttributeError` on the very first request that reaches it. As a dependency declaring `tenant = Depends(get_tenant)` as a sub-dependency, the order is driven by the dependency graph rather than by hoping registration order lines up with an implicit assumption.

The module still lives in a directory named `middleware/` for continuity with the original design, with the reason written into its own docstring so the name doesn't read as an accident.

## The Rate Limiter, and Why Each Simpler Option Fails

| Approach | Why it was rejected |
| --- | --- |
| Fixed-window counting | Allows a full limit's worth of requests at the end of one window and again at the start of the next — up to 2x the intended limit across the boundary. The window resets sharply; traffic doesn't |
| Sliding-window log as separate Redis calls | A race. Two concurrent requests can both read "9 of 10, proceed" before either writes. `MULTI`/`EXEC` is atomic *within* one transaction, not isolated *between* two |
| Token bucket | Genuinely strong, and set aside for two specific reasons: its state is one opaque number rather than a replayable log, so "why was I limited just now" has no precise answer; and a correct distributed implementation adds refill-timing complexity that wasn't needed |
| `WATCH`-based optimistic locking | Works, but trades the race for retry-storm risk under contention and pushes complexity into every caller |

**The decision:** a sliding-window log stored as a Redis sorted set — one member per request, scored by timestamp — with the whole `ZREMRANGEBYSCORE` → `ZCARD` → conditional `ZADD` + `PEXPIRE` sequence as a single Lua script, invoked via `EVALSHA` with a `NoScriptError` fallback that reloads and retries once.

The race is eliminated because Redis executes a Lua script to completion as one atomic unit — no other client's command, not even another script, can interleave. Atomicity by construction rather than by discipline.

**Its cost, named:** the sorted set stores one entry per in-window request, roughly 64 bytes each, growing with traffic. At high per-key volume across many distinct keys this stops being the cheap option; the migration path would be approximate counting or a move to token bucket where exact request-level replay isn't needed. At this project's scale it was never close to the limiting factor.

## Tenant Isolation the Database Enforces

The obvious approach — every query includes `WHERE tenant_id = ?` — works exactly as long as every engineer, on every query, forever, remembers the clause. One miss, in one endpoint added eighteen months later, and isolation is gone silently: no error, no crash, just the wrong rows.

PostgreSQL Row-Level Security moves that guarantee into the database. But RLS has a trap that makes it silently inert: **it does not apply to the table's owning role**, or to any role with `BYPASSRLS`. A verification test run as the migration owner passes identically whether the policy works or is completely broken.

So the schema defines two non-owner roles:

| Role | Used by | Grants |
| --- | --- | --- |
| `shieldstream_app` | The gateway's request path | RLS-bound. `SELECT` on tenants and policies, `SELECT`/`INSERT`/`UPDATE` on `request_metrics` |
| `shieldstream_worker` | The consumers and the admin policy API | `BYPASSRLS`, deliberately — the analytics consumer's micro-batched upsert writes for dozens of tenants in one statement, which is structurally incompatible with a session-scoped tenant context |

`request_metrics` also gets `FORCE ROW LEVEL SECURITY`, not just `ENABLE`, because plain `ENABLE` still exempts the table owner.

**The trade, stated:** `BYPASSRLS` means a bug in consumer code could in principle cross-write another tenant's rows. That is a deliberate boundary, not an oversight. What protects that table on the worker side isn't RLS — it's that exactly one small, audited process ever writes to it. RLS protects the surface where an unbounded amount of *future* code will run.

The test that matters connects as `shieldstream_app`, sets one tenant's id, and runs a bare `SELECT * FROM request_metrics` with no `WHERE` clause at all. Another tenant's row, inserted moments earlier, simply isn't in the result — not filtered out, invisible.

## Events Off the Critical Path

The constraint was strict: emitting event data has to be *invisible* in the latency histogram, not merely fast.

A synchronous Postgres write puts a second storage system's latency on the client's path. A Redis List was rejected for a sharper reason — `LPOP` is destructive, and this system needs two independent readers, which would mean either duplicated producer writes or a fan-out layer. Redis Streams with consumer groups give publish-once, consume-independently as a native primitive. Even awaiting the `XADD` inline was rejected: fast-but-synchronous is still synchronous, and during any Redis stall an inline `await` blocks the response on exactly the write this design exists to keep off the path.

`emit_event()` schedules the `XADD` via `asyncio.create_task()` and returns. Two sharp edges came with that:

- **Task garbage collection.** The event loop holds only a *weak* reference to a task from `create_task()`. Without a strong reference elsewhere, the collector may collect an unfinished task and silently cancel the write in progress — intermittently, depending on scheduling and memory pressure. Fixed with a module-level set holding a strong reference, cleared via `add_done_callback`.
- **Silent exceptions.** A fire-and-forget task's exception propagates nowhere: no crash, no log, no counter. The same callback inspects `task.exception()` and turns a failure into a log line and a dedicated Prometheus counter.

Two smaller decisions worth naming. **The 429 path emits its own event** before short-circuiting, because otherwise exactly the traffic a security gateway most needs visibility into — what it is actively rejecting — would be absent from analytics. Those events carry `latency_ms=0.0` by convention, and the analytics consumer excludes rate-limited events from latency percentiles, so a wall of blocked requests during an attack can't corrupt p50 and p99 precisely when they matter.

**Client IPs are hashed at the point of origin** — `SHA-256(ip + per-tenant salt)`, truncated to 16 hex characters, before the address ever leaves the request handler. No downstream component ever has the *option* to mishandle a raw address. The salt is per-tenant rather than global, so the same client hashes differently across tenants — cross-tenant correlation is impossible by construction, while the hash stays stable within a tenant, which is exactly what the anomaly detector needs.

## Hot-Reloading Policy Without Losing the Backstop

A ten-second policy TTL is fine for routine changes and badly wrong for an operator tightening a limit mid-incident. Pub/Sub invalidation fixes that — and becomes the wrong design the moment it *replaces* the TTL, because Pub/Sub has no delivery guarantee, no queue and no replay. A subscriber that is briefly disconnected never sees the message, and a missed message would mean permanently stale policy with nothing left to correct it.

So Pub/Sub is a latency optimization only. The TTL never goes away, and a lost invalidation degrades to "stale for up to ten seconds" rather than stale forever.

Verified both ways: through the admin endpoint, a limit dropped from 100 to 2 took effect in 0.126 seconds. Then the backstop itself was tested by updating a policy through raw SQL, deliberately bypassing the publish step — the gateway kept enforcing the old limit for several seconds and then picked up the new one the instant the TTL expired, with no signal from anywhere.

## Horizontal Scaling

The gateway holds no per-process state that matters. Rate-limit state is in Redis; dashboard fan-out rides Redis Pub/Sub. Verified live with two replicas on separate ports: a SQL-injection probe routed through replica A produced an identical alert delivered to a dashboard client connected to replica B — which is only possible if the Pub/Sub bridge is doing the work rather than anything living inside one gateway process.
