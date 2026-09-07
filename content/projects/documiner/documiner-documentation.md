---
project: documiner
label: Documentation
title: Running DocuMiner
description: Setup including the dependency the README omits, the data model, the output format, and the failure modes worth recognising.
order: 5
---

## Prerequisites

| Requirement | Notes |
| --- | --- |
| Python 3.12 | |
| Tesseract OCR | A system package, not a pip install — `apt-get install tesseract-ocr`, `brew install tesseract`, or the UB-Mannheim build on Windows |
| spaCy model | `python -m spacy download en_core_web_sm` — the requirements file installs spaCy but not the model |
| An OpenAI API key | Only for stage two. Redaction works without one |

## Setup

```bash
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
pip install langchain langchain-openai      # see the note below
python -m spacy download en_core_web_sm
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

**The extra install line is not optional.** `analysis.py` imports `langchain_openai` and several `langchain` modules, and neither package appears in `requirements.txt`. Following the README exactly produces an application whose analysis stage fails on import — and because that failure is caught by the outermost fallback, it reports itself as "analysis service temporarily unavailable" rather than as a missing dependency. Stage one redaction works correctly regardless, which makes the half-working state easy to miss.

Configuration is read from the environment: a Django `SECRET_KEY`, `ALLOWED_HOSTS`, a Tesseract path if it is not on the system path, and `OPENAI_API_KEY` for the analysis stage. `DEBUG` is currently hardcoded rather than read from the environment.

## Using It

Log in, upload a ZIP archive, and the application processes it inline. The archive can contain any mix of supported formats, nested in directories:

```
documents.zip
├── report.pdf
├── deck.pptx
├── employees.xlsx
└── scans/
    ├── invoice.png
    └── contract.jpg
```

When processing finishes you are redirected to a results page showing the redacted content and any security insights. Both are downloadable as JSON.

## The Data Model

| Model | Holds |
| --- | --- |
| `DocumentUpload` | The uploaded file, its size and name, a status of pending, processing, completed or failed, the processed data as JSONB, processing time, any error message, and the security insights |
| `ProcessingResult` | A one-to-one companion carrying the redacted JSON, per-format file statistics, and the same security insights |

Uploads are stored under `media/user_<id>/<uuid>_<filename>`, so the storage path is namespaced per user and a uuid prevents one upload overwriting another with the same name.

The security insights are stored on both models, which is duplication rather than design — the two were added at different times, and the analysis result ends up written to each.

## The Output Format

The redacted JSON mirrors each source document's own structure. A spreadsheet keys by sheet, then by row:

```json
{
  "employee_data.xlsx": {
    "type": "spreadsheet",
    "content": {
      "Sheet1": {
        "headers": ["Employee Name", "Employee ID", "Department"],
        "rows": {
          "row_001": {
            "Employee Name": "emp1",
            "Employee ID": "EMP12345",
            "Department": "[REDACTED_ORG]"
          }
        }
      }
    }
  }
}
```

Note what survived. The employee ID and the row structure are intact, because those are what makes the data still analysable; the name became a stable pseudonym and the department became a type label. A `_pseudonym_mapping` entry sits alongside the files, so a human with the right authority can re-attach identity to a finding afterwards.

## Customising Redaction

Two extension points, both edited in `utils.py` rather than configured externally:

**Company patterns.** `enhanced_company_redaction` holds a list of regex-to-replacement pairs for organisation names spaCy will not recognise on its own — internal codenames, subsidiaries, partner names.

**Custom PII patterns.** Additional regex rules for identifier formats specific to a deployment — a national ID scheme, an internal badge format, a customer reference shape.

Both being code rather than configuration is a limitation worth naming: a compliance team cannot adjust redaction rules without a developer and a redeploy.

## Failure Modes Worth Recognising

| Symptom | Cause |
| --- | --- |
| Every analysis reports "service temporarily unavailable" | Usually LangChain is not installed, since it is missing from `requirements.txt`. Also produced by a missing API key, an exhausted quota, or no network — the fallback does not distinguish them |
| `TesseractNotFoundError` | Tesseract is a system package. Install it and set the path if it is not on `PATH` |
| Redaction leaves names untouched | The spaCy model was never downloaded. Redaction degrades to regex only and does not raise |
| A large upload times out | Processing runs synchronously inside the request. There is no queue, and no size limit to stop it being attempted |
| A diagram's text is missing from the output | Intentional. The edge-density check skips images classified as diagrams, because OCR over a chart produces confident nonsense |
| Downloading the analysis JSON errors | `download_analysis` references a model field that does not exist. It fails on every call |
| Insights appear with empty detail fields | A known model failure mode, patched in two places — a schema validator and again in the view |
| A results URL shows someone else's document | The results view is not scoped to the requesting user. This is a real defect, not a permission setting |

## Where to Read the Code

| Path | What is in it |
| --- | --- |
| `documents/utils.py` | The whole deterministic pipeline — handlers, OCR, redaction, pseudonymisation. The largest and most substantial file |
| `documents/analysis.py` | The LangChain stage: the Pandas anomaly detection, the classification router, the fallbacks |
| `documents/schemas.py` | The four Pydantic output schemas — the contract the model is held to |
| `documents/prompts.py` | All five prompts, in one file |
| `documents/models.py` | `DocumentUpload` and `ProcessingResult` |
| `documents/views.py` | Upload, results, and the JSON download endpoints |

`utils.py` is where the project's actual engineering lives, and `analysis.py` is where its newest and least settled work is.
