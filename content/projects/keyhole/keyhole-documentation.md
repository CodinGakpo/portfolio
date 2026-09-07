---
project: keyhole
label: Documentation
title: Running and Operating KeyHole
description: Local setup, the cloud deploy, the CLI surface, what a run actually costs, and the failure modes worth recognising.
order: 5
---

## Prerequisites

| Tool | Requirement |
| --- | --- |
| Python | 3.11 or newer |
| Docker | Required for `--local` runs; the sandbox image is built from `images/sandbox-python` |
| Terraform | Only for the cloud deploy |
| AWS credentials | Only for the cloud deploy, with permission to create VPC, ECS, Lambda, DynamoDB, S3, ECR and KMS resources |

The core package depends on exactly two libraries — `pydantic` and `cryptography`. `boto3` is an optional `cloud` extra and the MCP SDK is an optional `mcp` extra, so a local-only install stays small. That minimalism is deliberate: the fewer dependencies inside the trust boundary, the smaller the surface an audit has to cover.

## Local Setup

```bash
python -m pip install -e '.[dev]'
sbx keygen        # create the local dev ed25519 signing key
sbx doctor        # check Docker, the image, and the key are all present
make demo         # the two-program demo: honest classifier vs exfiltrator
```

`make test` runs the unit and hostile suites together. `make unit` and `make hostile` split them, and `make lint`, `make fmt` and `make typecheck` cover ruff and mypy.

Local runs record their history under `~/.mark1` (overridable with `MARK1_HOME`), which is what the dashboard reads.

## The CLI Surface

| Command | What it does |
| --- | --- |
| `sbx run CODE --data NAME=PATH --schema PATH` | Run code under a declared exit schema. `--local` runs against Docker instead of AWS |
| `sbx run … --principal NAME --budget-bits N` | Charge the run against a named principal's cumulative exit-bits cap. `--budget-window SECONDS` makes the cap a rolling window instead of forever |
| `sbx run … --dataset ID --grant TOKEN` | Clean-room mode: run against a registered dataset by reference, without receiving the bytes |
| `sbx run … --save-attestation PATH` | Write the attestation JSON out for independent verification |
| `sbx dataset add NAME=PATH --owner ID` | Register a dataset you own |
| `sbx dataset grant DATASET_ID --to PROVIDER` | Issue a grant token for a specific code provider |
| `sbx dataset ls` | List registered datasets |
| `sbx verify ATTESTATION --pubkey PEM` | Verify a signature independently of the service that produced it |
| `sbx dashboard --port 8787` | Serve the local read-only run viewer |
| `sbx doctor` | Preflight the local environment |

`--timeout` defaults to 60 seconds of wall clock.

## Declaring an Exit Schema

Schemas are small JSON documents, and their shape is the entire security parameter. Four ship in `schemas/`:

```json
{"type": "enum", "choices": ["spam", "ham", "other"]}
```

```json
{"type": "array", "max_items": 3, "items": {"type": "enum", "choices": ["spam", "ham", "other"]}}
```

```json
{
  "type": "object",
  "properties": {
    "category":   { "type": "enum", "choices": ["invoice", "receipt", "contract", "other"] },
    "confidence": { "type": "integer", "minimum": 0, "maximum": 100 },
    "reference":  { "type": "string", "max_length": 32, "charset": "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ-" }
  }
}
```

Bounds are mandatory where they affect the bound: a string must declare `max_length`, an array must declare `max_items` and `items`. An integer without both `minimum` and `maximum` falls back to the 64-bit machine width rather than being rejected — the conservative choice, since an unbounded integer really can carry 64 bits.

## Deploying the Cloud API

```bash
make lambda-zip                                    # build dist/controlplane.zip
cd infra/terraform/environments/dev
terraform apply -var enable_control_plane=true -var enable_egress_endpoints=true
#   → outputs: api_endpoint, kms_key_id, ecr repository url
```

Push the sandbox image to the ECR repository once, then point the CLI at the deployment:

```bash
export MARK1_API_ENDPOINT="https://<id>.execute-api.<region>.amazonaws.com/"
sbx run classify.py --data emails.csv=./emails.csv --schema schemas/label.json \
    --save-attestation att.json                    # submit → poll → released + KMS-attested

aws kms get-public-key --key-id <kms_key_id> …     # export the public key as PEM
sbx verify att.json --pubkey kms.pem               # VALID, algorithm: ecdsa-p256-sha256
```

That last step is the one worth doing at least once yourself. It verifies the attestation with a key you exported, using a code path that never talks to the service — which is the difference between a claim and a proof.

## Configuration

The control plane is configured entirely through environment variables set by Terraform, so no credentials or resource ids live in the repository.

| Variable | Set for | Purpose |
| --- | --- | --- |
| `MARK1_API_ENDPOINT` | The client | Which deployment `sbx run` submits to. Unset means local |
| `MARK1_HOME` | The client | Where local run history and dev keys live. Defaults to `~/.mark1` |
| `MARK1_RUNS_TABLE`, `MARK1_AUDIT_TABLE` | The Lambda | DynamoDB table names |
| `MARK1_BUCKET` | The Lambda | The artifacts bucket |
| `MARK1_KMS_KEY_ID` | The Lambda | The attestation signing key |
| `MARK1_CLUSTER`, `MARK1_TASK_DEF`, `MARK1_SUBNET`, `MARK1_SG` | The Lambda | What to launch, and where |
| `MARK1_INPUT_URL`, `MARK1_OUTPUT_URL`, `MARK1_OUTPUT`, `MARK1_RUN_ID` | The sandbox task | Presigned input and output URLs, the path the code writes its result to, and the run id |

The sandbox never receives an AWS credential — only presigned URLs, which is why its task role can be empty.

## The Dashboard

`sbx dashboard` serves a self-contained read-only viewer over the local run history on `127.0.0.1:8787`. No web framework, no CDN, no external requests — a deliberate constraint for a tool whose whole subject is data not leaving.

Its signature element is the **exit-bandwidth aperture**: a log-scale gauge plotting a run's exit bits against 1 bit, 1 KB and 1 MB, so a bounded exit reads visually as the sliver it actually is. Alongside it are the run ledger, the bound code, data and schema hashes, the data-flow timeline, and drag-and-drop attestation verification.

Pointing it at DynamoDB for cloud runs is a small follow-up that has not been done.

## What It Costs

Designed to run under $10 a month, and to sit near $0 when idle:

| Resource | Cost |
| --- | --- |
| KMS signing key | About $1 per month — the only meaningful idle cost |
| Lambda and API Gateway | Scale to zero; free or pennies at this scale |
| DynamoDB | Pennies at this scale |
| Fargate | Per-second billing; a run costs fractions of a cent |
| NAT gateway | **Not used at all.** About $32 per month if it were, which would have broken the budget outright |
| ECR and Logs interface endpoints | Hourly charge, so they are opt-in at deploy time |

`terraform destroy` returns the account to roughly zero. Every cloud verification run in this project's history was followed by one.

## Failure Modes Worth Recognising

| Symptom | Likely cause |
| --- | --- |
| `sbx doctor` reports a missing image | The sandbox image has not been built; `--local` needs it present |
| Every local run reports no output at `MARK1_OUTPUT` | The code never wrote to the designated output path. The gate treats this as a failure, not a withholding |
| A cloud run stays pending | The task could not start. Usually the sandbox image was never pushed to ECR, or the ECR and Logs interface endpoints were left disabled at apply time |
| A run is withheld with a schema error on output you believe is correct | The value is JSON-valid but outside the declared bounds — an out-of-range integer, an over-length string, or an enum choice that is not in the list |
| A run is withheld citing the DLP backstop | A conforming output still contained something the secret or PII scanner recognised |
| A run is withheld citing the budget | The principal's cumulative exit bits would exceed the cap. Withheld runs charge zero, so the ledger is not the problem |
| The first cloud run is slow | Cold start, roughly 10 to 30 seconds. Warm pools are roadmap, not built |
