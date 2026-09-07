---
project: shieldstream
projectName: ShieldStream
tagline: A Distributed API Security Gateway, Verified by Breaking It
label: Overview
title: Product Overview
description: What ShieldStream is, what kind of project it honestly is, and the design instinct that shows up in four separate subsystems.
order: 1
---

## What is ShieldStream?

A multi-tenant API security gateway. A request arrives with a tenant API key, gets authenticated, matched against that tenant's rate-limit policy, checked by an atomic distributed limiter, and proxied to the tenant's upstream. Every request — allowed or rejected — emits one event onto a Redis Stream, which two structurally independent consumers drain: one counting analytics into a TimescaleDB hypertable, one running two tiers of threat detection and pushing deduplicated alerts to a live operator dashboard.

It is built for API providers who need to protect an upstream service from abuse or attack traffic without adding meaningful latency to the requests that aren't attacks.

## Not an ML Project

The "anomaly detection" is an exponentially weighted moving average and a z-score — roughly fifty lines of arithmetic, no trained model, no model file, no training phase. It is operational from the very first event.

This is stated up front rather than left ambiguous, because "real-time threat detection with statistical anomaly scoring" is a phrase that invites a reader to assume machine learning, and that assumption would be wrong. The detector is a cheap, interpretable heuristic. Its own alerts are tagged MEDIUM rather than HIGH precisely because a statistical deviation means *unusual*, not *malicious* — and the project would rather say so than dress it up.

## The Decision That Shapes Everything

**Assume every dependency will fail, and make the primary path degrade into a slower path that was already correct on its own.**

This was never adopted as a methodology. It got rediscovered independently in four different subsystems, which is the only reason it is worth naming:

- Redis being unreachable degrades the rate limiter to an in-memory fallback, and degrades authentication and policy lookups to hitting Postgres directly. The gateway never goes down.
- Policy hot-reload pushes invalidations over Redis Pub/Sub, but the ten-second TTL underneath is never removed. Pub/Sub has no delivery guarantee and no replay, so a design that trusted it alone would go permanently stale on one missed message. Instead a missed message degrades to "stale for up to ten seconds" — the behaviour that already worked.
- A crashed consumer recovers its own pending work on restart, with zero coordination.
- The signature tier and the statistical tier are structurally different detectors, so an attacker who evades one still has to evade the other.

The cost is that nothing here is ever the fastest possible version of itself. Fail-open costs a stacked 0.2-second timeout per Redis-dependent stage during an outage. The TTL keeps running even when Pub/Sub is working perfectly. Both are paid deliberately.

## The Shape of the System

| Component | Role | Built with |
| --- | --- | --- |
| `gateway` | Reverse proxy, authentication, policy engine, rate limiter, admin API, dashboard WebSocket | FastAPI, async, port 8000 |
| `consumers/analytics` | Durable counting into TimescaleDB, idempotent, scales horizontally | Python, Redis Streams consumer group |
| `consumers/alerts` | Two-tier detection, deduplication, alert publishing. Single replica by design | Python, Redis Streams + Pub/Sub |
| `dashboard` | Live operator view — RPS chart and alert feed over a native WebSocket | Next.js, TypeScript, Recharts |
| `db` | Schema, the TimescaleDB hypertable, Row-Level Security, two database roles | Alembic migrations |

Every directory maps to a deployable unit with its own Dockerfile. That structure is why a slow database write in the analytics consumer can never compete with a live proxied request for the same event loop — they don't share one.

## Key Features

- **Atomic distributed rate limiting.** A sliding-window log on a Redis sorted set, with the entire check-then-act sequence expressed as one Lua script. The race is closed by construction, not by careful call ordering.
- **Row-Level Security enforced from the governed role.** Tenant isolation is a property the database enforces, not a `WHERE` clause every future engineer has to remember.
- **Two-tier detection.** OWASP regex signatures for known attack shapes, plus a per-endpoint statistical baseline for traffic that is merely unusual — with the second tier's real sensitivity limit measured and documented rather than hidden.
- **Events genuinely off the critical path.** Emission is fire-and-forget via `asyncio.create_task`, and appears in no Jaeger span. Not "fast" — invisible.
- **Chaos-tested fail-open.** The Redis container is stopped mid-traffic under real concurrent load, and every request still returns 200.
- **Sub-second policy hot-reload with a correctness backstop.** Pub/Sub propagation in roughly 0.1 seconds, on top of a TTL that never goes away.

## Status, Stated Plainly

All twelve planned phases are implemented and verified running — locally and under Docker Compose — including load testing at 1,000 concurrent users, a three-phase chaos run, a Playwright end-to-end suite driving a real browser, and a CI pipeline publishing images to GHCR.

**The production deployment is prepared, not provisioned.** Everything under `infra/` — the production Compose file, the Caddy configuration, the runbook, the environment template — is written to be executed by someone with real credentials. No VM has been provisioned, no Neon branch created, no Vercel project deployed. The runbook is a runbook, not a record.

That distinction is kept sharp deliberately, because the difference between "this configuration is correct" and "this configuration has actually been run" is exactly the gap this project spent twenty chapters closing everywhere it was possible to close it.
