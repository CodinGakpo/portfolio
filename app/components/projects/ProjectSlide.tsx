import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { Project } from '../../data/data';

interface ProjectSlideProps {
  project: Project;
  stacked?: boolean;
}

const ProjectSlide = ({ project, stacked = false }: ProjectSlideProps) => {
  const badgeDotClass =
    project.statusTone === 'patent' ? 'bg-amber-400' :
    project.statusTone === 'oss' ? 'bg-sky-400' :
    'bg-green-400';
  const badgeTextColor =
    project.statusTone === 'patent' ? '#fbbf24' :
    project.statusTone === 'oss' ? '#38bdf8' :
    '#4ade80';

  return (
    <div
      className={
        stacked
          ? 'glass-card overflow-hidden'
          : 'grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center max-w-6xl w-full mx-auto px-6 md:px-10'
      }
    >
      {/* Image */}
      <div
        className={
          stacked
            ? 'relative w-full aspect-[4/5]'
            : 'relative w-full aspect-[4/5] max-h-[70vh] rounded-2xl overflow-hidden glass-card'
        }
      >
        {project.image ? (
          <Image
            src={project.image}
            alt={project.title}
            fill
            sizes={stacked ? '100vw' : '50vw'}
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-black" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        {project.statusBadge && (
          <div
            className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md"
            style={{ background: 'rgba(0,0,0,0.4)' }}
          >
            <span className={`w-2 h-2 rounded-full animate-pulse ${badgeDotClass}`} />
            <span className="text-xs font-mono tracking-wide" style={{ color: badgeTextColor }}>
              {project.statusBadge}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className={stacked ? 'p-6' : ''}>
        <h3 className={stacked ? 'text-xl font-bold mb-1' : 'text-2xl md:text-4xl font-bold mb-2'}>
          {project.title}
        </h3>
        <p className="text-sm md:text-base mb-3" style={{ color: 'var(--accent-light)' }}>
          {project.subtitle}
        </p>
        <p className="text-sm md:text-base mb-5 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          {project.oneLiner}
        </p>

        <div className="flex flex-wrap gap-2 mb-6">
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

        <div className="flex gap-3">
          <Link
            href={`/projects/${project.id}`}
            className="inline-flex items-center gap-2 text-sm px-5 py-2.5 rounded-full transition-all duration-200 hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', fontWeight: 500 }}
          >
            View Documentation
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm px-5 py-2.5 rounded-full transition-all duration-200 hover:scale-105"
            style={{ border: '1px solid rgba(255,255,255,0.15)', color: 'var(--text-secondary)' }}
          >
            GitHub
          </a>
        </div>
      </div>
    </div>
  );
};

export default ProjectSlide;
