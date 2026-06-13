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
  onToggle: () => void;
}

const Terminal = ({ isOpen, onClose, onToggle }: TerminalProps) => {
  const [lines, setLines] = useState<TerminalLine[]>(BOOT_LINES);
  const [input, setInput] = useState('');
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);

  // Drag state
  const dragState = useRef({ dragging: false, startX: 0, startY: 0, origX: 0, origY: 0 });
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [hasMoved, setHasMoved] = useState(false);

  // ── Fix 3: Lock body scroll when terminal is open ─────────────────────────
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

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

  // ── Focus input when opened / un-minimized ────────────────────────────────

  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [isOpen, isMinimized]);

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

  // ── Keyboard handling (Fix 2: Ctrl+` handled here too) ───────────────────

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Fix 2: catch Ctrl+` while input is focused
    if (e.ctrlKey && e.key === '`') {
      e.preventDefault();
      onToggle();
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
      return;
    }

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
    if (isMaximized) return; // can't drag when maximized
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

  // ── Traffic light handlers (Fix 1) ───────────────────────────────────────

  const handleMinimize = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMinimized(prev => !prev);
    if (isMaximized) setIsMaximized(false);
  };

  const handleMaximize = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMaximized(prev => !prev);
    setIsMinimized(false);
    // Reset drag position so maximize is properly centered
    if (!isMaximized) { setPos({ x: 0, y: 0 }); setHasMoved(false); }
  };

  // ── Fix 3: Stop wheel events from leaking to the page ────────────────────

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  if (!isOpen) return null;

  // ── Window sizing ─────────────────────────────────────────────────────────

  const maximizedStyle: React.CSSProperties = {
    position: 'fixed',
    top: '5vh',
    left: '5vw',
    width: '90vw',
    height: '90vh',
    transform: 'none',
    zIndex: 9999,
  };

  const normalStyle: React.CSSProperties = isMinimized
    ? {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: hasMoved
          ? `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))`
          : 'translate(-50%, -50%)',
        zIndex: 9999,
      }
    : {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: hasMoved
          ? `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))`
          : 'translate(-50%, -50%)',
        zIndex: 9999,
      };

  const windowStyle = isMaximized ? maximizedStyle : normalStyle;

  return (
    <>
      {/* Backdrop */}
      <div
        className="terminal-backdrop"
        onClick={onClose}
        onWheel={handleWheel}
      />

      {/* Terminal window */}
      <div
        ref={windowRef}
        className={`terminal-window${isMinimized ? ' terminal-window--minimized' : ''}${isMaximized ? ' terminal-window--maximized' : ''}`}
        style={windowStyle}
        onClick={() => !isMinimized && inputRef.current?.focus()}
        onWheel={handleWheel}
      >
        {/* Title bar */}
        <div
          className="terminal-titlebar"
          onMouseDown={onDragStart}
          onDoubleClick={handleMaximize}
        >
          <div className="terminal-traffic-lights">
            {/* Fix 1: All three as buttons with proper handlers */}
            <button
              className="terminal-light terminal-light--red"
              onClick={(e) => { e.stopPropagation(); onClose(); }}
              aria-label="Close terminal"
              title="Close"
            />
            <button
              className="terminal-light terminal-light--yellow"
              onClick={handleMinimize}
              aria-label="Minimize terminal"
              title={isMinimized ? 'Restore' : 'Minimize'}
            />
            <button
              className="terminal-light terminal-light--green"
              onClick={handleMaximize}
              aria-label="Maximize terminal"
              title={isMaximized ? 'Restore' : 'Maximize'}
            />
          </div>
          <span className="terminal-titlebar-label">
            adidev@portfolio:~{isMinimized ? ' (minimized)' : ''}
          </span>
          <span className="terminal-titlebar-hint">Ctrl+`</span>
        </div>

        {/* Output — hidden when minimized */}
        {!isMinimized && (
          <>
            <div ref={outputRef} className="terminal-output" onWheel={handleWheel}>
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
          </>
        )}
      </div>
    </>
  );
};

export default Terminal;
