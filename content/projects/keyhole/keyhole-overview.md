---
project: keyhole
projectName: KeyHole
tagline: Confidential Compute Sandbox for Untrusted and AI-Generated Code
label: Overview
title: Product Overview
description: What KeyHole is, the confinement problem it targets, and who it is for.
order: 1
---

## What is KeyHole?

Sandboxes like E2B, Modal, and AWS AgentCore are isolation-first: they stop code from escaping the box and touching the host, but they do nothing to stop code that legitimately has access to your data from leaking it back out — writing it to an open socket, encoding it in the output, and so on.

KeyHole flips the problem. Instead of trying to detect exfiltration, which encryption or steganography can always defeat, it bounds the **channel capacity** of the code's only way out. It is for developers and teams who want to let an AI agent or third-party script operate on sensitive data — support tickets, customer records, internal documents — without having to trust that the code will not exfiltrate it.

## The Confinement Problem

The sandbox runs with zero network egress. The caller must declare a narrow output schema up front — an int, enum, bounded string, bounded array, or small record, each worth some fixed number of bits. An exit gate only releases a return value if it conforms to that schema and the caller has not exceeded a cumulative per-principal bit budget across all their runs. A signed attestation then proves, verifiably, exactly what ran, on what data, with zero egress, and how many bits could have left.

It is explicitly grounded in Lampson's 1973 confinement problem. The project never claims "zero leak" — it claims a disclosed, quantified upper bound on leakage, which is a claim you can actually check rather than trust.

## Key Features

- **Bandwidth-bounded exit, not content scanning.** Bulk exfiltration is structurally impossible because the channel is a few bits wide, not because a filter is watching for secrets.
- **Cumulative exit-bandwidth budget.** Caps the total bits a caller can extract across many separate runs, defeating drip and salami-slicing exfiltration.
- **KMS-backed, independently verifiable attestations.** Every run, released or withheld, produces a signed claim anyone can verify against the exported public key.
- **Multi-party clean room mode.** A data owner and a code provider are separate principals; unauthorized access is refused before any data is ever loaded into memory.
- **Adversarial hostile test suite.** Dedicated tests actively try to defeat the guarantee — raw dumps, encoding data inside a conforming schema, fork bombs, drip exfiltration — all proven blocked on real AWS.
