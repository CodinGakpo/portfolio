---
project: documiner
label: Analysis
title: What the Model Does, and What It Deliberately Does Not
description: A classification router into schema-bound extraction chains, vectorised anomaly detection that never asks the model anything, and three layers of fallback.
order: 3
---

## Routing and Fallbacks

![DocuMiner classification routing and fallbacks](asset:documiner-fallbacks)

## Spreadsheets: Arithmetic Finds It, the Model Writes It Up

This is the part of the analysis worth defending, and it is the opposite of how an LLM pipeline is usually built.

Detection is done entirely in Pandas, vectorised, with no model call:

**Time-gap outliers.** Where a sheet carries both an authorization date and an in-person verification date, the gap is computed per row and compared against the sheet's own mean plus two standard deviations. A record verified far later than its peers is flagged — with the actual gap and the actual average quoted in the finding, so the claim is checkable.

**Duplicate employee IDs.** Two records sharing an employee ID is the signal for a failure in de-provisioning — an account that should have been closed and was instead reissued or left live. The finding names this as the ghost-account risk rather than reporting a bare duplicate.

**Rubber-stamping.** For each supervisor, the proportion of their approvals verified within one day. Where that exceeds 80% across at least three approvals, the supervisor is flagged as approving without meaningful review. The minimum-count guard is what stops a supervisor with a single fast approval reading as a 100% rubber-stamper — the same cold-start problem any rate-based signal has.

Only after a finding exists does the model get involved, and its job is narrow: take the row and the finding, and produce an `EmployeeVerificationInsight` — an employee ID, a one-sentence summary, a severity, and an explanation of why it matters.

The reason to build it this way is that the detection stays deterministic and auditable. Run it twice on the same sheet and it flags the same rows. Ask why a row was flagged and the answer is a number and a threshold rather than a model's judgement. The rubber-stamping analysis in particular is one nobody would get reliably by prompting — it requires grouping every row by supervisor and computing a ratio, which is a database operation wearing a security hat.

Rubber-stamping is also reported **once per supervisor** rather than once per row, because the finding is about a person's behaviour across records, not about any individual record.

## Documents: Classify, Then Extract Into a Schema

Each page or slide gets one zero-shot classification call, returning exactly one of five labels. Three of those labels have a registered extraction chain, each terminating in a Pydantic parser:

| Label | Schema | Fields |
| --- | --- | --- |
| `Firewall_Rule` | `FirewallRule` | source IP, destination IP, port, action constrained to ALLOW or DENY, description |
| `IAM_Policy` | `IAMPolicy` | principal, permission, resource ARN, effect constrained to Allow or Deny |
| `Policy_Document` | `PolicyDocument` | title, purpose, key processes, summary, detailed security analysis |
| `Employee_Record` | — | no chain registered |
| `General_Text` | — | no chain registered |

The schemas do real work. `Literal["ALLOW", "DENY"]` means a model that replies "permit" fails validation rather than producing a rule nobody can filter on later. Every field carries a description that becomes part of the prompt through the parser's format instructions, so the schema is simultaneously the validation and the specification.

`PolicyDocument` carries a small guard worth noticing: a field validator that synthesises a `details` value from the title and purpose if the model returns it empty. That is a patch over an observed failure mode rather than a designed feature, and the view layer patches the same problem again — evidence that the model returning empty detail fields was a recurring nuisance.

## Three Layers of Fallback

Every path produces an insight, and the layers are ordered from most specific to least.

**A routed chain whose output fails to parse** falls back to an insight carrying the first 300 characters of the page's own content, a Medium risk level, and the parse error attached. The page is not lost; it is downgraded from structured to raw.

**A label with no registered chain** — `Employee_Record` or `General_Text` — produces a General insight at Low risk, again carrying the page's own content. Since two of five labels are unrouted, this is not a rare path. A document that is genuinely prose rather than a firewall table lands here by default.

**A failure of the entire analysis run** — no API key, no quota, no network — returns a single Informational placeholder saying the service is temporarily unavailable, and the upload still completes with its redaction intact.

That third layer is the one worth arguing about. It means **a failed analysis and a genuinely clean document look identical in the interface.** A user who uploads a document, gets no findings, and reads "analysis service temporarily unavailable" has been told something; a user who gets one Informational placeholder among real output may not notice. The redaction is unaffected either way, which is the saving grace — the deterministic half of the product does not depend on the API at all.

## Cost and Call Volume

The document path makes **one classification call per page or slide, plus one extraction call for every page that classifies into a routed label.** A fifty-page PDF is therefore fifty to one hundred GPT-4o calls for a single upload, issued sequentially, inside the HTTP request.

Nothing batches, caches, or deduplicates. Two identical uploads cost twice. There is no token accounting anywhere in the code, and no ceiling on how much a single upload can spend.

This is the most significant scaling limitation in the project, and it compounds with the synchronous processing described in Known Defects: the same design that makes a large upload expensive is the one that makes it time out.

## What Is Not Here

Two things are worth correcting directly, because they have been described as present.

**There is no map-reduce summarisation and no chunking strategy.** No text splitter is used anywhere. Documents are divided by their own natural structure — one unit per page or slide — and each unit is sent whole. That works because a page is comfortably inside GPT-4o's context window, but it means a genuinely long single-page document has no handling at all.

**There is no zero-shot classification model in the ML sense.** The classification is a prompt asking GPT-4o to return one of five labels. Zero-shot in the sense of requiring no training examples, yes; not a zero-shot classifier as a distinct technique.
