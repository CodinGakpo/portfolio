---
project: shieldstream
projectName: ShieldStream
tagline: Distributed API Security Gateway with Real-Time Threat Detection
label: Overview
title: Product Overview
description: What ShieldStream is, who it protects, and what kind of project it actually is.
order: 1
---

## What is ShieldStream?

A distributed API security gateway: a reverse proxy, atomic Redis-backed sliding-window rate limiting, two-tier real-time threat detection (OWASP signatures plus statistical anomaly scoring), and a live WebSocket operator dashboard. Built for API providers who need to protect an upstream service from abuse or attack traffic without adding meaningful latency.

## Not an ML Project

The "anomaly detection" is a from-scratch statistical method — EWMA plus z-score — not a trained model. That is stated explicitly here so the project is not mis-tagged as AI/ML. It combines with OWASP regex signatures in a two-tier scheme: signatures catch known-shape HIGH-severity attacks, and statistical scoring catches MEDIUM-severity traffic that is unusual but not necessarily malicious.

## Key Features

- **Atomic distributed rate limiting.** A single Redis Lua script does check-then-act as one atomic unit, proven with 100 concurrent requests against a limit of 10, repeated 50 times with zero flakiness.
- **Chaos-tested fail-open design.** The Redis container is killed live under real traffic, and every request still returns 200 instead of 500ing or hanging.
- **Cross-process distributed tracing.** One Jaeger trace spans the gateway and a completely separate analytics-consumer process reading the same event off a Redis Stream.
- **Load-tested at 1,000 concurrent users**, with three real bottlenecks found and fixed from the test's own failure output.
- **Sub-second policy hot-reload with a correctness backstop.** Pub/Sub propagation in roughly 0.1s, with a 10s cache TTL underneath as a safety net.
