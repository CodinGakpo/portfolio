// ─── Phase 3: default fallback — freeform questions to Adidev's AI twin ──────
// Any terminal input that isn't a recognized command is routed here instead
// of erroring. Streams the response from /api/chat, buffers the full text,
// then pushes it to the terminal as formatted lines.

import { setFallbackHandler, line, divider } from './commands';
import type { PushFn } from './types';

const askAdidevAI = async (question: string, push: PushFn): Promise<void> => {
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
      line(`  Are the Bedrock AWS credentials set in .env.local (BEDROCK_AWS_REGION / BEDROCK_AWS_ACCESS_KEY / BEDROCK_AWS_SECRET_KEY)?`, 'info'),
      divider(),
    ]);
  }
};

setFallbackHandler(askAdidevAI);
export {};
