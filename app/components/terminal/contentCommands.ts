// ─── Phase 2: Content Commands ────────────────────────────────────────────────
// Registered via registerCommands() — imported once from terminal/index.tsx
// All content sourced from data.ts — no hardcoded strings.

import {
  heroData,
  aboutData,
  projectsData,
  achievementsData,
  expertiseDomains,
  certifications,
  contactData,
  resumeData,
} from '../../data/data';

import { registerCommands, line, divider } from './commands';
import type { Command } from './types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const openUrl = (url: string) => {
  if (typeof window !== 'undefined') window.open(url, '_blank', 'noopener');
};

const scrollToSection = (hash: string, onClose?: () => void) => {
  if (typeof window === 'undefined') return;
  onClose?.();
  setTimeout(() => {
    const el = document.querySelector(hash);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 150); // small delay so terminal closes first
};

const pad = (str: string, len: number) => str.padEnd(len, ' ');

// ─── Section map for cd ───────────────────────────────────────────────────────

const SECTIONS: Record<string, string> = {
  about:        '#about',
  skills:       '#skills',
  'tech-stack': '#skills',
  projects:     '#projects',
  achievements: '#achievements',
  resume:       '#resume',
  contact:      '#contact',
  home:         '#hero',
  hero:         '#hero',
};

// ─── Command definitions ──────────────────────────────────────────────────────

const CONTENT_COMMANDS: Command[] = [

  // ── whoami ──────────────────────────────────────────────────────────────────
  {
    name: 'whoami',
    aliases: ['about', 'me'],
    description: 'Who is Adidev?',
    handler: (_args, push) => {
      push([
        divider(),
        line(`  ${heroData.name}`, 'success'),
        line(`  Full Stack Developer · AWS Cloud Architect`, 'output'),
        divider(),
        line(`  📍  VIT Vellore · B.Tech Information Security`, 'output'),
        line(`  🎓  CGPA 9.13 · Graduating 2026`, 'output'),
        line(`  ☁️   AWS SAA-C03 Certified`, 'output'),
        line(`  ✉️   ${contactData.links.email}`, 'output'),
        divider(),
        line(`  "${aboutData.quote}"`, 'info'),
        divider(),
        line(`  ${aboutData.bio}`, 'output'),
        divider(),
        line(`  run  ls projects/  to see what I've shipped →`, 'info'),
        divider(),
      ]);
    },
  },

  // ── ls ──────────────────────────────────────────────────────────────────────
  {
    name: 'ls',
    description: 'List portfolio contents',
    usage: 'ls [directory]',
    handler: (args, push) => {
      const target = args[0]?.replace(/\/$/, '').toLowerCase();

      // ls projects/
      if (target === 'projects') {
        push([
          divider(),
          line('  projects/', 'success'),
          ...projectsData.map(p =>
            line(
              `  ${pad(p.id + '/', 20)} ${p.subtitle}`,
              'output'
            )
          ),
          divider(),
          line(`  run  cat projects/<name>  to deep-dive →`, 'info'),
          divider(),
        ]);
        return;
      }

      // ls skills/ or ls tech/
      if (target === 'skills' || target === 'tech') {
        push([
          divider(),
          line('  skills/', 'success'),
          ...expertiseDomains.map(d =>
            line(`  ${pad(d.title, 28)} ${d.technologies.slice(0, 3).join(', ')}...`, 'output')
          ),
          divider(),
          line(`  run  skills  for full breakdown →`, 'info'),
          divider(),
        ]);
        return;
      }

      // ls (root)
      if (!target) {
        push([
          divider(),
          line(
            '  projects/   skills/   achievements/   resume.pdf   contact',
            'success'
          ),
          divider(),
          line('  Tip: try  ls projects/  or  cat projects/reportmitra', 'info'),
          divider(),
        ]);
        return;
      }

      push(line(`ls: ${args[0]}: No such file or directory`, 'error'));
    },
  },

  // ── cat ─────────────────────────────────────────────────────────────────────
  {
    name: 'cat',
    description: 'Read a file or section',
    usage: 'cat projects/<name> | cat resume.pdf | cat achievements',
    handler: (args, push) => {
      if (!args.length) {
        push(line('cat: missing operand. usage: cat projects/<name>', 'error'));
        return;
      }

      const target = args.join(' ').toLowerCase().replace(/\/$/, '');

      // ── cat resume.pdf ─────────────────────────────────────────────────────
      if (target === 'resume.pdf' || target === 'resume') {
        openUrl(resumeData.fileUrl);
        push([
          line(`  Opening ${resumeData.fileName}...`, 'success'),
          line(`  → ${resumeData.fileUrl}`, 'info'),
        ]);
        return;
      }

      // ── cat achievements ───────────────────────────────────────────────────
      if (target === 'achievements') {
        push([
          divider(),
          line('  ACHIEVEMENTS', 'success'),
          divider(),
          ...achievementsData.map(a =>
            line(`  [${a.year}]  ${a.title}`, 'output')
          ),
          divider(),
        ]);
        return;
      }

      // ── cat projects/<id> ──────────────────────────────────────────────────
      const projectId = target.replace(/^projects\//, '');
      const project = projectsData.find(p => p.id === projectId);

      if (project) {
        push([
          divider(),
          line(`  ${project.title}`, 'success'),
          line(`  ${project.subtitle}`, 'info'),
          divider(),
          line(`  ${project.oneLiner}`, 'output'),
          divider(),
          line('  HIGHLIGHTS', 'success'),
          ...project.highlights.map(h => line(`  • ${h}`, 'output')),
          divider(),
          line('  STACK', 'success'),
          line(`  ${project.techStack.join('  ·  ')}`, 'output'),
          divider(),
          line(`  ⭐  ${project.standout}`, 'info'),
          divider(),
          ...(project.statusBadge
            ? [line(`  Status: ${project.statusBadge}`, 'success')]
            : []
          ),
          line(
            `  GitHub →`,
            'link',
            { href: project.githubUrl, label: `  GitHub → ${project.githubUrl}` }
          ),
          ...(project.liveUrl && project.liveUrl !== '#'
            ? [line(`  Live →`, 'link', { href: project.liveUrl, label: `  Live → ${project.liveUrl}` })]
            : []
          ),
          divider(),
        ]);
        return;
      }

      push(line(`cat: ${args.join(' ')}: No such file or directory`, 'error'));
    },
  },

  // ── skills ──────────────────────────────────────────────────────────────────
  {
    name: 'skills',
    aliases: ['tech', 'stack'],
    description: 'View tech stack by expertise domain',
    handler: (_args, push) => {
      push([
        divider(),
        line('  TECH STACK BY DOMAIN', 'success'),
        divider(),
        ...expertiseDomains.flatMap(domain => [
          line(`  ▸ ${domain.title}  (${domain.subtitle})`, 'success'),
          line(`    ${domain.technologies.join('  ·  ')}`, 'output'),
          line('', 'output'),
        ]),
        divider(),
        line('  CERTIFICATIONS', 'success'),
        ...certifications.map(c =>
          line(`  ✓  ${c.name} (${c.code}) — ${c.issuer}, ${c.year}`, 'output')
        ),
        divider(),
      ]);
    },
  },

  // ── cd ───────────────────────────────────────────────────────────────────────
  {
    name: 'cd',
    description: 'Navigate to a section of the portfolio',
    usage: 'cd <section>  (about|skills|projects|achievements|resume|contact)',
    handler: (args, push, opts) => {
      const target = args[0]?.toLowerCase();
      if (!target) {
        push(line('cd: missing argument. Available: about skills projects achievements resume contact', 'error'));
        return;
      }
      const hash = SECTIONS[target];
      if (!hash) {
        push(line(`cd: ${target}: section not found. Try: ${Object.keys(SECTIONS).filter(k => !['hero','tech-stack'].includes(k)).join(', ')}`, 'error'));
        return;
      }
      push(line(`  → Jumping to ${hash}`, 'success'));
      scrollToSection(hash, opts?.onClose);
    },
  },

  // ── open ─────────────────────────────────────────────────────────────────────
  {
    name: 'open',
    description: 'Open an external link',
    usage: 'open github | open linkedin | open resume',
    handler: (args, push) => {
      const target = args[0]?.toLowerCase();

      const targets: Record<string, { url: string; label: string }> = {
        github:   { url: contactData.links.github,   label: 'GitHub' },
        linkedin: { url: contactData.links.linkedin, label: 'LinkedIn' },
        resume:   { url: resumeData.fileUrl,          label: 'Resume PDF' },
        email:    { url: `mailto:${contactData.links.email}`, label: 'Email' },
      };

      if (!target) {
        push([
          line('  Available targets:', 'error'),
          ...Object.entries(targets).map(([k, v]) =>
            line(`  open ${pad(k, 12)} →  ${v.url}`, 'output')
          ),
        ]);
        return;
      }

      const t = targets[target];
      if (!t) {
        push(line(`open: unknown target '${target}'. Try: ${Object.keys(targets).join(', ')}`, 'error'));
        return;
      }

      openUrl(t.url);
      push([
        line(`  Opening ${t.label}...`, 'success'),
        line(`  → ${t.url}`, 'info'),
      ]);
    },
  },

  // ── history ──────────────────────────────────────────────────────────────────
  {
    name: 'history',
    aliases: ['hist'],
    description: 'Show command history for this session',
    handler: (_args, push, opts) => {
      const hist = opts?.history ?? [];
      if (!hist.length) {
        push(line('  No commands in history yet.', 'info'));
        return;
      }
      push([
        divider(),
        line('  SESSION HISTORY', 'success'),
        ...hist
          .slice()
          .reverse()
          .map((cmd, i) =>
            line(`  ${String(i + 1).padStart(3, ' ')}  ${cmd}`, 'output')
          ),
        divider(),
      ]);
    },
  },

  // ── contact ───────────────────────────────────────────────────────────────────
  {
    name: 'contact',
    description: 'Show contact information',
    handler: (_args, push) => {
      push([
        divider(),
        line('  CONTACT', 'success'),
        divider(),
        line(`  ✉   ${contactData.links.email}`, 'output'),
        line(`  gh  ${contactData.links.github}`, 'output'),
        line(`  in  ${contactData.links.linkedin}`, 'output'),
        divider(),
        line(`  "${contactData.subtext}"`, 'info'),
        divider(),
        line('  run  open github  or  open linkedin  to connect →', 'info'),
        divider(),
      ]);
    },
  },
];

// ─── Register on module load ──────────────────────────────────────────────────

registerCommands(CONTENT_COMMANDS);

export {};
