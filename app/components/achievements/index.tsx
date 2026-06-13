'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { achievementsData } from '../../data/data';

gsap.registerPlugin(ScrollTrigger);

const badgeColorMap: Record<string, string> = {
  gold: '#f59e0b',
  silver: '#94a3b8',
  blue: '#3b82f6',
  purple: '#8b5cf6',
  gray: '#6b7280',
};

const Achievements = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.achievements-heading', { x: -40, opacity: 0 }, {
        x: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
      });

      gsap.fromTo('.timeline-node', { x: -30, opacity: 0 }, {
        x: 0, opacity: 1, duration: 0.5, stagger: 0.12, ease: 'power3.out',
        scrollTrigger: { trigger: '.timeline-container', start: 'top 75%' },
      });

      gsap.fromTo('.timeline-line', { scaleY: 0 }, {
        scaleY: 1, duration: 1.2, ease: 'power2.out',
        scrollTrigger: { trigger: '.timeline-container', start: 'top 80%' },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="achievements" className="py-28 px-6 noise-overlay">
      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="achievements-heading mb-14" style={{ opacity: 0 }}>
          <div className="section-line" />
          <h2 className="text-3xl md:text-4xl font-bold">Achievements</h2>
        </div>

        <div className="timeline-container relative">
          {/* Vertical line */}
          <div
            className="timeline-line absolute left-[18px] md:left-[22px] top-0 bottom-0 w-px"
            style={{ background: 'rgba(139, 92, 246, 0.2)', transformOrigin: 'top' }}
          />

          <div className="space-y-6">
            {achievementsData.map((item, i) => {
              const color = badgeColorMap[item.badgeColor] || '#6b7280';
              return (
                <div key={i} className="timeline-node flex items-start gap-5 relative" style={{ opacity: 0 }}>
                  {/* Dot */}
                  <div className="relative flex-shrink-0 mt-1.5">
                    <div
                      className="w-3 h-3 md:w-3.5 md:h-3.5 rounded-full border-2"
                      style={{ borderColor: color, background: `${color}33` }}
                    />
                    <div
                      className="absolute inset-0 rounded-full animate-ping"
                      style={{ background: color, opacity: 0.15 }}
                    />
                  </div>

                  {/* Content */}
                  <div className="glass-card p-4 md:p-5 flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span
                        className="text-xs font-mono px-2 py-0.5 rounded-full"
                        style={{ background: `${color}20`, color, border: `1px solid ${color}40` }}
                      >
                        {item.year}
                      </span>
                    </div>
                    <p className="text-sm md:text-base" style={{ color: 'var(--text-secondary)' }}>
                      {item.title}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Achievements;
