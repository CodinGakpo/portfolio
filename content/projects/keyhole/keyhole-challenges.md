---
project: keyhole
label: Challenges & Fixes
title: Problems Found, and How They Were Solved
description: Every one of these was found by running the system against real AWS infrastructure, not by reading the code and assuming it worked.
order: 3
---

## Problem to Solution

| Problem | Solution |
| --- | --- |
| Assumed an egress-proxy sidecar could enforce network isolation. | Discovered Fargate's shared network namespace defeats sidecar enforcement; moved isolation to the subnet and security-group layer. |
| Read-only root plus a non-root user could not write to the mounted work volume. | A root-run, `essential=false` init container chowns the volume before the sandbox container's `dependsOn: SUCCESS` lets it start. |
| IAM `PassRole` and task-tagging permissions were misscoped. | Caught only by attempting real deploys; iteratively fixed via live AWS verification runs until an honest request released and attested, and an exfiltration attempt was withheld end to end. |
| DynamoDB rejects native Python floats, and an attestation risked colliding with its own run record. | Float to Decimal via a JSON round trip; attestation fields nested under a dedicated `att` key so they cannot clobber the run's own primary key. |
| Local SELinux blocked Docker bind mounts, breaking the local egress-containment test harness. | Baked the test probe into the Docker image itself rather than volume-mounting it. |
