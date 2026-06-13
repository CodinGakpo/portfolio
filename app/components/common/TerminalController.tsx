'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const Terminal = dynamic(() => import('../terminal'), { ssr: false });

const TerminalController = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => setIsOpen(prev => !prev);
  const close  = () => setIsOpen(false);

  // Global Ctrl+` — also handled inside the input's keydown when focused
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === '`') {
        e.preventDefault();
        toggle();
      }
      if (e.key === 'Escape' && isOpen) {
        close();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen]);

  return (
    <>
      <button
        onClick={toggle}
        className="terminal-fab"
        aria-label="Toggle terminal"
        title="Open terminal (Ctrl+`)"
      >
        <span className="terminal-fab-icon">_</span>
      </button>

      <Terminal isOpen={isOpen} onClose={close} onToggle={toggle} />
    </>
  );
};

export default TerminalController;
