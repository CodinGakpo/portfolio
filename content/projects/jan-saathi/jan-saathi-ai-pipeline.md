---
project: jan-saathi
label: AI Pipeline
title: Classification, Clustering and Closure Verification
description: How reports become routed clusters, and how a model verifies a fix without ever being trusted to close one.
order: 3
---

## Two Jobs, One Worker

The analysis worker does two separate things, and keeping them separate is most of the design.

**Intake** turns a raw report into a routed cluster: classify it, group it with nearby issues, find the right supervisor. **Closure verification** answers a narrower question later in the lifecycle: did the field worker actually fix the thing that was reported?

Both run on Amazon Bedrock with Nova Pro. Neither is allowed to move a cluster's lifecycle status on its own.

## The Intake Pipeline

1. **Extract, in parallel.** An image validation gate, image tagging, and text tagging with intent detection all run at once. An invalid image rejects the report immediately.
2. **Reject** if no civic tags surface at all.
3. **Synthesise** department, severity, category and a confidence score.
4. **Confidence gate.** Below the threshold the report is flagged and the cluster goes to `exception` rather than being routed on a guess.
5. **Resolve ward and cluster.** Point-in-polygon ward lookup, then find or create a cluster using a haversine distance test within a 15 metre radius.
6. **Route the cluster** to the least-loaded supervisor whose coverage includes that department and ward.

The clustering radius is worth a note. It started at 25 metres and was tightened to 15. At 25 metres, two genuinely different potholes on opposite sides of a junction merged into one cluster, and resolving one closed the other. Fifteen metres is tight enough to keep distinct issues distinct while still collapsing the ten people who photograph the same broken streetlight from across the road.

**Nothing in this pipeline may block the pipeline.** Every failure path falls through to `exception`, which is a real lifecycle state an admin can see and act on. A model outage does not queue reports up behind it; it produces a visible pile of exceptions.

One honest note on the implementation: `strands-agents` appears in the requirements file but is not actually imported. The agents call `bedrock-runtime.converse` directly through boto3. The dependency is a leftover, not an abstraction layer.

## Closure Verification: The Interesting Part

The original flow required a supervisor to look at every field worker's proof photo and decide whether the job was done. That is the bottleneck the verification pipeline removes. The supervisor becomes the exception handler rather than the default gate.

Handing that judgement to a model raises an obvious question: what stops a confident model from closing a complaint that was never fixed, and paying out a reward for it?

The answer is that the model does not have the authority to do either.

## Verification Is a Parallel State

`clusters.status` keeps exactly its six lifecycle values. Verification lives on a completely separate column, `clusters.verification_status`, which is nullable and takes `PENDING`, `APPROVED`, `REJECTED` or `UNCERTAIN`.

Throughout verification the cluster stays `in_progress`.

| `status` | `verification_status` | Meaning |
| --- | --- | --- |
| `in_progress` | `null` | Active work, nothing submitted, or a plain manual flow |
| `in_progress` | `PENDING` | Evidence submitted, AI verifying |
| `in_progress` | `REJECTED` | Evidence judged insufficient, worker must resubmit |
| `in_progress` | `UNCERTAIN` | AI not confident, supervisor reviews |
| `in_progress` | `APPROVED` | Approved, the finalizer is about to resolve |
| `resolved` | `APPROVED` | AI verified and Go performed the authoritative resolve |
| `resolved` | `UNCERTAIN` | AI could not verify, a supervisor resolved it manually |

The payoff is that every existing query, inbox, dashboard filter and SLA check keeps working untouched. None of them need to know AI verification exists. Adding a second dimension rather than adding statuses to the first is what made this shippable without rewriting the other three services.

## Who Is Actually Allowed to Close Work

The chain of custody matters more than the model.

1. The **model** returns a verdict and a confidence score. That is all it does.
2. A **deterministic decision engine** applies thresholds and vetoes, and writes `verification_status`. It never touches `status`.
3. A **Go finalizer** polls for approved clusters and calls `applyResolve`, which is the same function the supervisor path calls. It moves the status to `resolved` and credits wallets in one transaction.

So the model never mutates lifecycle status and never pays anyone.

The strongest guard is a deterministic one. Before any inference is spent, the worker backend runs a geofence check comparing the submitted GPS against the nearest member report. Evidence clearly outside the radius goes straight to `UNCERTAIN` for a human, and no model is called at all. **A high confidence score cannot override a failed geofence.** The deterministic check wins.

GPS is stored as structured data separately from the image, and the photo's own overlay is never trusted as a location source.

## Rubrics, and Knowing What a Photo Cannot Prove

Verification is graded against a per-category checklist rather than one generic prompt. The streetlight rubric is the example I like most: a still photograph cannot prove that a light actually works. The rubric therefore instructs the model to prefer `UNCERTAIN` unless operation is visibly demonstrated.

That is a small thing, but it is the difference between a system that automates judgement and one that automates confidence.

## Business Failure Versus Infrastructure Failure

The distinction is enforced in code, not left to a retry policy.

A model returning `REJECT` or `UNCERTAIN` is a **business outcome**. It is persisted and terminal.

A Bedrock outage, an image fetch error, or a database blip is **infrastructure**. The job retries up to a configured limit, and if it still fails the cluster is parked as `UNCERTAIN` for a supervisor.

The property this buys: a temporary outage never rejects a citizen's completion. The worst case of an AWS problem is a human looking at something.

## Idempotency

Queue delivery is at least once, so every step assumes it will run twice.

- `verification_jobs.job_uuid` is unique, with a partial unique index permitting only one in-flight job per evidence package.
- Claiming a job is a single conditional update from pending to processing, with a stale reclaim after a timeout. Exactly one delivery wins.
- `verification_results` has a partial unique index on the job id, so a duplicate terminal result is a no-op.
- Every transition is guarded on the cluster still being `in_progress` with `verification_status = PENDING`. A redelivered job arriving after the cluster moved on changes nothing.
- The finalizer resolves under `FOR UPDATE SKIP LOCKED` with a status guard, and the wallet credit is additionally guarded on `resolved_at`.

No double resolve, and no double credit.

## Evidence Is Immutable

`completion_evidence` rows are never modified or deleted. A rejection clears the pending proof photo so the worker can resubmit, but the evidence history survives. `verification_results` is an append-only audit holding the decision, confidence, individual checks, deterministic vetoes, input references, model id, timing and errors.

A worker may resubmit only when verification status is null or `REJECTED`. `PENDING`, `APPROVED` and `UNCERTAIN` all block a new submission, so the pipeline cannot be re-armed or raced while a decision is in flight.

## Current State

The container path is complete: in Docker Compose, closure verification runs end to end, driven either by a queue or by a database poll over the jobs table when no queue is configured.

Closure verification is the one part of the AWS footprint that is not wired. Both the Go producer and the Python consumer read `AI_VERIFICATION_SQS_QUEUE_URL`, but the Terraform defines only the analysis worker's dead letter queue. The verification queue resource does not exist, and the resolve finalizer has no scheduled Lambda equivalent. Everything else in the footprint is applied and running in staging, so this is a single missing path rather than an unbuilt environment. Classification verification, which runs inline in the intake pipeline, is unaffected and works in both deployments.
