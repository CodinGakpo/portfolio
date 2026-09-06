---
project: drdeepti
label: WhatsApp Bot
title: WhatsApp Chatbot Extension
description: Serverless chatbot bringing appointment booking to WhatsApp — architecture, conversation design, and database schema.
order: 3
---

## Why a Chatbot?

The web platform solved structured bookings, but the clinic was still fielding a high volume of unstructured WhatsApp inquiries — patients asking about availability, fees, and directions directly in chat. These were manually handled and frequently missed. The WhatsApp chatbot brings the same booking flow into the conversation the patient is already having, with zero app install required.

> The website remains the primary booking surface. The chatbot is a complementary channel — capturing leads and guiding patients through a structured booking flow without leaving WhatsApp.

## Chatbot Architecture

The chatbot is a fully serverless, independent service. It shares the clinic brand but runs on a separate infrastructure stack from the web platform.

| Layer | Technology | Role |
| --- | --- | --- |
| Messaging | Meta WhatsApp Cloud API | Inbound and outbound message transport |
| Gateway | AWS API Gateway (HTTP API) | Webhook receiver — routes POST to Lambda |
| Compute | AWS Lambda (Python 3.12) | Stateless request handler — ASGI via Mangum |
| Framework | FastAPI + Mangum | Async web framework; Mangum shims ASGI to Lambda |
| Database | Neon PostgreSQL (serverless) | Session state and lead storage; asyncpg + SQLAlchemy |
| IaC | AWS SAM + CloudFormation | Declarative, version-controlled infrastructure |

Data flow: Patient → WhatsApp → Meta Cloud API → API Gateway → Lambda → NeonDB. Outbound replies follow the reverse path, triggered within the same Lambda invocation.

## Conversation Design

The bot uses a guided decision tree rather than NLP. Reliability over complexity for v1 — every state is deterministic and auditable.

- **`nodes.json`** is the single source of truth for all conversation states, fully editable by non-engineers without code changes.
- **Node types:** options (list or button), text input, and action nodes.
- **Context accumulation:** patient name, age, concern, location, and preferred time are collected step by step.
- **Universal navigation:** Back and Main Menu buttons on every node, so patients are never stuck. Reset keywords (`hi`, `menu`) always return to root.
- **WhatsApp UI constraints respected:** list messages (10 items maximum) versus button replies (3 maximum) are chosen per node.
