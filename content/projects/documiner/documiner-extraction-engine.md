---
project: documiner
label: Extraction Engine
title: Data Extraction
description: How unstructured data is extracted and normalized across varying formats.
order: 2
---

## OCR and Preprocessing Pipeline

A major hurdle was dealing with scanned PDFs and images that yielded garbage text when fed directly into Tesseract OCR.

To solve this, a custom OpenCV preprocessing step was added before OCR:

- **Binarization.** Converting images to pure black and white to increase contrast for text.
- **Deskewing.** Automatically rotating crooked scans so text lines are perfectly horizontal.
- **Noise reduction.** Removing artifacts and speckles that confuse the OCR engine.
