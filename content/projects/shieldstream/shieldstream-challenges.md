---
project: shieldstream
label: Challenges & Fixes
title: Problems Found, and How They Were Solved
description: The source implementation blueprint's own pseudocode had real bugs — every one below was found by running the system, not by reading the code and assuming it worked.
order: 3
---

## Problem to Solution

| Problem | Solution |
| --- | --- |
| Naive rate limiters allow a 2x burst at window boundaries, or race under concurrency. | Sliding-window log on a Redis Sorted Set; the whole check-and-write sequence runs as one atomic Lua script. |
| An unconditional database dependency serialized requests under concurrency, even on cache hits. | Removed the blanket FastAPI `Depends()`; a database session is only opened inside the actual cache-miss branch. |
| Killing Redis live surfaced 30-second hangs and a uvloop/DNS interaction bug poisoning unrelated lookups. | Explicit 0.2s socket timeouts everywhere; switched to `--loop asyncio` instead of uvloop, a documented throughput-for-correctness trade. |
| TimescaleDB continuous aggregates are incompatible with Row-Level Security. | Replaced the continuous aggregate with a plain RLS-protected table, populated by a periodic idempotent upsert from a trusted worker role. |
| Random-consumer-name crash recovery left messages permanently stuck. | A stable per-process consumer name, so a restart drains its own pending entries instantly. `XAUTOCLAIM` is kept only as a backstop. |
| The admin policy-update endpoint had no tenant scoping — a cross-tenant IDOR. | Scoped the update and its not-found fallback by `tenant_id`, returning a plain 404 rather than leaking that another tenant's record exists. |
