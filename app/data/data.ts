// ─── Central Data File ─────────────────────────────────────────────────────
// Source of truth for all portfolio content. No hardcoded content in components.

export const siteConfig = {
  name: 'Adidev Anand',
  title: 'Adidev Anand — Full Stack Developer & AWS Cloud Engineer',
  description:
    'Final-year Information Security student at VIT Vellore. Full-stack systems, AWS cloud architecture, and production-grade applications. 2x hackathon winner. AWS SAA-C03 certified.',
  url: 'https://adidev.dev',
  ogImage: '/opengraph-image.png',
  twitterHandle: '@adidev',
};

// ─── Hero ────────────────────────────────────────────────────────────────────

export const heroData = {
  name: 'Adidev Anand',
  taglines: [
    'Full Stack Developer. AWS Cloud Architect.',
    'Building production systems with CI/CD, scalable architecture, and security-first design.',
    'B.Tech Information Security · VIT Vellore · 9.13 CGPA',
  ],
  subTagline:
    'Final-year CS student shipping production-ready full-stack systems across AWS, modern frameworks, and security-first architecture.',
  cta: {
    primary: { label: 'View Projects', href: '#projects' },
    secondary: { label: 'View Resume', href: '#resume' },
  },
};

// ─── About ───────────────────────────────────────────────────────────────────

export const aboutData = {
  bio: "I am a final-year Information Security student at VIT Vellore (9.13 CGPA) specializing in full-stack development and AWS cloud architecture. I have shipped production systems with real users, built scalable APIs with async processing pipelines, and deployed secure cloud infrastructure with CI/CD automation.",
  stats: [
    { value: '9.13', label: 'CGPA' },
    { value: '2x', label: 'Hackathon Winner' },
    { value: 'SAA-C03', label: 'AWS Certified' },
  ],
  quote: 'Build to ship. Ship to scale.',
};

// ─── Skills ──────────────────────────────────────────────────────────────────

export const techMarqueeItems: string[] = [
  'Python', 'JavaScript', 'TypeScript', 'SQL', 'Bash',
  'Django', 'FastAPI', 'Node.js', 'Express', 'REST APIs',
  'React.js', 'Next.js', 'Vite', 'Tailwind CSS', 'HTML5 / CSS3',
  'AWS EC2', 'AWS S3', 'AWS RDS', 'CloudFront', 'Route53',
  'Docker', 'GitHub Actions', 'Nginx', 'Linux',
  'PostgreSQL', 'MySQL', 'MongoDB', 'Redis',
  'Celery', 'JWT / OAuth2', 'LangChain', 'OpenAI API',
  'TensorFlow', 'spaCy', 'Keras',
];

export interface ExpertiseDomain {
  title: string;
  subtitle: string;
  description: string;
  accentColor: string;
  glowColor: string;
  technologies: string[];
}

export const expertiseDomains: ExpertiseDomain[] = [
  {
    title: 'Backend Engineering',
    subtitle: 'Core Strength',
    description:
      'Designing and deploying production APIs with async processing, task queues, and secure authentication flows.',
    accentColor: '#10b981',
    glowColor: 'rgba(16, 185, 129, 0.15)',
    technologies: [
      'Python', 'Django', 'FastAPI', 'Node.js / Express',
      'REST APIs', 'Celery + Redis', 'JWT / OAuth2',
      'PostgreSQL', 'MySQL', 'MongoDB',
    ],
  },
  {
    title: 'Cloud & DevOps',
    subtitle: 'AWS SAA-C03 Certified',
    description:
      'Production AWS architecture with CI/CD pipelines, IAM best practices, and zero-downtime deployments.',
    accentColor: '#f59e0b',
    glowColor: 'rgba(245, 158, 11, 0.15)',
    technologies: [
      'AWS EC2', 'AWS S3', 'AWS RDS', 'CloudFront + Route53',
      'Docker', 'GitHub Actions CI/CD', 'Nginx + Gunicorn',
      'Linux (Fedora / Ubuntu)', 'IAM + OIDC Federation',
    ],
  },
  {
    title: 'Frontend & AI',
    subtitle: 'Full Stack Reach',
    description:
      'Building responsive interfaces and integrating AI/ML pipelines for intelligent, user-facing features.',
    accentColor: '#8b5cf6',
    glowColor: 'rgba(139, 92, 246, 0.15)',
    technologies: [
      'React.js', 'Next.js', 'Vite', 'Tailwind CSS',
      'LangChain', 'OpenAI API', 'Keras / TensorFlow', 'spaCy',
    ],
  },
];

export const certifications = [
  {
    name: 'AWS Solutions Architect – Associate',
    code: 'SAA-C03',
    issuer: 'Amazon Web Services',
    year: '2026',
  },
];

// ─── Projects ────────────────────────────────────────────────────────────────

export interface TimelineEntry {
  date: string;
  title: string;
  description: string;
  problemFaced: string;
  solution: string;
}

export interface Project {
  id: string;
  title: string;
  subtitle: string;
  oneLiner: string;
  statusBadge?: string;
  statusTone?: 'live' | 'patent' | 'oss';
  liveUrl?: string;
  githubUrl: string;
  image?: string;
  highlights: string[];
  techStack: string[];
  standout: string;
  timeline: TimelineEntry[];
}

export const projectsData: Project[] = [
  {
    id: 'jan-saathi',
    title: 'Jan Saathi',
    subtitle: 'AI-Routed Civic Complaint Platform — 2 Apps + 2 Websites',
    oneLiner:
      'A citizen files a report, AI clusters it with nearby same-category issues and auto-routes it to the right supervisor, a field worker resolves it with photo proof, and the citizen gets a small wallet reward — no human dispatcher in the loop.',
    statusBadge: 'Staging · Live Domains',
    statusTone: 'live',
    liveUrl: 'https://jansaathi.co.in',
    githubUrl: '#',
    image: '/projects/jan-saathi.png',
    highlights: [
      'AI clusters same-category reports within 15m via haversine geo-matching and auto-routes each cluster to the least-workload supervisor covering that department and ward — zero human dispatcher',
      'Self-healing SLA watchdog: unresolved clusters auto-escalate at 72h, un-acknowledged clusters auto-reroute to the next-best supervisor at 48h',
      'Real Aadhaar-backed citizen identity via Setu/DigiLocker alongside phone-OTP, with the Flutter app gracefully degrading to status-polling where redirect-based OAuth doesn\'t work on mobile',
      'Bedrock-driven multi-agent AI pipeline (image validation, image/text tagging, synthesis) that never blocks the citizen-facing flow — every failure path falls back to a safe "needs human attention" state',
      'Four independently-deployed services — 2 Flutter apps, 2 React sites — coordinate purely through shared Postgres tables, with no message broker between them',
    ],
    techStack: ['Go (Gin)', 'Flutter', 'React + Vite', 'AWS RDS Postgres', 'AWS Bedrock (Nova Pro)', 'Terraform', 'AWS Lambda'],
    standout:
      'Built around 225 real BBMP (Bengaluru) civic ward polygons for actual point-in-polygon routing — real administrative geography, not a synthetic demo.',
    timeline: [
      {
        date: 'Platform evolution',
        title: 'From per-report tracking to per-cluster state',
        description: 'Redesigned the core lifecycle model as the platform scaled from one app into four coordinated services.',
        problemFaced: 'Multiple citizens reporting the same civic issue (e.g. one pothole) were creating independent tickets routed to different supervisors.',
        solution: 'Redesigned the state machine so the AI-formed cluster, not the individual report, is the unit of work — every report in a cluster mirrors its cluster\'s single status.',
      },
      {
        date: 'Platform evolution',
        title: 'Adding JanKarta as a dedicated fourth service',
        description: 'The supervisor/field-worker workflow was expanded into its own branded app and backend, distinct from citizen-facing JanSaathi and the admin console.',
        problemFaced: 'The operational (supervisor/field-worker) side needed its own dedicated mobile experience rather than living inside a bigger admin surface.',
        solution: 'Built JanKarta as a fourth independently-deployed Flutter service with its own Go backend, coordinating with the other three purely through shared Postgres tables.',
      },
    ],
  },
  {
    id: 'mark-1',
    title: 'Mark-1',
    subtitle: 'Confidential Compute Sandbox for Untrusted / AI-Generated Code',
    oneLiner:
      'Lets untrusted or AI-generated code run against private data in the cloud and return only a small, cryptographically-attested answer — bounding the exfiltration channel to a few bits instead of trying to detect leaks after the fact.',
    statusBadge: 'Feature-Complete · Self-Hosted',
    statusTone: 'oss',
    githubUrl: 'https://github.com/CodinGakpo/KeyHole',
    image: '/projects/mark-1.png',
    highlights: [
      'Zero-egress AWS Fargate sandbox with a schema-bounded exit gate and a cumulative per-principal bit budget, so bulk AND slow-drip exfiltration are both structurally capped, not just filtered',
      'KMS-backed signed attestations (ed25519 locally, ECDSA/KMS in the cloud) that prove exactly what ran, on what data, with zero egress — independently verifiable, not just logged',
      'Multi-party "clean room" mode: data-owner and code-provider are separate principals with scoped access grants; unauthorized access is refused before any data is ever loaded',
      'Proven by a hostile test suite that actively tries to defeat the guarantee (encoding stolen data inside a conforming schema, fork bombs, drip exfiltration) — all verified end-to-end on real AWS, not mocked',
    ],
    techStack: ['Python', 'AWS Fargate', 'Lambda + API Gateway', 'KMS (ed25519/ECDSA)', 'DynamoDB', 'Terraform', 'MCP Server'],
    standout:
      'Grounded in Lampson\'s 1973 confinement problem: it never claims "zero leak," it claims a disclosed, quantified upper bound on leakage — a claim you can actually verify rather than trust.',
    timeline: [
      {
        date: 'Design correction',
        title: 'Egress containment: sidecar vs. network layer',
        description: 'Initially assumed an in-task sidecar proxy could enforce network isolation for the sandbox container.',
        problemFaced: 'AWS Fargate\'s awsvpc mode puts every container in a task on one shared network namespace, so a sidecar has no privileged position to intercept another container\'s traffic.',
        solution: 'Moved enforcement to the infrastructure boundary instead — private subnet, no NAT, security group with no 0.0.0.0/0 route — which actually isolates egress rather than merely observing it.',
      },
      {
        date: 'Fargate hardening',
        title: 'Read-only root filesystem vs. writable work volume',
        description: 'The sandbox runs as a non-root user on a read-only root filesystem for hardening.',
        problemFaced: 'The empty mounted work volume the sandbox writes results to defaults to root-owned, so a non-root, read-only-root container can\'t write to it.',
        solution: 'Added an essential=false init container that runs as root via the ECS entryPoint field (not command, which overrides image CMD instead of ENTRYPOINT) to chown the volume before the sandbox container starts.',
      },
    ],
  },
  {
    id: 'drdeepti',
    title: 'DrDeepti',
    subtitle: 'Real-time Patient Appointment System',
    oneLiner:
      'Production clinic booking platform with real-time slot conflict prevention and an admin dashboard.',
    statusBadge: 'Live · Real Users',
    statusTone: 'live',
    liveUrl: 'https://drdeeptientdelhi.in',
    githubUrl: '#',
    image: '/projects/drdeepti.png',
    highlights: [
      'Implemented real-time appointment slot booking with conflict prevention and live availability display',
      'Built an admin dashboard for staff operations, patient records, and daily capacity tracking',
      'Handled production deployment across Render (backend) and Vercel (frontend)',
    ],
    techStack: ['Django', 'React', 'PostgreSQL', 'Render', 'Vercel'],
    standout: 'Used by an active clinic with real users and operational impact.',
    timeline: [
      {
        date: 'Phase 1',
        title: 'MVP Development',
        description: 'Developed the core booking flow and admin dashboard.',
        problemFaced: 'Double bookings occurred when two users clicked "book" simultaneously.',
        solution: 'Implemented database-level locking and optimistic concurrency control using Django transactions.'
      }
    ]
  },
  {
    id: 'shieldstream',
    title: 'ShieldStream',
    subtitle: 'Distributed API Security Gateway with Real-Time Threat Detection',
    oneLiner:
      'A reverse proxy with atomic Redis-backed sliding-window rate limiting, two-tier real-time threat detection, and a live WebSocket operator dashboard — built to protect an upstream API from abuse without adding meaningful latency.',
    statusBadge: 'Feature-Complete · Solo Project',
    statusTone: 'oss',
    githubUrl: 'https://github.com/CodinGakpo/SheildStream',
    image: '/projects/shieldstream.png',
    highlights: [
      'Atomic distributed rate limiting via a single Redis Lua script (check-then-act as one unit) — proven with 100 concurrent requests against a limit of 10, repeated 50x with zero flakiness',
      'Chaos-tested fail-open design: the Redis container is killed live under real traffic, and every request still returns 200 rather than 500ing or hanging',
      'Cross-process distributed tracing — one Jaeger trace spans the gateway and a completely separate analytics-consumer process reading the same event off a Redis Stream',
      'Load-tested at 1,000 concurrent users, with three real bottlenecks (connection pool, DB pool, container file-descriptor limit) found and fixed from the test\'s own failure output',
    ],
    techStack: ['FastAPI', 'Redis (Lua)', 'PostgreSQL + TimescaleDB', 'Next.js', 'Prometheus/Grafana/Jaeger', 'Docker Compose', 'Playwright/Locust'],
    standout:
      'Built from a structured implementation blueprint whose own pseudocode had real bugs — a cross-tenant IDOR, a broken RLS setup, a middleware ordering crash — each found by running the system under load and logged as it happened in a ~400-line architectural decision record.',
    timeline: [
      {
        date: 'Correctness under load',
        title: 'Hidden serialization from an unconditional DB dependency',
        description: 'FastAPI resolves every Depends() before the route body runs.',
        problemFaced: 'An unconditional DB dependency was acquiring a Postgres connection on every request even on a pure Redis cache hit, serializing requests under concurrency (2.6ms p50 at concurrency 1 → 47ms p50 at concurrency 20).',
        solution: 'Removed the blanket dependency and only opened a DB session inside the actual cache-miss branch.',
      },
      {
        date: 'Chaos testing',
        title: 'A uvloop/DNS interaction bug found only by killing Redis live',
        description: 'Killing the Redis container under real traffic (not mocking it) to verify the fail-open guarantee.',
        problemFaced: 'A timed-out Redis connection under uvloop poisoned the next unrelated async DNS lookup, hanging requests for the full timeout window instead of failing open.',
        solution: 'Added explicit 0.2s socket timeouts everywhere and switched to --loop asyncio instead of uvloop — a deliberate, documented throughput-for-correctness trade.',
      },
    ],
  },
  {
    id: 'documiner',
    title: 'DocuMiner',
    subtitle: 'AI Enterprise Document Security Analyzer',
    oneLiner:
      'Agentic zero-shot AI pipeline that analyzes enterprise documents (PDF, Excel, PPT, images) for security compliance violations.',
    githubUrl: 'https://github.com/CodinGakpo/DocuMiner',
    image: '/projects/documiner.png',
    highlights: [
      'Automated PII detection, pseudonymization, and IAM policy extraction using LangChain + OpenAI API',
      'Added Tesseract OCR for image-based content extraction across multiple document formats through a unified REST API',
      'Built a multi-stage agentic pipeline with zero-shot classification for document compliance analysis',
    ],
    techStack: [
      'FastAPI', 'LangChain', 'OpenAI API', 'spaCy', 'Tesseract OCR', 'Python',
    ],
    standout: 'True multi-stage AI pipeline with zero-shot classification and multi-format document processing.',
    timeline: [
      {
        date: 'Phase 1',
        title: 'Core Extraction Engine',
        description: 'Built the Tesseract OCR and PDF parsing utility for multi-format support.',
        problemFaced: 'Scanned PDFs were yielding garbage text due to poor image quality.',
        solution: 'Added an OpenCV preprocessing step (binarization, deskewing) before passing images to Tesseract.'
      },
      {
        date: 'Phase 2',
        title: 'Agentic Pipeline Integration',
        description: 'Integrated LangChain and OpenAI for compliance analysis.',
        problemFaced: 'Context window limits were exceeded on large enterprise documents.',
        solution: 'Implemented a map-reduce summarization strategy and chunking with overlap to maintain context.'
      }
    ]
  },
];

// ─── Achievements ────────────────────────────────────────────────────────────

export interface Achievement {
  year: string;
  title: string;
  badgeColor: string;
}

export const achievementsData: Achievement[] = [
  {
    year: '2026',
    title: 'AWS Solutions Architect Associate (SAA-C03) — Certified',
    badgeColor: 'amber',
  },
  {
    year: '2026',
    title: "DevSoc'26 — Tech for Good Track Winner (150+ participants, CodeChef)",
    badgeColor: 'gold',
  },
  {
    year: '2026',
    title: "Yantra'26 Central Hack — CS/IT Track Winner",
    badgeColor: 'gold',
  },
  {
    year: '2026',
    title: 'Rank 10 / 2000+ — Neo Codeathon, VIT Vellore',
    badgeColor: 'silver',
  },
];

// ─── Experience ──────────────────────────────────────────────────────────────

export interface ExperienceEntry {
  role: string;
  org: string;
  period: string;
  summary: string;
  highlights?: string[];
}

export const experienceData: ExperienceEntry[] = [
  {
    role: 'Software Development Intern',
    org: 'QNu Labs',
    period: 'Aug 2026 – Present',
    summary: 'Contributing to production software as part of the engineering team.',
  },
  {
    role: 'Backend Engineering Intern',
    org: 'Aquevix Solutions',
    period: '2024',
    summary: 'Backend engineering work on production systems and APIs.',
  },
];

// ─── Resume ──────────────────────────────────────────────────────────────────

export const resumeData = {
  heading: 'Resume',
  subtext:
    'Prefer a quick review? Open or download the latest resume directly from this page.',
  fileUrl: '/resume.pdf',
  fileName: 'Adidev-Anand-Resume.pdf',
};

// ─── Contact ─────────────────────────────────────────────────────────────────

export const contactData = {
  heading: "Let's build something.",
  subtext:
    'Open to full-stack and cloud engineering roles. AWS certified, graduation-ready, and available for immediate start.',
  links: {
    email: 'anandadidev43@gmail.com',
    github: 'https://github.com/CodinGakpo',
    linkedin: 'https://www.linkedin.com/in/adidevanand/',
  },
  cta: {
    label: 'Email Me',
    href: 'mailto:anandadidev43@gmail.com',
  },
};

// ─── Navigation ──────────────────────────────────────────────────────────────

export const navLinks = [
  { label: 'About', href: '#about' },
  { label: 'Skills', href: '#skills' },
  { label: 'Experience', href: '#experience' },
  { label: 'Achievements', href: '#achievements' },
  { label: 'Projects', href: '#projects' },
  { label: 'Resume', href: '#resume' },
  { label: 'Contact', href: '#contact' },
];
