---
project: jan-saathi
label: Documentation
title: Running and Operating Jan Saathi
description: Local setup, the seeding model, deployment state, and the operational rules that keep four writers honest.
order: 4
---

## Prerequisites

| Tool | Requirement |
| --- | --- |
| Docker and Docker Compose | Current version |
| Go | 1.22 or later, for building the backends outside Docker |
| Python | 3.11 or later, for the analysis worker |
| Flutter | 3.x, for the citizen and worker apps |
| Node.js | 18 or later, for the admin dashboard and info site |
| `jq` | Required by the seed script |
| AWS account | Only for a cloud deployment. Local development needs none |

## Local Development

The whole system runs on Docker Compose against one Postgres. The schema is created by the Go backends' migrations on boot, so there is no SQL dump to import.

```bash
docker compose up -d              # migrations create schema and reference data
./scripts/db_seed.sh --full       # 225 wards, actors, and a synthetic demo dataset
```

Health checks:

```bash
curl -s localhost:8080/health     # client-app
curl -s localhost:8081/health     # admin-app
curl -s localhost:8082/health     # worker-app
curl -s localhost:8000/health     # analysis-worker
```

The admin dashboard runs on port 5174. Redis backs the worker app's per-cluster chat websockets.

**Local development needs no AWS.** With no verification queue URL configured, the closure verification pipeline runs off a database poll over the jobs table instead of SQS, so the full lifecycle including AI verification works on a laptop.

## The Seeding Model

Data comes from three places, and the split matters when something looks wrong.

| Source | Provides |
| --- | --- |
| Go migrations, on boot | Schema, plus reference data: departments, admin users, tags, tag to department mapping |
| `infra/seed/wards.geojson` | 225 real BBMP ward boundary polygons, loaded into `zones` |
| `scripts/db_seed.sh` | Loads wards, seeds operational actors, and with `--full` generates a demo dataset |

```bash
./scripts/db_seed.sh          # wards and actors only, idempotent and non-destructive
./scripts/db_seed.sh --full   # also truncates transactional tables and generates demo data
```

The ward GeoJSON is the one genuinely irreplaceable artifact in the repository. Everything else can be regenerated.

Default seeding creates one supervisor per department, plus a **second Roads supervisor** sharing the same wards. That is deliberate: it is the only way to exercise least-workload routing across a shared ward, which is otherwise invisible in a demo.

`--full` generates roughly 20 citizens and 72 clusters spread across all six statuses, with member reports whose mirrored status matches their cluster, audit rows, wallet credits applied under the real reward rule, and admin activity logs.

Both `db_seed.sh --full` and `db_reset.sh` deliberately preserve departments, tags, the tag mapping, and admin users, so a reset and reseed cycle keeps admin logins working without restarting the backends.

```bash
docker compose down -v            # drop the volume entirely
docker compose up -d              # migrations rebuild schema and reference data
./scripts/db_seed.sh --full
```

## Deployment State

**The staging environment is applied and running on AWS.** `envs/staging` is the only wired Terraform root and it composes eight modules: `dns`, `github-oidc`, `info-app`, `shared`, `analysis-worker`, `admin`, `client` and `worker`. `envs/dev` holds tfvars with no root module and `envs/prod` holds a backend that is entirely commented out, so staging is the accurate word for what is live. There is no production environment.

Two deployment paths exist and only one of them is automated.

| Component | How it ships |
| --- | --- |
| Admin console and public info site | GitHub Actions on push to `main`: assume the OIDC deploy role, `aws s3 sync`, CloudFront invalidation |
| VPC, RDS, image bucket, four Go Lambdas, analysis worker container | Local `terraform apply` with a locally built `bootstrap.zip` and a hand-pushed ECR image |

An apply has an order, because later modules depend on outputs from earlier ones.

1. Apply `shared` and `analysis-worker` first, creating the VPC, RDS, S3 and ECR.
2. Push the analysis worker container image to ECR.
3. Build the Go services' `bootstrap.zip` artifacts. The worker app additionally needs `cmd/ws-lambda` and `cmd/sla-watchdog-lambda`.
4. Apply the full plan.

Each environment owns its own S3-backed Terraform state. Secrets are passed at apply time and never committed; only the example tfvars file is tracked.

## Known Gaps

Worth stating plainly, because a portfolio that only lists what works is not describing a real system.

| Gap | Impact |
| --- | --- |
| The AI verification SQS queue is not in Terraform | Closure verification runs in the container path but cannot run in AWS as currently defined |
| The resolve finalizer has no scheduled Lambda | In containers it is an in-process loop; in pure Lambda mode it is unwired |
| DigiLocker redirect points at a local dev URL | On mobile the callback dead-ends, and the app relies on polling to detect completion. Needs a real domain with App Links and Universal Links |
| Cognito not adopted | Each backend still issues its own JWT. Migrating existing phone and employee-code accounts needs a plan first |
| No pipeline for the backends | The two frontends deploy on every push to `main`. The Lambdas and the analysis worker container still update through a local apply and a hand-pushed image |

## Operational Rules

These are the rules that keep four services writing to one database from corrupting each other. They are worth reading as a contract rather than as trivia.

**Never write a report's status directly.** Each report's status is a mirror of its parent cluster. Change the cluster and let the mirror follow. Writing the mirror produces a report that disagrees with the work item it belongs to.

**Proof photo upload is two steps.** The uploader requests a presigned S3 URL, uploads the image, then sends the resulting URL back to the API. Skipping the second step orphans the photo in the bucket with nothing referencing it.

**Every state change writes an audit row.** Rows carry both a cluster id and a nullable report id for cluster-level actions. This is the only history the system keeps, so an action that skips it is invisible forever.

**Routing needs coverage data.** A cluster with no active supervisor scope for its department and ward becomes an exception by design. If exceptions are piling up, the fix is usually a missing coverage row, not a bug in the router.

**Only the client app's migrations may alter the `clusters` table.** Its status CHECK constraint encodes the six-value lifecycle. Other modules add defensive column mirrors and nothing else. Docker health checks enforce the boot order that makes this safe.

## Troubleshooting

| Symptom | Likely cause |
| --- | --- |
| Reports stay pending, no clusters appear | Analysis worker not running, or `ai_status` never set. Check its health endpoint and logs |
| Everything lands in the exception queue | No supervisor coverage rows for that department and ward, or the ward GeoJSON was never loaded |
| Clusters route but no SLA escalation | The watchdog runs in the worker app, not the analysis worker. Check that it is running |
| Proof photo missing after upload | The second step was skipped, so the image is orphaned in S3 |
| Seed script aborts immediately | It preflights that departments is non-empty. Bring the stack up first so migrations run |
| Verification never leaves PENDING | No queue configured and the database poll is not running, or the job was claimed and the claim went stale |
