---
project: shieldstream
label: Documentation
title: Running and Operating ShieldStream
description: The local stack, the service and port map, configuration, the deployment plan and exactly how far it has actually been taken.
order: 5
---

## Prerequisites

| Tool | Requirement |
| --- | --- |
| Docker and Docker Compose | Current version — this is the whole local runtime |
| Node | Only for the dashboard and the Playwright end-to-end suite |
| Python | 3.11+, only for running gateway or consumer tests outside a container |

Local development is Docker Compose rather than bare-metal installs or a local Kubernetes. Bare metal is exactly the dev/prod parity gap that produces "works on my machine" bugs, and for a stack this size nothing would enforce that versions, startup order or configuration match a real deployment. Local Kubernetes solves a scaling problem this project does not have, and charges a scheduler, a control plane and the cost of learning to debug them for a capability nothing here asked for.

Every service carries an explicit `healthcheck`, with `depends_on: condition: service_healthy` wired between anything with a real startup-order dependency — the gateway should not accept traffic before Postgres can actually answer queries, not merely before its container has started.

## The Service and Port Map

| Service | Port | Notes |
| --- | --- | --- |
| `gateway` | 8000 | FastAPI reverse proxy, admin API, dashboard WebSocket |
| `postgres` | 5433 → 5432 | `timescale/timescaledb:2.17.2-pg16` |
| `redis` | 6379 | `redis:7.4-alpine` |
| `analytics-consumer` | 9100 | Prometheus scrape target |
| `alert-consumer` | — | Single replica by design |
| `httpbin` | 9000 → 80 | The stand-in upstream for local testing |
| `jaeger` | 16686 (UI), 4317 (OTLP gRPC) | Distributed tracing |
| `prometheus` | 9090 | Cardinality-disciplined metrics |
| `grafana` | 3001 → 3000 | Dashboards and alerting |
| `migrate` | — | One-shot Alembic migration runner |

The dashboard runs separately as a Next.js app. `loadtest` is a profile-gated Locust service rather than part of the default stack.

## Configuration

| Variable | Purpose |
| --- | --- |
| `REDIS_URL` | Caches, the sliding-window sorted set, the event stream and Pub/Sub |
| `DATABASE_URL` | The gateway's runtime identity — `shieldstream_app`, the RLS-governed role |
| `ADMIN_DATABASE_URL` | `shieldstream_worker`, the `BYPASSRLS` role used by consumers and the admin API |
| `RATE_LIMIT_FAIL_OPEN` | Whether an unreachable Redis allows traffic through or rejects it |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | Jaeger's OTLP gRPC receiver |
| `LOG_LEVEL` | Defaults to `debug` locally — deliberately verbose, and a measured cost under heavy load |

The two database URLs being genuinely different roles is the point, not boilerplate. If the gateway ran as the owner or as the worker, Row-Level Security would be silently inert.

## Observability

Prometheus scrapes the gateway and the analytics consumer; Grafana renders dashboards and holds alert rules; Jaeger receives traces over OTLP. Structured logging uses `structlog` with `contextvars`, so a request id propagates through the call stack without being threaded manually through every function signature.

Metric cardinality is treated as a design constraint rather than an afterthought — labels are kept to bounded sets, because an unbounded label such as a raw path or a client identifier is the standard way a Prometheus instance is accidentally destroyed by its own instrumentation.

One trace spans process boundaries: a single Jaeger trace covers the gateway and the entirely separate analytics-consumer process reading the same event off the stream, which is what makes the fan-out actually debuggable rather than merely designed.

## CI

GitHub Actions runs lint for the gateway, the consumers and the dashboard; unit tests for the gateway and consumers; a container build publishing to GHCR; a security scan; and then migrate, deploy and smoke-test stages.

Those last three are written and wired but have never run against real infrastructure, for the reason in the next section.

## The Deployment Plan, and Exactly How Far It Has Been Taken

The original blueprint specified an entirely AWS-native production deployment — CloudFormation, ECS Fargate, RDS, ElastiCache, an Application Load Balancer. Coherent and defensible, and roughly $65 a month by its own estimate, indefinitely, for a portfolio project with no revenue behind it.

The chosen alternative is a hybrid, effectively free-tier shape:

| Concern | Choice | Why |
| --- | --- | --- |
| Compute | One always-free VM running the stack under Docker Compose | The same tool as local development, so the two stay the same shape rather than merely similar |
| Postgres | Neon, managed free tier | A managed provider's backup and durability story is genuinely stronger than anything worth self-managing at this scale |
| Dashboard | Vercel static hosting | Close to free, and removes an entire deployment target from the VM |
| TLS and routing | Caddy instead of an ALB | Automatic certificate provisioning and renewal, reverse proxying and transparent WebSocket upgrades, all built in, with none of the AWS-specific machinery an ALB assumes around it |
| Observability | Grafana, Prometheus and Jaeger stay self-hosted on the VM | Already free to run, with no clear benefit to paying for a hosted equivalent |

One flagged risk in that plan sat unresolved for a while: whether Neon supports the TimescaleDB extension the schema depends on. Checked against Neon's own documentation rather than carried forward as an open question, the answer was better than the risk implied — Neon does support `timescaledb` for the Apache-2 licensed tier, and this schema only ever uses that tier. The one genuinely unavailable feature, continuous aggregates, had already been abandoned much earlier for an entirely unrelated reason: it is structurally incompatible with Row-Level Security regardless of the host. A decision made for one reason happened to already avoid the gap that would have mattered here, so the migration needs no schema changes at all.

**None of it has been run.** Everything under `infra/` — the production Compose file, the Caddyfile, the runbook, the environment template — is prepared, not provisioned. No VM exists, no Neon branch has been created, no Vercel project deployed. `infra/DEPLOY.md` is written to be executed by a human with real credentials; it is not a record of something already completed.

The next real step is running it against actual accounts and reporting what actually happened — the same way everything else here was reported.

## Failure Modes Worth Recognising

| Symptom | Likely cause |
| --- | --- |
| Every request returns 500 immediately after starting the stack | Migrations have not run. The `migrate` service is one-shot and the gateway needs the schema and both roles to exist |
| Requests succeed but the dashboard stays empty | The alert consumer is not running, or is running more than one replica. It is single-replica by design |
| A tenant's new rate limit takes up to ten seconds to apply | The policy was changed by direct SQL rather than the admin endpoint, so no invalidation was published. The TTL is the backstop and will catch it — this is working as designed |
| Requests take about a second each and logs show three cache fallbacks | Redis is unreachable. This is fail-open engaging, bounded by three stacked 0.2-second timeouts |
| The effective rate limit appears higher than configured | The in-memory fallback is per-process, so during a Redis outage the effective limit multiplies by replica count |
| A second gateway replica fails with `Could not import module "app.main"` | An SELinux bind mount using the exclusive `:Z` flag rather than shared `:z` |
| No anomaly alerts on an endpoint that is clearly spiking | Either the cold-start guard is still suppressing scoring below twenty samples, or the spike ramped gradually enough for the moving average to chase it — a documented limit of this estimator |
| Load tests show 429s mixed into the failure data | The rate limit is a request *count* inside a window, not a per-second rate. A 5,000/60s policy is about 83 requests per second |
