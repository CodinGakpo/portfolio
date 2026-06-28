'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { navLinks, heroData } from '../../data/data';
import { useTerminalStore } from '../../stores/terminalStore';
import Link from 'next/link';
import { Home } from 'lucide-react';

const Navbar = () => {
  const navRef = useRef<HTMLElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { toggle: toggleTerminal } = useTerminalStore();

  useEffect(() => {
    gsap.fromTo(
      navRef.current,
      { y: -60, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, delay: 1.8, ease: 'power3.out' }
    );

    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      ref={navRef}
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
        scrolled
          ? 'bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5'
          : 'bg-transparent'
      }`}
      style={{ opacity: 0 }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="text-lg font-bold tracking-tight hover:opacity-80 transition-opacity flex items-center gap-2"
        >
          <Home className="w-5 h-5 text-emerald-400" />
          {heroData.name.split(' ')[0]}
          <span style={{ color: 'var(--accent-light)' }}>.</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm tracking-wide transition-colors duration-200 hover:text-white"
              style={{ color: 'var(--text-muted)' }}
            >
              {link.label}
            </a>
          ))}

          {/* Terminal trigger — cheeky shell syntax */}
          <button
            onClick={toggleTerminal}
            className="navbar-terminal-btn"
            aria-label="Open terminal"
            title="Open interactive terminal (Ctrl+`)"
          >
            <span className="navbar-terminal-btn__icon">&gt;_</span>
            <span>./explore</span>
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden flex flex-col gap-1.5 p-2"
          aria-label="Toggle menu"
        >
          <span
            className={`w-5 h-px bg-white transition-all duration-300 ${
              isOpen ? 'rotate-45 translate-y-[3.5px]' : ''
            }`}
          />
          <span
            className={`w-5 h-px bg-white transition-all duration-300 ${
              isOpen ? 'opacity-0' : ''
            }`}
          />
          <span
            className={`w-5 h-px bg-white transition-all duration-300 ${
              isOpen ? '-rotate-45 -translate-y-[3.5px]' : ''
            }`}
          />
        </button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-white/5 px-6 py-6 flex flex-col gap-4">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="text-sm tracking-wide py-2 transition-colors hover:text-white"
              style={{ color: 'var(--text-muted)' }}
            >
              {link.label}
            </a>
          ))}
          {/* Mobile terminal trigger */}
          <button
            onClick={() => { setIsOpen(false); toggleTerminal(); }}
            className="navbar-terminal-btn text-left"
            aria-label="Open terminal"
          >
            <span className="navbar-terminal-btn__icon">&gt;_</span>
            <span>./explore</span>
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
