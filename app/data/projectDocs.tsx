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
    subtitle: 'Real-time Patient Appointment System',
    oneLiner: 'A production clinic booking platform with real-time slot conflict prevention and a comprehensive admin dashboard.',
    version: 'V1',
    versionSummary: 'Production release covering the booking flow, concurrency control backend, and staff operations dashboard.',
    liveUrl: 'https://drdeeptientdelhi.in',
    githubUrl: '#',
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
              <div className="overflow-x-auto">
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
              <div className="overflow-x-auto">
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
    ],
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
