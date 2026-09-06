'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { experienceData } from '../../data/data';

gsap.registerPlugin(ScrollTrigger);

const Experience = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.experience-heading', { x: -40, opacity: 0 }, {
        x: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
      });

      gsap.fromTo('.experience-card', { y: 50, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.7, stagger: 0.15, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 65%' },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="experience" className="py-28 px-6 noise-overlay">
      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="experience-heading mb-14" style={{ opacity: 0 }}>
          <div className="section-line" />
          <h2 className="text-3xl md:text-4xl font-bold font-display">Experience</h2>
        </div>

        <div className="space-y-6">
          {experienceData.map((item, i) => (
            <div key={i} className="experience-card glass-card p-5 md:p-6" style={{ opacity: 0 }}>
              <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
                <h3 className="text-lg md:text-xl font-bold">
                  {item.role} <span style={{ color: 'var(--accent-light)' }}>· {item.org}</span>
                </h3>
                <span
                  className="text-xs font-mono px-2 py-0.5 rounded-full whitespace-nowrap"
                  style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.25)' }}
                >
                  {item.period}
                </span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {item.summary}
              </p>
              {item.highlights && item.highlights.length > 0 && (
                <ul className="mt-3 space-y-1.5">
                  {item.highlights.map((h, hi) => (
                    <li key={hi} className="text-sm flex gap-2" style={{ color: 'var(--text-secondary)' }}>
                      <span style={{ color: '#34d399' }}>→</span> {h}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Experience;
