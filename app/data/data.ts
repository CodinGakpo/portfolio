// ─── Central Data File ─────────────────────────────────────────────────────
// Source of truth for all portfolio content. No hardcoded content in components.

export const siteConfig = {
  name: 'Adidev Anand',
  title: 'Adidev Anand - Backend Engineer & CS Student',
  description:
    'Final-year Information Security student at VIT Vellore. Backend systems, cloud infrastructure, and AI-integrated applications. 2x hackathon winner. AWS certified.',
  url: 'https://adidev.dev',
  ogImage: '/opengraph-image.png',
  twitterHandle: '@adidev',
};

// ─── Hero ────────────────────────────────────────────────────────────────────

export const heroData = {
  name: 'Adidev Anand',
  taglines: [
    'Backend Engineer. Cloud Architect. Security Thinker.',
    'Built production AWS stacks with CI/CD and IAM best practices.',
    'B.Tech Information Security · VIT Vellore · 9.13 CGPA',
  ],
  subTagline:
    'Final-year CS student building production-ready backend systems across AWS, AI workflows, and security-first architecture.',
  cta: {
    primary: { label: 'View Projects', href: '#projects' },
    secondary: { label: 'View Resume', href: '#resume' },
  },
};

// ─── About ───────────────────────────────────────────────────────────────────

export const aboutData = {
  bio: "I am a final-year Information Security student at VIT Vellore (9.13 CGPA) focused on backend and cloud engineering. I have shipped full-stack systems with real users, built asynchronous AI pipelines, and worked on production deployments with CI/CD and secure IAM practices.",
  stats: [
    { value: '9.13', label: 'CGPA' },
    { value: '2x', label: 'Hackathon Winner' },
    { value: '1', label: 'Patent Filed' },
  ],
  quote: 'Reliable systems. Measurable impact. Fast learning.',
};

// ─── Skills ──────────────────────────────────────────────────────────────────

export interface Skill {
  name: string;
  icon?: string;
}

export interface SkillCategory {
  title: string;
  icon: string;
  skills: Skill[];
}

export const skillsData: SkillCategory[] = [
  {
    title: 'Languages',
    icon: '</>',
    skills: [
      { name: 'Python' },
      { name: 'JavaScript' },
      { name: 'SQL' },
      { name: 'Bash' },
      { name: 'Solidity' },
    ],
  },
  {
    title: 'Backend',
    icon: '⚙',
    skills: [
      { name: 'Django' },
      { name: 'FastAPI' },
      { name: 'Node.js / Express' },
      { name: 'REST APIs' },
      { name: 'Celery + Redis' },
      { name: 'JWT / OAuth2' },
    ],
  },
  {
    title: 'Frontend',
    icon: '◧',
    skills: [
      { name: 'React.js' },
      { name: 'Next.js' },
      { name: 'Vite' },
      { name: 'Tailwind CSS' },
      { name: 'HTML5 / CSS3' },
    ],
  },
  {
    title: 'Cloud & DevOps',
    icon: '☁',
    skills: [
      { name: 'AWS EC2' },
      { name: 'AWS S3' },
      { name: 'AWS RDS' },
      { name: 'CloudFront + Route53' },
      { name: 'GitHub Actions CI/CD' },
      { name: 'Docker' },
      { name: 'Nginx + Gunicorn' },
      { name: 'Linux (Fedora / Ubuntu)' },
    ],
  },
  {
    title: 'Databases',
    icon: '⛁',
    skills: [
      { name: 'MySQL / AWS RDS' },
      { name: 'PostgreSQL / NeonDB' },
      { name: 'MongoDB' },
      { name: 'Redis' },
    ],
  },
  {
    title: 'AI / ML',
    icon: '⬡',
    skills: [
      { name: 'LangChain' },
      { name: 'OpenAI API' },
      { name: 'Keras / TensorFlow' },
      { name: 'LSTM / CNN' },
      { name: 'spaCy' },
      { name: 'Isolation Forest' },
    ],
  },
  {
    title: 'Security',
    icon: '⛨',
    skills: [
      { name: 'Cryptography (MD5, SHA-512, HMAC, TLS, IPSec)' },
      { name: 'PKI / X.509 / Kerberos' },
      { name: 'Firewalls / IDS' },
      { name: 'Zero-shot agentic AI pipelines' },
    ],
  },
];

// ─── Projects ────────────────────────────────────────────────────────────────

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
      'Django',
      'React + Vite',
      'AWS',
      'Celery/Redis',
      'CNN (Keras)',
      'Blockchain',
      'Leaflet',
      'GitHub Actions',
    ],
    standout:
      'Production deployment with secure IAM, HTTPS termination, and zero-downtime CI/CD.',
  },
  {
    id: 'documiner',
    title: 'DocuMiner',
    subtitle: 'AI Enterprise Document Security Analyzer',
    oneLiner:
      'Agentic zero-shot AI pipeline that analyzes enterprise documents (PDF, Excel, PPT, images) for security compliance violations.',
    statusBadge: 'Patent Filed',
    statusTone: 'patent',
    githubUrl: 'https://github.com/CodinGakpo/DocuMiner',
    highlights: [
      'Automated PII detection, pseudonymization, and IAM policy extraction using LangChain + OpenAI API',
      'Added Tesseract OCR for image-based content extraction across multiple document formats through a unified REST API',
      'Submitted for VIT patent disclosure (IPR-B format) as an undergraduate-led research contribution',
    ],
    techStack: [
      'FastAPI',
      'LangChain',
      'OpenAI API',
      'spaCy',
      'Tesseract OCR',
      'Python',
    ],
    standout: 'Patent-filed as an undergrad with a true multi-stage AI pipeline.',
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
    title: 'Patent Disclosure Filed — DocuMiner (VIT IPR-B)',
    badgeColor: 'blue',
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
    'Open to backend engineering internships and full-time software roles. Available for interviews and immediate projects.',
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
  { label: 'About', href: '#about' },
  { label: 'Skills', href: '#skills' },
  { label: 'Projects', href: '#projects' },
  { label: 'Achievements', href: '#achievements' },
  { label: 'Resume', href: '#resume' },
  { label: 'Contact', href: '#contact' },
];
