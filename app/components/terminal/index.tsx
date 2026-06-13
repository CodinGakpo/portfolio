'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { v4 as uuid } from 'uuid';
import { execute } from './commands';
import type { TerminalLine } from './types';

// ─── Boot message ─────────────────────────────────────────────────────────────

const BOOT_LINES: TerminalLine[] = [
  { id: uuid(), type: 'success', content: '  Welcome to adidev@portfolio — interactive terminal' },
  { id: uuid(), type: 'info',    content: '  Type  help  to explore all commands.' },
  { id: uuid(), type: 'info',    content: '  Press  Ctrl+`  or  Esc  to close.' },
  { id: uuid(), type: 'divider', content: '' },
];

// ─── Output renderer ──────────────────────────────────────────────────────────

const LineRenderer = ({ line }: { line: TerminalLine }) => {
  const PROMPT = <span className="terminal-prompt">adidev@portfolio:~$ </span>;

  if (line.type === 'divider') {
    return <div className="terminal-divider" />;
  }

  if (line.type === 'link') {
    return (
      <div className="terminal-line">
        <a
          href={line.href}
          target="_blank"
          rel="noopener noreferrer"
          className="terminal-link"
        >
          {line.label ?? line.content}
        </a>
      </div>
    );
  }

  return (
    <div className={`terminal-line terminal-line--${line.type}`}>
      {line.type === 'command' && PROMPT}
      {line.content}
    </div>
  );
};

// ─── Main Terminal Component ──────────────────────────────────────────────────

interface TerminalProps {
  isOpen: boolean;
  onClose: () => void;
}

const Terminal = ({ isOpen, onClose }: TerminalProps) => {
  const [lines, setLines] = useState<TerminalLine[]>(BOOT_LINES);
  const [input, setInput] = useState('');
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);

  // Drag state
  const dragState = useRef({ dragging: false, startX: 0, startY: 0, origX: 0, origY: 0 });
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [hasMoved, setHasMoved] = useState(false);

  // ── Helpers ────────────────────────────────────────────────────────────────

  const push = useCallback((incoming: TerminalLine | TerminalLine[]) => {
    setLines(prev => [...prev, ...(Array.isArray(incoming) ? incoming : [incoming])]);
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const scrollToBottom = () => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  };

  // ── Auto-scroll on new output ─────────────────────────────────────────────

  useEffect(() => { scrollToBottom(); }, [lines]);

  // ── Focus input when opened ───────────────────────────────────────────────

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [isOpen]);

  // ── Submit command ─────────────────────────────────────────────────────────

  const submit = async () => {
    const raw = input.trim();
    setInput('');
    setHistoryIndex(-1);

    if (!raw) return;

    setCmdHistory(prev => [raw, ...prev]);
    setIsLoading(true);
    await execute(raw, push, clear);
    setIsLoading(false);
  };

  // ── Keyboard handling ─────────────────────────────────────────────────────

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      submit();
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const next = Math.min(historyIndex + 1, cmdHistory.length - 1);
      setHistoryIndex(next);
      setInput(cmdHistory[next] ?? '');
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = Math.max(historyIndex - 1, -1);
      setHistoryIndex(next);
      setInput(next === -1 ? '' : cmdHistory[next]);
      return;
    }

    if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      clear();
      return;
    }
  };

  // ── Drag logic ────────────────────────────────────────────────────────────

  const onDragStart = (e: React.MouseEvent) => {
    dragState.current = {
      dragging: true,
      startX: e.clientX,
      startY: e.clientY,
      origX: pos.x,
      origY: pos.y,
    };
    window.addEventListener('mousemove', onDragMove);
    window.addEventListener('mouseup', onDragEnd);
  };

  const onDragMove = (e: MouseEvent) => {
    if (!dragState.current.dragging) return;
    setHasMoved(true);
    setPos({
      x: dragState.current.origX + (e.clientX - dragState.current.startX),
      y: dragState.current.origY + (e.clientY - dragState.current.startY),
    });
  };

  const onDragEnd = () => {
    dragState.current.dragging = false;
    window.removeEventListener('mousemove', onDragMove);
    window.removeEventListener('mouseup', onDragEnd);
  };

  // ── Click-through on backdrop focuses input ───────────────────────────────

  if (!isOpen) return null;

  const translateStyle = hasMoved
    ? { transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))` }
    : { transform: 'translate(-50%, -50%)' };

  return (
    <>
      {/* Backdrop */}
      <div
        className="terminal-backdrop"
        onClick={onClose}
      />

      {/* Terminal window */}
      <div
        ref={windowRef}
        className="terminal-window"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          ...translateStyle,
          zIndex: 9999,
        }}
        onClick={() => inputRef.current?.focus()}
      >
        {/* Title bar */}
        <div
          className="terminal-titlebar"
          onMouseDown={onDragStart}
        >
          <div className="terminal-traffic-lights">
            <button
              className="terminal-light terminal-light--red"
              onClick={(e) => { e.stopPropagation(); onClose(); }}
              aria-label="Close terminal"
            />
            <div className="terminal-light terminal-light--yellow" />
            <div className="terminal-light terminal-light--green" />
          </div>
          <span className="terminal-titlebar-label">adidev@portfolio:~</span>
          <span className="terminal-titlebar-hint">Ctrl+`</span>
        </div>

        {/* Output */}
        <div ref={outputRef} className="terminal-output">
          {lines.map(l => <LineRenderer key={l.id} line={l} />)}
          {isLoading && (
            <div className="terminal-line terminal-line--info">
              <span className="terminal-spinner" /> thinking...
            </div>
          )}
        </div>

        {/* Input row */}
        <div className="terminal-inputbar">
          <span className="terminal-prompt">adidev@portfolio:~$&nbsp;</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="terminal-input"
            spellCheck={false}
            autoComplete="off"
            autoCapitalize="off"
            placeholder="type a command..."
            aria-label="Terminal input"
          />
        </div>
      </div>
    </>
  );
};

export default Terminal;
