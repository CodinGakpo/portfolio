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

export interface ProjectDoc {
  id: string;
  title: string;
  subtitle: string;
  oneLiner: string;
  version: string;
  versionSummary: string;
  liveUrl?: string;
  githubUrl?: string;
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
  reportmitra: {
    id: 'reportmitra',
    title: 'ReportMitra',
    subtitle: 'AI Civic Issue Reporting Platform',
    oneLiner: 'Citizens report civic issues while a CNN model classifies and routes cases through an asynchronous pipeline on AWS.',
    version: 'V1',
    versionSummary: 'Initial deployment covering AWS infrastructure, basic issue reporting, and Celery task queues.',
    liveUrl: '#',
    githubUrl: 'https://github.com/CodinGakpo',
    tabs: [
      {
        id: 'overview',
        label: 'Overview',
        documentTitle: 'Coming Soon',
        documentDescription: 'Detailed documentation for ReportMitra is being written.',
        sections: [
          {
            id: 'placeholder',
            title: 'Documentation In Progress',
            content: <p>Check back later for the full architectural breakdown of ReportMitra.</p>,
          }
        ]
      }
    ]
  }
};
