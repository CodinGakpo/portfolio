// Per-project metadata for the documentation pages.
// The documents themselves live as markdown in content/projects/<id>/ and are
// loaded by app/lib/docs.ts — this file only carries what wraps them.

export interface ExternalLink {
  label: string;
  url: string;
}

export interface DocVersion {
  id: string;
  label: string;
  description: string;
}

export interface ProjectDocMeta {
  id: string;
  title: string;
  tagline: string;
  description: string;
  /** 1–10, rendered as the Diff / Learn pills in the header card. */
  difficulty: number;
  learning: number;
  liveUrl?: string;
  githubUrl?: string;
  externalLinks?: ExternalLink[];
  notice?: { text: string; links?: ExternalLink[] };
  versions: DocVersion[];
}

export const projectDocsMeta: Record<string, ProjectDocMeta> = {
  'jan-saathi': {
    id: 'jan-saathi',
    title: 'Jan Saathi',
    tagline: 'AI-Routed Civic Complaint Pipeline with No Human Dispatcher',
    description:
      'Four services over one Postgres, where AI clusters civic reports and routes them to the right supervisor with no human dispatcher in the middle.',
    difficulty: 9,
    learning: 9,
    liveUrl: 'https://jansaathi.co.in',
    githubUrl: 'https://github.com/dibyajyoti-chakrabarti/jan-saathi',
    notice: {
      text: 'Jan Saathi is the successor to ReportMitra, rebuilt as four services around AI routing. The staging environment is live on AWS.',
      links: [
        { label: 'jansaathi.co.in', url: 'https://jansaathi.co.in' },
        { label: 'console.jansaathi.co.in', url: 'https://console.jansaathi.co.in' },
      ],
    },
    versions: [
      {
        id: 'staging',
        label: 'Staging · 4-Service Platform',
        description:
          'Evolved from a single-service civic reporting app into a 4-service platform — 2 Flutter apps (JanSaathi for citizens, JanKarta for supervisors and field workers) + 2 React websites (admin console, public info site) — live on real AWS infrastructure and real domains in staging.',
      },
    ],
  },

  keyhole: {
    id: 'keyhole',
    title: 'KeyHole',
    tagline: 'Confidential Code Execution with a Bandwidth-Bounded, Attested Exit',
    description:
      'Runs untrusted or AI-generated code against private data in your own AWS account and returns only a small, typed, cryptographically attested answer — the data stays in because the exit is a few bits wide, not because a filter is watching it.',
    difficulty: 9,
    learning: 9,
    githubUrl: 'https://github.com/CodinGakpo/KeyHole',
    notice: {
      text: 'KeyHole is a self-hosted tool with no public URL by design — it deploys into your own AWS account with one terraform apply. Verified end to end on real AWS, then torn down to keep idle cost near $0.',
    },
    externalLinks: [
      { label: 'README + architecture diagram', url: 'https://github.com/CodinGakpo/KeyHole/blob/HEAD/README.md' },
      { label: 'SECURITY.md', url: 'https://github.com/CodinGakpo/KeyHole/blob/HEAD/SECURITY.md' },
      { label: 'Future Scope', url: 'https://github.com/CodinGakpo/KeyHole/blob/HEAD/docs/FUTURE-SCOPE.md' },
    ],
    versions: [
      {
        id: 'm0-m9',
        label: 'Milestones M0–M9',
        description:
          'Feature-complete for its planned base scope — 19 test files, 90+ individual tests passing, verified end-to-end on real AWS infrastructure (Fargate, Lambda, KMS, DynamoDB), then torn down via terraform destroy to keep idle cost near $0.',
      },
    ],
  },

  drdeepti: {
    id: 'drdeepti',
    title: 'DrDeepti',
    tagline: 'Appointment Platform + WhatsApp Chatbot for Adarsh ENT Clinic',
    description:
      'A production-grade ENT clinic platform — a web booking system for self-service slot management, extended by a serverless WhatsApp chatbot that captures patient leads directly in-chat.',
    difficulty: 6,
    learning: 6,
    liveUrl: 'https://drdeeptientdelhi.in',
    githubUrl: 'https://github.com/CodinGakpo/DrDeeptiEnt',
    versions: [
      {
        id: 'v1-1',
        label: 'V1.1',
        description:
          'Web platform live at drdeeptientdelhi.in · WhatsApp bot deployed on AWS Lambda via Meta Cloud API.',
      },
    ],
  },

  shieldstream: {
    id: 'shieldstream',
    title: 'ShieldStream',
    tagline: 'Distributed API Security Gateway with Real-Time Threat Detection',
    description:
      'A reverse proxy with atomic Redis-backed sliding-window rate limiting, two-tier real-time threat detection, and a live WebSocket operator dashboard — built to protect an upstream API from abuse without adding meaningful latency.',
    difficulty: 8,
    learning: 8,
    githubUrl: 'https://github.com/CodinGakpo/SheildStream',
    externalLinks: [
      { label: 'DECISIONS.md (engineering log)', url: 'https://github.com/CodinGakpo/SheildStream/blob/HEAD/DECISIONS.md' },
      { label: 'Load test report', url: 'https://github.com/CodinGakpo/SheildStream/blob/HEAD/loadtest-results/report.html' },
    ],
    versions: [
      {
        id: '12-phase',
        label: '12-Phase Blueprint',
        description:
          'All 12 planned phases implemented and live-verified locally / in Docker Compose — proxy, auth, rate limiting, threat detection, dashboard, observability, load & chaos testing, CI/CD. Deployment runbook written but not yet executed against production infrastructure.',
      },
    ],
  },

  documiner: {
    id: 'documiner',
    title: 'DocuMiner',
    tagline: 'AI Enterprise Document Security Analyzer',
    description:
      'Agentic zero-shot AI pipeline that analyzes enterprise documents for security compliance violations.',
    difficulty: 7,
    learning: 7,
    githubUrl: 'https://github.com/CodinGakpo/DocuMiner',
    versions: [
      {
        id: 'v2',
        label: 'V2',
        description:
          'Multi-stage pipeline update integrating Tesseract OCR, OpenCV preprocessing, and LangChain map-reduce.',
      },
    ],
  },
};
