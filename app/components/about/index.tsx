'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { aboutData } from '../../data/data';

gsap.registerPlugin(ScrollTrigger);

const About = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const bioRef = useRef<HTMLParagraphElement>(null);
  const backendRef = useRef<HTMLDivElement>(null);
  const quoteRef = useRef<HTMLParagraphElement>(null);

  const backendHighlights = [
    {
      title: 'Infra Snapshot',
      lines: ['AWS: EC2 + RDS + S3 + CloudFront', 'Deploy: Nginx + Gunicorn + HTTPS', 'Runtime: Linux-first workflows'],
    },
    {
      title: 'Pipeline Mode',
      lines: ['CI/CD: GitHub Actions + OIDC IAM', 'Async Jobs: Celery + Redis queues', 'Observability: Logs, retries, rollbacks'],
    },
    {
      title: 'Build Philosophy',
      lines: ['Security-first defaults', 'Production over prototypes', 'Measure, profile, iterate'],
    },
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.about-heading',
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
        bioRef.current,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          delay: 0.2,
          ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' },
        }
      );

      gsap.fromTo(
        '.backend-card',
        { y: 40, opacity: 0, scale: 0.95 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.6,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: { trigger: backendRef.current, start: 'top 85%' },
        }
      );

      gsap.fromTo(
        quoteRef.current,
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: { trigger: quoteRef.current, start: 'top 85%' },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="about" className="py-28 px-6 noise-overlay">
      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="about-heading mb-12" style={{ opacity: 0 }}>
          <div className="section-line" />
          <h2 className="text-3xl md:text-4xl font-bold">About</h2>
        </div>

        <p
          ref={bioRef}
          className="text-base md:text-lg leading-relaxed mb-14 max-w-3xl"
          style={{ color: 'var(--text-secondary)', opacity: 0 }}
        >
          {aboutData.bio}
        </p>

        {/* Backend-focused filler content */}
        <div ref={backendRef} className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-14">
          {backendHighlights.map((item) => (
            <div key={item.title} className="backend-card glass-card border border-emerald-500/30 p-5" style={{ opacity: 0 }}>
              <p className="text-xs font-mono mb-3 tracking-wide text-emerald-300">$ {item.title.toLowerCase().replace(/\s+/g, '-')}</p>
              <ul className="space-y-2">
                {item.lines.map((line) => (
                  <li key={line} className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    <span className="text-emerald-300">▸ </span>
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Quote */}
        <p
          ref={quoteRef}
          className="text-xl md:text-2xl font-light italic text-center"
          style={{ color: 'var(--text-muted)', opacity: 0 }}
        >
          &quot;{aboutData.quote}&quot;
        </p>
      </div>
    </section>
  );
};

export default About;
