// ─── Phase 3: `ask` command — Gemini-powered AI twin ─────────────────────────
// Streams the response from /api/chat, buffers the full text,
// then pushes it to the terminal as formatted lines.

import { registerCommands, line, divider } from './commands';
import type { Command } from './types';

const ASK_COMMANDS: Command[] = [
  {
    name: 'ask',
    aliases: ['query', 'ai'],
    description: "Ask Adidev's AI twin anything about him",
    usage: 'ask <question>',
    handler: async (args, push) => {
      const question = args.join(' ').trim();

      if (!question) {
        push([
          line('  ask: missing question.', 'error'),
          line('  e.g.  ask why should I hire you?', 'info'),
        ]);
        return;
      }

      // Show a "thinking" indicator while waiting
      push([
        divider(),
        line('  Adidev[AI] ▸ receiving response...', 'info'),
      ]);

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question }),
        });

        if (!res.ok || !res.body) {
          const errText = await res.text().catch(() => res.statusText);
          push([
            line(`  Error ${res.status}: ${errText}`, 'error'),
            divider(),
          ]);
          return;
        }

        // Read the full response
        const full = await res.text();

        const trimmed = full.trim();
        if (!trimmed) {
          push([line('  (no response)', 'error'), divider()]);
          return;
        }

        // Split response into paragraphs — blank lines become dividers
        const paragraphs = trimmed.split(/\n\n+/);
        const outputLines = paragraphs.flatMap((para) => {
          const innerLines = para.split('\n').map(l => line(`  ${l}`, 'output'));
          return [...innerLines, line('', 'output')];
        });

        push([
          line('  Adidev[AI] ▸', 'success'),
          ...outputLines,
          divider(),
        ]);

      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        push([
          line(`  Network error: ${msg}`, 'error'),
          line(`  Is GEMINI_API_KEY set in .env.local?`, 'info'),
          divider(),
        ]);
      }
    },
  },
];

registerCommands(ASK_COMMANDS);
export {};
