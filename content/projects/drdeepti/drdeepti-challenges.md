---
project: drdeepti
label: Challenges
title: Debugging Journey
description: Real production bugs faced during the WhatsApp chatbot deployment — problem, root cause, fix, and learnings.
order: 4
---

## The Two WABA Problem

This was the most time-consuming bug. The bot responded correctly to direct POST tests, but zero real patient messages ever triggered a Lambda invocation.

| | |
| --- | --- |
| Symptom | CloudWatch had no new logs after July 5th. A direct POST to API Gateway returned `403 Missing Signature`, proving Lambda was alive and reachable. |
| Investigation | Checked app permissions (granted) → webhook verification GET (passing) → messages subscription in the dashboard (showing subscribed) → API Gateway access logs (none existed). |
| Root cause | The Meta account had two separate WhatsApp Business Accounts (WABAs). The active clinic number belonged to one that had never been explicitly subscribed to the App via API. Meta silently dropped all messages. |
| Fix | Called `POST /{waba_id}/subscribed_apps` via the Meta Graph API to subscribe the correct WABA. |
| Learned | Meta's dashboard "messages: subscribed" indicator is per-WABA and is often visually misleading if you have more than one. |

## Staff Alert and the 24-Hour Window Policy

| | |
| --- | --- |
| Symptom | Booking confirmation arrived on the patient's phone and the lead saved to the database, but no alert reached the staff number. |
| Root cause | WhatsApp's 24-hour customer service window blocks free-form messages to numbers that have not messaged the bot first. The staff number had never initiated contact. |
| Fix | Created a Meta-approved Utility message template (`new_lead_alert`) with 7 dynamic variable slots. The template was rewritten significantly after being rejected for "too many variables for its length". |
| Learned | WhatsApp templates require a high ratio of static text to variables, and a variable cannot be the first or last element of the body. |
