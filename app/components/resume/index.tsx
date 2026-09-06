'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { resumeData, aboutData, certifications } from '../../data/data';

gsap.registerPlugin(ScrollTrigger);

const Resume = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.resume-heading',
        { x: -40, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
        }
      );

      gsap.fromTo(
        '.resume-content',
        { y: 35, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="resume" className="py-28 px-6 noise-overlay">
      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="resume-heading mb-10" style={{ opacity: 0 }}>
          <div className="section-line" />
          <h2 className="text-3xl md:text-4xl font-bold font-display">{resumeData.heading}</h2>
        </div>

        <div className="resume-content glass-card p-5 md:p-7" style={{ opacity: 0 }}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
            <p className="text-sm md:text-base" style={{ color: 'var(--text-secondary)' }}>
              {resumeData.subtext}
            </p>
            <div className="flex gap-3">
              <a
                href={resumeData.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs px-4 py-2 rounded-full transition-all duration-200 hover:scale-105"
                style={{
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: 'var(--text-secondary)',
                }}
              >
                Open Resume
              </a>
              <a
                href={resumeData.fileUrl}
                download={resumeData.fileName}
                className="text-xs px-4 py-2 rounded-full transition-all duration-200 hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: '#fff',
                }}
              >
                Download PDF
              </a>
            </div>
          </div>

          {/* Stat strip */}
          <div className="flex flex-wrap gap-2 mb-5">
            {aboutData.stats.map((stat, i) => (
              <span
                key={i}
                className="text-xs font-mono px-3 py-1.5 rounded-full"
                style={{
                  background: 'rgba(16, 185, 129, 0.08)',
                  color: '#34d399',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                }}
              >
                {stat.value} {stat.label}
              </span>
            ))}
            {certifications.map((cert, i) => (
              <span
                key={`cert-${i}`}
                className="text-xs font-mono px-3 py-1.5 rounded-full"
                style={{
                  background: 'rgba(245, 158, 11, 0.08)',
                  color: '#f59e0b',
                  border: '1px solid rgba(245, 158, 11, 0.2)',
                }}
              >
                {cert.code} Certified
              </span>
            ))}
          </div>

          {/* Terminal-chrome file viewer frame */}
          <div className="rounded-xl overflow-hidden border border-white/10 bg-black/20">
            <div className="terminal-titlebar" style={{ cursor: 'default' }}>
              <div className="terminal-traffic-lights">
                <span className="terminal-light terminal-light--red" style={{ cursor: 'default' }} />
                <span className="terminal-light terminal-light--yellow" />
                <span className="terminal-light terminal-light--green" />
              </div>
              <span className="terminal-titlebar-label">
                {resumeData.fileName}
              </span>
            </div>
            <iframe
              title="Adidev Anand Resume"
              src={resumeData.fileUrl}
              className="w-full h-[70vh] min-h-[520px]"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Resume;
