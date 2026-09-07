---
project: documiner
label: Pipeline
title: Extraction, OCR and Redaction
description: The deterministic half — how four file formats become one shape, and how PII is removed before anything leaves the machine.
order: 2
---

## The Pipeline

![DocuMiner two-stage pipeline](asset:documiner-pipeline)

## One Archive, Four Handlers

Upload is a ZIP rather than individual files, because the real unit of work is a set of related documents — a report, its supporting deck, and the spreadsheet behind both. Each entry is dispatched by type, and an unrecognised extension is skipped rather than guessed at.

| Format | Library | What is extracted |
| --- | --- | --- |
| PDF | PyMuPDF | Text per page, tables, and embedded images sent on to OCR |
| PPTX | python-pptx | Slide text, plus text found inside slide images |
| XLSX | openpyxl and pandas | Row-wise data with header detection, keyed as `row_001` and so on |
| Images | Pillow, then OCR | PNG, JPG, BMP, TIFF, GIF |

Everything converges on one output shape: a per-file object carrying a `type` and a `content` tree that mirrors the source's own hierarchy. A PDF keys by page, a deck by slide, a workbook by sheet then row. That uniformity is what lets the analysis stage treat a slide and a PDF page identically while still reporting exactly where a finding came from.

## OCR, and Knowing When Not to Run It

Scanned pages and embedded images go through Tesseract, but raw Tesseract on an unprocessed image produces noise. The preprocessing chain is deliberately modest and entirely Pillow-based:

- convert to grayscale,
- double the contrast, then double the sharpness,
- apply a 3-pixel median filter to suppress speckle,
- upscale anything under 300 pixels on a side with Lanczos resampling, since small text is where OCR fails first.

Worth stating plainly, because it is often described otherwise: **there is no binarisation and no deskewing.** A rotated scan is not straightened before OCR. Both would be genuine improvements and neither is implemented.

The more interesting piece is the decision *not* to OCR. A separate check estimates edge density with OpenCV and classifies an image as a diagram rather than a text image. Running OCR over a network diagram or a chart produces confident nonsense — fragments of axis labels and legend text assembled into sentences that were never in the document — and that nonsense would then flow downstream into redaction and analysis as if it were real content. Skipping is the correct answer, and knowing when a tool will produce garbage is more useful than running it everywhere.

Extracted text is then cleaned and checked for meaningful content, so pages that yielded nothing but artefacts are dropped rather than carried forward as empty noise.

## Redaction

Three mechanisms run in sequence over every extracted string.

**Regex** handles the patterns that are unambiguous by shape — email addresses, phone numbers, SSN-formatted identifiers. These become `[REDACTED_EMAIL]` and so on.

**spaCy NER** handles what regex cannot. Person entities are replaced with a stable pseudonym; organisations and locations are replaced with a bracketed label naming the entity type.

**Configured company patterns** catch the deployment-specific names NER reliably misses — an internal project codename is not a recognisable organisation to a general-purpose model.

One implementation detail is load-bearing. Entities are replaced **in reverse order, from the end of the string backwards.** Replacing forwards would invalidate every subsequent character offset the moment a replacement changed the string's length — `Rajesh Kumar` becoming `emp1` shifts everything after it by eight characters, so the next entity's recorded span would point at the wrong text. Iterating from the end means every offset still refers to text that has not moved yet. It is a small thing that would corrupt every multi-entity document if reversed.

## Pseudonyms Instead of Black Boxes

The choice that makes the output still useful: person names are **pseudonymised, not destroyed.**

Redacting every name to `[REDACTED]` is safer in the trivial sense and destroys the analysis. A spreadsheet where every supervisor is `[REDACTED]` cannot show that one supervisor approved forty records in a day. The same sheet where they are `emp7` shows it immediately, without revealing who `emp7` is.

Pseudonyms are generated per document so the same person maps to the same identifier throughout, and the mapping is carried in the output under `_pseudonym_mapping`. That is the deliberate trade: the mapping is the sensitive artifact, held in one place, rather than identity being scattered across every page.

Employee IDs and dates are deliberately **left intact**. They are what the anomaly detection actually operates on, and an employee ID is an internal identifier rather than personal data in the sense the rest of this is guarding.

## What Reaches Stage Two

Only the redacted JSON. The analysis stage takes the output of redaction as its input, so the boundary is structural rather than a matter of remembering to sanitise before each call.

The spreadsheet path is handed the content tree directly, because Pandas needs the rows as rows. The PDF and PPTX paths are flattened per page or slide into a LangChain `Document` combining page text, table content, and any OCR text recovered from images, with metadata recording the source file and location so a finding can be traced back to a specific page.
