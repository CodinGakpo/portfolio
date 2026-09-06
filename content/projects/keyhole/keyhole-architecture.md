---
project: keyhole
label: Architecture
title: System Architecture
description: The technology stack and the infrastructure decisions behind the confinement guarantee.
order: 2
---

## Technology Stack

| Layer | Technology |
| --- | --- |
| Core | Python — minimal dependencies by design (pydantic and cryptography) |
| Sandbox and compute | AWS ECS Fargate — no NAT, no internet route, empty IAM task role, read-only root filesystem |
| Control plane (cloud mode) | AWS Lambda and API Gateway, async submit and poll pattern |
| Data and audit | DynamoDB, append-only audit log |
| Attestation and crypto | ed25519 locally; AWS KMS (`ECC_NIST_P256`, `ECDSA_SHA_256`) in the cloud — the signing key never leaves KMS |
| Storage | S3 with SSE-S3, presigned GET and PUT so the sandbox task itself needs zero AWS credentials |
| Infrastructure | Terraform — a single `terraform apply` / `terraform destroy` for the whole stack |
| Interfaces | A CLI (`sbx`) and an MCP server (`run_confidential` tool) for direct AI-agent use |

## Egress Containment: A Corrected Design

Egress containment moved from an in-task sidecar proxy to network-layer containment — private subnet, no NAT, a security group with no open route. This was a real design correction made after building and testing the sidecar approach locally, then discovering it does not hold in Fargate's shared-network-namespace `awsvpc` mode.

A separate infrastructure gotcha: a read-only root filesystem plus a non-root user meant the sandbox container could not write to its own empty mounted work volume, because mounts default to root-owned. The fix was an `essential=false` init container that runs as root via ECS's `entryPoint` field — not `command`, which overrides the image CMD rather than ENTRYPOINT — to `chown` the volume before the sandbox container starts.

## Multi-Party Clean Room Mode

A data owner and a code provider are modeled as separate principals. The owner registers a dataset and grants scoped access tokens to specific providers; unauthorized access is refused before any data is ever loaded into memory. This has been verified directly: ungranted access is refused without running, cross-principal exfiltration attempts are withheld, and tampered attestations are flagged invalid.
