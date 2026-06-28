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
  statusTone?: 'live' | 'patent';
  liveUrl?: string;
  githubUrl: string;
  highlights: string[];
  techStack: string[];
  standout: string;
  timeline: TimelineEntry[];
}

export const projectsData: Project[] = [
  {
    id: 'reportmitra',
    title: 'ReportMitra',
    subtitle: 'AI Civic Issue Reporting Platform',
    oneLiner:
      'Citizens report civic issues while a CNN model classifies and routes cases through an asynchronous pipeline on AWS.',
    statusBadge: 'Live · Production',
    statusTone: 'live',
    liveUrl: '#',
    githubUrl: 'https://github.com/CodinGakpo',
    highlights: [
      'Designed and deployed full AWS production stack from scratch: EC2 + RDS + S3 + CloudFront + Route53 + ACM',
      'Eliminated stored credentials using IAM OIDC-based auth in GitHub Actions with short-lived federated tokens',
      'CNN model classifies issue departments and routes tasks via Celery/Redis with blockchain audit trail on Ethereum Sepolia',
    ],
    techStack: [
      'Django', 'React + Vite', 'AWS', 'Celery/Redis',
      'CNN (Keras)', 'Blockchain', 'Leaflet', 'GitHub Actions',
    ],
    standout:
      'Production deployment with secure IAM, HTTPS termination, and zero-downtime CI/CD.',
    timeline: [
      {
        date: 'Phase 1',
        title: 'Initial Architecture & Setup',
        description: 'Designed the core monolithic architecture and set up AWS VPC with public and private subnets.',
        problemFaced: 'Managing secure database credentials and access without hardcoding.',
        solution: 'Implemented IAM roles and Secrets Manager to inject credentials dynamically into the EC2 instances.'
      },
      {
        date: 'Phase 2',
        title: 'AI Integration & Asynchronous Tasks',
        description: 'Integrated the Keras CNN model for issue classification.',
        problemFaced: 'Model inference was blocking the main thread, causing API timeouts for users.',
        solution: 'Offloaded model inference to a Celery worker pool backed by Redis, returning a task ID to the client for polling.'
      }
    ]
  },
  {
    id: 'documiner',
    title: 'DocuMiner',
    subtitle: 'AI Enterprise Document Security Analyzer',
    oneLiner:
      'Agentic zero-shot AI pipeline that analyzes enterprise documents (PDF, Excel, PPT, images) for security compliance violations.',
    githubUrl: 'https://github.com/CodinGakpo/DocuMiner',
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
  {
    year: '2026',
    title: 'Backend Engineering Intern — Aquevix Solutions',
    badgeColor: 'gray',
  },
  {
    year: '2023',
    title: 'Joined VIT Vellore — B.Tech Information Security',
    badgeColor: 'purple',
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
    linkedin: 'https://linkedin.com/in/adidev-anand',
  },
  cta: {
    label: 'Email Me',
    href: 'mailto:anandadidev43@gmail.com',
  },
};

// ─── Navigation ──────────────────────────────────────────────────────────────

export const navLinks = [
  { label: 'Achievements', href: '#achievements' },
  { label: 'About', href: '#about' },
  { label: 'Skills', href: '#skills' },
  { label: 'Projects', href: '#projects' },
  { label: 'Resume', href: '#resume' },
  { label: 'Contact', href: '#contact' },
];
