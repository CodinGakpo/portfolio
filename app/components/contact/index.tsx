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
    <section ref={sectionRef} id="contact" className="py-28 px-6 noise-overlay">
      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <div className="contact-content" style={{ opacity: 0 }}>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">{contactData.heading}</h2>
          <p className="text-base md:text-lg mb-12" style={{ color: 'var(--text-secondary)' }}>
            {contactData.subtext}
          </p>
        </div>

        {/* Links */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-10">
          <a
            href={`mailto:${contactData.links.email}`}
            className="contact-link glass-card px-6 py-3 text-sm flex items-center justify-center gap-2 hover:border-purple-500/30 transition-all"
            style={{ opacity: 0 }}
          >
            <Mail className="w-4 h-4 text-emerald-400" /> {contactData.links.email}
          </a>
          <a
            href={contactData.links.github}
            target="_blank"
            rel="noopener noreferrer"
            className="contact-link glass-card px-6 py-3 text-sm flex items-center justify-center gap-2 hover:border-purple-500/30 transition-all"
            style={{ opacity: 0 }}
          >
            <FiGithub className="w-4 h-4 text-emerald-400" /> GitHub
          </a>
          <a
            href={contactData.links.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="contact-link glass-card px-6 py-3 text-sm flex items-center justify-center gap-2 hover:border-purple-500/30 transition-all"
            style={{ opacity: 0 }}
          >
            <FiLinkedin className="w-4 h-4 text-emerald-400" /> LinkedIn
          </a>
        </div>

        {/* CTA */}
        <a
          href={contactData.cta.href}
          className="contact-link inline-flex items-center justify-center gap-2 px-10 py-3.5 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(139,92,246,0.3)]"
          style={{
            background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
            color: '#fff',
            opacity: 0,
          }}
        >
          {contactData.cta.label}
          <Send className="w-4 h-4" />
        </a>

        {/* Footer */}
        <div className="mt-20 pt-8 border-t border-white/5">
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            © {new Date().getFullYear()} Adidev Anand. Built with Next.js & GSAP.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Contact;
