---
project: keyhole
label: Architecture
title: Architecture and the Run Lifecycle
description: One task per run inside a subnet with no way out, three IAM roles with one of them empty, and an AWS footprint built around not needing a NAT gateway.
order: 2
---

## A Run, End to End

Every interface — CLI, REST, MCP — funnels into the same sequence.

```
sbx run classify.py --data emails.csv --schema label.json
  → POST /runs                     code + data + schema + limits
  → control plane                  validate schema, write PENDING run + audit row,
                                   upload the input bundle to S3 (SSE-KMS),
                                   presign GET (input) and PUT (output)
  → ecs.run_task                   init-chown, then the sandbox fetches the presigned
                                   bundle and runs the code: non-root, read-only root FS,
                                   no internet route, no usable credentials, under a timeout
  → sandbox                        writes its output envelope and data-flow log back to S3;
                                   the task self-destructs
  → exit gate                      validate against schema → bandwidth → DLP backstop →
                                   budget → sign attestation → release or withhold
  → GET /runs/{id}                 released output + attestation
  → sbx verify                     checks the signature independently of the service
```

The citizen-facing property of that ordering: the caller never waits on a trust decision made by the code itself. The sandbox produces an artifact; the control plane decides what, if anything, that artifact becomes.

## The AWS Footprint

![KeyHole AWS footprint](asset:keyhole-aws-footprint)

The load-bearing claim in that picture is an absence. The sandbox box has no edge leaving the VPC except its own output object in S3.

## Egress Containment Is the Network, Not a Sidecar

This is the correction the project is most defined by, and it was found by building the wrong thing first.

The original design put an egress-proxy container in the task alongside the sandbox, intercepting outbound traffic. It was built, and it worked under Docker Compose locally. It does not hold on Fargate. In `awsvpc` mode every container in a task **shares one network namespace**, which makes the proxy a peer of the sandbox rather than a gateway in front of it — the sandbox can simply route around it.

Enforcement moved down a layer, to where it cannot be routed around:

- a private subnet whose route table has no internet route,
- no NAT gateway anywhere in the account,
- a run security group whose only egress is the S3 managed prefix list plus in-subnet ECR and Logs endpoints.

The egress-proxy image and its Docker harness are still in the repository. They are not dead code and they are not the enforcement point — they are kept for a future allowlisted-egress feature, which needs a *separate proxy task* to be a real chokepoint.

## IAM: Three Roles, One of Them Empty

| Role | Held by | Permissions |
| --- | --- | --- |
| Control-plane role | The Lambda | Scoped `ecs:RunTask` / `StopTask`, `iam:PassRole` for only the task and execution roles, scoped DynamoDB, S3 and Logs, and KMS sign plus encrypt |
| Task execution role | The ECS agent, not the code | ECR pull and Logs write, nothing else |
| Task role | The sandbox itself | **Empty** |

The empty task role is the "no reachable credentials" guarantee made concrete rather than asserted. Fargate has no EC2 instance metadata service, and the task metadata endpoint vends credentials attached to that empty role — so code that scrapes them gets something that can do nothing.

## The Container Pair, and Why There Are Two

A read-only root filesystem plus a non-root user creates a problem that only shows up at runtime: the sandbox container cannot write to its own mounted scratch volume, because an empty mount defaults to root ownership.

The fix is an init container that runs as root purely to `chown 10001:10001 /sandbox/work`, declared `essential=false` so its exit does not fail the task, with the sandbox container gated behind `dependsOn: SUCCESS`. One detail matters: the chown is wired through ECS's `entryPoint` field, not `command` — `command` overrides the image's CMD rather than its ENTRYPOINT, which silently does the wrong thing.

## Why Each Big Choice

| Concern | Choice | Why |
| --- | --- | --- |
| Compute | ECS Fargate, one task per run | VM-level task isolation, per-second billing, no hosts to manage. A run costs fractions of a cent |
| Control plane | Lambda plus HTTP API v2 | Scales to zero, so idle is roughly $0 — which is what keeps the whole design inside a sub-$10/month budget |
| Egress | No NAT gateway at all | A NAT gateway alone is about $32/month and would blow the budget. Default runs need no egress, so the network is designed around not needing one |
| Image and data I/O | Free S3 gateway endpoint | The highest-volume path costs nothing and never touches a metered route |
| ECR and Logs | Interface endpoints, opt-in at deploy time | They carry an hourly charge, so an idle deployment does not pay for them |
| Data delivery | The caller uploads data; the code never fetches it | Keeps the no-network guarantee clean. Mediated fetch through a broker is a roadmap item, not a shortcut taken now |
| Attestation | KMS ECDSA P-256 | The signing key never leaves KMS, so a compromised control plane still cannot forge a past attestation offline |

The cold start is the honest cost of this shape: roughly 10 to 30 seconds per run. Warm pools are on the roadmap and are not pretended to exist.

## Infrastructure Layout

Terraform is one root (`environments/dev`) composing six modules:

| Module | Creates |
| --- | --- |
| `network` | VPC, private subnet, route table, the run and deny-all security groups, the S3 gateway endpoint, and the opt-in interface endpoints |
| `execution` | ECS cluster, the hardened task definition, the log group, and the execution and (empty) task roles |
| `controlplane` | The Lambda, its scoped role, the HTTP API, integration, route, stage and invoke permission |
| `state` | `mark1_runs` and `mark1_audit` tables, plus the artifacts bucket with public access blocked, SSE, and a lifecycle policy |
| `registry` | The ECR repository and its lifecycle policy |
| `guardrails` | An AWS Budgets monthly alarm — the backstop for anything the in-code quota policy misses |

`sbx run --local` runs the identical pipeline against a local Docker executor, which is what makes the fast development loop possible without an AWS round trip per iteration.
