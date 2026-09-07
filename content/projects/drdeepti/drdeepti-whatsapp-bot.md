---
project: drdeepti
label: WhatsApp Bot
title: A Conversation as a Data File, and Five Meta Gotchas
description: A declarative node graph with no NLP, and the debugging journey that made it actually receive messages.
order: 4
---

## No NLP, On Purpose

The bot is a state machine driven entirely by `nodes.json`. There is no language model, no intent classifier, and no training data. Sixteen nodes describe the whole conversation, and editing that file changes the bot's behaviour with no code change and no deploy of new logic.

For v1 this is the right trade and not a shortcut. A guided menu is deterministic, auditable, and cannot hallucinate a clinic timing. A patient booking a medical appointment benefits far more from a flow that always works than from one that understands free text most of the time. The cost is rigidity — the bot cannot answer a question the graph does not anticipate, and it falls back to the menu rather than improvising.

## How a Node Works

Each node carries a message template, a set of options, and a `render_as` hint. Three details make the graph do more than its size suggests:

**Message templates interpolate context.** A `{field|default}` placeholder is filled from the session's accumulated context, so a confirmation screen can read back the name, age and time the patient supplied several steps earlier.

**Rendering respects WhatsApp's hard limits.** `render_as: buttons` for three options or fewer, `render_as: list` for up to ten. These are API constraints rather than style preferences, and exceeding them is an error from Meta rather than a degraded layout — so the limit is enforced in the send layer, not merely observed in the data file.

**Some options cannot be static.** Dates are generated at request time rather than stored in the graph. The physical-clinic branch offers the next three non-Sunday days; the online-consultation branch offers the next three weekdays, Monday to Friday. Both are computed in IST regardless of where the Lambda happens to run, which matters because a UTC-based "tomorrow" is wrong for five and a half hours of every Indian day.

## Session State and Navigation

One row per phone number holds `current_node`, a `node_stack`, and a `context` object — the last two as JSONB, because what a conversation accumulates is genuinely schema-less and changes whenever the graph changes.

The `node_stack` is what makes **Back** work: every forward step pushes, and Back pops. Combined with a Main Menu option on every node and reset keywords — `hi`, `menu`, `start`, `restart` — that always jump to the root, a patient can never get stranded somewhere with no way out. Being stuck in a menu is the single most common way a chatbot loses someone, and it is designed against explicitly rather than patched later.

## Security

Every webhook POST is verified before it is parsed. The `X-Hub-Signature-256` header is checked as an HMAC-SHA256 of the raw body against the Meta app secret, compared with `hmac.compare_digest` rather than `==` so the comparison is constant-time and does not leak the expected value through timing. A request with no signature is rejected with 403 before any parsing happens.

Secrets are CloudFormation `NoEcho` parameters injected as Lambda environment variables at deploy time, never committed. `samconfig.toml` is generated from the local environment file by a script and is gitignored, so the deployment configuration is reproducible without the secrets ever entering version control.

## The Debugging Journey

This is the part worth reading. The bot was functionally complete and receiving nothing.

### Messages reaching the webhook, but not really

**Symptom.** Direct POSTs to the endpoint worked perfectly. Zero real patient messages ever triggered a Lambda invocation. CloudWatch showed no new logs at all.

**Investigation.** App permissions — granted. Webhook verification GET — passing. The dashboard's `messages` subscription — showing subscribed. API Gateway access logs — none existed. A direct POST returned `403 Missing signature`, which was the useful result: it proved the Lambda was alive, reachable, and correctly rejecting an unsigned request. The code was fine. Nothing was arriving.

**Root cause.** The Meta account had **two separate WhatsApp Business Accounts**. The WABA configured in the environment was subscribed to the app's webhook. The clinic's actual live phone number belonged to the other one. Meta dropped every message from the real number silently — no error, no log, no bounce.

**Fix.** Subscribe the correct WABA explicitly through the Graph API, with `POST /{waba_id}/subscribed_apps`.

**What it teaches.** The dashboard's "messages: subscribed" indicator is per-WABA, and reads as global when you only think you have one.

### "Verify and save" does not do what it looks like

A closely related trap, and the reason the first one took so long. Clicking **Verify and save** in the app dashboard verifies the webhook GET handshake and nothing else. It does **not** subscribe a WABA to receive message events — that is a separate API call to a separate system. The dashboard presents two independent mechanisms as one action, so a green checkmark next to the webhook URL says nothing about whether messages will ever arrive.

### A false baseline built from old logs

During local development the webhook was exposed through an ngrok tunnel. After moving to Lambda, an old CloudWatch entry from the ngrok phase was treated as a production baseline while diagnosing the missing messages — which made the timeline look like delivery had worked and then stopped, when in fact it had never worked from Lambda at all. The fix was procedural rather than technical: gate log searches to the deployment date of the thing being debugged.

### Staff alerts silently not sending

**Symptom.** The patient's confirmation arrived. The lead was written to the database. The staff number received nothing, with no error anywhere.

**Root cause.** WhatsApp's 24-hour customer service window. Free-form messages can only be sent to a number that has messaged the business within the last 24 hours. The staff number had never messaged the bot, and never would.

**Fix.** A Meta-approved **Utility template** with seven variable slots, sent through a separate template-send path instead of the free-text one. Meta's validator rejected the first draft twice — once for having too many variables for the body's length, and once for ending the body on a variable. The template was rewritten with substantially more static text and a closing static sentence.

**What it teaches.** Templates need a high ratio of static text to variables, and a variable cannot be the first or last element of the body.

### The driver that rejects its own connection string

**Symptom.** The Lambda crashed on the first real message with `TypeError: connect() got an unexpected keyword argument 'sslmode'`.

**Root cause.** asyncpg does not accept `?sslmode=require` in the URL the way psycopg2 does, despite both being Postgres drivers pointed at the same database.

**Fix.** Strip the query string from the connection URL and pass SSL through the engine's `connect_args` instead.

### A phone number ID missing one digit

Outbound sends failed with unhelpful API errors. The phone number ID had been copied with a trailing digit missing — fifteen characters where there should be sixteen. Worth including precisely because it is not clever: a meaningful share of integration debugging is verifying that an opaque identifier is character-for-character what the dashboard says it is.

## What Is Actually Still Open

The `collect_time` dead-end that once stranded patients at the time-selection step **is fixed** — the graph now has working `collect_time_slot` and `collect_online_time` nodes, alongside dynamically generated dates for both the in-person and online branches.

Genuinely still open:

- The access token is a temporary user token and needs migrating to a permanent System User token.
- **There is no webhook deduplication.** Meta retries a delivery up to three times, and nothing in the handler tracks message ids, so a retry re-processes the message and can advance the conversation twice or write a duplicate lead. This is the most significant open defect.
- There is no graceful handling if the database is unreachable — the Lambda returns 500 and Meta retries, which compounds the deduplication gap above.
- There is no admin view for leads; they are read out of the database or off the staff WhatsApp thread.
- A completed bot conversation still does not reserve a real slot.
