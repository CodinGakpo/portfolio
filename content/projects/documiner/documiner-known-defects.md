---
project: documiner
label: Known Defects
title: What Is Actually Broken
description: A read of the current code, listing the defects rather than leaving them to be discovered — including two that are security-relevant in a security tool.
order: 4
---

## Why This Document Exists

This project's own subject is finding security problems in other people's documents. Publishing it without an equally direct account of its own would be the wrong shape. Everything below comes from reading the code at the current commit, and each item names the specific consequence rather than the general category.

## Security-Relevant

**The results view is not scoped to the requesting user.** `document_results` is decorated with `@login_required`, so an anonymous visitor is turned away — but it fetches its `ProcessingResult` by primary key alone, with no `user` filter. Any authenticated user can therefore view any other user's results by changing an integer in the URL, and those results contain the full redacted document tree and every security insight derived from it. The neighbouring download endpoints get this right, filtering on `user=request.user`; this one was missed. It is an insecure direct object reference, and the fix is a single additional filter on the query.

**`DEBUG = True` is hardcoded.** The environment-driven line is present but commented out, with the literal below it. Deployed as-is, an unhandled exception renders Django's full traceback page — local variables, settings, and the parts of the configuration that page exposes — to whoever triggered it. For an application that holds uploaded documents this is the highest-severity item on the list, and the fix is uncommenting one line.

## Correctness

**`download_analysis` raises on every call.** It reads `document.uploaded_at`, and the model field is named `upload_date`. There is no such attribute, so the endpoint fails with an `AttributeError` for every request. It has evidently never been exercised.

**The same endpoint reads file statistics from the wrong object.** It looks for `file_statistics` inside `document.processed_data`, but that key is stored on `ProcessingResult`, not inside the processed data tree. Once the attribute error above is fixed, this silently returns an empty object.

**`results_view` is dead code that would fail if reached.** It is unrouted — the URL configuration points at `document_results`, with a comment noting only one should be kept — and it renders `'results.html'` where the template actually lives at `documents/results.html`. It also has no `@login_required` and no user scoping, so it should be deleted rather than left as a trap for whoever wires up a URL to it later.

## Dependencies and Configuration

**LangChain and its OpenAI integration are not declared in `requirements.txt`.** `analysis.py` imports `langchain_openai`, `langchain.prompts`, `langchain.schema` and `langchain.output_parsers`, and none of those packages appear in the requirements file. A clean install following the README produces an application whose analysis stage fails immediately on import — caught by the outermost fallback, which reports the service as temporarily unavailable. The failure is therefore quiet rather than loud, which is worse: a fresh deployment appears to work while doing only half its job.

**`requirements.txt` has duplicated and conflicting entries.** Several packages are listed twice, once unpinned and once with a minimum version, because a second dependency block was appended rather than merged.

**Celery and Redis are declared but never used.** Neither appears anywhere in the code or settings. They are the remains of a planned asynchronous processing path that was never built — which is exactly the thing the next item needs.

**Streamlit and `ProtoPlus` are declared and unused.** Streamlit is presumably left from an earlier interface before the Django rewrite.

## Architecture

**Processing is fully synchronous inside the HTTP request.** The upload view calls extraction and then analysis directly, so a request holds a worker for the entire duration of ZIP extraction, OCR across every image, and every sequential GPT-4o call. A large archive will exceed any ordinary gateway timeout, and the user sees a failed request rather than a queued job. This is what the unused Celery dependency was meant to solve, and it is the single change that would most improve the application.

**There is no upload size or file-count limit.** Nothing bounds how large an archive may be or how many files it contains, so processing time and API spend are both unbounded by a single upload.

**There are no automated tests.** `documents/tests.py` is the empty Django stub. Nothing verifies that redaction actually removes what it claims to — which, for a redaction tool, is the test that most needs to exist. A regression that silently stopped redacting a category of PII would produce output that still looks structurally correct.

**Debug `print` statements run in production paths.** Views and the analysis module print progress, results and full tracebacks to stdout. Some of that output includes analysis content.

## Priority

Ordered by consequence rather than effort:

1. Scope `document_results` by `request.user` — one filter, closes cross-tenant access to uploaded document content.
2. Restore environment-driven `DEBUG` — one line, closes traceback exposure.
3. Declare LangChain in `requirements.txt` — makes a clean install actually work.
4. Move processing to Celery — the dependency is already there.
5. Fix or delete `download_analysis`, and delete `results_view`.
6. Add a redaction test suite, starting with a fixture asserting that known PII does not survive the pipeline.
7. Bound upload size and add token accounting.
