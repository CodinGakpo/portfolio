// ─── Command Registry ─────────────────────────────────────────────────────────
// Phase 1: help/man, clear
// Phase 2: all content commands (whoami, ls, cat, cd, open, skills, history)
// Phase 3: ask (Gemini LLM)

import { v4 as uuid } from 'uuid';
import type { Command, PushFn, TerminalLine, ExecOptions } from './types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const line = (
  content: string,
  type: TerminalLine['type'] = 'output',
  extras?: Partial<TerminalLine>
): TerminalLine => ({ id: uuid(), type, content, ...extras });

export const divider = (): TerminalLine => line('', 'divider');

// ─── Command definitions ──────────────────────────────────────────────────────

const COMMANDS: Command[] = [
  // ── help / man ────────────────────────────────────────────────────────────
  {
    name: 'help',
    aliases: ['man', '?'],
    description: 'List all available commands',
    usage: 'help [command]',
    handler: (args, push) => {
      if (args.length > 0) {
        const target = registry.get(args[0]);
        if (!target) {
          push(line(`man: no manual entry for '${args[0]}'`, 'error'));
          return;
        }
        push([
          divider(),
          line(`  ${target.name}`, 'success'),
          line(`  ${target.description}`, 'output'),
          ...(target.usage ? [line(`  usage: ${target.usage}`, 'info')] : []),
          ...(target.aliases?.length
            ? [line(`  aliases: ${target.aliases.join(', ')}`, 'info')]
            : []),
          divider(),
        ]);
        return;
      }

      // Full command listing
      push([
        divider(),
        line('  ADIDEV PORTFOLIO — COMMAND REFERENCE', 'success'),
        line('  Type any command below. Use ↑ / ↓ to navigate history.', 'info'),
        divider(),
        line('  EXPLORE', 'success'),
        line('  whoami         →  who is Adidev?', 'output'),
        line('  ls             →  list everything in this portfolio', 'output'),
        line('  ls projects/   →  show all projects', 'output'),
        line('  skills         →  view tech stack by domain', 'output'),
        divider(),
        line('  READ', 'success'),
        line('  cat projects/<name>   →  deep-dive into a project', 'output'),
        line('  cat resume.pdf        →  open the resume', 'output'),
        line('  cat achievements      →  full achievements list', 'output'),
        divider(),
        line('  NAVIGATE', 'success'),
        line('  cd projects    →  jump to Projects section', 'output'),
        line('  cd skills      →  jump to Tech Stack section', 'output'),
        line('  cd contact     →  jump to Contact section', 'output'),
        divider(),
        line('  OPEN', 'success'),
        line('  open github    →  github.com/CodinGakpo', 'output'),
        line('  open linkedin  →  linkedin.com/in/adidev-anand', 'output'),
        line('  open resume    →  open resume PDF', 'output'),
        divider(),
        line('  ASK (powered by Gemini)', 'success'),
        line('  ask <question> →  talk to Adidev\'s AI twin', 'output'),
        line('  e.g.  ask why should I hire you?', 'info'),
        divider(),
        line('  UTILITY', 'success'),
        line('  history        →  show command history', 'output'),
        line('  clear          →  clear terminal', 'output'),
        line('  help [cmd]     →  show this menu or detail on a command', 'output'),
        divider(),
        line('  Tip: press Ctrl+` or Esc to toggle this terminal.', 'info'),
        divider(),
      ]);
    },
  },

  // ── clear ─────────────────────────────────────────────────────────────────
  {
    name: 'clear',
    aliases: ['cls'],
    description: 'Clear the terminal output',
    handler: () => {
      // Handled specially in the terminal component (resets lines array)
    },
  },
];

// ─── Registry ─────────────────────────────────────────────────────────────────

export const registry = new Map<string, Command>();

const registerAll = (cmds: Command[]) => {
  for (const cmd of cmds) {
    registry.set(cmd.name, cmd);
    for (const alias of cmd.aliases ?? []) {
      registry.set(alias, cmd);
    }
  }
};

registerAll(COMMANDS);

// ─── Public: register more commands (called by Phase 2 / Phase 3) ─────────────

export const registerCommands = (cmds: Command[]) => registerAll(cmds);

// ─── Public: execute a raw input string ───────────────────────────────────────


export const execute = async (
  raw: string,
  push: PushFn,
  onClear: () => void,
  opts: ExecOptions = {}
): Promise<void> => {
  const trimmed = raw.trim();
  if (!trimmed) return;

  // Echo the command back
  push(line(`${trimmed}`, 'command'));

  const [name, ...args] = trimmed.split(/\s+/);
  const cmd = registry.get(name.toLowerCase());

  if (!cmd) {
    push(line(
      `command not found: ${name}. Type 'help' to see available commands.`,
      'error'
    ));
    return;
  }

  if (cmd.name === 'clear') {
    onClear();
    return;
  }

  await cmd.handler(args, push, opts);
};
