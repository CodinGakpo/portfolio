'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { aboutData } from '../../data/data';

const Hero = () => {
  const lineRef = useRef<HTMLHeadingElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.3 });
    tl.fromTo(lineRef.current, { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' });
    tl.fromTo(panelRef.current, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' }, '-=0.3');
    tl.fromTo('.hero-stat-card', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.12, ease: 'power3.out' }, '-=0.25');
  }, []);

  return (
    <section id="hero" className="min-h-screen flex items-center px-6 py-28 noise-overlay">
      <div className="relative z-10 max-w-5xl mx-auto w-full">
        <h1 ref={lineRef} className="text-4xl sm:text-5xl md:text-7xl font-semibold tracking-tight mb-8" style={{ opacity: 0 }}>
          Hi, I am Adidev.
        </h1>

        <div
          ref={panelRef}
          className="rounded-2xl overflow-hidden border border-emerald-500/30 bg-[#0b1110]"
          style={{ opacity: 0 }}
        >
          <div className="flex items-center gap-2 px-4 py-3 border-b border-emerald-500/20 bg-[#0d1513]">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
            <span className="text-xs tracking-wider font-mono text-emerald-300">adidev@portfolio:~</span>
          </div>
          <div className="p-5 md:p-7 font-mono text-sm md:text-base leading-7 text-emerald-200/90">
            <p>$ role --current</p>
            <p className="text-emerald-300">Backend Engineer | Cloud & DevOps | Information Security</p>
            <p className="mt-4">$ highlight --focus</p>
            <p>Building production systems with AWS, CI/CD, async processing, and security-first design.</p>
            <p className="mt-4">$ open --projects</p>
            <a href="#projects" className="underline underline-offset-4 text-emerald-300 hover:text-emerald-200">View shipped work</a>
          </div>
        </div>

        <div ref={statsRef} className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          {aboutData.stats.map((stat, i) => (
            <div
              key={i}
              className="hero-stat-card glass-card border border-emerald-500/30 p-5 text-center"
              style={{ opacity: 0 }}
            >
              <div className="text-3xl md:text-4xl font-bold mb-1 gradient-text">{stat.value}</div>
              <div className="text-xs md:text-sm" style={{ color: 'var(--text-muted)' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
