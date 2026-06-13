'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const Terminal = dynamic(() => import('../terminal'), { ssr: false });

const TerminalController = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => setIsOpen(prev => !prev);
  const close  = () => setIsOpen(false);

  // Global shortcut: Ctrl+` (Backquote)
  // Uses e.code (physical key) not e.key — reliable on Linux + Windows
  // regardless of keyboard layout or what character Ctrl produces.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isBackquote =
        e.code === 'Backquote' ||
        e.key === '`' ||
        e.keyCode === 192;

      if (e.ctrlKey && isBackquote) {
        e.preventDefault();
        toggle();
        return;
      }
      if (e.key === 'Escape' && isOpen) {
        close();
      }
    };
    // document instead of window — catches events even when
    // focus is inside an iframe or deep shadow DOM
    document.addEventListener('keydown', handler, { capture: true });
    return () => document.removeEventListener('keydown', handler, { capture: true });
  }, [isOpen]);

  return (
    <>
      <button
        onClick={toggle}
        className="terminal-fab"
        aria-label="Toggle terminal"
        title="Open terminal (Ctrl+`)"
      >
        <span className="terminal-fab-icon">&gt;_</span>
        <span className="terminal-fab-label">terminal</span>
      </button>

      <Terminal isOpen={isOpen} onClose={close} onToggle={toggle} />
    </>
  );
};

export default TerminalController;
