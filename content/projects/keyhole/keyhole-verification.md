---
project: keyhole
label: Verification
title: The Hostile Suite, and What Broke Along the Way
description: A security claim nobody has tried to break is a hope, not a guarantee — so the marquee test suite is the one that attacks the product.
order: 4
---

## The Principle

Most of this project's test surface is ordinary. The part that matters is the suite whose job is to defeat it: scripts that actively try to steal the supplied data by every avenue available to code running inside the box, each asserting both that the control held *and* that the attempt was faithfully recorded in the attestation and audit trail.

A green run of that suite is the product's proof. Everything else is scaffolding around it.

## The Test Layers

| Layer | What it covers | Where it runs |
| --- | --- | --- |
| Unit | The core guarantee — schema validation, bandwidth accounting, the exit gate's ordering, attestation sign-and-verify including tamper detection, launcher parameter construction, the DLP backstop, quotas and the budget ledger | Every commit, no cloud |
| Integration | DynamoDB and S3 flows, the `ecs.run_task` call shape, client-to-handler round trips, KMS sign and verify, and the MCP transport end to end | CI, against LocalStack |
| Hostile | The adversarial suite below | Every CI cycle against the local Docker executor; gated against real Fargate |
| Real AWS | An opt-in `terraform apply` → run → `destroy` smoke test | Manual, kept off default CI to protect the budget |

Ninety-two tests across eighteen test modules. LocalStack's Fargate fidelity is limited, so the integration layer is explicitly scoped to wiring and parameters rather than real container execution — a limitation worth stating, because a test that claims more than it checks is worse than no test.

## The Hostile Suite

| Attack | Expected result |
| --- | --- |
| Return the whole dataset as the result | Schema validation rejects it and nothing is released. The headline structural win |
| Encode the dataset inside a bounded string field | The leak is capped to the declared bandwidth and the exact bytes are attested — a deliberate demonstration of the bounded, disclosed residual channel |
| Use the bounded channel and then check it was disclosed | The attestation records what left, so the honest limit is proven rather than asserted |
| Print a secret into the small output | The secondary DLP backstop flags it and the run is withheld |
| Write the data to stdout | Stdout is not an exit channel; nothing is released through it |
| Drip-exfiltrate across many individually-conforming runs | The cumulative per-principal budget stops the sequence once the cap is reached |
| Burn budget with runs that get withheld | A withheld run charges zero, so an attacker cannot exhaust their own cap to poison the ledger |
| Fork bomb, memory hog | The limits and timeout kill the task cleanly; the platform is unaffected |
| Open an outbound socket | No egress path exists. Gated to the cloud suite, since it needs real network enforcement |
| Run against a dataset without a grant | Refused before anything runs; the data never materializes |
| Exfiltrate another principal's data through a valid grant | Withheld — the bandwidth guarantee holds across principals |
| Tamper with the identities in an attestation | The signature check fails |

What a passing suite demonstrates, all at once: typed answers are released and attested, so the product does useful work; bulk exfiltration is structurally impossible under active attack rather than merely under careless code; and the residual channel is bounded and disclosed rather than hidden.

## Problems Found, and How They Were Solved

Every one of these was found by running the system — under load, against real AWS, or with a dependency deliberately killed — rather than by reading the code and assuming it worked.

| Problem | Solution |
| --- | --- |
| Assumed an in-task egress-proxy sidecar could enforce network isolation. It worked locally under Docker Compose. | Fargate `awsvpc` containers share one network namespace, so the sidecar is a peer rather than a gateway and can be routed around. Isolation moved to the subnet, route table and security group — a layer the code cannot reach. |
| A read-only root filesystem plus a non-root user left the sandbox unable to write to its own mounted scratch volume, because an empty mount defaults to root ownership. | A root-run, `essential=false` init container chowns the volume, with the sandbox gated behind `dependsOn: SUCCESS`. Wired through ECS's `entryPoint`, not `command` — `command` overrides the image CMD rather than its ENTRYPOINT and silently does nothing useful. |
| IAM `PassRole` and task-tagging permissions were misscoped in a way no unit test could catch. | Only real deploys surfaced it. Fixed iteratively through live AWS verification runs until an honest request released and attested, and an exfiltration attempt was withheld, end to end. |
| DynamoDB rejects native Python floats, and the attestation's fields risked colliding with the run record's own keys. | Float to Decimal via a JSON round trip, and attestation fields nested under a dedicated `att` key so they cannot clobber the run's primary key. |
| Local SELinux blocked Docker bind mounts, breaking the egress-containment test harness on the development machine. | Baked the test probe into the image rather than volume-mounting it, which also made the harness portable. |

The pattern across all five is the same, and it is the reason the hostile suite exists at all: the failures that mattered were not logic errors visible in a diff. They were assumptions about how a platform behaves, and the only thing that surfaced them was running against the real platform.
