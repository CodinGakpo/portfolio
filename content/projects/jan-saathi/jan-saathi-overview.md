---
project: jan-saathi
projectName: Jan Saathi
tagline: AI-Routed Civic Complaint Pipeline with No Human Dispatcher
label: Overview
title: Product Overview
description: What Jan Saathi does, the four services behind it, and the design decision that shapes everything else.
order: 1
---

## What is Jan Saathi?

Jan Saathi is a civic complaint pipeline. A citizen files a report, AI groups it with nearby issues of the same category into a **cluster** and routes that cluster to the right supervisor, the supervisor (or a field worker they delegate to) resolves it with photo proof, the citizen is rewarded, and an admin only ever touches two operational queues.

No human dispatcher sits in the middle. That is the point of the system.

Most civic reporting tools stop at collecting complaints and hand the hard part, deciding who should act, to a person reading a queue. Jan Saathi treats routing as the product. Classification, deduplication and assignment all happen before anyone sees the work.

## The Decision That Shapes Everything

**The cluster is the unit of work, not the report.**

Ten people reporting the same broken streetlight produce ten reports and one cluster. All operational state lives on the cluster: status, supervisor and field worker assignment, SLA timestamps, proof, and resolution reasons. Each individual report carries a denormalised status that is only a mirror of its parent cluster, useful for a citizen's history screen but never the source of truth.

This is what makes the pipeline tractable. A supervisor acts once on a pothole, not once per complaint about it. Wallet credits still fan back out to every distinct reporter when the cluster is resolved.

## The Four Services

| Service | Port | Role | Built with |
| --- | --- | --- | --- |
| `client-app` | 8080 | Citizen files and tracks reports, community feed, rewards wallet | Flutter and Go |
| `worker-app` | 8082 | Supervisor and field worker actions, SLA watchdog, per-cluster chat | Flutter and Go |
| `admin-app` | 8081 / 5174 | Oversight, exception and escalation queues, activity logs | React and Go |
| `analysis-worker` | 8000 | AI classification, clustering, routing, closure verification | Python |

All four share **one Postgres database** and coordinate only through the `clusters` table and the `assignments` audit table. There is no service-to-service API between them. The only asynchronous hand-offs are the client app invoking the analysis worker directly, and a dedicated queue for AI closure verification.

That is an unusual choice, and a deliberate one: with four services and one team, a shared schema with a strict ownership contract was cheaper to reason about than four APIs with four failure modes.

## The Six-Status Lifecycle

`clusters.status` is the single source of truth for where a piece of work is, and it takes exactly six values.

| Status | Meaning | Who sets it |
| --- | --- | --- |
| `pending` | Routed to a supervisor, awaiting acknowledgement | Analysis worker, or an admin acting on a queue |
| `in_progress` | Supervisor acknowledged, field workers may be assigned | Supervisor |
| `resolved` | Fix confirmed with proof, reporter wallets credited | Supervisor, or admin on an escalation |
| `rejected` | Not actionable or not a civic issue | Supervisor, or admin on an appeal |
| `escalated` | Manual escalation, or an SLA breach | Supervisor, or the SLA watchdog |
| `exception` | Outside Bangalore, AI failure, or no supervisor covers it | Analysis worker only |

Only the supervisor moves a cluster through the normal flow. Field workers never change status; they submit photo proof and nothing else. The analysis worker only ever writes `pending` or `exception`. The admin has no manual "change status" button at all, by design.

## Who Does What

**Citizen (Flutter app)**
- Onboarding by phone OTP or DigiLocker identity verification
- File a report in around twenty seconds: photo, location, description
- Track status, appeal a rejection
- Community feed of resolved issues, and a rewards wallet

**Supervisor (Flutter app)**
- Receives routed clusters in an inbox, acknowledges to take ownership
- Allocates one or many field workers to a cluster
- Resolves with proof, rejects, or escalates
- Per-cluster chat with their team

**Field worker (Flutter app)**
- Sees allocated clusters, submits completion evidence: photo, GPS, remarks
- Cannot advance the work; the evidence goes to AI verification

**Admin (React dashboard)**
- Watches the live pipeline and a cluster map
- Acts on exactly two queues: exceptions the AI could not route, and escalations
- Reads activity logs, manages departments, supervisors, zones and SLA

## Rewards

A resolved cluster credits every distinct reporter of its member reports. The formula is Rs 2 per resolved report, and Rs 10 on every tenth. The credit happens in the same database transaction as the status change, so a resolve either credits everyone or does not happen.

## Technology Stack

| Layer | Technology |
| --- | --- |
| Citizen and worker apps | Flutter |
| Admin dashboard | React |
| Backends | Go (three services) |
| AI pipeline | Python |
| Database | PostgreSQL on Amazon RDS |
| AI models | Amazon Bedrock, Nova Pro |
| Identity | Phone OTP, DigiLocker through Setu |
| Media | S3 with presigned upload URLs |
| Realtime | Redis-backed websockets for cluster chat |
| Compute | Lambda and API Gateway HTTP API v2, one per service |
| IaC | Terraform, one consolidated root |
| Geospatial | Point-in-polygon ward matching over 225 BBMP ward boundaries |

## Coverage

The system is built for Bangalore. Ward detection is a point-in-polygon test against 225 BBMP ward polygons loaded from GeoJSON. A report whose coordinates fall inside no ward becomes an `exception` with the reason `out_of_bangalore`, rather than being silently routed to the nearest guess.

Routing matches department plus ward to a supervisor through a coverage table, and picks the supervisor with the fewest open clusters. If no active coverage row exists for that combination, the cluster becomes an exception and an admin sees it. That is intentional: an unroutable cluster surfaces as a gap in coverage data rather than landing on an arbitrary person.

## Project Team

Built in collaboration with [Adidev Anand](https://github.com/CodinGakpo), with a shared focus on reliability, deployment discipline, and end-user experience.
