---
project: drdeepti
label: Roadmap
title: Known Limitations and V2 Roadmap
description: Current limitations, planned improvements, and cost snapshot.
order: 5
---

## Known Limitations in V1

- The `collect_time` node has no options defined, so a patient gets stuck at this step. Known bug, scheduled for v2.
- The access token is a temporary user token and needs migration to a permanent System User token.
- There is no graceful error handling if the Neon database is unreachable — Lambda returns 500 and Meta retries up to three times.
- There is no admin dashboard for viewing or managing leads captured by the chatbot.
- Chatbot bookings do not reserve a real calendar slot; this needs a Google Calendar or Cal.com integration.

## Cost Snapshot at Launch

| Resource | Free tier / cost |
| --- | --- |
| Meta Cloud API | 1,000 free conversations per month |
| AWS Lambda | 1M invocations per month free — effectively $0 at clinic scale |
| Neon PostgreSQL | 0.5 GB storage, 190 compute hours per month free |
| **Total monthly infra cost** | **~$0** |

The zero-cost serverless architecture was a deliberate design goal. The clinic should incur no infrastructure bill until message volume exceeds the free tiers by an order of magnitude.
