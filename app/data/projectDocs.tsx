import React from 'react';

export interface DocSection {
  id: string;
  title: string;
  content: React.ReactNode;
}

export interface DocTab {
  id: string;
  label: string;
  documentTitle: string;
  documentDescription: string;
  sections: DocSection[];
}

export interface ExternalLink {
  label: string;
  url: string;
}

export interface ProjectDoc {
  id: string;
  title: string;
  subtitle: string;
  oneLiner: string;
  version: string;
  versionSummary: string;
  liveUrl?: string;
  githubUrl?: string;
  externalLinks?: ExternalLink[];
  tabs: DocTab[];
}

export const projectDocs: Record<string, ProjectDoc> = {
  drdeepti: {
    id: 'drdeepti',
    title: 'DrDeepti',
    subtitle: 'Appointment Platform + WhatsApp Chatbot for Adarsh ENT Clinic',
    oneLiner: 'A production-grade ENT clinic platform — a web booking system for self-service slot management, extended by a serverless WhatsApp chatbot that captures patient leads directly in-chat.',
    version: 'V1.1',
    versionSummary: 'Web platform live at drdeeptientdelhi.in · WhatsApp bot deployed on AWS Lambda via Meta Cloud API.',
    liveUrl: 'https://drdeeptientdelhi.in',
    githubUrl: 'https://github.com/CodinGakpo/DrDeeptiEnt',
    tabs: [
      {
        id: 'overview',
        label: 'Overview',
        documentTitle: 'Product Overview',
        documentDescription: 'Who Dr. Deepti is, the purpose of the platform, and the core problems it solves.',
        sections: [
          {
            id: 'who-is-drdeepti',
            title: 'Who is DrDeepti?',
            content: (
              <>
                <p>
                  Dr. Deepti is an experienced ENT (Ear, Nose, and Throat) specialist dedicated to providing comprehensive medical care. To support her active practice, this platform was developed as a specialized, real-time clinic appointment booking system designed to streamline patient scheduling and overall clinic administration.
                </p>
                <p>
                  The system empowers patients to easily view live availability, book consultation slots, and manage their appointments online. Simultaneously, it equips the clinic staff with a unified administrative dashboard to track daily capacity, manage patient records, and maintain smooth operations.
                </p>
                <p>
                  Built with a strong focus on reliability, the platform implements robust concurrency controls to ensure that high volumes of simultaneous booking attempts never result in double bookings or overlapping schedules. This seamless automation allows Dr. Deepti and her team to focus entirely on patient care rather than administrative overhead.
                </p>
              </>
            ),
          },
          {
            id: 'the-problem-it-solves',
            title: 'The Problem It Solves',
            content: (
              <>
                <p>
                  Traditional clinic operations often rely on phone calls or simple forms for appointments, leading to manual data entry errors, overbooking, and inefficient use of staff time.
                </p>
                <p>
                  DrDeepti replaces these manual processes with an automated system. A critical challenge in healthcare scheduling is <strong>concurrency</strong>—multiple patients attempting to book the same limited slot simultaneously. This platform solves this by implementing robust database-level locking mechanisms.
                </p>
              </>
            ),
          },
          {
            id: 'key-roles',
            title: 'Key Roles & Personas',
            content: (
              <div className="overflow-x-auto mt-4">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr>
                      <th className="p-4 border-b border-[var(--card-border)] font-semibold">Persona</th>
                      <th className="p-4 border-b border-[var(--card-border)] font-semibold">Key Use Case</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-4 border-b border-[var(--card-border)]">Patient</td>
                      <td className="p-4 border-b border-[var(--card-border)] text-[var(--text-secondary)]">Browsing available slots, booking appointments, receiving confirmations.</td>
                    </tr>
                    <tr>
                      <td className="p-4 border-b border-[var(--card-border)]">Clinic Staff</td>
                      <td className="p-4 border-b border-[var(--card-border)] text-[var(--text-secondary)]">Managing the daily queue, viewing patient history, handling cancellations.</td>
                    </tr>
                    <tr>
                      <td className="p-4 border-b border-[var(--card-border)]">Administrator</td>
                      <td className="p-4 border-b border-[var(--card-border)] text-[var(--text-secondary)]">Configuring clinic hours, managing staff access, reviewing analytics.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ),
          },
        ],
      },
      {
        id: 'architecture',
        label: 'Architecture',
        documentTitle: 'System Architecture',
        documentDescription: 'The technical foundation, tech stack, and deployment strategy of the platform.',
        sections: [
          {
            id: 'technology-stack',
            title: 'Technology Stack',
            content: (
              <div className="overflow-x-auto mt-4">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr>
                      <th className="p-4 border-b border-[var(--card-border)] font-semibold">Layer</th>
                      <th className="p-4 border-b border-[var(--card-border)] font-semibold">Technology</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-4 border-b border-[var(--card-border)]">Frontend</td>
                      <td className="p-4 border-b border-[var(--card-border)] text-[var(--text-secondary)]">React, Tailwind CSS, Vite</td>
                    </tr>
                    <tr>
                      <td className="p-4 border-b border-[var(--card-border)]">Backend</td>
                      <td className="p-4 border-b border-[var(--card-border)] text-[var(--text-secondary)]">Django, Django REST Framework</td>
                    </tr>
                    <tr>
                      <td className="p-4 border-b border-[var(--card-border)]">Database</td>
                      <td className="p-4 border-b border-[var(--card-border)] text-[var(--text-secondary)]">PostgreSQL</td>
                    </tr>
                    <tr>
                      <td className="p-4 border-b border-[var(--card-border)]">Hosting</td>
                      <td className="p-4 border-b border-[var(--card-border)] text-[var(--text-secondary)]">Render (Backend + DB), Vercel (Frontend)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ),
          },
          {
            id: 'concurrency-control',
            title: 'Concurrency Control',
            content: (
              <>
                <p>
                  To prevent double bookings, the system uses database-level locking. Specifically, it employs Django&apos;s <code>select_for_update()</code> to lock the specific appointment slot row in PostgreSQL until the booking transaction completes.
                </p>
                <ul className="list-disc pl-6 space-y-2 mt-4 text-[var(--text-secondary)]">
                  <li><strong>Pessimistic Locking:</strong> Ensures that if two users request the same slot at the exact same millisecond, the database serializes the transactions.</li>
                  <li><strong>Atomicity:</strong> The booking process (verifying slot availability, creating the appointment record, updating slot status) is wrapped in an atomic database transaction.</li>
                  <li><strong>Failure Handling:</strong> If the transaction fails or the lock cannot be acquired within a timeout, the user is cleanly notified that the slot is no longer available.</li>
                </ul>
              </>
            ),
          },
        ],
      },
      {
        id: 'whatsapp-bot',
        label: 'WhatsApp Bot',
        documentTitle: 'WhatsApp Chatbot Extension',
        documentDescription: 'Serverless chatbot bringing appointment booking to WhatsApp — architecture, conversation design, and database schema.',
        sections: [
          {
            id: 'why-chatbot',
            title: 'Why a Chatbot?',
            content: (
              <>
                <p>
                  The web platform solved structured bookings, but the clinic was still fielding a high volume of unstructured WhatsApp inquiries — patients asking about availability, fees, and directions directly in chat. These were manually handled and frequently missed. The WhatsApp chatbot brings the same booking flow into the conversation the patient is already having, with zero app install required.
                </p>
                <p className="mt-4 p-4 border border-[var(--card-border)] rounded-md text-[var(--text-secondary)]">
                  📱 The website remains the primary booking surface. The chatbot is a complementary channel — capturing leads and guiding patients through a structured booking flow without leaving WhatsApp.
                </p>
              </>
            )
          },
          {
            id: 'chatbot-architecture',
            title: 'System Architecture',
            content: (
              <>
                <p>
                  The chatbot is a fully serverless, independent service. It shares the clinic brand but runs on a separate infrastructure stack from the web platform.
                </p>
                <div className="overflow-x-auto mt-4">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr>
                        <th className="p-4 border-b border-[var(--card-border)] font-semibold">Layer</th>
                        <th className="p-4 border-b border-[var(--card-border)] font-semibold">Technology</th>
                        <th className="p-4 border-b border-[var(--card-border)] font-semibold">Role</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="p-4 border-b border-[var(--card-border)]">Messaging</td>
                        <td className="p-4 border-b border-[var(--card-border)] text-[var(--text-secondary)]">Meta WhatsApp Cloud API</td>
                        <td className="p-4 border-b border-[var(--card-border)] text-[var(--text-secondary)]">Inbound/outbound message transport</td>
                      </tr>
                      <tr>
                        <td className="p-4 border-b border-[var(--card-border)]">Gateway</td>
                        <td className="p-4 border-b border-[var(--card-border)] text-[var(--text-secondary)]">AWS API Gateway (HTTP API)</td>
                        <td className="p-4 border-b border-[var(--card-border)] text-[var(--text-secondary)]">Webhook receiver — routes POST to Lambda</td>
                      </tr>
                      <tr>
                        <td className="p-4 border-b border-[var(--card-border)]">Compute</td>
                        <td className="p-4 border-b border-[var(--card-border)] text-[var(--text-secondary)]">AWS Lambda (Python 3.12)</td>
                        <td className="p-4 border-b border-[var(--card-border)] text-[var(--text-secondary)]">Stateless request handler — ASGI via Mangum</td>
                      </tr>
                      <tr>
                        <td className="p-4 border-b border-[var(--card-border)]">Framework</td>
                        <td className="p-4 border-b border-[var(--card-border)] text-[var(--text-secondary)]">FastAPI + Mangum</td>
                        <td className="p-4 border-b border-[var(--card-border)] text-[var(--text-secondary)]">Async web framework; Mangum shims ASGI to Lambda</td>
                      </tr>
                      <tr>
                        <td className="p-4 border-b border-[var(--card-border)]">Database</td>
                        <td className="p-4 border-b border-[var(--card-border)] text-[var(--text-secondary)]">Neon PostgreSQL (serverless)</td>
                        <td className="p-4 border-b border-[var(--card-border)] text-[var(--text-secondary)]">Session state + lead storage; asyncpg + SQLAlchemy</td>
                      </tr>
                      <tr>
                        <td className="p-4 border-b border-[var(--card-border)]">IaC</td>
                        <td className="p-4 border-b border-[var(--card-border)] text-[var(--text-secondary)]">AWS SAM + CloudFormation</td>
                        <td className="p-4 border-b border-[var(--card-border)] text-[var(--text-secondary)]">Declarative, version-controlled infra</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="mt-4">
                  Data flow: Patient → WhatsApp → Meta Cloud API → API Gateway → Lambda → NeonDB. Outbound replies follow the reverse path, triggered within the same Lambda invocation.
                </p>
              </>
            )
          },
          {
            id: 'conversation-design',
            title: 'Conversation Design',
            content: (
              <>
                <p>
                  The bot uses a guided decision-tree rather than NLP. Reliability over complexity for v1 — every state is deterministic and auditable.
                </p>
                <ul className="list-disc pl-6 space-y-2 mt-4 text-[var(--text-secondary)]">
                  <li><strong>nodes.json</strong> — single source of truth for all conversation states; fully editable by non-engineers without code changes.</li>
                  <li><strong>Node types:</strong> options (list/button), text_input, action nodes.</li>
                  <li><strong>Context accumulation:</strong> patient name, age, concern, location, and preferred time collected step-by-step.</li>
                  <li><strong>Universal Navigation:</strong> Back and Main Menu buttons on every node — patients are never stuck. Reset keywords (hi, menu) always return to root.</li>
                  <li><strong>WhatsApp UI constraints respected:</strong> List messages (≤10 items) vs. Button replies (≤3) chosen per node.</li>
                </ul>
              </>
            )
          }
        ]
      },
      {
        id: 'challenges',
        label: 'Challenges',
        documentTitle: 'Debugging Journey',
        documentDescription: 'Real production bugs faced during the WhatsApp Chatbot deployment — problem, root cause, fix, and learnings.',
        sections: [
          {
            id: 'two-waba-problem',
            title: 'The Two WABA Problem (Silent Message Drop)',
            content: (
              <>
                <p>
                  This was the most time-consuming bug. The bot responded correctly to direct POST tests, but zero real patient messages ever triggered a Lambda invocation.
                </p>
                <div className="overflow-x-auto mt-4">
                  <table className="w-full text-left border-collapse">
                    <tbody>
                      <tr>
                        <td className="p-4 border-b border-[var(--card-border)] font-semibold">Symptom</td>
                        <td className="p-4 border-b border-[var(--card-border)] text-[var(--text-secondary)]">CloudWatch had no new logs after July 5th. Direct POST to API Gateway returned 403 Missing Signature — proving Lambda was alive and reachable.</td>
                      </tr>
                      <tr>
                        <td className="p-4 border-b border-[var(--card-border)] font-semibold">Investigation</td>
                        <td className="p-4 border-b border-[var(--card-border)] text-[var(--text-secondary)]">Checked app permissions (granted) → webhook verification GET (passing) → messages subscription in dashboard (showing subscribed) → API Gateway access logs (none existed).</td>
                      </tr>
                      <tr>
                        <td className="p-4 border-b border-[var(--card-border)] font-semibold">Root Cause</td>
                        <td className="p-4 border-b border-[var(--card-border)] text-[var(--text-secondary)]">The Meta account had two separate WhatsApp Business Accounts (WABAs). The active clinic number belonged to one that had never been explicitly subscribed to the App via API. Meta silently dropped all messages.</td>
                      </tr>
                      <tr>
                        <td className="p-4 border-b border-[var(--card-border)] font-semibold">Fix</td>
                        <td className="p-4 border-b border-[var(--card-border)] text-[var(--text-secondary)]">Called <code>POST /&#123;waba_id&#125;/subscribed_apps</code> via the Meta Graph API to subscribe the correct WABA.</td>
                      </tr>
                      <tr>
                        <td className="p-4 border-b border-[var(--card-border)] font-semibold">Learned</td>
                        <td className="p-4 border-b border-[var(--card-border)] text-[var(--text-secondary)]">Meta&apos;s dashboard &quot;messages: subscribed&quot; indicator is per-WABA and often visually misleading if you have multiple WABAs.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </>
            )
          },
          {
            id: 'staff-alert-policy',
            title: 'Staff Alert — 24h Window Policy',
            content: (
              <>
                <div className="overflow-x-auto mt-4">
                  <table className="w-full text-left border-collapse">
                    <tbody>
                      <tr>
                        <td className="p-4 border-b border-[var(--card-border)] font-semibold">Symptom</td>
                        <td className="p-4 border-b border-[var(--card-border)] text-[var(--text-secondary)]">Booking confirmation arrived on patient phone, lead saved to DB, but no alert on staff number.</td>
                      </tr>
                      <tr>
                        <td className="p-4 border-b border-[var(--card-border)] font-semibold">Root Cause</td>
                        <td className="p-4 border-b border-[var(--card-border)] text-[var(--text-secondary)]">WhatsApp&apos;s 24-hour customer service window blocks free-form messages to numbers that haven&apos;t messaged the bot first. The staff number had never initiated contact.</td>
                      </tr>
                      <tr>
                        <td className="p-4 border-b border-[var(--card-border)] font-semibold">Fix</td>
                        <td className="p-4 border-b border-[var(--card-border)] text-[var(--text-secondary)]">Created a Meta-approved Utility message template (new_lead_alert) with 7 dynamic variable slots. Rewrote template significantly after it was initially rejected for &quot;too many variables for its length&quot;.</td>
                      </tr>
                      <tr>
                        <td className="p-4 border-b border-[var(--card-border)] font-semibold">Learned</td>
                        <td className="p-4 border-b border-[var(--card-border)] text-[var(--text-secondary)]">WhatsApp templates require a high ratio of static text to variables, and variables cannot be the first or last element of the body.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </>
            )
          }
        ]
      },
      {
        id: 'roadmap',
        label: 'Roadmap',
        documentTitle: 'Known Limitations & V2 Roadmap',
        documentDescription: 'Current limitations, planned improvements, and cost snapshot.',
        sections: [
          {
            id: 'known-limitations',
            title: 'Known Limitations (V1)',
            content: (
              <ul className="list-disc pl-6 space-y-2 mt-4 text-[var(--text-secondary)]">
                <li><code>collect_time</code> node has no options defined — patient gets stuck at this step (known bug, scheduled for v2).</li>
                <li>Access token is a temporary user token — needs migration to a permanent System User token.</li>
                <li>No graceful error handling if Neon DB is unreachable — Lambda returns 500, Meta retries up to 3×.</li>
                <li>No admin dashboard to view or manage leads from the chatbot.</li>
                <li>Chatbot bookings do not reserve a real calendar slot — needs Google Calendar / Cal.com integration.</li>
              </ul>
            )
          },
          {
            id: 'cost-snapshot',
            title: 'Cost Snapshot (at Launch)',
            content: (
              <>
                <div className="overflow-x-auto mt-4">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr>
                        <th className="p-4 border-b border-[var(--card-border)] font-semibold">Resource</th>
                        <th className="p-4 border-b border-[var(--card-border)] font-semibold">Free Tier / Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="p-4 border-b border-[var(--card-border)]">Meta Cloud API</td>
                        <td className="p-4 border-b border-[var(--card-border)] text-[var(--text-secondary)]">1,000 free conversations/month</td>
                      </tr>
                      <tr>
                        <td className="p-4 border-b border-[var(--card-border)]">AWS Lambda</td>
                        <td className="p-4 border-b border-[var(--card-border)] text-[var(--text-secondary)]">1M invocations/month free — effectively $0 at clinic scale</td>
                      </tr>
                      <tr>
                        <td className="p-4 border-b border-[var(--card-border)]">Neon PostgreSQL</td>
                        <td className="p-4 border-b border-[var(--card-border)] text-[var(--text-secondary)]">0.5 GB storage · 190 compute hours/month free</td>
                      </tr>
                      <tr>
                        <td className="p-4 border-b border-[var(--card-border)] font-semibold">Total monthly infra cost</td>
                        <td className="p-4 border-b border-[var(--card-border)] font-semibold text-[var(--text-secondary)]">~$0</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="mt-4 p-4 border border-[var(--card-border)] rounded-md text-[var(--text-secondary)]">
                  The zero-cost serverless architecture was a deliberate design goal — the clinic should incur no infra bill until message volume exceeds the free tiers by an order of magnitude.
                </p>
              </>
            )
          }
        ]
      }
    ]
  },
  documiner: {
    id: 'documiner',
    title: 'DocuMiner',
    subtitle: 'AI Enterprise Document Security Analyzer',
    oneLiner: 'Agentic zero-shot AI pipeline that analyzes enterprise documents for security compliance violations.',
    version: 'V2',
    versionSummary: 'Multi-stage pipeline update integrating Tesseract OCR, OpenCV preprocessing, and LangChain map-reduce.',
    githubUrl: 'https://github.com/CodinGakpo/DocuMiner',
    tabs: [
      {
        id: 'overview',
        label: 'Overview',
        documentTitle: 'Product Overview',
        documentDescription: 'What DocuMiner is and the enterprise compliance challenges it addresses.',
        sections: [
          {
            id: 'what-is-documiner',
            title: 'What is DocuMiner?',
            content: (
              <>
                <p>
                  DocuMiner is an AI-powered pipeline designed to automatically audit enterprise documents—including PDFs, Excel sheets, PowerPoints, and scanned images—for security vulnerabilities and compliance violations (like exposed PII or improper IAM policies).
                </p>
                <p>
                  It utilizes a multi-stage agentic approach with zero-shot classification to interpret documents without requiring task-specific fine-tuning.
                </p>
              </>
            ),
          },
          {
            id: 'the-problem-it-solves',
            title: 'The Problem It Solves',
            content: (
              <>
                <p>
                  Manual auditing of vast enterprise document repositories is slow, error-prone, and expensive. Security teams struggle to track sensitive data (PII) spread across unstructured formats.
                </p>
                <p>
                  DocuMiner automates this by extracting text from any format (even poor-quality scans) and running it through an LLM to identify, classify, and pseudonymize sensitive information.
                </p>
              </>
            ),
          },
        ],
      },
      {
        id: 'extraction-engine',
        label: 'Extraction Engine',
        documentTitle: 'Data Extraction',
        documentDescription: 'How unstructured data is extracted and normalized across varying formats.',
        sections: [
          {
            id: 'ocr-preprocessing',
            title: 'OCR & Preprocessing Pipeline',
            content: (
              <>
                <p>
                  A major hurdle was dealing with scanned PDFs and images that yielded garbage text when fed directly into Tesseract OCR.
                </p>
                <p>
                  To solve this, a custom OpenCV preprocessing step was added before OCR:
                </p>
                <ul className="list-disc pl-6 space-y-2 mt-4 text-[var(--text-secondary)]">
                  <li><strong>Binarization:</strong> Converting images to pure black and white to increase contrast for text.</li>
                  <li><strong>Deskewing:</strong> Automatically rotating crooked scans to ensure text lines are perfectly horizontal.</li>
                  <li><strong>Noise Reduction:</strong> Removing artifacts and speckles that confuse the OCR engine.</li>
                </ul>
              </>
            ),
          },
        ],
      },
      {
        id: 'ai-pipeline',
        label: 'AI Pipeline',
        documentTitle: 'AI & LangChain',
        documentDescription: 'The core intelligence of the platform driving compliance analysis.',
        sections: [
          {
            id: 'context-window-strategy',
            title: 'Context Window Strategy',
            content: (
              <>
                <p>
                  Enterprise documents often exceed the token limits of modern LLMs. Feeding a 100-page policy manual into OpenAI&apos;s API directly results in a context window error.
                </p>
                <p>
                  DocuMiner implements a <strong>Map-Reduce summarization strategy</strong> via LangChain:
                </p>
                <ul className="list-disc pl-6 space-y-2 mt-4 text-[var(--text-secondary)]">
                  <li><strong>Chunking:</strong> Documents are split into overlapping chunks to ensure context at boundaries is not lost.</li>
                  <li><strong>Map Step:</strong> Each chunk is analyzed independently for compliance violations.</li>
                  <li><strong>Reduce Step:</strong> The findings from all chunks are aggregated into a final, unified compliance report.</li>
                </ul>
              </>
            ),
          },
          {
            id: 'technology-stack',
            title: 'Technology Stack',
            content: (
              <div className="overflow-x-auto mt-4">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr>
                      <th className="p-4 border-b border-[var(--card-border)] font-semibold">Layer</th>
                      <th className="p-4 border-b border-[var(--card-border)] font-semibold">Technology</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-4 border-b border-[var(--card-border)]">API Framework</td>
                      <td className="p-4 border-b border-[var(--card-border)] text-[var(--text-secondary)]">FastAPI (Python)</td>
                    </tr>
                    <tr>
                      <td className="p-4 border-b border-[var(--card-border)]">Orchestration</td>
                      <td className="p-4 border-b border-[var(--card-border)] text-[var(--text-secondary)]">LangChain</td>
                    </tr>
                    <tr>
                      <td className="p-4 border-b border-[var(--card-border)]">AI Model</td>
                      <td className="p-4 border-b border-[var(--card-border)] text-[var(--text-secondary)]">OpenAI API</td>
                    </tr>
                    <tr>
                      <td className="p-4 border-b border-[var(--card-border)]">Computer Vision</td>
                      <td className="p-4 border-b border-[var(--card-border)] text-[var(--text-secondary)]">OpenCV, Tesseract OCR</td>
                    </tr>
                    <tr>
                      <td className="p-4 border-b border-[var(--card-border)]">NLP</td>
                      <td className="p-4 border-b border-[var(--card-border)] text-[var(--text-secondary)]">spaCy</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ),
          },
        ],
      },
    ],
  },
  'jan-saathi': {
    id: 'jan-saathi',
    title: 'Jan Saathi',
    subtitle: 'AI-Routed Civic Complaint Platform',
    oneLiner: 'A citizen files a report, AI clusters it with nearby same-category issues and auto-routes it to the right supervisor, a field worker resolves it with photo proof, and the citizen gets a small wallet reward — no human dispatcher in the loop.',
    version: 'Staging · 4-Service Platform',
    versionSummary: 'Evolved from a single-service civic reporting app into a 4-service platform — 2 Flutter apps (JanSaathi for citizens, JanKarta for supervisors and field workers) + 2 React websites (admin console, public info site) — live on real AWS infrastructure and real domains in staging.',
    liveUrl: 'https://jansaathi.co.in',
    githubUrl: 'https://github.com/dibyajyoti-chakrabarti/jan-saathi',
    tabs: [
      {
        id: 'overview',
        label: 'Overview',
        documentTitle: 'Product Overview',
        documentDescription: 'What Jan Saathi is, the four properties that make up the platform, and how they fit together.',
        sections: [
          {
            id: 'what-is-jan-saathi',
            title: 'What is Jan Saathi?',
            content: (
              <>
                <p>
                  Jan Saathi is a civic-complaint pipeline: a citizen files a report, AI clusters it with nearby same-category issues and auto-routes the cluster to the right supervisor, the supervisor (or a field worker they delegate to) resolves it with photo proof, the citizen gets a small wallet reward, and a human admin only ever touches two exception queues. There is no human dispatcher in the middle.
                </p>
                <p>
                  The platform carries two citizen-facing sub-brands under one system: <strong>JanSaathi</strong> for citizens, and <strong>JanKarta</strong> for supervisors and field workers.
                </p>
              </>
            ),
          },
          {
            id: 'four-properties',
            title: 'The Four Properties',
            content: (
              <div className="overflow-x-auto mt-4">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr>
                      <th className="p-4 border-b border-[var(--card-border)] font-semibold">Property</th>
                      <th className="p-4 border-b border-[var(--card-border)] font-semibold">Type / Brand</th>
                      <th className="p-4 border-b border-[var(--card-border)] font-semibold">For</th>
                      <th className="p-4 border-b border-[var(--card-border)] font-semibold">Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-4 border-b border-[var(--card-border)]">client-app</td>
                      <td className="p-4 border-b border-[var(--card-border)] text-[var(--text-secondary)]">Flutter app · JanSaathi</td>
                      <td className="p-4 border-b border-[var(--card-border)] text-[var(--text-secondary)]">Citizens</td>
                      <td className="p-4 border-b border-[var(--card-border)] text-[var(--text-secondary)]">Starts the pipeline — files/tracks reports, community feed, rewards wallet</td>
                    </tr>
                    <tr>
                      <td className="p-4 border-b border-[var(--card-border)]">worker-app</td>
                      <td className="p-4 border-b border-[var(--card-border)] text-[var(--text-secondary)]">Flutter app · JanKarta</td>
                      <td className="p-4 border-b border-[var(--card-border)] text-[var(--text-secondary)]">Supervisors + field workers</td>
                      <td className="p-4 border-b border-[var(--card-border)] text-[var(--text-secondary)]">Owns the operational middle — acknowledge, assign, resolve, reject, escalate</td>
                    </tr>
                    <tr>
                      <td className="p-4 border-b border-[var(--card-border)]">admin-app</td>
                      <td className="p-4 border-b border-[var(--card-border)] text-[var(--text-secondary)]">React website</td>
                      <td className="p-4 border-b border-[var(--card-border)] text-[var(--text-secondary)]">Admin / department staff</td>
                      <td className="p-4 border-b border-[var(--card-border)] text-[var(--text-secondary)]">Oversight only — watches the pipeline, acts on exception and escalation queues</td>
                    </tr>
                    <tr>
                      <td className="p-4 border-b border-[var(--card-border)]">info-app</td>
                      <td className="p-4 border-b border-[var(--card-border)] text-[var(--text-secondary)]">React website (static) · JanSaathi</td>
                      <td className="p-4 border-b border-[var(--card-border)] text-[var(--text-secondary)]">Public / prospective citizens</td>
                      <td className="p-4 border-b border-[var(--card-border)] text-[var(--text-secondary)]">Marketing + walkthrough site, hosts both apps&apos; APK downloads</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ),
          },
        ],
      },
      {
        id: 'architecture',
        label: 'Architecture',
        documentTitle: 'System Architecture',
        documentDescription: 'The technology stack and the coordination model behind the four services.',
        sections: [
          {
            id: 'technology-stack',
            title: 'Technology Stack',
            content: (
              <div className="overflow-x-auto mt-4">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr>
                      <th className="p-4 border-b border-[var(--card-border)] font-semibold">Layer</th>
                      <th className="p-4 border-b border-[var(--card-border)] font-semibold">Technology</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td className="p-4 border-b border-[var(--card-border)]">Backend (x3)</td><td className="p-4 border-b border-[var(--card-border)] text-[var(--text-secondary)]">Go 1.24/1.25, Gin, pgx/v5, golang-jwt — one independent service per app</td></tr>
                    <tr><td className="p-4 border-b border-[var(--card-border)]">Database</td><td className="p-4 border-b border-[var(--card-border)] text-[var(--text-secondary)]">Single shared AWS RDS Postgres instance across all three backends</td></tr>
                    <tr><td className="p-4 border-b border-[var(--card-border)]">Mobile</td><td className="p-4 border-b border-[var(--card-border)] text-[var(--text-secondary)]">Flutter (client-app + worker-app)</td></tr>
                    <tr><td className="p-4 border-b border-[var(--card-border)]">Frontends</td><td className="p-4 border-b border-[var(--card-border)] text-[var(--text-secondary)]">React 19 + Vite — admin-app (MapLibre GL + supercluster heatmap), info-app (Tailwind CSS v4)</td></tr>
                    <tr><td className="p-4 border-b border-[var(--card-border)]">AI</td><td className="p-4 border-b border-[var(--card-border)] text-[var(--text-secondary)]">Python analysis-worker calling AWS Bedrock (Nova Pro) across 4 agents: image validation, image tagging, text tagging, synthesis</td></tr>
                    <tr><td className="p-4 border-b border-[var(--card-border)]">Identity</td><td className="p-4 border-b border-[var(--card-border)] text-[var(--text-secondary)]">Phone-OTP everywhere; Aadhaar/DigiLocker verification via Setu for citizens</td></tr>
                    <tr><td className="p-4 border-b border-[var(--card-border)]">Infra</td><td className="p-4 border-b border-[var(--card-border)] text-[var(--text-secondary)]">Consolidated Terraform root, serverless-first — Lambda + API Gateway per service</td></tr>
                    <tr><td className="p-4 border-b border-[var(--card-border)]">CI/CD</td><td className="p-4 border-b border-[var(--card-border)] text-[var(--text-secondary)]">GitHub Actions with OIDC role assumption — no static AWS keys</td></tr>
                  </tbody>
                </table>
              </div>
            ),
          },
          {
            id: 'coordination-model',
            title: 'Shared-Database, Independent Services',
            content: (
              <p>
                There is no service-to-service API and no message broker between the four backends — they coordinate purely through shared Postgres tables (a <code>clusters</code> table for state, an <code>assignments</code> table for the full audit trail). Each backend is deployed as its own Lambda. The one genuine asynchronous hand-off in the system is the client-app invoking the analysis-worker directly and asynchronously right after a report is saved, so the AI pipeline never blocks the citizen-facing flow.
              </p>
            ),
          },
          {
            id: 'real-geography',
            title: 'Real Civic Geography',
            content: (
              <p>
                225 real BBMP (Bengaluru) civic ward polygons are bundled and used for point-in-polygon routing — reports are matched to the actual administrative ward and department responsible, not a synthetic or toy geography.
              </p>
            ),
          },
        ],
      },
      {
        id: 'evolution',
        label: 'Platform Evolution',
        documentTitle: 'From Single App to Four-Service Platform',
        documentDescription: 'How the architecture grew from a single reporting app into a coordinated multi-service platform, and where it stands today.',
        sections: [
          {
            id: 'what-changed',
            title: 'What Changed',
            content: (
              <ul className="list-disc pl-6 space-y-3">
                <li><strong>Cluster-based lifecycle:</strong> the report tracking model was redesigned so the AI-formed cluster — not the individual report — is the unit of work, collapsing what used to be many independent per-report tickets into one shared status per cluster.</li>
                <li><strong>JanKarta as a fourth service:</strong> the supervisor/field-worker workflow was built out into its own dedicated Flutter app and Go backend, distinct from the citizen-facing app and the admin console.</li>
                <li><strong>Consolidated infrastructure:</strong> the platform now runs from one unified Terraform root (shared, admin, client, worker, and analysis-worker modules) instead of separate infrastructure definitions per service.</li>
                <li><strong>Database consolidation:</strong> all services now write to a single AWS RDS Postgres instance, replacing an earlier external managed-Postgres dependency.</li>
                <li><strong>Reward model refinement:</strong> the citizen wallet reward structure was simplified to a flat per-resolution amount plus a milestone bonus every 10 resolutions.</li>
              </ul>
            ),
          },
          {
            id: 'current-status',
            title: 'Current Status',
            content: (
              <p>
                Live in a staging environment on real AWS infrastructure and real domains — <code>jansaathi.co.in</code> (public info site) and <code>console.jansaathi.co.in</code> (admin console), both served via CloudFront + S3. Both mobile apps are distributed as signed, direct-download APKs from the info site ahead of a planned Play Store listing.
              </p>
            ),
          },
        ],
      },
    ],
  },
  keyhole: {
    id: 'keyhole',
    title: 'KeyHole',
    subtitle: 'Confidential Compute Sandbox for Untrusted / AI-Generated Code',
    oneLiner: 'Lets untrusted or AI-generated code run against private data in the cloud and return only a small, cryptographically-attested answer — the data is structurally incapable of leaking out, not just scanned for leaks.',
    version: 'Milestones M0–M9',
    versionSummary: 'Feature-complete for its planned base scope — 19 test files, 90+ individual tests passing, verified end-to-end on real AWS infrastructure (Fargate, Lambda, KMS, DynamoDB), then torn down via terraform destroy to keep idle cost near $0.',
    githubUrl: 'https://github.com/CodinGakpo/KeyHole',
    externalLinks: [
      { label: 'README + architecture diagram', url: 'https://github.com/CodinGakpo/KeyHole/blob/HEAD/README.md' },
      { label: 'SECURITY.md', url: 'https://github.com/CodinGakpo/KeyHole/blob/HEAD/SECURITY.md' },
      { label: 'Future Scope', url: 'https://github.com/CodinGakpo/KeyHole/blob/HEAD/docs/FUTURE-SCOPE.md' },
    ],
    tabs: [
      {
        id: 'overview',
        label: 'Overview',
        documentTitle: 'Product Overview',
        documentDescription: 'What KeyHole is, the confinement problem it targets, and who it is for.',
        sections: [
          {
            id: 'what-is-keyhole',
            title: 'What is KeyHole?',
            content: (
              <>
                <p>
                  Sandboxes like E2B, Modal, and AWS AgentCore are isolation-first: they stop code from escaping the box and touching the host, but they do nothing to stop code that legitimately has access to your data from leaking it back out — writing it to an open socket, encoding it in the output, and so on.
                </p>
                <p>
                  KeyHole flips the problem. Instead of trying to detect exfiltration — which encryption or steganography can always defeat — it bounds the <strong>channel capacity</strong> of the code&apos;s only way out. It&apos;s for developers and teams who want to let an AI agent or third-party script operate on sensitive data (support tickets, customer records, internal documents) without having to trust that the code won&apos;t exfiltrate it.
                </p>
              </>
            ),
          },
          {
            id: 'confinement-problem',
            title: 'The Confinement Problem',
            content: (
              <>
                <p>
                  The sandbox runs with zero network egress. The caller must declare a narrow output schema up front — an int, enum, bounded string, bounded array, or small record, each worth some fixed number of bits. An exit gate only releases a return value if it conforms to that schema and the caller hasn&apos;t exceeded a cumulative per-principal bit budget across all their runs. A signed attestation then proves, verifiably, exactly what ran, on what data, with zero egress, and how many bits could have left.
                </p>
                <p>
                  It is explicitly grounded in Lampson&apos;s 1973 confinement problem. The project never claims &quot;zero leak&quot; — it claims a disclosed, quantified upper bound on leakage, which is a claim you can actually check rather than trust.
                </p>
              </>
            ),
          },
          {
            id: 'key-features',
            title: 'Key Features',
            content: (
              <ul className="list-disc pl-6 space-y-3">
                <li><strong>Bandwidth-bounded exit, not content scanning</strong> — bulk exfiltration is structurally impossible because the channel is a few bits wide, not because a filter is watching for secrets.</li>
                <li><strong>Cumulative exit-bandwidth budget</strong> — caps total bits a caller can extract across many separate runs, defeating drip/salami-slicing exfiltration.</li>
                <li><strong>KMS-backed, independently verifiable attestations</strong> — every run, released or withheld, produces a signed claim anyone can verify against the exported public key.</li>
                <li><strong>Multi-party &quot;clean room&quot; mode</strong> — a data-owner and a code-provider are separate principals; unauthorized access is refused before any data is ever loaded into memory.</li>
                <li><strong>Adversarial &quot;hostile&quot; test suite</strong> — dedicated tests actively try to defeat the guarantee (raw dumps, encoding data inside a conforming schema, fork bombs, drip exfiltration), all proven blocked on real AWS.</li>
              </ul>
            ),
          },
        ],
      },
      {
        id: 'architecture',
        label: 'Architecture',
        documentTitle: 'System Architecture',
        documentDescription: 'The technology stack and the infrastructure decisions behind the confinement guarantee.',
        sections: [
          {
            id: 'technology-stack',
            title: 'Technology Stack',
            content: (
              <div className="overflow-x-auto mt-4">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr>
                      <th className="p-4 border-b border-[var(--card-border)] font-semibold">Layer</th>
                      <th className="p-4 border-b border-[var(--card-border)] font-semibold">Technology</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td className="p-4 border-b border-[var(--card-border)]">Core</td><td className="p-4 border-b border-[var(--card-border)] text-[var(--text-secondary)]">Python — minimal deps by design (pydantic + cryptography)</td></tr>
                    <tr><td className="p-4 border-b border-[var(--card-border)]">Sandbox / compute</td><td className="p-4 border-b border-[var(--card-border)] text-[var(--text-secondary)]">AWS ECS Fargate — no NAT, no internet route, empty IAM task role, read-only root filesystem</td></tr>
                    <tr><td className="p-4 border-b border-[var(--card-border)]">Control plane (cloud mode)</td><td className="p-4 border-b border-[var(--card-border)] text-[var(--text-secondary)]">AWS Lambda + API Gateway, async submit/poll pattern</td></tr>
                    <tr><td className="p-4 border-b border-[var(--card-border)]">Data / audit</td><td className="p-4 border-b border-[var(--card-border)] text-[var(--text-secondary)]">DynamoDB, append-only audit log</td></tr>
                    <tr><td className="p-4 border-b border-[var(--card-border)]">Attestation / crypto</td><td className="p-4 border-b border-[var(--card-border)] text-[var(--text-secondary)]">ed25519 locally; AWS KMS (ECC_NIST_P256, ECDSA_SHA_256) in the cloud — signing key never leaves KMS</td></tr>
                    <tr><td className="p-4 border-b border-[var(--card-border)]">Storage</td><td className="p-4 border-b border-[var(--card-border)] text-[var(--text-secondary)]">S3 (SSE-S3), presigned GET/PUT so the sandbox task itself needs zero AWS credentials</td></tr>
                    <tr><td className="p-4 border-b border-[var(--card-border)]">Infra / IaC</td><td className="p-4 border-b border-[var(--card-border)] text-[var(--text-secondary)]">Terraform — single terraform apply / terraform destroy for the whole stack</td></tr>
                    <tr><td className="p-4 border-b border-[var(--card-border)]">Interfaces</td><td className="p-4 border-b border-[var(--card-border)] text-[var(--text-secondary)]">CLI (sbx) and an MCP server (run_confidential tool) for direct AI-agent use</td></tr>
                  </tbody>
                </table>
              </div>
            ),
          },
          {
            id: 'egress-containment',
            title: 'Egress Containment: A Corrected Design',
            content: (
              <>
                <p>
                  Egress containment moved from an in-task sidecar proxy to network-layer containment (private subnet, no NAT, security group with no open route) — a real design correction made after initially building and testing the sidecar approach locally, then discovering it doesn&apos;t hold in Fargate&apos;s shared-network-namespace <code>awsvpc</code> mode.
                </p>
                <p>
                  A separate infrastructure gotcha: a read-only root filesystem plus a non-root user meant the sandbox container couldn&apos;t write to its own empty mounted work volume (mounts default to root-owned). The fix was an <code>essential=false</code> init container that runs as root via ECS&apos;s <code>entryPoint</code> field — not <code>command</code>, which overrides the image CMD rather than ENTRYPOINT — to <code>chown</code> the volume before the sandbox container starts.
                </p>
              </>
            ),
          },
          {
            id: 'clean-room-mode',
            title: 'Multi-Party Clean Room Mode',
            content: (
              <p>
                A data-owner and a code-provider are modeled as separate principals. The owner registers a dataset and grants scoped access tokens to specific providers; unauthorized access is refused before any data is ever loaded into memory. This has been verified directly: ungranted access is refused without running, cross-principal exfiltration attempts are withheld, and tampered attestations are flagged invalid.
              </p>
            ),
          },
        ],
      },
      {
        id: 'challenges',
        label: 'Challenges & Fixes',
        documentTitle: 'Problems Found, and How They Were Solved',
        documentDescription: 'Every one of these was found by running the system against real AWS infrastructure, not by reading the code and assuming it worked.',
        sections: [
          {
            id: 'problem-solution-table',
            title: 'Problem → Solution',
            content: (
              <div className="overflow-x-auto mt-4">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr>
                      <th className="p-4 border-b border-[var(--card-border)] font-semibold">Problem</th>
                      <th className="p-4 border-b border-[var(--card-border)] font-semibold">Solution</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-4 border-b border-[var(--card-border)]">Assumed an egress-proxy sidecar could enforce network isolation.</td>
                      <td className="p-4 border-b border-[var(--card-border)] text-[var(--text-secondary)]">Discovered Fargate&apos;s shared network namespace defeats sidecar enforcement; moved isolation to the subnet/security-group layer.</td>
                    </tr>
                    <tr>
                      <td className="p-4 border-b border-[var(--card-border)]">Read-only root + non-root user couldn&apos;t write to the mounted work volume.</td>
                      <td className="p-4 border-b border-[var(--card-border)] text-[var(--text-secondary)]">A root-run, essential=false init container chowns the volume before the sandbox container&apos;s dependsOn: SUCCESS lets it start.</td>
                    </tr>
                    <tr>
                      <td className="p-4 border-b border-[var(--card-border)]">IAM PassRole and task-tagging permissions were misscoped.</td>
                      <td className="p-4 border-b border-[var(--card-border)] text-[var(--text-secondary)]">Caught only by attempting real deploys; iteratively fixed via live AWS verification runs until an honest request released+attested and an exfiltration attempt was withheld end-to-end.</td>
                    </tr>
                    <tr>
                      <td className="p-4 border-b border-[var(--card-border)]">DynamoDB rejects native Python floats; risk of an attestation colliding with its own run record.</td>
                      <td className="p-4 border-b border-[var(--card-border)] text-[var(--text-secondary)]">Float→Decimal via a JSON round-trip; attestation fields nested under a dedicated &quot;att&quot; key so they can&apos;t clobber the run&apos;s own primary key.</td>
                    </tr>
                    <tr>
                      <td className="p-4 border-b border-[var(--card-border)]">Local SELinux blocked Docker bind-mounts, breaking the local egress-containment test harness.</td>
                      <td className="p-4 border-b border-[var(--card-border)] text-[var(--text-secondary)]">Baked the test probe into the Docker image itself rather than volume-mounting it.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ),
          },
        ],
      },
      {
        id: 'status',
        label: 'Status & Scope',
        documentTitle: 'Current Status',
        documentDescription: 'What\'s done, what\'s explicitly not built yet, and why that\'s stated plainly rather than hidden.',
        sections: [
          {
            id: 'current-status',
            title: 'Where It Stands',
            content: (
              <p>
                Feature-complete for its planned base scope (internally tracked as milestones M0–M9), all verified end-to-end on real AWS infrastructure. There is no public live URL — this is a self-hosted, deploy-into-your-own-AWS-account tool, not a hosted SaaS. All cloud verification runs were done against a real AWS account and then torn down via terraform destroy to keep idle cost near $0 (designed to run under $10/month).
              </p>
            ),
          },
          {
            id: 'not-built-yet',
            title: 'Explicitly Not Built Yet',
            content: (
              <>
                <p>Documented as a known gap rather than hidden:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Typed / numeric-tolerance output schemas</li>
                  <li>Warm execution pools (cold start is currently the main latency cost)</li>
                  <li>Nitro Enclave hardware attestation</li>
                  <li>Signed, time-boxed access grants for clean-room mode (grants are currently unguessable bearer tokens — fine for a solo/demo project, a noted production gap)</li>
                </ul>
              </>
            ),
          },
          {
            id: 'honesty-as-design',
            title: 'Honesty as a Design Principle',
            content: (
              <p>
                A solo project built around a specific thesis — channel-capacity confinement over content-based leak detection — rather than a generic sandbox clone. It documents what it does <em>not</em> solve with the same rigor as what it claims, in a dedicated security doc and future-scope doc, rather than overselling.
              </p>
            ),
          },
        ],
      },
    ],
  },
  shieldstream: {
    id: 'shieldstream',
    title: 'ShieldStream',
    subtitle: 'Distributed API Security Gateway with Real-Time Threat Detection',
    oneLiner: 'A reverse proxy with atomic Redis-backed sliding-window rate limiting, two-tier real-time threat detection, and a live WebSocket operator dashboard — built to protect an upstream API from abuse without adding meaningful latency.',
    version: '12-Phase Blueprint',
    versionSummary: 'All 12 planned phases implemented and live-verified locally / in Docker Compose — proxy, auth, rate limiting, threat detection, dashboard, observability, load & chaos testing, CI/CD. Deployment runbook written but not yet executed against production infrastructure.',
    githubUrl: 'https://github.com/CodinGakpo/SheildStream',
    externalLinks: [
      { label: 'DECISIONS.md (engineering log)', url: 'https://github.com/CodinGakpo/SheildStream/blob/HEAD/DECISIONS.md' },
      { label: 'Load test report', url: 'https://github.com/CodinGakpo/SheildStream/blob/HEAD/loadtest-results/report.html' },
    ],
    tabs: [
      {
        id: 'overview',
        label: 'Overview',
        documentTitle: 'Product Overview',
        documentDescription: 'What ShieldStream is, who it protects, and what kind of project it actually is.',
        sections: [
          {
            id: 'what-is-shieldstream',
            title: 'What is ShieldStream?',
            content: (
              <p>
                A distributed API security gateway: reverse proxy + atomic Redis-backed sliding-window rate limiting + two-tier real-time threat detection (OWASP signatures + statistical anomaly scoring) + a live WebSocket operator dashboard. Built for API providers who need to protect an upstream service from abuse or attack traffic without adding meaningful latency.
              </p>
            ),
          },
          {
            id: 'not-ml',
            title: 'Not an ML Project',
            content: (
              <p>
                The &quot;anomaly detection&quot; is a from-scratch statistical method (EWMA + z-score), not a trained model — stated explicitly here so it isn&apos;t mis-tagged as an AI/ML project. It combines with OWASP regex signatures in a two-tier scheme: signatures catch known-shape HIGH-severity attacks, statistical scoring catches MEDIUM-severity traffic that&apos;s unusual but not necessarily malicious.
              </p>
            ),
          },
          {
            id: 'key-features',
            title: 'Key Features',
            content: (
              <ul className="list-disc pl-6 space-y-3">
                <li><strong>Atomic distributed rate limiting</strong> — a single Redis Lua script does check-then-act as one atomic unit, proven with 100 concurrent requests against a limit of 10, repeated 50x with zero flakiness.</li>
                <li><strong>Chaos-tested fail-open design</strong> — the Redis container is killed live under real traffic, and every request still returns 200 instead of 500ing or hanging.</li>
                <li><strong>Cross-process distributed tracing</strong> — one Jaeger trace spans the gateway and a completely separate analytics-consumer process reading the same event off a Redis Stream.</li>
                <li><strong>Load-tested at 1,000 concurrent users</strong>, with three real bottlenecks found and fixed from the test&apos;s own failure output.</li>
                <li><strong>Sub-second policy hot-reload with a correctness backstop</strong> — Pub/Sub propagation in ~0.1s, with a 10s cache TTL underneath as a safety net.</li>
              </ul>
            ),
          },
        ],
      },
      {
        id: 'architecture',
        label: 'Architecture',
        documentTitle: 'System Architecture',
        documentDescription: 'The technology stack and the event-driven design behind the gateway.',
        sections: [
          {
            id: 'technology-stack',
            title: 'Technology Stack',
            content: (
              <div className="overflow-x-auto mt-4">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr>
                      <th className="p-4 border-b border-[var(--card-border)] font-semibold">Layer</th>
                      <th className="p-4 border-b border-[var(--card-border)] font-semibold">Technology</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td className="p-4 border-b border-[var(--card-border)]">Backend</td><td className="p-4 border-b border-[var(--card-border)] text-[var(--text-secondary)]">Python, FastAPI (async), Redis (Lua scripting, Streams, Pub/Sub)</td></tr>
                    <tr><td className="p-4 border-b border-[var(--card-border)]">Database</td><td className="p-4 border-b border-[var(--card-border)] text-[var(--text-secondary)]">PostgreSQL (Neon, serverless) + TimescaleDB hypertables; Row-Level Security with two distinct DB roles</td></tr>
                    <tr><td className="p-4 border-b border-[var(--card-border)]">Frontend</td><td className="p-4 border-b border-[var(--card-border)] text-[var(--text-secondary)]">Next.js (App Router, TypeScript, Tailwind), Recharts, native browser WebSocket</td></tr>
                    <tr><td className="p-4 border-b border-[var(--card-border)]">Auth</td><td className="p-4 border-b border-[var(--card-border)] text-[var(--text-secondary)]">Per-tenant API keys, SHA-256 hashed with indexed lookup</td></tr>
                    <tr><td className="p-4 border-b border-[var(--card-border)]">Infra (prepared, not provisioned)</td><td className="p-4 border-b border-[var(--card-border)] text-[var(--text-secondary)]">Docker Compose; target: always-free VM + Neon + Vercel + Caddy + GHCR</td></tr>
                    <tr><td className="p-4 border-b border-[var(--card-border)]">CI/CD</td><td className="p-4 border-b border-[var(--card-border)] text-[var(--text-secondary)]">GitHub Actions — builds/publishes images to GHCR</td></tr>
                    <tr><td className="p-4 border-b border-[var(--card-border)]">Observability</td><td className="p-4 border-b border-[var(--card-border)] text-[var(--text-secondary)]">Prometheus (cardinality-disciplined), Grafana, Jaeger, structlog with contextvars</td></tr>
                    <tr><td className="p-4 border-b border-[var(--card-border)]">Testing</td><td className="p-4 border-b border-[var(--card-border)] text-[var(--text-secondary)]">pytest, Playwright (black-box E2E incl. real-browser WebSocket), Locust, custom chaos scripts</td></tr>
                  </tbody>
                </table>
              </div>
            ),
          },
          {
            id: 'event-driven-fanout',
            title: 'Event-Driven Fan-Out',
            content: (
              <p>
                The gateway writes every proxied request as one event to a Redis Stream, consumed independently by two consumer groups with zero producer coupling: an analytics consumer (at-least-once, idempotent upsert into TimescaleDB so replay-on-crash produces duplicates, never losses) and an alert consumer (two-tier detection, deduplicated Alertmanager-style so a 50-probe attack burst collapses to one alert). Client IPs are salted-hashed at the point of origin so no raw IP ever leaves the edge. The alert consumer runs single-replica by design — its rate baseline is only correct if one process sees the whole stream — while the analytics consumer scales horizontally since its counting is idempotent.
              </p>
            ),
          },
        ],
      },
      {
        id: 'challenges',
        label: 'Challenges & Fixes',
        documentTitle: 'Problems Found, and How They Were Solved',
        documentDescription: 'The source implementation blueprint\'s own pseudocode had real bugs — every one below was found by running the system, not by reading the code and assuming it worked.',
        sections: [
          {
            id: 'problem-solution-table',
            title: 'Problem → Solution',
            content: (
              <div className="overflow-x-auto mt-4">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr>
                      <th className="p-4 border-b border-[var(--card-border)] font-semibold">Problem</th>
                      <th className="p-4 border-b border-[var(--card-border)] font-semibold">Solution</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-4 border-b border-[var(--card-border)]">Naive rate limiters allow a 2x burst at window boundaries, or race under concurrency.</td>
                      <td className="p-4 border-b border-[var(--card-border)] text-[var(--text-secondary)]">Sliding-window log on a Redis Sorted Set; the whole check+write sequence runs as one atomic Lua script.</td>
                    </tr>
                    <tr>
                      <td className="p-4 border-b border-[var(--card-border)]">An unconditional DB dependency serialized requests under concurrency, even on cache hits.</td>
                      <td className="p-4 border-b border-[var(--card-border)] text-[var(--text-secondary)]">Removed the blanket FastAPI Depends(); only open a DB session inside the actual cache-miss branch.</td>
                    </tr>
                    <tr>
                      <td className="p-4 border-b border-[var(--card-border)]">Killing Redis live surfaced 30+ second hangs and a uvloop/DNS interaction bug poisoning unrelated lookups.</td>
                      <td className="p-4 border-b border-[var(--card-border)] text-[var(--text-secondary)]">Explicit 0.2s socket timeouts everywhere; switched to --loop asyncio instead of uvloop (a documented throughput-for-correctness trade).</td>
                    </tr>
                    <tr>
                      <td className="p-4 border-b border-[var(--card-border)]">TimescaleDB continuous aggregates are incompatible with Row-Level Security.</td>
                      <td className="p-4 border-b border-[var(--card-border)] text-[var(--text-secondary)]">Replaced the continuous aggregate with a plain RLS-protected table, populated by a periodic idempotent upsert from a trusted worker role.</td>
                    </tr>
                    <tr>
                      <td className="p-4 border-b border-[var(--card-border)]">Random-consumer-name crash recovery left messages permanently stuck.</td>
                      <td className="p-4 border-b border-[var(--card-border)] text-[var(--text-secondary)]">Stable per-process consumer name so a restart drains its own pending entries instantly; XAUTOCLAIM kept only as a backstop.</td>
                    </tr>
                    <tr>
                      <td className="p-4 border-b border-[var(--card-border)]">The admin policy-update endpoint had no tenant scoping — a cross-tenant IDOR.</td>
                      <td className="p-4 border-b border-[var(--card-border)] text-[var(--text-secondary)]">Scoped the update and its not-found fallback by tenant_id, returning a plain 404 rather than leaking that another tenant&apos;s record exists.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ),
          },
        ],
      },
      {
        id: 'methodology',
        label: 'Methodology',
        documentTitle: 'Engineering Process, Not Just a Feature List',
        documentDescription: 'Why the debugging methodology behind ShieldStream is arguably the most portfolio-relevant part of the repo.',
        sections: [
          {
            id: 'the-decisions-log',
            title: 'A Real-Time Architectural Decision Log',
            content: (
              <>
                <p>
                  ShieldStream was built end-to-end from a set of structured implementation guides — a 12-week/phase blueprint. The interesting part isn&apos;t following the plan, it&apos;s everywhere the plan was wrong and had to be caught and fixed: a broken RLS setup that would have silently allowed cross-tenant data leakage, a rate-limiter middleware ordering bug that would crash on the first request, a cache-invalidation function reconstructing a Redis key that never existed, a cross-tenant IDOR in the admin policy-update endpoint, and an alert-consumer worker script that was non-runnable pseudocode.
                </p>
                <p>
                  Every one of these was found by actually running the system under load or by deliberately killing dependencies mid-traffic — not by reading the code and assuming it worked. Every fix, alternative considered, and trade-off accepted is logged in a running architectural decision record (<code>DECISIONS.md</code>, ~400 lines) as it happened, not written up after the fact. It&apos;s evidence of a debugging methodology — reproduce, isolate, fix, verify live, repeat — rather than just a feature list.
                </p>
              </>
            ),
          },
          {
            id: 'real-artifacts',
            title: 'Real Artifacts, Not Just Claims',
            content: (
              <p>
                The load-test results are committed in-repo as a static HTML report rather than quoted as a bare number, and the decision log is linked directly below rather than paraphrased — both are meant to be checked, not taken on faith.
              </p>
            ),
          },
        ],
      },
    ],
  },
};
