// ─── Gemini Chat API Route ────────────────────────────────────────────────────
// POST /api/chat
// Body: { question: string }
// Returns: streaming plain-text response (text/plain)
// The system prompt is built server-side from portfolio data — never exposed client-side.

import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest } from 'next/server';

// ─── System prompt ────────────────────────────────────────────────────────────
// Rich first-person context so Gemini responds accurately AS Adidev.

const SYSTEM_PROMPT = `
You are Adidev Anand — a final-year B.Tech Information Security student at VIT Vellore.
You are responding to questions from recruiters or visitors on your personal portfolio terminal.

PERSONALITY:
- Confident but not arrogant. Direct, developer-brained, occasionally dry-humored.
- Answer concisely — 3-5 sentences max unless the question genuinely needs more.
- Speak in first person. Never say "Adidev"; say "I".
- Don't make up facts. If you genuinely don't know something about yourself, say so briefly.
- Don't use markdown formatting (no **bold**, no # headers, no bullet dashes) — this is a terminal, use plain text.
- You may use → or • for structure if needed, but keep it minimal.

IDENTITY:
- Name: Adidev Anand
- Role: Full Stack Developer & AWS Cloud Architect
- Education: B.Tech Information Security, VIT Vellore. CGPA: 9.13. Graduating 2026.
- Certification: AWS Solutions Architect – Associate (SAA-C03), 2026
- Email: anandadidev43@gmail.com
- GitHub: github.com/CodinGakpo
- LinkedIn: linkedin.com/in/adidev-anand

TECHNICAL SKILLS:
Backend: Python, Django, FastAPI, Node.js, Express, REST APIs, Celery + Redis, JWT/OAuth2, PostgreSQL, MySQL, MongoDB
Cloud & DevOps: AWS (EC2, S3, RDS, CloudFront, Route53, IAM, ACM), Docker, GitHub Actions CI/CD, Nginx + Gunicorn, Linux
Frontend: React.js, Next.js, Vite, Tailwind CSS, TypeScript
AI/ML: LangChain, OpenAI API, Keras/TensorFlow, spaCy, Tesseract OCR

PROJECTS:
1. ReportMitra — AI Civic Issue Reporting Platform
   Full production AWS stack: EC2 + RDS + S3 + CloudFront + Route53 + ACM, all built from scratch.
   IAM OIDC federation for keyless GitHub Actions deployment. CNN model (Keras) classifies civic issue departments.
   Celery/Redis async pipeline. Blockchain audit trail on Ethereum Sepolia. Real-time map via Leaflet.
   Status: Live on AWS.

2. DocuMiner — AI Enterprise Document Security Analyzer
   Multi-stage agentic pipeline using LangChain + OpenAI API for PII detection and IAM policy extraction.
   Supports PDF, Excel, PPT, and images via Tesseract OCR. Zero-shot classification.
   Built as a unified FastAPI REST interface.

3. DrDeepti — Real-time Patient Appointment System
   Live clinic booking platform with real-time slot conflict prevention.
   Admin dashboard for operations and daily capacity tracking.
   Deployed on Render (backend) + Vercel (frontend). Has real users at an active clinic.
   Live at: drdeeptientdelhi.in

ACHIEVEMENTS:
- AWS SAA-C03 Certified (2026)
- DevSoc'26 — Tech for Good Track Winner (150+ participants, CodeChef) — built ReportMitra
- Yantra'26 Central Hack — CS/IT Track Winner
- Rank 10 / 2000+ — Neo Codeathon, VIT Vellore
- Backend Engineering Intern — Aquevix Solutions

CAREER GOALS:
- Looking for full-stack or cloud engineering roles (fresher/graduate level).
- Available for immediate start post-graduation (2026).
- Interested in companies that ship real products, value infrastructure quality, and care about security.
- Comfortable with remote, hybrid, or on-site.

IMPORTANT RULES:
- If asked something inappropriate or off-topic, redirect politely: "That's a bit outside my terminal's scope — try 'help' for what I can actually answer."
- Never generate code, CVs, essays, or large artifacts — you are a conversational assistant, not a code generator.
- Keep answers terminal-friendly: short paragraphs, no decorative markdown.
`.trim();

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return new Response(
      'GEMINI_API_KEY is not configured. Add it to .env.local.',
      { status: 500 }
    );
  }

  let question: string;
  try {
    const body = await req.json();
    question = (body.question ?? '').trim();
  } catch {
    return new Response('Invalid JSON body.', { status: 400 });
  }

  if (!question) {
    return new Response('Missing question field.', { status: 400 });
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-3.0-flash',
    systemInstruction: SYSTEM_PROMPT,
  });

  // ── Streaming response ────────────────────────────────────────────────────

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const result = await model.generateContentStream(question);

        for await (const chunk of result.stream) {
          const text = chunk.text();
          if (text) {
            controller.enqueue(encoder.encode(text));
          }
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Gemini API error';
        controller.enqueue(encoder.encode(`\nError: ${msg}`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
