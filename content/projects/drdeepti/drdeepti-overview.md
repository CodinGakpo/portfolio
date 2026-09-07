---
project: drdeepti
projectName: DrDeepti
tagline: A Real Clinic's Booking Platform, Plus the WhatsApp Channel Patients Actually Use
label: Overview
title: Product Overview
description: What the clinic needed, the three independently deployed pieces that answer it, and the one design decision underneath all of them.
order: 1
---

## What This Is

A production platform for Dr. Deepti Sinha's ENT practice at Adarsh ENT Clinic, live at [drdeeptientdelhi.in](https://drdeeptientdelhi.in). It has real patients booking real appointments, which is the constraint that shapes everything else in it.

It is three independently deployed pieces:

- A **public site and booking flow** where a patient picks a real slot, verifies their phone, and gets a confirmed appointment.
- A **doctor portal** for viewing the day's schedule.
- A **WhatsApp chatbot** that captures patients who were never going to open a website, and forwards them to clinic staff as structured leads.

## The Problem, In Two Halves

The clinic ran on phone calls and messages. That produced two distinct failure modes, and they needed different answers.

**Structured bookings were error-prone.** Manual entry, overbooking, and staff time spent on scheduling instead of care. The web platform answers this by making slot state authoritative in a database and making double-booking structurally impossible rather than merely unlikely.

**Unstructured inquiries were being missed.** Patients were already messaging the clinic on WhatsApp asking about availability, fees and directions. Those were handled by hand and frequently dropped. A website does not fix this, because the patients causing it were never going to visit one. The chatbot answers this by meeting them in the conversation they had already started.

The website remains the primary booking surface. The chatbot is a complementary capture channel, not a replacement — and the two deliberately do different jobs.

## The Decision That Shapes Everything

**Three deployables, one database instance — and no service-to-service call between them.**

The Django API and the WhatsApp Lambda both talk to the same Neon Postgres. They do not share a schema, do not read each other's tables, and never call each other. The bot writes sessions and leads; the web platform writes appointments against real slots. A lead becomes an appointment only when a human at the clinic acts on it.

The upside is real: two services, one free-tier database, no integration surface to keep in sync, and no distributed transaction anywhere. The cost is equally real and worth naming — **a chatbot booking does not reserve a slot.** A patient who completes the bot flow has expressed intent, not secured a time. That is a deliberate v1 boundary rather than an oversight, and closing it is the main item on the roadmap.

## Who Does What

| Role | What they do |
| --- | --- |
| Patient (web) | Browses live availability, picks a 15-minute slot, verifies by phone, receives a confirmed appointment |
| Patient (WhatsApp) | Walks a guided menu — concern, name, age, clinic or online, date, time — and submits a lead |
| Clinic staff | Receives each lead as a structured WhatsApp template message and acts on it |
| Doctor | Signs in to the portal to see the schedule |
| Administrator | Manages doctors, availability and appointments through a customised Django admin |

There is no bespoke admin dashboard. Administration is Django's own admin with a restyled base template and CSS overrides — the right amount of interface for one clinic, and a deliberate non-decision rather than a missing feature.

## Technology

| Layer | Technology |
| --- | --- |
| Public site and portal | React 19, Vite 7, Tailwind 4, React Router 7 — deployed on Vercel |
| Web API | Django 6 with Django REST Framework, psycopg 3, WhiteNoise, Gunicorn — deployed on Render |
| Patient identity | Firebase phone sign-in, with the ID token verified server-side by `firebase-admin` |
| Chatbot | FastAPI on AWS Lambda behind an API Gateway HTTP API, via Mangum |
| Chatbot data | Async SQLAlchemy with asyncpg, Alembic migrations |
| Database | One Neon Postgres instance, shared by both services |
| Messaging | Meta WhatsApp Cloud API |
| Chatbot infrastructure | AWS SAM and CloudFormation |

## Status

The web platform and the chatbot are both live and in real use. Infrastructure cost is approximately zero — every component sits inside a free tier, which was a design goal rather than an accident.

The honest gap is testing. There are eight Playwright specs covering the WhatsApp flow end to end, and that is the entire automated suite. The Django apps still carry empty stub `tests.py` files, and the frontend has no test runner configured. The concurrency guarantee is enforced by the database rather than by a test proving it — a stronger guarantee than a test would give, but not the same as having both.
