---
project: documiner
projectName: DocuMiner
tagline: Redact First, Then Analyse — Document Security Analysis That Never Ships Your PII
label: Overview
title: Product Overview
description: What DocuMiner does, the ordering decision the whole design rests on, and an honest account of what it is and is not.
order: 1
---

## What is DocuMiner?

Upload a ZIP of enterprise documents — PDFs, PowerPoint decks, Excel workbooks, scanned images — and DocuMiner does two separate things to them.

First it **redacts**. Every extracted string passes through regex patterns for emails, phone numbers and national IDs, and through spaCy named entity recognition. Organisations and locations become `[REDACTED_ORG]` and `[REDACTED_GPE]`. Person names become stable pseudonyms — `emp1`, `emp2` — so a document stays internally consistent and analytically useful instead of being reduced to a wall of black boxes.

Then it **analyses**. The redacted content is examined for security-relevant structure: firewall rules, IAM policy statements, policy documents, and behavioural anomalies in employee verification records.

The output is structured JSON that preserves the original document hierarchy — pages, slides, rows — alongside a list of security insights.

## The Decision That Shapes Everything

**Redaction completes before a single token reaches the model.**

The analysis stage never receives raw documents. It receives the redacted JSON that stage one produced, which means the language model sees `emp1` and `[REDACTED_ORG]` where the source had real names and real companies.

This ordering is not a convenience. A tool whose entire purpose is protecting sensitive documents, which then forwarded those documents unredacted to a third-party API, would be arguing against itself. The redaction stage is also fully deterministic — regex and a local spaCy model, no network call — so it produces the same output every run and works with no API key at all.

The cost is real and worth naming. **The model analyses a document it cannot fully see.** A policy that says "only Rajesh may approve wire transfers above ₹10 lakh" reaches the analyser as "only emp3 may approve...". The structural finding survives; the identity does not. For anomaly detection across records that is exactly right, because the pattern is what matters. For a finding that genuinely depends on *who* someone is, the analyser is working with less than a human reviewer would have — and the pseudonym mapping is kept alongside the output precisely so a human can re-attach identity afterwards.

## The Two Stages Are Not Equally Mature

Worth being direct about, because they are usually described as one pipeline.

**Stage one is the solid half.** Multi-format extraction, OCR with preprocessing, deterministic redaction, consistent pseudonymisation, structured output. It is deterministic, dependency-light, and works offline.

**Stage two is the newer, thinner half.** It is a real LangChain pipeline against GPT-4o, and it produces genuinely structured output through Pydantic schemas. It is also the part with the rough edges — three layers of fallback that make a failed analysis indistinguishable from a clean one, and a set of extraction schemas narrow enough that most real documents classify into a category with no chain registered for it.

## What It Actually Detects

| Stage | Mechanism | Finds |
| --- | --- | --- |
| Redaction | Regex | Emails, phone numbers, SSN-shaped identifiers |
| Redaction | spaCy NER | Person, organisation and location entities |
| Redaction | Configured patterns | Named companies specific to the deployment |
| Analysis | Pandas, vectorised | Verification time-gap outliers, duplicate employee IDs, rubber-stamping supervisors |
| Analysis | GPT-4o + Pydantic | Firewall rules, IAM policy statements, policy document summaries |

The row worth noticing is the Pandas one. **The anomalies in spreadsheets are found by arithmetic, not by prompting.** The model is only used afterwards, to write each finding up as a structured insight. A detector that asked an LLM "is this row anomalous?" would be non-deterministic and unauditable; a mean-plus-two-sigma threshold is neither.

## Technology

| Layer | Technology |
| --- | --- |
| Web application | Django with crispy-forms and Bootstrap 5 templates, session authentication |
| Extraction | PyMuPDF, python-pptx, openpyxl, pandas |
| OCR | Tesseract via pytesseract, with PIL preprocessing and an OpenCV edge-density check |
| PII detection | spaCy `en_core_web_sm`, plus regex |
| Analysis | LangChain with `ChatOpenAI` on GPT-4o at temperature 0 |
| Structured output | Pydantic schemas behind `PydanticOutputParser` |
| Storage | Django ORM with JSONB columns, SQLite in development |

There is **no FastAPI in this project** and no REST framework — it is a server-rendered Django application with a login, an upload form, a results page and JSON download endpoints. Earlier descriptions of a "unified FastAPI REST interface" do not match the code.

## Status

A working Django application, co-authored as a B.Tech capstone and filed as a patent disclosure through VIT's IPR process.

It is a research and coursework project rather than a deployed product. It runs with `DEBUG = True` hardcoded, processes uploads synchronously inside the request, and has no automated tests. The Known Defects document lists the specific gaps rather than leaving them to be discovered.
