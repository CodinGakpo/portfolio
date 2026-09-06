'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { projectsData } from '../../data/data';
import ProjectSlide from './ProjectSlide';

gsap.registerPlugin(ScrollTrigger);

const Projects = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const pinWrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.projects-heading', { x: -40, opacity: 0 }, {
        x: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
      });

      // Mobile stack reveal — harmless no-op when this tree is display:none on desktop
      gsap.fromTo('.project-slide-mobile', { y: 50, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.7, stagger: 0.15, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 65%' },
      });
    }, sectionRef);

    // Desktop-only pinned horizontal scroll gallery, gated by viewport width
    // (matches the lg: breakpoint used to hide/show the two DOM trees).
    const mm = gsap.matchMedia();

    mm.add('(min-width: 1024px)', () => {
      const track = trackRef.current;
      const pinWrap = pinWrapRef.current;
      if (!track || !pinWrap) return;

      const slides = gsap.utils.toArray<HTMLElement>('.project-slide', track);
      const n = slides.length;
      if (n === 0) return;

      const tween = gsap.to(track, {
        xPercent: -100 * (n - 1),
        ease: 'none',
        scrollTrigger: {
          trigger: pinWrap,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          snap: n > 1 ? 1 / (n - 1) : undefined,
          end: () => '+=' + (track.scrollWidth - window.innerWidth),
          onUpdate: (self) => {
            const idx = Math.round(self.progress * (n - 1));
            slides.forEach((slide, i) => {
              gsap.to(slide, {
                scale: i === idx ? 1 : 0.92,
                opacity: i === idx ? 1 : 0.7,
                duration: 0.3,
                overwrite: 'auto',
              });
            });
          },
        },
      });

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    });

    return () => {
      ctx.revert();
      mm.revert();
    };
  }, []);

  return (
    <section ref={sectionRef} id="projects" className="py-28 noise-overlay overflow-hidden">
      <div className="relative z-10 max-w-6xl mx-auto px-6 mb-14">
        <div className="projects-heading" style={{ opacity: 0 }}>
          <div className="section-line" />
          <h2 className="text-3xl md:text-4xl font-bold font-display">Projects</h2>
        </div>
      </div>

      {/* Desktop: pinned horizontal scroll gallery */}
      <div ref={pinWrapRef} className="hidden lg:block h-screen w-screen overflow-hidden">
        <div ref={trackRef} className="flex h-full">
          {projectsData.map((project) => (
            <div
              key={project.id}
              className="project-slide flex-none w-screen h-full flex items-center justify-center"
            >
              <ProjectSlide project={project} />
            </div>
          ))}
        </div>
      </div>

      {/* Mobile / small screens: plain vertical stack, no scroll-jacking */}
      <div className="lg:hidden max-w-2xl mx-auto px-6 flex flex-col gap-8">
        {projectsData.map((project) => (
          <div key={project.id} className="project-slide-mobile" style={{ opacity: 0 }}>
            <ProjectSlide project={project} stacked />
          </div>
        ))}
      </div>
    </section>
  );
};

export default Projects;
