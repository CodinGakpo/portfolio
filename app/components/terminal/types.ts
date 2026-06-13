// ─── Terminal Types ───────────────────────────────────────────────────────────

export type OutputType = 'command' | 'output' | 'error' | 'success' | 'info' | 'link' | 'divider';

export interface TerminalLine {
  id: string;
  type: OutputType;
  content: string;
  href?: string; // for 'link' type
  label?: string; // display label for links
}

export interface Command {
  name: string;
  aliases?: string[];
  description: string;
  usage?: string;
  handler: (args: string[], push: PushFn) => void | Promise<void>;
}

export type PushFn = (lines: TerminalLine | TerminalLine[]) => void;
