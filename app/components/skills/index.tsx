'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { techMarqueeItems, expertiseDomains, certifications } from '../../data/data';

gsap.registerPlugin(ScrollTrigger);

/* ── Infinite Marquee Row ─────────────────────────────────────────────────── */
const MarqueeRow = ({ items, reverse = false }: { items: string[]; reverse?: boolean }) => {
  // Duplicate the items for seamless loop
  const doubled = [...items, ...items];
  return (
    <div className="marquee-container">
      <div className={`marquee-track ${reverse ? 'marquee-track--reverse' : ''}`}>
        {doubled.map((item, i) => (
          <span key={`${item}-${i}`} className="marquee-item">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
};

/* ── Expertise Card ───────────────────────────────────────────────────────── */
const ExpertiseCard = ({
  domain,
}: {
  domain: (typeof expertiseDomains)[number];
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    card.style.setProperty('--mouse-x', `${x}%`);
    card.style.setProperty('--mouse-y', `${y}%`);
  };

  return (
    <div
      ref={cardRef}
      className="expertise-card"
      onMouseMove={handleMouseMove}
      style={
        {
          '--card-accent': domain.accentColor,
          '--card-glow': domain.glowColor,
        } as React.CSSProperties
      }
    >
      {/* Accent top line */}
      <div
        className="expertise-card__accent"
        style={{ background: `linear-gradient(90deg, ${domain.accentColor}, transparent)` }}
      />

      {/* Spotlight overlay on hover */}
      <div className="expertise-card__spotlight" />

      <div className="relative z-10">
        <p
          className="text-xs font-mono tracking-widest uppercase mb-2"
          style={{ color: domain.accentColor }}
        >
          {domain.subtitle}
        </p>
        <h3 className="text-xl md:text-2xl font-bold mb-3">{domain.title}</h3>
        <p
          className="text-sm leading-relaxed mb-6"
          style={{ color: 'var(--text-secondary)' }}
        >
          {domain.description}
        </p>

        {/* Technologies as flowing dot-separated text */}
        <div className="expertise-card__techs">
          {domain.technologies.map((tech, i) => (
            <span key={tech} className="expertise-card__tech-item">
              {tech}
              {i < domain.technologies.length - 1 && (
                <span className="expertise-card__dot" style={{ color: domain.accentColor }}>
                  ·
                </span>
              )}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ── Skills Section ───────────────────────────────────────────────────────── */
const Skills = () => {
  const sectionRef = useRef<HTMLElement>(null);

  // Split marquee items into two rows
  const mid = Math.ceil(techMarqueeItems.length / 2);
  const row1 = techMarqueeItems.slice(0, mid);
  const row2 = techMarqueeItems.slice(mid);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.skills-heading',
        { x: -40, opacity: 0 },
        {
          x: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
        }
      );

      gsap.fromTo(
        '.marquee-section',
        { opacity: 0, y: 20 },
        {
          opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' },
        }
      );

      gsap.fromTo(
        '.expertise-card',
        { y: 50, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.7, stagger: 0.15, ease: 'power3.out',
          scrollTrigger: { trigger: '.expertise-grid', start: 'top 80%' },
        }
      );

      gsap.fromTo(
        '.cert-badge',
        { y: 30, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.6, ease: 'power3.out',
          scrollTrigger: { trigger: '.cert-badge', start: 'top 90%' },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="skills" className="py-28 px-6 noise-overlay">
      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Heading */}
        <div className="skills-heading mb-14" style={{ opacity: 0 }}>
          <div className="section-line" />
          <h2 className="text-3xl md:text-4xl font-bold">Tech Stack</h2>
        </div>

        {/* Marquee */}
        <div className="marquee-section mb-16" style={{ opacity: 0 }}>
          <div className="space-y-3">
            <MarqueeRow items={row1} />
            <MarqueeRow items={row2} reverse />
          </div>
        </div>

        {/* Expertise Domains */}
        <div className="expertise-grid grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          {expertiseDomains.map((domain) => (
            <ExpertiseCard key={domain.title} domain={domain} />
          ))}
        </div>

        {/* AWS Certification Badge */}
        {certifications.map((cert) => (
          <div key={cert.code} className="cert-badge" style={{ opacity: 0 }}>
            <div className="cert-badge__icon">
              <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
                <path
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  stroke="#f59e0b"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold" style={{ color: '#f59e0b' }}>
                {cert.name}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {cert.issuer} · {cert.code} · {cert.year}
              </p>
            </div>
            <div className="cert-badge__verified">
              <span className="text-xs font-mono tracking-wide" style={{ color: '#10b981' }}>
                ✓ Verified
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Skills;
