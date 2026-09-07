---
project: keyhole
label: Security Model
title: The Threat Model, Bounded Honestly
description: What is structurally guaranteed, what is bounded rather than zero, and what is named as out of scope instead of quietly omitted.
order: 3
---

## The Model in One Sentence

> Untrusted code may read the supplied data and compute freely, but the only thing that can leave the sandbox is a value conforming to the caller's declared schema — bounding any leak to that schema's information content, disclosing the exact bytes released via a signed attestation, and making bulk exfiltration structurally impossible. Covert timing channels and inference leakage are out of scope.

Every clause in that sentence is load-bearing, including the last one.

## The Exit Gate

![The KeyHole exit gate](asset:keyhole-exit-gate)

The order of those four checks encodes the whole thesis, and it is deliberate.

**Validation comes first**, so a non-conforming output releases nothing at all — no partial value, no truncated version, no "sanitized" rewrite. **Bandwidth is computed second**, from the schema rather than from the value, so the number is the same whether the code was honest or hostile. **The DLP scan is third**, and its position is the point: a content filter that ran first would be the thing you had to trust, and content filters lose to encryption. Here it is a backstop that can only ever withhold more, never release more. **The budget check is last**, because it is the only check that depends on history rather than on this run.

Both outcomes emit an attestation. A withheld run is not silence — it is a signed record that something was attempted and nothing came out.

## Structurally Guaranteed

- **No network egress.** Enforced at the subnet, route table and security group layer. A private subnet with no NAT and no internet route, and a run security group whose only egress is to AWS service endpoints. Default runs cannot reach the general internet.
- **No reachable cloud credentials.** The sandbox task role is empty. Fargate has no EC2 IMDS, and the task metadata endpoint vends credentials that can do nothing.
- **No persistence.** Read-only root filesystem plus ephemeral scratch. The task is destroyed after the run.
- **One bounded exit.** The result must validate against the declared narrow schema before release, and the exit bandwidth in bits is computed and recorded per run.

## Bounded, Not Zero

The declared schema's own information content is a **residual channel**. A malicious script that cannot dump the dataset can still choose *which* permitted value to return, and encode a few bits that way. A three-way enum leaks at most 1.58 bits per run.

This is not hidden, worked around, or described as negligible. It is bounded by construction, disclosed in the attestation — which records the exact released bytes — and defended over time by the cumulative budget. The hostile suite includes a test whose entire job is to *demonstrate the channel being used*, so the honest limit is proven rather than claimed.

`--principal alice --budget-bits 8` caps the total bits alice can ever extract. Only released runs spend budget, since a withheld run leaks nothing, and a release is charged the schema's conservative upper bound rather than the value's actual entropy — the same overstate-never-understate discipline the bandwidth accounting uses everywhere.

## Out of Scope, Named Rather Than Hidden

- **Covert timing and resource side channels.** A run's duration is observable and carries information. Fixed-duration runs and output-release quantization are on the roadmap; today this is an open channel and is stated as one.
- **Inference leakage.** A legitimate small answer may itself reveal something about the data. "Is this person's salary above the median" is 1 bit and may be 1 bit too many. That is the caller's modeling concern, not something a schema can fix.
- **Breaking AWS's own task isolation.** KeyHole relies on Fargate isolation as its substrate. If that falls, so does this.

## The Trust Root, and Its Limit

The base attestation is signed by the control plane using a per-deployment KMS key. It proves what the control plane observed — which means a compromised control plane could, in principle, attest to a run that never happened.

Hardware-anchored attestation via Nitro Enclaves would remove the need to trust the control plane at all, and it is on the roadmap rather than in the product. Until then the honest statement is: the attestation is as trustworthy as the deployment that produced it, and it is trivially verifiable that *the signature is genuine* even by someone who does not trust the deployer.

## Clean Room: Separating the Data Owner From the Code Provider

The strongest form of the thesis is letting an external party's AI run on your data and getting proof of exactly what left.

A data owner registers a dataset and grants a named code provider access to it by id. The provider runs against the dataset by reference and **never receives the bytes**. The attestation binds both identities plus the dataset hash, so the owner can verify afterwards: this provider ran this code on the dataset whose hash I registered, zero egress, and only this value came out.

An ungranted provider is refused before anything runs — the data never materializes in memory.

This is a local MVP of the model, and two gaps are documented rather than glossed. Grant tokens are unguessable bearer capabilities; a production grant would be signed and time-boxed. And principal separation is currently enforced in application logic, not by infrastructure — the cloud hardening step is making the provider's IAM structurally unable to read the dataset's S3 objects.

## The Rule for Every Future Feature

A new capability that makes a new security claim ships only with a hostile test that tries to break it. New claim, new adversary script, new assertion. That rule is what lets the roadmap grow without eroding the guarantee, because the test suite — not the README — is the contract.
