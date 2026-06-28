// Project documentation data.
// Keys must match the :projectName route param in your router.
// Tabs, sections, and content blocks are all data-driven — add/remove freely.

export const projectDocs = {

  // ─── DrDeepti ──────────────────────────────────────────────────────────────
  drdeepti: {
    label: 'HEALTHCARE PLATFORM',
    title: 'DrDeepti',
    subtitle: 'Hospital Appointment Management System',
    oneLiner:
      'A production-grade appointment booking platform serving a Delhi ENT clinic — replacing phone queues with instant self-service slot access, backed by conflict-safe concurrent booking and a full admin dashboard.',
    github: 'https://github.com/CodinGakpo/DrDeeptiEnt',
    live:   'https://drdeeptientdelhi.in',
    version:     'v1.0 · Live in Production',
    versionNote: 'Deployed at drdeeptientdelhi.in — handling real patient bookings.',
    tags: ['Django', 'React', 'PostgreSQL', 'AWS EC2', 'Nginx', 'Gunicorn'],

    tabs: [

      // ── Overview ────────────────────────────────────────────────────────────
      {
        name: 'Overview',
        document: {
          title: 'Platform Overview',
          description: 'Purpose, user roles, and a high-level feature summary.',
        },
        sections: [
          {
            id: 'dd-intro',
            title: 'Introduction',
            content: [
              { type: 'h2', text: 'Introduction' },
              { type: 'p', text: "DrDeepti is a full-stack hospital appointment booking platform built for Dr. Deepti's ENT clinic in New Delhi. The platform replaces a fragmented phone-based booking process with a self-service web app — patients can discover available slots, book in seconds, and receive instant confirmation without ever calling the clinic." },
              { type: 'callout', text: '🏥 Live in production at drdeeptientdelhi.in — serving real patients.' },
            ],
          },
          {
            id: 'dd-roles',
            title: 'User Roles',
            content: [
              { type: 'h2', text: 'User Roles' },
              { type: 'table',
                headers: ['Role', 'Primary Actions', 'Key Use Case'],
                rows: [
                  ['Patient', 'Browse slots, book, cancel, view history', 'Book an appointment without calling the clinic'],
                  ['Admin',   'Manage slot grid, view all bookings, block dates', 'Full operational visibility and inventory control'],
                ],
              },
            ],
          },
          {
            id: 'dd-features',
            title: 'Feature Highlights',
            content: [
              { type: 'h2', text: 'Feature Highlights' },
              { type: 'ul', items: [
                'Real-time slot availability — patients only ever see genuinely open slots',
                'Conflict-safe concurrent booking — row-level locking prevents double-booking at the DB layer',
                'Appointment history — patients can view and cancel upcoming bookings',
                'Admin slot grid — create, block, and manage time slots across dates',
                'Role-based access — patient UI vs. full admin dashboard, enforced server-side',
                'Mobile-friendly UI — patients with limited technical familiarity can book in 3 taps',
              ]},
            ],
          },
        ],
      },

      // ── Architecture ────────────────────────────────────────────────────────
      {
        name: 'Architecture',
        document: {
          title: 'System Architecture',
          description: 'Three-tier design, request flow, and full tech stack.',
        },
        sections: [
          {
            id: 'dd-arch-design',
            title: 'System Design',
            content: [
              { type: 'h2', text: 'System Design' },
              { type: 'p', text: 'DrDeepti follows a classic three-tier architecture. The React SPA is served statically by Nginx. API calls from the browser hit Nginx, which reverse-proxies to Gunicorn running Django. Django talks exclusively to PostgreSQL.' },
              { type: 'table',
                headers: ['Layer', 'Component', 'Role'],
                rows: [
                  ['Client',       'React 18 (Vite)',   'UI, routing, API consumption'],
                  ['Reverse Proxy','Nginx',              'Static file serving, SSL termination, API proxy'],
                  ['Application',  'Django + Gunicorn',  'Business logic, REST API, session auth'],
                  ['Database',     'PostgreSQL 15',       'Slot and appointment persistence'],
                  ['Hosting',      'AWS EC2 (Ubuntu 22.04)', 'Single instance hosting the full stack'],
                ],
              },
            ],
          },
          {
            id: 'dd-arch-flow',
            title: 'Booking Request Flow',
            content: [
              { type: 'h2', text: 'Booking Request Flow' },
              { type: 'ul', items: [
                'Patient selects a date — React fetches /api/slots/?date=... and renders available slots',
                'Patient submits a booking — POST /api/appointments/ hits Django',
                'Django opens an atomic transaction and acquires a row-level lock (SELECT FOR UPDATE) on the chosen slot',
                'Inside the lock: slot status and capacity are re-checked',
                'If still open → create Appointment, decrement capacity, commit',
                'If taken → rollback, return 409 — patient sees "slot no longer available"',
              ]},
              { type: 'callout', text: 'The lock is held at the database level, so correctness is guaranteed across all Gunicorn workers — no application-level locking needed.' },
            ],
          },
          {
            id: 'dd-stack',
            title: 'Tech Stack',
            content: [
              { type: 'h2', text: 'Tech Stack' },
              { type: 'table',
                headers: ['Layer', 'Technology'],
                rows: [
                  ['Backend framework', 'Django 4.x + Django REST Framework'],
                  ['Frontend',          'React 18, Vite, React Router v6'],
                  ['Database',          'PostgreSQL 15'],
                  ['Web server',        'Nginx'],
                  ['WSGI server',       'Gunicorn (3 workers, Unix socket)'],
                  ['Hosting',           'AWS EC2 — Ubuntu 22.04'],
                  ['SSL',               "Let's Encrypt via Certbot — auto-renewing"],
                  ['Auth',              'Django session auth + CSRF protection'],
                ],
              },
            ],
          },
        ],
      },

      // ── Backend ─────────────────────────────────────────────────────────────
      {
        name: 'Backend',
        document: {
          title: 'Backend Engineering',
          description: 'Slot management, conflict prevention, auth model, and REST API reference.',
        },
        sections: [
          {
            id: 'dd-slots',
            title: 'Slot Management',
            content: [
              { type: 'h2', text: 'Slot Management' },
              { type: 'p', text: 'Slots are created by the admin in advance. Each slot carries a date, time range, capacity, and status. The patient-facing API only exposes AVAILABLE slots for a given date.' },
              { type: 'table',
                headers: ['Status', 'Meaning'],
                rows: [
                  ['AVAILABLE',  'Open for booking by a patient'],
                  ['BOOKED',     'Fully occupied — no remaining capacity'],
                  ['BLOCKED',    'Manually closed by admin (holiday, unavailability)'],
                  ['COMPLETED',  'Appointment time has passed'],
                ],
              },
            ],
          },
          {
            id: 'dd-conflict',
            title: 'Conflict Prevention',
            content: [
              { type: 'h2', text: 'Conflict Prevention' },
              { type: 'p', text: 'The critical invariant is that two patients cannot book the same slot simultaneously. This is enforced at the PostgreSQL level:' },
              { type: 'ul', items: [
                'Booking view wrapped in @transaction.atomic',
                'Slot row fetched with SELECT FOR UPDATE — blocks concurrent transactions on the same row',
                'Status and capacity re-validated inside the lock before any write',
                'On success: Appointment created, capacity decremented, status updated — all in one commit',
                'On failure (slot taken): transaction rolls back, 409 returned to client',
              ]},
            ],
          },
          {
            id: 'dd-auth',
            title: 'Authentication & Roles',
            content: [
              { type: 'h2', text: 'Authentication & Roles' },
              { type: 'p', text: 'Patients register with name, phone, and email. Login uses Django session auth with CSRF. Admin users are Django superusers.' },
              { type: 'p', text: 'Admin-scoped endpoints are protected by a decorator that checks request.user.is_staff. Patients hitting admin routes receive 403 — no data leaks on unauthorized access.' },
            ],
          },
          {
            id: 'dd-api',
            title: 'API Reference',
            content: [
              { type: 'h2', text: 'API Reference' },
              { type: 'table',
                headers: ['Method', 'Endpoint', 'Access'],
                rows: [
                  ['GET',    '/api/slots/?date=YYYY-MM-DD',    'Public'],
                  ['POST',   '/api/appointments/',              'Patient'],
                  ['GET',    '/api/appointments/mine/',         'Patient'],
                  ['DELETE', '/api/appointments/:id/',          'Patient (own only)'],
                  ['GET',    '/api/admin/slots/',               'Admin'],
                  ['POST',   '/api/admin/slots/',               'Admin'],
                  ['PATCH',  '/api/admin/slots/:id/',           'Admin'],
                  ['GET',    '/api/admin/appointments/',        'Admin'],
                ],
              },
            ],
          },
        ],
      },

      // ── Frontend ─────────────────────────────────────────────────────────────
      {
        name: 'Frontend',
        document: {
          title: 'Frontend & UX',
          description: 'Patient booking flow, admin dashboard, and tech decisions.',
        },
        sections: [
          {
            id: 'dd-patient-flow',
            title: 'Patient Booking Flow',
            content: [
              { type: 'h2', text: 'Patient Booking Flow' },
              { type: 'ul', items: [
                'Landing page — clinic info and a CTA to view appointments',
                'Date picker — calendar component; unavailable dates greyed out',
                'Slot grid — available time slots rendered as tappable cards',
                'Confirmation dialog — patient reviews date, time, and doctor name',
                'Success screen — booking confirmed with a reference number',
                'My Appointments — list of upcoming and past bookings with a cancel action',
              ]},
            ],
          },
          {
            id: 'dd-admin-dash',
            title: 'Admin Dashboard',
            content: [
              { type: 'h2', text: 'Admin Dashboard' },
              { type: 'p', text: 'Admins land on a separate protected dashboard after login. Key views:' },
              { type: 'ul', items: [
                'Slot grid — week-level view of all slots with status and occupancy count',
                'Bookings list — all appointments (today / upcoming / past) with patient details',
                'Quick actions — block a slot, create new slot, mark as completed',
                'Patient lookup — search by name or phone number',
              ]},
            ],
          },
          {
            id: 'dd-tech-decisions',
            title: 'Tech Decisions',
            content: [
              { type: 'h2', text: 'Tech Decisions' },
              { type: 'table',
                headers: ['Decision', 'Rationale'],
                rows: [
                  ['Vite over CRA',       'Faster builds, leaner config'],
                  ['React Router v6',     'Nested routes cleanly split patient and admin layouts'],
                  ['Axios + interceptors', 'Consistent CSRF token injection on every mutating request'],
                  ['No Redux',           'State is simple enough — useState + Context covers it'],
                  ['CSS Modules',        'Scoped styles, zero class name collisions with global CSS'],
                ],
              },
            ],
          },
        ],
      },

      // ── Deployment ──────────────────────────────────────────────────────────
      {
        name: 'Deployment',
        document: {
          title: 'Infrastructure & Deployment',
          description: 'AWS EC2 setup, Nginx config, SSL, and the deploy workflow.',
        },
        sections: [
          {
            id: 'dd-infra',
            title: 'Infrastructure',
            content: [
              { type: 'h2', text: 'Infrastructure' },
              { type: 'p', text: 'The entire stack runs on a single AWS EC2 instance. This keeps costs minimal for clinic-scale traffic while remaining production-grade.' },
              { type: 'table',
                headers: ['Component', 'Configuration'],
                rows: [
                  ['EC2 instance',    't3.small — Ubuntu 22.04'],
                  ['Nginx',           'Reverse proxy on 80/443; serves React build from /var/www'],
                  ['Gunicorn',        '3 workers bound to a Unix socket; managed by systemd'],
                  ['PostgreSQL',      'On-instance; pg_hba.conf locked to localhost'],
                  ['Static files',    'collectstatic output served directly by Nginx (no Django overhead)'],
                ],
              },
            ],
          },
          {
            id: 'dd-ssl',
            title: 'SSL / TLS',
            content: [
              { type: 'h2', text: 'SSL / TLS' },
              { type: 'p', text: "HTTPS enforced via Let's Encrypt (Certbot). Nginx redirects all HTTP → HTTPS. Certificate auto-renews via cron." },
              { type: 'callout', text: 'drdeeptientdelhi.in — live, HTTPS-enforced, certificate auto-renewed every 90 days.' },
            ],
          },
          {
            id: 'dd-deploy-flow',
            title: 'Deploy Workflow',
            content: [
              { type: 'h2', text: 'Deploy Workflow' },
              { type: 'ul', items: [
                'Push to GitHub',
                'SSH into EC2 → git pull origin main',
                'pip install -r requirements.txt  (inside virtualenv)',
                'python manage.py migrate',
                'python manage.py collectstatic --noinput',
                'sudo systemctl restart gunicorn',
                'Nginx picks up new static files automatically — no restart needed',
              ]},
            ],
          },
        ],
      },

    ],
  },

  // ─── DocuMiner ─────────────────────────────────────────────────────────────
  documiner: {
    label: 'AI SECURITY RESEARCH · PATENT PENDING',
    title: 'DocuMiner',
    subtitle: 'Enterprise Cybersecurity Document Analysis System',
    oneLiner:
      'An agentic AI system that ingests enterprise security documentation, constructs a Security Knowledge Graph, and simulates attack paths via a Digital Twin engine — surfacing prioritized risk insights without requiring model fine-tuning. Subject of a VIT Vellore patent disclosure.',
    github: 'https://github.com/CodinGakpo/DocuMiner',
    version:     'Research Preview · Patent Disclosure Filed',
    versionNote: 'Capstone project — VIT Vellore B.Tech Information Security, batch 2023–2027.',
    tags: ['Python', 'LLM', 'Knowledge Graph', 'Zero-Shot AI', 'spaCy', 'NetworkX', 'Cybersecurity'],

    tabs: [

      // ── Overview ────────────────────────────────────────────────────────────
      {
        name: 'Overview',
        document: {
          title: 'System Overview',
          description: 'What DocuMiner is, the problem it solves, and its three core modules.',
        },
        sections: [
          {
            id: 'dm-intro',
            title: 'Introduction',
            content: [
              { type: 'h2', text: 'Introduction' },
              { type: 'p', text: 'DocuMiner is an enterprise cybersecurity document analysis system powered by zero-shot agentic AI. It ingests security-relevant documents — policies, network diagrams, system configurations, audit logs — and extracts structured threat intelligence without requiring domain-specific fine-tuning.' },
              { type: 'p', text: 'The system was developed as a capstone research project at VIT Vellore and resulted in a patent disclosure for its core approach of combining a Security Knowledge Graph with a Digital Twin Simulation Engine.' },
              { type: 'callout', text: '📄 Patent disclosure filed at VIT Vellore for the Security Knowledge Graph + Digital Twin Simulation architecture.' },
            ],
          },
          {
            id: 'dm-problem',
            title: 'Problem Statement',
            content: [
              { type: 'h2', text: 'Problem Statement' },
              { type: 'p', text: 'Enterprise security teams accumulate vast volumes of documentation — vendor advisories, internal policies, config files, audit reports. Manually reviewing this to identify risks is slow, inconsistent, and unscalable. A single large enterprise may manage thousands of assets across multiple regulatory frameworks (ISO 27001, NIST, SOC 2), each with its own document format.' },
              { type: 'p', text: 'DocuMiner automates the ingestion-to-insight pipeline, transforming unstructured documents into actionable security intelligence.' },
            ],
          },
          {
            id: 'dm-modules',
            title: 'Core Modules',
            content: [
              { type: 'h2', text: 'Core Modules' },
              { type: 'table',
                headers: ['Module', 'Function'],
                rows: [
                  ['Document Ingestion Layer',      'Parses PDFs, DOCX, configs, and logs into normalized text chunks'],
                  ['Security Knowledge Graph (SKG)','Builds a graph of assets, vulnerabilities, threat actors, and controls from extracted entities'],
                  ['Digital Twin Simulation Engine','Traverses the asset graph to simulate lateral movement paths and score exploitability'],
                  ['Report Generator',              'Synthesizes findings into a structured threat report with recommended mitigations'],
                ],
              },
            ],
          },
        ],
      },

      // ── Architecture ────────────────────────────────────────────────────────
      {
        name: 'Architecture',
        document: {
          title: 'System Architecture',
          description: 'Full pipeline from document ingestion to threat report generation.',
        },
        sections: [
          {
            id: 'dm-pipeline',
            title: 'Pipeline Overview',
            content: [
              { type: 'h2', text: 'Pipeline Overview' },
              { type: 'p', text: 'DocuMiner is a sequential multi-stage pipeline. Each stage outputs structured data consumed by the next.' },
              { type: 'ul', items: [
                'Stage 1 — Ingestion: raw documents (PDF, DOCX, configs) parsed and chunked to plain text',
                'Stage 2 — Entity Extraction: NER identifies assets, CVEs, threat actor references, and compliance controls',
                'Stage 3 — Knowledge Graph Construction: entities → nodes; relationships (exploits, mitigates, depends_on) → edges',
                'Stage 4 — Threat Simulation: the Digital Twin engine traverses the KG for lateral movement and privilege escalation paths',
                'Stage 5 — Report Synthesis: risk scores, attack paths, and mitigations compiled to JSON + Markdown output',
              ]},
            ],
          },
          {
            id: 'dm-stack',
            title: 'Tech Stack',
            content: [
              { type: 'h2', text: 'Tech Stack' },
              { type: 'table',
                headers: ['Layer', 'Technology'],
                rows: [
                  ['Core language',   'Python 3.11'],
                  ['LLM backbone',    'Zero-shot prompting via LLM API (Anthropic / OpenAI)'],
                  ['NLP pipeline',    'spaCy + custom security entity extractors'],
                  ['Graph engine',    'NetworkX (in-memory) → Neo4j (persistent, Cypher queries)'],
                  ['Document parsing','PyMuPDF (PDF), python-docx (DOCX), raw text'],
                  ['Orchestration',   'Custom agent loop — no LangChain, full control of reasoning flow'],
                  ['Output format',   'JSON schema-validated report + Markdown summary'],
                ],
              },
            ],
          },
          {
            id: 'dm-design',
            title: 'Key Design Decisions',
            content: [
              { type: 'h2', text: 'Key Design Decisions' },
              { type: 'table',
                headers: ['Decision', 'Rationale'],
                rows: [
                  ['Zero-shot over fine-tuned',  'No labeled data required; immediately portable to new enterprise domains'],
                  ['Custom agent loop',           'Avoids LangChain abstractions that make debugging hard in a research context'],
                  ['NetworkX → Neo4j',            'NetworkX for development speed; Neo4j for production Cypher query support'],
                  ['Modular pipeline stages',     'Each stage is independently testable; simulation failure does not block report generation'],
                  ['JSON schema validation',      'LLM outputs are validated at every stage — malformed outputs are retried with a stricter prompt'],
                ],
              },
            ],
          },
        ],
      },

      // ── AI Pipeline ─────────────────────────────────────────────────────────
      {
        name: 'AI Pipeline',
        document: {
          title: 'AI & NLP Pipeline',
          description: 'Zero-shot classification, entity extraction, and Knowledge Graph construction.',
        },
        sections: [
          {
            id: 'dm-zeroshot',
            title: 'Zero-Shot Approach',
            content: [
              { type: 'h2', text: 'Zero-Shot Approach' },
              { type: 'p', text: "DocuMiner requires no labeled training examples. Structured prompts instruct the LLM to act as a specialized security analyst for each pipeline stage. The LLM's pre-trained security knowledge provides the foundation; the prompts constrain the output to a validated JSON schema." },
              { type: 'callout', text: 'Outputs that fail schema validation are automatically retried with a more constrained prompt — hallucinations that cannot be parsed are never propagated downstream.' },
            ],
          },
          {
            id: 'dm-skg',
            title: 'Security Knowledge Graph',
            content: [
              { type: 'h2', text: 'Security Knowledge Graph' },
              { type: 'p', text: "The SKG is DocuMiner's central data structure — a directed graph representing the enterprise's security posture:" },
              { type: 'table',
                headers: ['Element', 'Type', 'Example'],
                rows: [
                  ['Asset',        'Node', 'Web server, database, VPN gateway, user account'],
                  ['Vulnerability','Node', 'CVE-2024-XXXX, misconfiguration, exposed service'],
                  ['Threat Actor', 'Node', 'External attacker, insider threat, automated scanner'],
                  ['Control',      'Node', 'Firewall rule, MFA policy, patch level'],
                  ['exploits',     'Edge', 'Threat Actor → Vulnerability'],
                  ['affects',      'Edge', 'Vulnerability → Asset'],
                  ['mitigates',    'Edge', 'Control → Vulnerability'],
                  ['depends_on',   'Edge', 'Asset → Asset (lateral movement path)'],
                ],
              },
            ],
          },
          {
            id: 'dm-agents',
            title: 'Agent Coordination',
            content: [
              { type: 'h2', text: 'Agent Coordination' },
              { type: 'p', text: 'Specialized agents handle distinct extraction tasks and write results into the shared Knowledge Graph.' },
              { type: 'ul', items: [
                'Asset Discovery Agent — identifies and classifies all IT assets mentioned in documents',
                'Vulnerability Mapping Agent — extracts CVEs, misconfigs, and exposure indicators',
                'Threat Intelligence Agent — extracts TTP references and maps them to MITRE ATT&CK',
                'Control Inventory Agent — extracts security controls and maps them to the vulnerabilities they mitigate',
                'Orchestrator — sequences execution, handles retries, aggregates agent outputs into the KG',
              ]},
            ],
          },
        ],
      },

      // ── Security Analysis ───────────────────────────────────────────────────
      {
        name: 'Security Analysis',
        document: {
          title: 'Threat Analysis & Risk Scoring',
          description: 'Digital Twin simulation, MITRE ATT&CK mapping, and composite risk scoring.',
        },
        sections: [
          {
            id: 'dm-digital-twin',
            title: 'Digital Twin Simulation',
            content: [
              { type: 'h2', text: 'Digital Twin Simulation Engine' },
              { type: 'p', text: 'The Digital Twin engine uses the Knowledge Graph as a simulation environment. It models an attacker starting from a set of initial access points and traverses exploit → affects → depends_on chains to enumerate reachable targets.' },
              { type: 'p', text: 'This produces a ranked set of attack paths — sequences of compromised assets from entry to critical target. Each path is scored by path length (shorter = more dangerous), intermediate CVE exploitability, and target asset criticality.' },
            ],
          },
          {
            id: 'dm-mitre',
            title: 'MITRE ATT&CK Mapping',
            content: [
              { type: 'h2', text: 'MITRE ATT&CK Mapping' },
              { type: 'p', text: 'Extracted threat behaviors are mapped to MITRE ATT&CK tactics and techniques. This gives security teams standardized language for identified threats and enables gap analysis against existing detection coverage.' },
              { type: 'table',
                headers: ['MITRE Tactic', 'Example Techniques Detected'],
                rows: [
                  ['Initial Access',    'Phishing, Exposed RDP, Supply Chain Compromise'],
                  ['Execution',         'PowerShell, Scheduled Tasks, Script Interpreters'],
                  ['Lateral Movement',  'Pass-the-Hash, Remote Services, Internal Spearphishing'],
                  ['Privilege Escalation', 'Sudo Abuse, Token Impersonation, SUID Binaries'],
                  ['Exfiltration',      'Data over C2 Channel, Exfiltration via Web Service'],
                ],
              },
            ],
          },
          {
            id: 'dm-risk',
            title: 'Risk Scoring',
            content: [
              { type: 'h2', text: 'Risk Scoring' },
              { type: 'p', text: 'Each identified attack path receives a composite risk score based on three factors: exploitability of the vulnerability chain (CVSS or LLM-estimated), criticality of the target asset, and coverage of existing controls.' },
              { type: 'callout', text: 'Risk Score = (Path Exploitability × Asset Criticality) × (1 − Control Coverage). Normalized 0–100. Scores drive the prioritized remediation list in the output report.' },
            ],
          },
        ],
      },

      // ── Research ────────────────────────────────────────────────────────────
      {
        name: 'Research',
        document: {
          title: 'Research & IP',
          description: 'Patent disclosure details, academic context, and capstone authorship.',
        },
        sections: [
          {
            id: 'dm-patent',
            title: 'Patent Disclosure',
            content: [
              { type: 'h2', text: 'Patent Disclosure' },
              { type: 'p', text: "DocuMiner's core architecture — specifically the combination of a Security Knowledge Graph with a Digital Twin Simulation Engine driven by zero-shot agentic AI — is the subject of a patent disclosure filed at VIT Vellore." },
              { type: 'p', text: 'The disclosure covers the method of transforming unstructured enterprise security documents into structured threat intelligence via multi-agent extraction and graph-based attack simulation, without domain-specific model training.' },
            ],
          },
          {
            id: 'dm-paper',
            title: 'Capstone Research Paper',
            content: [
              { type: 'h2', text: 'Capstone Research Paper' },
              { type: 'table',
                headers: ['Attribute', 'Detail'],
                rows: [
                  ['Title',       'Automated Enterprise Information Asset Security Analysis Using Zero-Shot Agentic AI'],
                  ['Authors',     'Adidev Anand, Raghav Sharma, Divyansh Gupta'],
                  ['Institution', 'VIT Vellore — B.Tech Information Security (2023–2027)'],
                  ['Status',      'Capstone submission; patent disclosure filed'],
                ],
              },
            ],
          },
        ],
      },

    ],
  },

  // ─── ReportMitra ───────────────────────────────────────────────────────────
  reportmitra: {
    label: 'CIVIC TECH · HACKATHON WINNER',
    title: 'ReportMitra',
    subtitle: 'Civic Issue Reporting & Tracking Platform',
    oneLiner:
      'A hackathon-built civic reporting platform where citizens submit photo-verified infrastructure complaints — powered by a CNN image validator, Celery async pipeline, AWS cloud infrastructure, and a blockchain audit trail for tamper-proof accountability. Succeeded in production by JanSaathi (v2).',
    github: 'https://github.com/CodinGakpo/Yantra26-user',
    version:     'Hackathon Edition · Succeeded by JanSaathi',
    versionNote: "Won DevSoc'26 (Tech for Good) and Yantra'26 Central Hack — 1st place, CSIT track.",
    tags: ['Django', 'React', 'Celery', 'Redis', 'CNN', 'AWS', 'Blockchain', 'PostgreSQL'],

    tabs: [

      // ── Overview ────────────────────────────────────────────────────────────
      {
        name: 'Overview',
        document: {
          title: 'Platform Overview',
          description: "What ReportMitra is, the two hackathon wins, and its successor JanSaathi.",
        },
        sections: [
          {
            id: 'rm-intro',
            title: 'Introduction',
            content: [
              { type: 'h2', text: 'Introduction' },
              { type: 'p', text: "ReportMitra is a civic issue reporting platform that lets citizens photograph and report local infrastructure problems — broken roads, streetlight outages, waterlogging — and track them through resolution. Built under hackathon constraints; subsequently won two back-to-back competitions." },
              { type: 'callout', text: "🏆 Won DevSoc'26 (Tech for Good, CodeChef) and Yantra'26 Central Hack (1st place, CSIT track, VIT Vellore)." },
            ],
          },
          {
            id: 'rm-wins',
            title: 'Hackathon Results',
            content: [
              { type: 'h2', text: 'Hackathon Results' },
              { type: 'table',
                headers: ['Hackathon', 'Track', 'Result', 'Role'],
                rows: [
                  ["DevSoc'26 (CodeChef)",   'Tech for Good',  'Winner',   'Backend Architect'],
                  ["Yantra'26 (VIT Vellore)",'CSIT',           '1st Place','Backend Architect'],
                ],
              },
            ],
          },
          {
            id: 'rm-evolution',
            title: 'Evolution to JanSaathi',
            content: [
              { type: 'h2', text: 'Evolution to JanSaathi' },
              { type: 'p', text: 'ReportMitra validated the concept. JanSaathi is the production v2 — a ground-up rebuild with a faster stack, DigiLocker-based identity verification, and production-grade GCP infrastructure.' },
              { type: 'badge-row', items: ['Django → Go/Gin', 'Redis → Valkey', 'CNN validator → DigiLocker OTP auth', 'AWS → GCP', 'React + Vite'] },
            ],
          },
          {
            id: 'rm-features',
            title: 'Feature Set',
            content: [
              { type: 'h2', text: 'Feature Set' },
              { type: 'ul', items: [
                'Citizen issue submission with photo upload and GPS-tagged location',
                'CNN image validator — rejects spam/irrelevant photos before issue creation',
                'Issue lifecycle tracking: submitted → under_review → in_progress → resolved',
                'Admin dashboard with assignment, escalation, and bulk actions',
                'Blockchain audit trail — every status transition logged immutably on-chain',
                'Celery async processing — image validation and notifications offloaded from request cycle',
                'AWS S3 for media storage; RDS (PostgreSQL) for data',
              ]},
            ],
          },
        ],
      },

      // ── Architecture ────────────────────────────────────────────────────────
      {
        name: 'Architecture',
        document: {
          title: 'System Architecture',
          description: 'Service topology, async worker flow, and data model.',
        },
        sections: [
          {
            id: 'rm-topology',
            title: 'Service Topology',
            content: [
              { type: 'h2', text: 'Service Topology' },
              { type: 'table',
                headers: ['Service', 'Technology', 'Role'],
                rows: [
                  ['Web Application',  'Django + Gunicorn',       'REST API, business logic, Django admin'],
                  ['Frontend',         'React (Vite)',             'Citizen-facing SPA'],
                  ['Task Queue',       'Celery',                   'Async image validation, notification dispatch'],
                  ['Message Broker',   'Redis',                    'Celery task queue backend + result store'],
                  ['Database',         'PostgreSQL (AWS RDS)',     'Persistent application data'],
                  ['Media Storage',    'AWS S3',                   'Issue photos and attachments'],
                  ['Audit Trail',      'Blockchain (on-chain log)','Immutable record of every status transition'],
                ],
              },
            ],
          },
          {
            id: 'rm-async-flow',
            title: 'Async Submission Flow',
            content: [
              { type: 'h2', text: 'Async Submission Flow' },
              { type: 'p', text: 'Image validation is offloaded to Celery to keep API response times fast:' },
              { type: 'ul', items: [
                'Citizen submits issue with photo → Django stores it with status PENDING_VALIDATION',
                'Celery task dispatched to validate the uploaded image',
                'Client immediately receives 202 Accepted — no waiting on ML inference',
                'Celery worker runs the CNN classifier against the S3 image',
                'Valid: status → SUBMITTED, confirmation notification sent',
                'Invalid: status → REJECTED, citizen notified with rejection reason',
              ]},
            ],
          },
          {
            id: 'rm-data-model',
            title: 'Data Model',
            content: [
              { type: 'h2', text: 'Data Model' },
              { type: 'table',
                headers: ['Model', 'Key Fields'],
                rows: [
                  ['Issue',       'id, citizen, category, description, photo_s3_key, location (lat/lng), status, assigned_to, created_at'],
                  ['IssueEvent',  'id, issue, from_status, to_status, actor, timestamp, blockchain_tx_hash'],
                  ['Citizen',     'id, phone, name, ward'],
                  ['AdminUser',   'id, name, department, assigned_wards'],
                ],
              },
            ],
          },
        ],
      },

      // ── Backend ─────────────────────────────────────────────────────────────
      {
        name: 'Backend',
        document: {
          title: 'Backend Engineering',
          description: 'Issue lifecycle, REST API design, and admin automation.',
        },
        sections: [
          {
            id: 'rm-lifecycle',
            title: 'Issue Lifecycle',
            content: [
              { type: 'h2', text: 'Issue Lifecycle' },
              { type: 'table',
                headers: ['Status', 'Trigger', 'Valid Next States'],
                rows: [
                  ['PENDING_VALIDATION', 'Citizen submits issue',               'SUBMITTED, REJECTED'],
                  ['SUBMITTED',          'CNN validator approves image',         'UNDER_REVIEW, DUPLICATE'],
                  ['UNDER_REVIEW',       'Admin opens the issue',               'IN_PROGRESS, REJECTED'],
                  ['IN_PROGRESS',        'Admin assigns to field worker',        'RESOLVED, ESCALATED'],
                  ['ESCALATED',          'SLA breach or manual escalation',      'IN_PROGRESS'],
                  ['RESOLVED',           'Admin marks as fixed',                '(terminal)'],
                ],
              },
            ],
          },
          {
            id: 'rm-api',
            title: 'REST API',
            content: [
              { type: 'h2', text: 'REST API' },
              { type: 'table',
                headers: ['Method', 'Endpoint', 'Description'],
                rows: [
                  ['POST',  '/api/issues/',                   'Submit a new issue (citizen)'],
                  ['GET',   '/api/issues/:id/',               'Issue details + event history'],
                  ['GET',   '/api/issues/mine/',              "Citizen's submitted issues"],
                  ['GET',   '/api/admin/issues/',             'Admin: all issues with filters'],
                  ['PATCH', '/api/admin/issues/:id/status/',  'Admin: status transition'],
                  ['POST',  '/api/admin/issues/:id/assign/',  'Admin: assign to department'],
                  ['GET',   '/api/admin/issues/:id/audit/',   'Blockchain-verified audit trail'],
                ],
              },
            ],
          },
          {
            id: 'rm-automation',
            title: 'Admin Automation',
            content: [
              { type: 'h2', text: 'Admin Automation' },
              { type: 'p', text: 'Two Celery Beat periodic tasks reduce manual admin workload:' },
              { type: 'ul', items: [
                'Auto-escalation — issues in IN_PROGRESS exceeding a configurable SLA threshold (by issue category) are automatically escalated and a supervisor notification sent',
                'Duplicate detection — newly submitted issues are compared against recent open issues by location proximity + category; suspected duplicates are flagged for admin review before being created',
              ]},
            ],
          },
        ],
      },

      // ── AI / ML ─────────────────────────────────────────────────────────────
      {
        name: 'AI / ML',
        document: {
          title: 'CNN Image Validator',
          description: 'The convolutional neural network that gates issue photos before acceptance.',
        },
        sections: [
          {
            id: 'rm-cnn-purpose',
            title: 'Purpose',
            content: [
              { type: 'h2', text: 'Purpose' },
              { type: 'p', text: 'Civic platforms attract spam — selfies, blank images, random photos — that waste admin review time. The CNN validator is the first gate: it classifies uploaded images as civic-issue-relevant or not before the issue enters the system.' },
            ],
          },
          {
            id: 'rm-model',
            title: 'Model Architecture',
            content: [
              { type: 'h2', text: 'Model Architecture' },
              { type: 'p', text: 'A fine-tuned ResNet-18 pre-trained on ImageNet. The final classification head was replaced and retrained on a labeled dataset of civic issue photos (potholes, broken streetlights, garbage dumps, waterlogging) vs. non-issue images.' },
              { type: 'table',
                headers: ['Attribute', 'Detail'],
                rows: [
                  ['Base model',          'ResNet-18 (ImageNet pre-trained)'],
                  ['Fine-tuning',         'Last two residual blocks unfrozen; new binary classification head'],
                  ['Classes',             'civic_issue / not_relevant'],
                  ['Input size',          '224×224 RGB'],
                  ['Framework',           'PyTorch'],
                  ['Confidence threshold','≥ 0.65 → accepted; < 0.65 → rejected'],
                  ['Serving',             'Loaded once at Celery worker startup; reused across tasks'],
                ],
              },
            ],
          },
          {
            id: 'rm-inference',
            title: 'Inference Flow',
            content: [
              { type: 'h2', text: 'Inference Flow' },
              { type: 'ul', items: [
                'Celery worker receives task with the S3 key of the uploaded image',
                'Image downloaded from S3 and resized to 224×224',
                'Standard ImageNet normalization applied (mean/std per channel)',
                'Forward pass → softmax confidence on civic_issue class',
                'Score ≥ 0.65 → issue accepted and moves to SUBMITTED',
                'Score < 0.65 → issue rejected; citizen notified: "Photo does not show a civic issue"',
              ]},
            ],
          },
        ],
      },

      // ── Cloud & DevOps ──────────────────────────────────────────────────────
      {
        name: 'Cloud & DevOps',
        document: {
          title: 'AWS Infrastructure & CI/CD',
          description: 'AWS service layout, CI/CD pipeline, and deployment strategy.',
        },
        sections: [
          {
            id: 'rm-aws',
            title: 'AWS Infrastructure',
            content: [
              { type: 'h2', text: 'AWS Infrastructure' },
              { type: 'table',
                headers: ['AWS Service', 'Usage'],
                rows: [
                  ['EC2 (t3.medium)',    'Django application server + Celery workers'],
                  ['RDS (PostgreSQL)',   'Managed database; automated daily snapshots'],
                  ['S3',                'Issue photo storage; presigned URLs for client-side uploads'],
                  ['Redis (on EC2)',     'Celery broker and result backend (hackathon config)'],
                  ['Route 53',          'DNS management'],
                  ['ACM',               'TLS certificate for HTTPS'],
                ],
              },
            ],
          },
          {
            id: 'rm-cicd',
            title: 'CI/CD Pipeline',
            content: [
              { type: 'h2', text: 'CI/CD Pipeline' },
              { type: 'ul', items: [
                'Dockerized — docker-compose for local dev; separate containers in prod',
                'GitHub Actions: on push to main → lint (flake8), test (pytest), build Docker image, push to ECR',
                'EC2 pulls new image from ECR, restarts containers via systemd service definitions',
                'Nginx on EC2 as reverse proxy with TLS termination (ACM cert)',
                'Secrets (DB password, S3 keys, blockchain RPC URL) via AWS Secrets Manager',
              ]},
            ],
          },
        ],
      },

      // ── Blockchain ──────────────────────────────────────────────────────────
      {
        name: 'Blockchain',
        document: {
          title: 'Blockchain Audit Trail',
          description: 'How every issue state transition is logged immutably on-chain for public accountability.',
        },
        sections: [
          {
            id: 'rm-motivation',
            title: 'Motivation',
            content: [
              { type: 'h2', text: 'Motivation' },
              { type: 'p', text: 'Civic accountability requires that resolution records cannot be altered retroactively — by admins, the platform operator, or anyone else. A traditional database offers no such guarantee. By logging every state transition on-chain, ReportMitra creates a public, tamper-proof record that any citizen or journalist can independently verify.' },
            ],
          },
          {
            id: 'rm-implementation',
            title: 'Implementation',
            content: [
              { type: 'h2', text: 'Implementation' },
              { type: 'p', text: 'Each IssueEvent triggers an on-chain write via Web3.py to a smart contract on an Ethereum-compatible network. The write is dispatched via Celery (async) to avoid blocking the API response.' },
              { type: 'table',
                headers: ['Field Logged On-Chain', 'Description'],
                rows: [
                  ['issue_id (hashed)',   'Pseudonymous issue identifier'],
                  ['from_status',         'Previous state'],
                  ['to_status',           'New state'],
                  ['actor_id (hashed)',   'Admin or system that triggered the transition'],
                  ['block timestamp',     'Canonical event ordering'],
                ],
              },
              { type: 'callout', text: 'The transaction hash from each on-chain write is stored in the IssueEvent row and exposed via the /api/admin/issues/:id/audit/ endpoint.' },
            ],
          },
          {
            id: 'rm-guarantees',
            title: 'Guarantees',
            content: [
              { type: 'h2', text: 'Guarantees' },
              { type: 'ul', items: [
                'Immutability — once mined, no party (including the platform operator) can alter a logged event',
                'Public verifiability — anyone with the transaction hash can look it up on a block explorer',
                'Non-repudiation — each event is linked to a hashed actor ID; an admin cannot deny a resolution or escalation they performed',
                'Sequencing — block ordering provides a canonical timeline of all state transitions',
              ]},
            ],
          },
        ],
      },

    ],
  },

};
