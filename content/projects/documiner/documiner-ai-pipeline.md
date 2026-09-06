---
project: documiner
label: AI Pipeline
title: AI and LangChain
description: The core intelligence of the platform driving compliance analysis.
order: 3
---

## Context Window Strategy

Enterprise documents often exceed the token limits of modern LLMs. Feeding a 100-page policy manual into OpenAI's API directly results in a context window error.

DocuMiner implements a **map-reduce summarization strategy** via LangChain:

- **Chunking.** Documents are split into overlapping chunks so context at boundaries is not lost.
- **Map step.** Each chunk is analyzed independently for compliance violations.
- **Reduce step.** The findings from all chunks are aggregated into a final, unified compliance report.

## Technology Stack

| Layer | Technology |
| --- | --- |
| API framework | FastAPI (Python) |
| Orchestration | LangChain |
| AI model | OpenAI API |
| Computer vision | OpenCV, Tesseract OCR |
| NLP | spaCy |
