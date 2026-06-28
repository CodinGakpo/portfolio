'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { projectsData, Project } from '../../data/data';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const ProjectCard = ({ project }: { project: Project }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -6;
    const rotateY = ((x - centerX) / centerX) * 6;

    gsap.to(card, {
      rotateX,
      rotateY,
      duration: 0.3,
      ease: 'power2.out',
      transformPerspective: 800,
    });
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    gsap.to(cardRef.current, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.5,
      ease: 'power3.out',
    });
  };

  const isPatent = project.statusTone === 'patent';
  const badgeDotClass = isPatent ? 'bg-amber-400' : 'bg-green-400';
  const badgeTextColor = isPatent ? '#fbbf24' : '#4ade80';

  return (
    <div
      ref={cardRef}
      className="project-card glass-card p-6 md:p-8 cursor-pointer"
      style={{ opacity: 0, transformStyle: 'preserve-3d' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* Status badge */}
      {project.statusBadge && (
        <div className="flex items-center gap-2 mb-4">
          <span className={`w-2 h-2 rounded-full animate-pulse ${badgeDotClass}`} />
          <span className="text-xs font-mono tracking-wide" style={{ color: badgeTextColor }}>
            {project.statusBadge}
          </span>
        </div>
      )}

      <h3 className="text-xl md:text-2xl font-bold mb-1">{project.title}</h3>
      <p className="text-sm mb-3" style={{ color: 'var(--accent-light)' }}>
        {project.subtitle}
      </p>
      <p className="text-sm mb-5 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
        {project.oneLiner}
      </p>

      {/* Tech tags */}
      <div className="flex flex-wrap gap-2 mb-5">
        {project.techStack.map((tech, i) => (
          <span
            key={i}
            className="text-[11px] px-2.5 py-1 rounded-full font-mono"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'var(--text-muted)',
            }}
          >
            {tech}
          </span>
        ))}
      </div>

      {/* Expanded details */}
      {/* Expanded details are moved to the dedicated project page */}

      {/* Links */}
      <div className="flex gap-3 mt-4 pt-4 border-t border-white/10">
        <Link
          href={`/projects/${project.id}`}
          className="inline-flex items-center gap-2 text-sm px-5 py-2.5 rounded-full transition-all duration-200 hover:scale-105"
          style={{
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: '#fff',
            fontWeight: 500,
          }}
        >
          View Documentation
          <ArrowRight className="w-4 h-4" />
        </Link>
        <a
          href={project.githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-2 text-sm px-5 py-2.5 rounded-full transition-all duration-200 hover:scale-105"
          style={{
            border: '1px solid rgba(255,255,255,0.15)',
            color: 'var(--text-secondary)',
          }}
        >
          GitHub
        </a>
      </div>
    </div>
  );
};

const Projects = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.projects-heading', { x: -40, opacity: 0 }, {
        x: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
      });

      gsap.fromTo('.project-card', { y: 50, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.7, stagger: 0.15, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 65%' },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="projects" className="py-28 px-6 noise-overlay">
      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="projects-heading mb-14" style={{ opacity: 0 }}>
          <div className="section-line" />
          <h2 className="text-3xl md:text-4xl font-bold">Projects</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {projectsData.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;
