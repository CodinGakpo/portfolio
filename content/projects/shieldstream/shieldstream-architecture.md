---
project: shieldstream
label: Architecture
title: System Architecture
description: The technology stack and the event-driven design behind the gateway.
order: 2
---

## Technology Stack

| Layer | Technology |
| --- | --- |
| Backend | Python, FastAPI (async), Redis (Lua scripting, Streams, Pub/Sub) |
| Database | PostgreSQL (Neon, serverless) with TimescaleDB hypertables; Row-Level Security across two distinct database roles |
| Frontend | Next.js (App Router, TypeScript, Tailwind), Recharts, native browser WebSocket |
| Auth | Per-tenant API keys, SHA-256 hashed with indexed lookup |
| Infrastructure (prepared, not provisioned) | Docker Compose; target is an always-free VM plus Neon, Vercel, Caddy and GHCR |
| CI/CD | GitHub Actions — builds and publishes images to GHCR |
| Observability | Prometheus (cardinality-disciplined), Grafana, Jaeger, structlog with contextvars |
| Testing | pytest, Playwright (black-box E2E including real-browser WebSocket), Locust, custom chaos scripts |

## Event-Driven Fan-Out

The gateway writes every proxied request as one event to a Redis Stream, consumed independently by two consumer groups with zero producer coupling.

The **analytics consumer** is at-least-once with an idempotent upsert into TimescaleDB, so a replay on crash produces duplicates, never losses. The **alert consumer** runs two-tier detection, deduplicated Alertmanager-style so a 50-probe attack burst collapses to one alert. Client IPs are salted-hashed at the point of origin, so no raw IP ever leaves the edge.

The alert consumer runs single-replica by design — its rate baseline is only correct if one process sees the whole stream — while the analytics consumer scales horizontally, since its counting is idempotent.
