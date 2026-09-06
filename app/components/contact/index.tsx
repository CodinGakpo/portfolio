'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { contactData } from '../../data/data';
import { Mail, Send } from 'lucide-react';
import { FiGithub, FiLinkedin } from 'react-icons/fi';

gsap.registerPlugin(ScrollTrigger);

const Contact = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.contact-content', { y: 40, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' },
      });

      gsap.fromTo('.contact-link', { y: 20, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <>
      <section
        ref={sectionRef}
        id="contact"
        className="relative py-32 px-6 noise-overlay overflow-hidden"
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at 50% 30%, rgba(16, 185, 129, 0.12), transparent 60%)',
          }}
        />

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <div className="contact-content" style={{ opacity: 0 }}>
            <div className="section-line mx-auto" />
            <p className="terminal-prompt font-mono text-sm mb-4">$ contact --initiate</p>
            <h2 className="text-4xl md:text-5xl font-bold font-display mb-4">{contactData.heading}</h2>
            <p className="text-base md:text-lg mb-12" style={{ color: 'var(--text-secondary)' }}>
              {contactData.subtext}
            </p>
          </div>

          {/* Links */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            <a
              href={`mailto:${contactData.links.email}`}
              className="contact-link glass-card p-6 flex flex-col items-center justify-center gap-2 hover:border-emerald-500/30 transition-all"
              style={{ opacity: 0 }}
            >
              <Mail className="w-6 h-6 text-emerald-400" />
              <span className="text-sm break-all">{contactData.links.email}</span>
            </a>
            <a
              href={contactData.links.github}
              target="_blank"
              rel="noopener noreferrer"
              className="contact-link glass-card p-6 flex flex-col items-center justify-center gap-2 hover:border-emerald-500/30 transition-all"
              style={{ opacity: 0 }}
            >
              <FiGithub className="w-6 h-6 text-emerald-400" />
              <span className="text-sm">GitHub</span>
            </a>
            <a
              href={contactData.links.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="contact-link glass-card p-6 flex flex-col items-center justify-center gap-2 hover:border-emerald-500/30 transition-all"
              style={{ opacity: 0 }}
            >
              <FiLinkedin className="w-6 h-6 text-emerald-400" />
              <span className="text-sm">LinkedIn</span>
            </a>
          </div>

          {/* CTA */}
          <a
            href={contactData.cta.href}
            className="contact-link inline-flex items-center justify-center gap-2 px-10 py-3.5 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(16,185,129,0.3)]"
            style={{
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: '#fff',
              opacity: 0,
            }}
          >
            {contactData.cta.label}
            <Send className="w-4 h-4" />
          </a>
        </div>
      </section>

      <footer className="px-6 py-8 border-t border-white/5">
        <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
          © {new Date().getFullYear()} Adidev Anand. Built with Next.js & GSAP.
        </p>
      </footer>
    </>
  );
};

export default Contact;
