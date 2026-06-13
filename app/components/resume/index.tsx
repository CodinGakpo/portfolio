'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { resumeData } from '../../data/data';

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
          <h2 className="text-3xl md:text-4xl font-bold">{resumeData.heading}</h2>
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
                  background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                  color: '#fff',
                }}
              >
                Download PDF
              </a>
            </div>
          </div>

          <div className="rounded-xl overflow-hidden border border-white/10 bg-black/20">
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
