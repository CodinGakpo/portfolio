---
project: shieldstream
label: Verification
title: Three Bottlenecks and a Dozen Guide Bugs
description: Almost every real defect in this project was found by running something and reading what actually happened — not by reading the code and assuming it worked.
order: 4
---

## The Test Surface

| Layer | Count | Covers |
| --- | --- | --- |
| Gateway unit | 23 | Rate limiter correctness and latency, policy matching, event emission, the in-memory fallback limiter, health |
| Consumer unit | 35 | Signature rules including a benign `select` that must *not* false-positive, the ReDoS timing bound, cold start, spike and eviction behaviour, deduplication under burst and expiry, RPS bucketing, aggregation |
| End-to-end | 9 Playwright specs | Black-box auth, proxying, rate limiting, and a real browser WebSocket against the live dashboard |
| Load | Locust | 0 to 1,000 concurrent users over 60s, held 5 minutes, weighted mix of 70% GET, 25% POST, 5% SQL-injection probe |
| Chaos | 3-phase script | Baseline, a real Redis outage mid-traffic, recovery |

The rate limiter's unit tests run against `fakeredis[lua]`, which executes the **actual Lua script** through a real embedded Lua interpreter rather than a Python reimplementation of what it is supposed to do. That distinction matters: a suite validating behaviour against a hand-rolled reimplementation is really testing that the reimplementation matches the author's understanding of the script — a test that would pass even if the atomicity guarantee were broken.

## Proving the Limiter Cannot Over-Admit

The whole reason for choosing one atomic Lua script over a careful sequence of calls was a specific claim: under real concurrency, this cannot over-admit.

A hundred concurrent async calls fired at once via `asyncio.gather()` — genuinely concurrent, not a sequential loop dressed up to look concurrent — against a limit of ten produced exactly ten allowed and ninety blocked. Sequential calls could never have exposed a race even if one existed. That same proof was then run **fifty times in a row**, fifty passes out of fifty, because a race that only appears under scheduling luck is exactly the kind of bug a single passing run hides.

Live, non-mocked Redis round-trip latency for the script call: 0.116ms p50, 0.206ms p99.

## Three Bottlenecks a Code Review Would Never Have Found

The first load-test run failed almost completely — a **63.7% error rate**, average latency around thirteen seconds. Three separate ceilings, found one at a time, each invisible until the one before it was fixed:

| Bottleneck | Symptom | Cause |
| --- | --- | --- |
| Upstream HTTP connection pool | Roughly 900 requests queuing for a slot that never came, blowing the 2s acquisition timeout | A hard cap of 100 concurrent connections — entirely adequate through every prior week, since nothing before had generated more than a few dozen |
| Database connection pool | `QueuePool limit of size 10 overflow 5 reached` | A real thundering herd. A fixed API key with a 30s cache TTL means new concurrent connections arriving faster than the cache warms all fall through to Postgres at once — exactly what a ramp-up, or a real flash crowd, does |
| Container file-descriptor limit | `OSError(24, 'Too many open files')`, logged by asyncio itself rather than surfacing as a clean 500 | The default soft limit of 1,024, exhausted by 1,000 client sockets plus upstream, database and Redis connections competing for descriptors |

A fourth issue was self-inflicted in the tooling: the load-test tenant's limit was configured as 5,000 requests over a 60-second window, which — read correctly against the limiter's actual semantics, a *count* inside a window rather than a per-second rate — is about 83 requests per second. Real 429s were mixing into the failure data meant to isolate the other three. Fixed by setting the window to one second, so the configuration's name and its behaviour finally agreed.

**After all three fixes: a 0.005% error rate — two failures out of 47,311 requests.**

## The Latency Number That Missed Its Target

Reported as measured, including the part that missed: **p50 came in at 4.2 seconds and p99 at 33 seconds**, against targets of 15 and 50 *milliseconds*.

This was not reframed as a partial success. The cause was confirmed directly with `docker stats`: the gateway's single CPU core sat at roughly 100% for the entire five-minute hold, and response times climbed monotonically throughout — median starting around 350ms at the beginning of the ramp and passing four seconds by the end. That is the textbook signature of sustained overload, where the arrival rate exceeds one process's service rate and the queue never drains.

It is a capacity ceiling of *this deployment shape* — one uvicorn worker, one container, this hardware — not evidence the application is inefficient. Per-request overhead measured in isolation, at a concurrency the downstream target could actually sustain, is around six milliseconds, and that number did not change. The real mitigation is horizontal scaling, already proven live across independent gateway replicas, and that is treated as the actual answer rather than chasing a single-process configuration that was never going to reach millisecond latency at this concurrency.

## Killing Redis On Purpose

![ShieldStream fail-open degradation](asset:shieldstream-fail-open)

The design intent was that a Redis outage keeps requests flowing rather than failing them. Testing that only by mocking the client's exceptions is not sufficient — so the container was actually stopped, live, mid-traffic. That surfaced **three real defects no mocked-exception test would have caught**:

**Authentication had no Redis error handling at all.** The tenant-lookup cache read was completely unguarded, so a Redis outage 500'd *every request* before the rate limiter's carefully built fail-open logic ever got a turn — authentication runs first in the dependency chain and was failing hard before execution reached the code meant to degrade gracefully. Fixed by falling through to Postgres, authentication's actual source of truth, and swallowing failures on the cache-repopulation write. This is not fail-open in the security sense; the key is still genuinely checked against the database. It is making the cache layer resilient enough that the downstream fail-open logic ever executes.

**No socket timeout on the Redis client.** Against a fully stopped container, a client with no configured timeout can hang for tens of seconds on an OS-level TCP timeout before a `RedisError` surfaces. A fail-open design that takes thirty seconds per request to trigger is not preserving availability — it is replacing a clean fast failure with a slow silent one, which from the caller's side is often worse. Fixed with explicit 0.2-second connect and socket timeouts.

**A genuine uvloop and async-DNS interaction bug**, caused by the fast-timeout fix above. With uvloop installed, a timed-out Redis connection attempt left the process's async DNS machinery in a state where the *next, completely unrelated* lookup — httpx resolving the proxy target for the next request — also failed, consistently, for the full connect timeout. Captured precisely: a Jaeger span showed the failure taking 2002.1ms against a configured 2.0-second budget, which is what made it clear this was deterministic rather than flaky. Isolated outside the application entirely — a minimal script under default asyncio never reproduced it, the identical script with `uvloop.install()` reproduced it every run. Fixed bluntly with `--loop asyncio`, giving up uvloop's throughput specifically to get correctness during the exact failure this work exists to handle. For a project whose point is provable correctness under failure, that is the right trade, made with eyes open.

The root cause was never traced to a specific line inside uvloop or anyio — that would need bisecting their source — but it was conclusively isolated to that layer by a controlled, repeatable reproduction.

## The Chaos Run, Including the Part That Did Not Work

The very first chaos run produced an incomplete result, and the cause was in the script rather than the system. Locust's headless mode exits non-zero whenever a run records any failures — a reasonable default, and exactly the expected outcome of an outage phase *designed* to produce failures. The script used `set -e`, so the moment the outage phase correctly recorded failures, the script stopped dead and silently skipped the recovery phase and the summary. A script bug that would have made every future run *look* complete while quietly reporting nothing.

With all three phases actually running, the result was uneventful where it mattered: **zero evidence of the fail-open logic itself ever failing.** Every request during the outage logged that the tenant cache, the policy cache and the limiter's Redis call were all unavailable, and each path degraded exactly as designed. No uncaught exception traced back to any of them. The database pool, widened earlier, held even though every request was now hitting Postgres twice.

One hypothesis is worth recording precisely because it **did not** pan out: that verbose debug logging was adding enough event-loop overhead to explain the upstream timeouts, and quieting it during the outage would reduce the failure rate. The experiment was run. It showed no clear improvement — if anything the failure rate was higher on that run, most plausibly ordinary variance on shared single-core hardware, since one comparison run cannot distinguish signal from noise. The default was reverted, because there was no evidence to justify changing a working one.

Both consumers crashed outright the moment Redis was killed, with a plain `ConnectionError` — neither has the outer reconnect-with-backoff wrapper the gateway's Pub/Sub listener has. Restarting them by hand turned into an unplanned second verification: the analytics consumer's crash-recovery logic, previously proven through a deliberately staged kill, now proved itself under a real unstaged crash and behaved identically — pending entries drained completely, zero loss, zero duplication. This was left as a finding rather than a code change, because the production plan already restarts services automatically, while the local stack deliberately sets no restart policy anywhere so a crash surfaces for a developer to look at instead of being masked by a restart loop.

## A Dozen Bugs in the Source Material Itself

This system was built from a set of structured implementation guides. Roughly a dozen distinct defects in the guides' own pseudocode surfaced along the way — not typos, but the specific kind of mistake pseudocode gets away with because it never actually runs, never gets killed mid-flight, never gets hit by two concurrent requests at once.

| Guide defect | Consequence had it shipped |
| --- | --- |
| RLS verification performed as the schema-owning role | A completely broken policy and a working one look identical. Tenant isolation could have been inert with no symptom |
| Policy-update endpoint with no `tenant_id` in its `WHERE` clause | A textbook IDOR — any authenticated tenant could patch any other tenant's policy by enumerating ids |
| Cache invalidation reconstructing keys from the glob pattern rather than the literal request path | The keys never collide. Invalidation would fire, run, `DEL` nothing, and appear to work while doing precisely nothing |
| Rate limiting wired as Starlette middleware | `AttributeError` on the very first request — middleware runs before FastAPI resolves `Depends()` |
| Alert-consumer worker as non-runnable pseudocode | Imports from paths that do not exist, four undefined functions, and a final acknowledgment step whose nested comprehension would not parse |
| Acknowledging only matched messages | The pending-entries list grows without bound on entirely normal traffic |
| Signature scanning over concatenated fields | End-anchored rules silently neutralized by content in the adjacent field |
| Crash-recovery logic that loses data on the first real restart | Silent event loss exactly when a consumer crashes |

Even the IDOR fix needed a second half: the fallback path that runs when the update matches zero rows had to re-check existence scoped by tenant too. Without that, a cross-tenant request could still distinguish "does not exist" from "exists but is not yours" by the error code, leaking another tenant's ids while correctly blocking the write. Both cases now return a plain 404 — verified by patching one tenant's policy id with a different tenant's key and confirming 404, not 403 and not 200.

The guides were still genuinely valuable: they set direction, named the right problems in the right order, and got most of the shape of each solution right. "The guide says so" was simply never treated as a stopping point for verification.

## Environment Bugs Worth Naming

**SELinux's exclusive bind-mount flag.** The `:Z` flag grants exclusive relabeled access to exactly one container. Scaling the gateway to two replicas failed the second one outright with `Could not import module "app.main"` — both were bind-mounting the same source directory exclusively, and the second could not read it. The identical bug turned out to be already latent between the two consumers, which had always shared a mount; it simply had not manifested, because it depends on a cold-start race. Fixed with lowercase `:z` — shared relabeling, SELinux still enforcing.

**A shared Redis client tuned for the wrong job.** The hot-path client's aggressive 0.2-second timeout is exactly right for fail-open on the request path, and exactly wrong for `pubsub.listen()`, a call that is *supposed* to block waiting for the next message — the same timeout makes a healthy idle connection look dead, producing a constant reconnect storm. Fixed with a second client, no aggressive timeout, used only by the invalidation listener and the dashboard fan-out.

**A transitive dependency that only resolved by luck.** `greenlet`, required by SQLAlchemy's async engine, silently failed to resolve in the host virtual environment despite being present in the Docker image. Now pinned explicitly rather than relied on transitively.
