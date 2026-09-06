---
project: drdeepti
label: Architecture
title: System Architecture
description: The technical foundation, tech stack, and deployment strategy of the platform.
order: 2
---

## Technology Stack

| Layer | Technology |
| --- | --- |
| Frontend | React, Tailwind CSS, Vite |
| Backend | Django, Django REST Framework |
| Database | PostgreSQL |
| Hosting | Render (backend and database), Vercel (frontend) |

## Concurrency Control

To prevent double bookings, the system uses database-level locking. Specifically, it employs Django's `select_for_update()` to lock the specific appointment slot row in PostgreSQL until the booking transaction completes.

- **Pessimistic locking.** If two users request the same slot at the exact same millisecond, the database serializes the transactions.
- **Atomicity.** The booking process — verifying slot availability, creating the appointment record, updating slot status — is wrapped in a single atomic database transaction.
- **Failure handling.** If the transaction fails or the lock cannot be acquired within a timeout, the user is cleanly notified that the slot is no longer available.
