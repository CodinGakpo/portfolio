---
project: jan-saathi
label: Architecture
title: Architecture and Lifecycle
description: One database with many writers, the six-status contract, and the AWS footprint running in staging.
order: 2
---

## One Database, Many Writers

Four services, one Postgres. There is no service-to-service API in Jan Saathi and no general message broker. The backends coordinate entirely through two tables: `clusters`, which holds status and assignment, and `assignments`, which is the audit trail.

![Jan Saathi AWS footprint](asset:jan-saathi-aws-footprint)

The vertical trunk running into RDS is the load-bearing claim of that picture. Every Lambda writes to the same schema over TCP 5432.

This is not the default advice for a multi-service system, so it is worth saying why. With four services and a two-person team, four HTTP contracts would have meant four sets of retries, four failure modes, and four places for the lifecycle to disagree with itself. A shared schema with a strict, written ownership contract puts all of that in one place: the database enforces the state machine with a CHECK constraint, and the rules about who may write what are documented per service rather than negotiated over the wire.

The cost is real and worth naming. Every service is coupled to one schema, migrations have to be ordered, and a bad write from any service lands directly in shared state. The mitigation is ownership: the client app's migrations own the `clusters` table and its status constraint, and no other module may alter it. Docker health checks enforce the boot order that guarantees this.

## The Six-Status Contract

`clusters.status` takes exactly six values. The transition table is the contract every service is written against.

| To | From | Set by | Guard |
| --- | --- | --- | --- |
| `pending` | new, `exception`, `escalated` | Analysis worker on a successful route, or an admin routing from a queue | AI system or admin only |
| `exception` | new, any | Analysis worker on no scope, out of Bangalore, or failure | AI system only |
| `in_progress` | `pending` | Supervisor acknowledge or assign | Supervisor only |
| `escalated` | `pending`, `in_progress` | Supervisor, or the SLA watchdog | Supervisor or SLA system |
| `rejected` | `pending`, `in_progress` | Supervisor, or admin on an appeal | Supervisor or admin |
| `resolved` | `in_progress`, `escalated` | Supervisor, or admin on an escalation | Supervisor normally, admin on escalation |

Three properties fall out of this table.

**Field workers cannot advance work.** They submit photo proof, which writes a proof URL and an audit row. It changes no status. The supervisor's resolve is the only normal path to `resolved`.

**The AI can only ever route or give up.** The analysis worker writes `pending` or `exception` and nothing else. It cannot resolve, reject, or escalate. A misclassification therefore costs a wrong routing decision, never a wrongly closed complaint.

**The admin has no override.** There is deliberately no manual status control in the dashboard. An admin acts on exceptions and escalations, which are themselves lifecycle states. Anything they do re-enters the normal flow rather than bypassing it.

## SLA as a Watchdog, Not a Field

Two clocks run against every routed cluster, both in the worker app.

- **72 hours unresolved** escalates the cluster automatically.
- **48 hours without acknowledgement** reroutes it to the next eligible supervisor, falling back to escalation if there is no one else.

The clock starts when the analysis worker stamps `sla_routed_at` on a successful route. The analysis worker does not enforce the SLA; it only starts the timer. Enforcement lives in a watchdog that also ships as a scheduled Lambda, driven by an EventBridge rule every fifteen minutes.

## Routing

Routing matches `department + ward` to a supervisor through a coverage table, and picks the eligible supervisor with the fewest open clusters, breaking ties by id. Multiple supervisors may share a ward.

Ward detection is a genuine point-in-polygon test against 225 BBMP ward boundaries, not a nearest-centroid guess. A nearest-centroid fallback exists only for the case where no boundary geometry is loaded at all. A coordinate inside no ward becomes an exception with the reason `out_of_bangalore`.

If no active coverage row exists for a cluster's department and ward, the cluster becomes an exception. This is a design decision rather than an error path: an unroutable cluster should surface as a hole in the coverage data that an admin can fix, not get assigned to whoever happens to be nearby.

`route_cluster` is idempotent and is written so it can never throw. Any failure inside it falls back to `exception`. Nothing gets stuck.

## The Two Asynchronous Paths

Everything else in the system is a synchronous database write. Exactly two flows are asynchronous, and they work differently.

![Jan Saathi asynchronous paths](asset:jan-saathi-async-paths)

**Intake** is a direct asynchronous Lambda invoke. After the client backend saves a report with `ai_status = 'pending'`, it invokes the analysis worker with `InvocationType = Event` and returns immediately. The citizen never waits for a model call. In local development there is no Lambda, so the worker polls Postgres for pending reports with `FOR UPDATE SKIP LOCKED` instead.

**Closure verification** is queue-driven, and this is where the current state needs stating plainly. The Go producer and the Python consumer both read `AI_VERIFICATION_SQS_QUEUE_URL`, and the pipeline also runs off a database poll when no queue URL is set, which is how the container path works end to end today. But the only SQS queue defined in the Terraform is the analysis worker's dead letter queue. **No resource anywhere creates the verification queue**, which is why it is drawn dashed above. In a container deployment closure verification runs end to end. In staging, where the rest of this diagram is applied and serving traffic, it does not.

## The AWS Footprint

The footprint is serverless-first and cost-conscious, aimed at an early-stage account. It is applied and running in staging.

| Concern | Choice | Why |
| --- | --- | --- |
| Compute | One Lambda plus HTTP API v2 per service | Scales to zero, no idle cost |
| Database | One RDS Postgres `db.t4g.micro`, single AZ | One schema, many writers; Aurora is not warranted at this size |
| Egress | Self-managed NAT instance on `t3.micro` | A managed NAT Gateway costs an order of magnitude more idle |
| Report photos | S3 gateway endpoint | Image bytes are the highest volume, so they bypass the metered NAT path entirely |
| Worker chat | WebSocket API plus DynamoDB for connections | Connection state is ephemeral and keyed, which suits DynamoDB and not Postgres |
| Analysis worker | Container Lambda from ECR at 1536 MB | The Python AI dependencies do not fit a zip package |
| Secrets | SSM Parameter Store | No credentials in the repository |
| SLA | EventBridge rule every fifteen minutes | A scheduler without a scheduler service |

The split between the S3 gateway endpoint and the NAT instance is the decision I would defend hardest. Report photos are both the largest payloads in the system and the most frequent. Routing them through a NAT would put the highest-volume traffic on the one metered path in the VPC. A gateway endpoint is free, so the expensive bytes take the free road and only model calls and package pulls pay.

**Deployment status.** The diagram above is applied and running, not a plan. It splits into three tiers, because they are maintained very differently.

**Applied and continuously deployed.** The two static frontends and everything serving them: S3 buckets, CloudFront distributions, ACM certificates, Route 53 zones, and the GitHub OIDC deploy roles. A push to `main` builds the bundle, assumes the deploy role, runs `aws s3 sync` and issues a CloudFront invalidation. `jansaathi.co.in` and `console.jansaathi.co.in` serve from this path.

**Applied, but deployed by hand.** The shared VPC, RDS, the image bucket, and the four Go Lambdas plus the analysis worker container. These exist and run, but they update through a local `terraform apply` against a locally built `bootstrap.zip` and a manually pushed ECR image. No pipeline covers them, and that is the real gap in the deployment story.

**Referenced but never created.** The SQS verification queue. Both backends read `AI_VERIFICATION_SQS_QUEUE_URL`, and no Terraform resource creates it.

One naming note, because it changes what the claim means. `envs/staging` is the only wired Terraform root, and it composes eight modules. `envs/dev` holds tfvars with no root module, and `envs/prod` holds a backend that is entirely commented out. What is live is a staging environment, not a production one.

Docker Compose remains the complete path for local work, where all four services and the full verification pipeline run against one Postgres.

## Boot Order

Docker health checks enforce client app, then admin app, then worker app. The client app's migrations own the `clusters` table and the CHECK constraint that encodes the six statuses. Other modules add only defensive `add column if not exists` mirrors and never alter that constraint. A single owner for the state machine is what keeps four writers honest.
