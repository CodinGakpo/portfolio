---
project: shieldstream
label: Methodology
title: Engineering Process, Not Just a Feature List
description: Why the debugging methodology behind ShieldStream is arguably the most portfolio-relevant part of the repo.
order: 4
---

## A Real-Time Architectural Decision Log

ShieldStream was built end to end from a set of structured implementation guides — a twelve-phase blueprint. The interesting part is not following the plan, it is everywhere the plan was wrong and had to be caught and fixed: a broken RLS setup that would have silently allowed cross-tenant data leakage, a rate-limiter middleware ordering bug that would crash on the first request, a cache-invalidation function reconstructing a Redis key that never existed, a cross-tenant IDOR in the admin policy-update endpoint, and an alert-consumer worker script that was non-runnable pseudocode.

Every one of these was found by actually running the system under load or by deliberately killing dependencies mid-traffic, not by reading the code and assuming it worked. Every fix, alternative considered, and trade-off accepted is logged in a running architectural decision record (`DECISIONS.md`, roughly 400 lines) as it happened, not written up after the fact. It is evidence of a debugging methodology — reproduce, isolate, fix, verify live, repeat — rather than just a feature list.

## Real Artifacts, Not Just Claims

The load-test results are committed in-repo as a static HTML report rather than quoted as a bare number, and the decision log is linked directly below rather than paraphrased. Both are meant to be checked, not taken on faith.
