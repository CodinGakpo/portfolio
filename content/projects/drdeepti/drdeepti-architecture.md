---
project: drdeepti
label: Architecture
title: Three Services, One Database
description: How the pieces are deployed, why they share a Postgres instance instead of an API, and what that trade actually costs.
order: 2
---

## The System

![DrDeepti system map](asset:drdeepti-system)

Three deployables, three different hosts, one database. Nothing in the middle.

## Why One Instance Instead of an API Between Them

The conventional answer would be to give the chatbot its own database and have it call the Django API to create leads. That was not done, and the reasoning is worth stating rather than leaving as an accident of convenience.

An HTTP contract between the two would mean an auth scheme between them, a retry policy, a failure mode when Django is asleep on a free-tier dyno, and a second place for the lead schema to drift. What that would buy is independence the project does not need — the two services are deployed by one person, on one release train, and neither is scaling independently of the other.

A shared instance with genuinely separate table groups gets the same isolation for none of that cost. Neither service reads the other's tables. The bot owns `whatsapp_sessions` and `whatsapp_leads` through Alembic; Django owns everything else through its own migrations. The boundary is a convention rather than a wall, and at this size a convention is enough.

The cost, named plainly: there is no automatic path from a chatbot lead to a booked slot. The two systems agree on nothing at runtime. A lead is a message to a human, and a human has to act on it.

## The Slot Model

Availability is authored coarsely and enforced finely.

| Model | Role |
| --- | --- |
| `DoctorProfile` | A doctor, their specialization and bio |
| `AvailabilitySlot` | A doctor's working window on a date — `unique_together` on doctor, date and start time |
| `TimeSlot` | A bookable 15-minute unit, with `is_booked` — `unique_together` on availability and start time |
| `Appointment` | The booking itself, with a **one-to-one** relation to a `TimeSlot` |

Staff enter a window such as "Tuesday, 5pm to 8pm" and `AvailabilitySlot.save()` expands it into 15-minute `TimeSlot` rows automatically. Regeneration only fires when the date or times actually changed, so re-saving an availability row for an unrelated edit does not silently destroy and recreate its slots — and with them, any bookings pointing at those slots.

There is one defensive detail worth noticing: generation is guarded by a check that the `clinic_timeslot` table exists in the database at all. That guard is there so the very first migration run, which creates `AvailabilitySlot` before `TimeSlot` exists, does not crash on a table it is about to create.

## Identity

Patient identity is Firebase phone sign-in. The browser completes the SMS challenge with Firebase directly and receives an ID token; the Django API verifies that token server-side with `firebase-admin` and — importantly — **checks that the phone number inside the verified token matches the phone number the request claims**. Without that comparison, a valid token for any number would authorize a booking for any other.

A separate OTP path exists in `appointments/otp_delivery.py`, abstracting SMS and WhatsApp providers behind a configurable setting and normalising Indian numbers to `91XXXXXXXXXX` for Twilio. Firebase is what the live booking flow uses.

## Deployment

| Piece | Host | Notes |
| --- | --- | --- |
| Frontend | Vercel | Static build; CORS and CSRF trust the production domain, localhost, and any `*.vercel.app` preview via a regex |
| Django API | Render | `render.yaml` plus `build.sh`; static files served by WhiteNoise. An EC2-over-SSH GitHub Actions path also exists in the repo's history |
| Chatbot | AWS Lambda | SAM template at the repo root, `CodeUri` pointing at `whatsapp-bot/` |
| Database | Neon | Serverless Postgres with a connection pooler, free tier |

Settings are selected by an `ENV` variable, with `prod.py` and `local.py` both extending `base.py`. Locally, if the Postgres variables are absent, it falls back to SQLite — so a fresh clone runs without provisioning anything.

A small middleware adds `X-Robots-Tag: noindex` to every `/api/` and `/admin/` response, so the API surface and the admin never appear in search results for a clinic whose public pages very much should.

## Two Connection-Pool Details That Matter

The chatbot's pool is deliberately tiny — `pool_size=2, max_overflow=3`. This looks under-provisioned and is not. Lambda scales by starting many concurrent execution environments, each with its own pool, and Neon's free tier caps total connections. A pool sized for a single long-lived server would exhaust that cap under a burst of concurrent invocations.

The connection string also needs handling that differs between the two services. asyncpg does not accept `sslmode=` in the URL query string the way psycopg2 does, so the bot strips any query parameters from the connection string and passes `ssl` through `connect_args` instead. Django, on psycopg 3, takes the URL as given. Same database, two drivers, two different correct ways to reach it.
