---
project: drdeepti
label: Documentation
title: Running and Deploying the Platform
description: Local setup for all three pieces, the deployment paths, what it costs, and the failure modes worth recognising.
order: 5
---

## Repository Shape

Three project roots in one repository, with no top-level build tool tying them together. Each directory is treated as its own project.

| Directory | What it is |
| --- | --- |
| `backend/` | Django REST API — `accounts`, `clinic`, `appointments` |
| `frontend/` | React 19 + Vite SPA — public site, booking flow, doctor portal |
| `whatsapp-bot/` | FastAPI chatbot, deployed as a Lambda |
| `template.yaml` | SAM template at the repo root, with `CodeUri` pointing at `whatsapp-bot/` |

## Local Setup

**Backend.** Create a virtualenv, install requirements, migrate, run. Settings are chosen by the `ENV` variable — `prod.py` when it is `prod` or `production`, otherwise `local.py`, both extending `base.py`. If the Postgres variables are absent locally, it falls back to SQLite, so a fresh clone runs with no database to provision. `base.py` hand-parses a `.env` file rather than using python-dotenv, and accepts either a single connection string or individual `PG*` variables.

**Frontend.** `npm install`, then `npm run dev` for Vite, `npm run build` for a production bundle, `npm run lint` for ESLint. No test runner is configured.

**Chatbot.** Create a virtualenv, install requirements, then `alembic upgrade head` — which applies against **the same Neon database the backend uses**, so be deliberate about which environment is targeted. `uvicorn main:app --port 8001 --reload` runs it locally; Meta needs a public URL, so local webhook testing goes through a tunnel.

## Deploying the Chatbot

```
python generate_samconfig.py   # regenerates samconfig.toml from whatsapp-bot/.env
sam build && sam deploy        # or ./build.ps1, or python deploy.py
```

`samconfig.toml` is generated, gitignored, and should never be hand-edited — regenerate it instead. Secrets reach the Lambda as CloudFormation `NoEcho` parameters injected as environment variables at deploy time, so nothing sensitive is committed. `.aws-sam/` and the virtualenvs are gitignored for the same reason.

The function runs on Python 3.12 at 256 MB with a 30-second timeout.

## Configuration

| Variable | Used by | Purpose |
| --- | --- | --- |
| `NEON_CONNECTION_STRING` or `DATABASE_URL` / `PG*` | Both services | The shared Postgres instance |
| `ENV` | Backend | Selects the production or local settings module |
| `OTP_PROVIDER` | Backend | Chooses the SMS or WhatsApp OTP delivery path |
| `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_SMS_FROM` | Backend | Twilio credentials for the OTP path |
| `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_BUSINESS_ACCOUNT_ID` | Chatbot | Meta Cloud API credentials |
| `META_APP_SECRET` | Chatbot | Verifies the `X-Hub-Signature-256` on every webhook POST |
| `STAFF_WHATSAPP_NUMBER` | Chatbot | Where lead alerts are sent |

Firebase service-account credentials back the server-side ID token verification in the Django API.

## Editing the Conversation

`whatsapp-bot/nodes.json` is the whole conversation. Adding a question, changing wording, or re-ordering the flow requires no Python and no redeploy of logic — only the file. Three rules when editing it:

- `render_as: buttons` supports at most three options; `render_as: list` supports at most ten. These are Meta's limits, not the bot's.
- Every node should keep a route back to the root, or a patient can be stranded.
- Date options for the in-person and online branches are generated in code at request time, not stored in the file — editing those means editing `graph.py`.

## What It Costs

| Resource | Cost |
| --- | --- |
| Meta Cloud API | 1,000 free conversations per month |
| AWS Lambda | 1M invocations per month free — effectively $0 at clinic scale |
| Neon Postgres | 0.5 GB storage, 190 compute hours per month, free |
| Vercel | Free for a static frontend |
| Render | Free tier for the API, with the cold-start behaviour that implies |
| **Total** | **Approximately $0 per month** |

Zero cost was a design goal rather than a happy accident. The clinic should not carry an infrastructure bill until volume exceeds these free tiers by an order of magnitude, and every architectural choice — serverless compute, a serverless database, static hosting, one shared instance instead of two — follows from that.

## Failure Modes Worth Recognising

| Symptom | Likely cause |
| --- | --- |
| The bot answers direct POSTs but no real messages arrive | The clinic's number belongs to a WABA that was never subscribed to the app. The dashboard's "subscribed" indicator is per-WABA |
| Webhook verification passes but messages still never arrive | "Verify and save" only confirms the GET handshake. WABA event subscription is a separate Graph API call |
| The patient gets a confirmation but staff receive nothing | The 24-hour customer service window. Staff have not messaged the bot, so only an approved template will send |
| A Meta template is rejected | Too many variables for the body length, or a variable as the first or last element |
| `TypeError: connect() got an unexpected keyword argument 'sslmode'` | asyncpg does not accept `sslmode` in the URL. Strip the query string and pass `ssl` via `connect_args` |
| Outbound sends fail with opaque API errors | Verify the phone number ID character by character — a missing digit produces exactly this |
| Connection errors under a burst of messages | Many concurrent Lambda environments, each with its own pool, against Neon's connection cap. The pool is deliberately small for this reason |
| A patient reports being booked twice from WhatsApp | Meta retried the webhook and there is no deduplication. This is a known open defect |
| Editing an availability window wipes its bookings | Regeneration only fires when the date or times change — but when it does fire, it deletes and recreates that window's slots |
| Old CloudWatch entries confuse a diagnosis | Gate the search to the deployment date of the thing being debugged |

## The Roadmap

In priority order, by actual impact rather than by effort:

1. **Webhook deduplication** — track Meta message ids so a retry cannot re-process a conversation or duplicate a lead.
2. **A permanent System User access token**, replacing the temporary one.
3. **Slot reservation from the chatbot** — the change that would let the bot book instead of merely capture intent, and the one that makes the two halves of the platform one product.
4. **Graceful database-unavailable handling** in the Lambda, so a Neon hiccup does not become a Meta retry storm.
5. **A lead view in the admin**, so staff do not read leads out of a WhatsApp thread.
6. **A test for concurrent booking**, firing two simultaneous requests at one slot and asserting exactly one wins.
