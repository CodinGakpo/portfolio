'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamic import avoids SSR issues with uuid/uuid and browser APIs
const Terminal = dynamic(() => import('../terminal'), { ssr: false });

const TerminalController = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Ctrl+` global toggle
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === '`') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen]);

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="terminal-fab"
        aria-label="Open terminal"
        title="Open terminal (Ctrl+`)"
      >
        <span className="terminal-fab-icon">{'_'}</span>
      </button>

      <Terminal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default TerminalController;
