---
project: keyhole
projectName: KeyHole
tagline: Confidential Code Execution with a Bandwidth-Bounded, Attested Exit
label: Overview
title: Product Overview
description: What KeyHole does, the one decision that shapes everything else, and the four moving parts behind it.
order: 1
---

## What is KeyHole?

KeyHole runs untrusted or AI-generated code against your private data in the cloud and returns **only a small, typed, cryptographically attested answer**. The data does not stay in because a filter is watching it — it stays in because the exit is a few bits wide.

A run looks like this:

```
sbx run classify.py --data emails.csv=./emails.csv --schema schemas/label.json
→ status: succeeded   output: "spam"   bandwidth: 1.58 bits   attestation: att-…
```

Point the same command at a script that tries to dump the dataset instead, and the answer is not a warning:

```
→ status: withheld    output does not conform to the declared schema  (nothing released)
```

The dataset in that demo is 20,279 bytes. The widest the exit can carry is 1.58 bits.

## The Decision That Shapes Everything

**Bound the channel, do not inspect the payload.**

Isolation-first sandboxes — E2B, Modal, AWS AgentCore — stop code from escaping the box. They protect the *host* from the code. None of them stop code that legitimately reads your data from writing it to a socket, or returning it, or encoding it somewhere on the way out. Content inspection is the usual answer, and content inspection loses to `encrypt-then-emit` every time.

KeyHole inverts it. The caller declares a narrow output schema up front — an enum, a bounded integer, a length-capped string, a bounded array, a small record. That schema has a computable information content in bits. An exit gate releases a value only if it conforms. Bulk exfiltration becomes structurally impossible rather than detectable, and the claim is arithmetic rather than a promise about a filter's coverage.

The cost is real and worth naming. A narrow exit is a narrow product: KeyHole can answer "which of these three labels" but not "summarize this document". Every capability that widens the exit has to widen the guarantee too, which is why free-form output is deliberately parked in future scope and labelled a downgrade rather than a feature.

It is explicitly grounded in Lampson's 1973 confinement problem, and it never claims zero leak. It claims a **disclosed, quantified upper bound** on leakage — a claim you can check rather than trust.

## The Four Moving Parts

| Component | Role | Built with |
| --- | --- | --- |
| Clients | `sbx` CLI and an MCP server exposing `run_confidential` — thin wrappers over one REST API | Python |
| Control plane | Validates the request, launches the sandbox, runs the exit gate, signs the attestation, records audit | Lambda behind API Gateway HTTP API v2 |
| Sandbox task | One ephemeral task per run: an init container chowns the scratch volume, then the sandbox container executes the untrusted code | ECS Fargate, 256 CPU / 512 MB |
| State and crypto | Run state, append-only audit, artifacts, images, and the attestation signing key | DynamoDB, S3, ECR, KMS |

The CLI, the API and the MCP server all call the same `controlplane/gate.py`, so the guarantee is identical across every interface. There is no "local mode is a bit looser" caveat.

## How the Bound Is Computed

`schema/bandwidth.py` turns a declared schema into an upper bound in bits, deliberately overstating rather than understating the channel:

| Schema type | Bits |
| --- | --- |
| `boolean` | 1 |
| `enum` | log2(number of choices) |
| `integer` with min and max | log2(span) |
| `integer` unbounded | 64, the machine-width fallback |
| `number` | 64, an IEEE-754 double |
| `string` | `max_length` × log2(charset size) |
| `array` | `max_items` × the item's bits |
| `object` | the sum of its properties' bits |

A three-way enum is 1.58 bits. That number goes into the attestation, so the caller and anyone auditing them see the same figure.

## Key Features

- **Bandwidth-bounded exit, not content scanning.** Bulk exfiltration is structurally impossible because the channel is a few bits wide, not because a filter is watching for secrets.
- **Cumulative exit-bandwidth budget.** A per-principal ledger caps the *total* bits a caller can extract across many separate runs, so drip exfiltration over many individually-conforming calls is bounded too. Only released runs spend budget; a withheld run leaks nothing, so it charges zero.
- **Attestations anyone can verify.** Every run — released or withheld — emits a signed claim binding the code, data and schema hashes, the exit bandwidth, the egress attempts observed, and the exact bytes released. In the cloud the signing key is a KMS ECDSA P-256 key whose private half never leaves KMS.
- **Multi-party clean room.** A data owner registers a dataset and grants a specific code provider access by id. The provider runs against it without ever receiving the bytes, and the attestation binds both identities plus the dataset hash.
- **An adversarial test suite as the proof.** `tests/hostile/` actively tries to defeat the guarantee and asserts each attempt is blocked *and* faithfully recorded.

## Status

Feature-complete for its planned base scope, tracked internally as milestones M0 through M9, and verified end to end on real AWS: an honest answer released and KMS-attested, an exfiltrator withheld, and the attestation checked VALID against the exported public key — all inside a no-NAT private subnet with an empty task IAM role.

There is no public live URL, by design. This is a self-hosted tool that deploys into your own AWS account with one `terraform apply`. Every cloud verification run was torn down afterwards with `terraform destroy`, so idle cost returns to roughly $0 apart from the ~$1/month KMS key.
