---
project: keyhole
label: Status & Scope
title: Current Status
description: What is done, what is explicitly not built yet, and why that is stated plainly rather than hidden.
order: 4
---

## Where It Stands

Feature-complete for its planned base scope, tracked internally as milestones M0 through M9, all verified end to end on real AWS infrastructure. There is no public live URL — this is a self-hosted, deploy-into-your-own-AWS-account tool, not a hosted SaaS. All cloud verification runs were done against a real AWS account and then torn down via `terraform destroy` to keep idle cost near $0. The stack is designed to run under $10 per month.

## Explicitly Not Built Yet

Documented as a known gap rather than hidden:

- Typed and numeric-tolerance output schemas
- Warm execution pools — cold start is currently the main latency cost
- Nitro Enclave hardware attestation
- Signed, time-boxed access grants for clean-room mode. Grants are currently unguessable bearer tokens, which is fine for a solo project and a noted production gap.

## Honesty as a Design Principle

A solo project built around a specific thesis — channel-capacity confinement over content-based leak detection — rather than a generic sandbox clone. It documents what it does *not* solve with the same rigor as what it claims, in a dedicated security document and a future-scope document, rather than overselling.
