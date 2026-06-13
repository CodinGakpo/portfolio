'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { skillsData } from '../../data/data';

gsap.registerPlugin(ScrollTrigger);

const Skills = () => {
  const sectionRef = useRef<HTMLElement>(null);

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
        '.skill-category',
        { y: 40, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="skills" className="py-28 px-6 noise-overlay">
      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="skills-heading mb-14" style={{ opacity: 0 }}>
          <div className="section-line" />
          <h2 className="text-3xl md:text-4xl font-bold">Skills</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {skillsData.map((category, ci) => (
            <div key={ci} className="skill-category glass-card p-5 min-h-[300px]" style={{ opacity: 0 }}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xl" style={{ color: 'var(--accent-light)' }}>
                  {category.icon}
                </span>
                <h3 className="text-sm font-semibold tracking-wide uppercase">
                  {category.title}
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {category.skills.map((skill, si) => (
                  <span
                    key={si}
                    className="text-xs px-3 py-1.5 rounded-full transition-colors duration-200"
                    style={{
                      background: 'rgba(139, 92, 246, 0.08)',
                      border: '1px solid rgba(139, 92, 246, 0.15)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Skills;
