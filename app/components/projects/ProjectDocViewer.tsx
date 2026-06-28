'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Boxes } from 'lucide-react';
import { ProjectDoc } from '../../data/projectDocs';

export default function ProjectDocViewer({ project }: { project: ProjectDoc }) {
  const [activeTabId, setActiveTabId] = useState(project.tabs[0]?.id || '');
  const [activeSectionId, setActiveSectionId] = useState('');
  
  const activeTab = project.tabs.find((t) => t.id === activeTabId) || project.tabs[0];

  useEffect(() => {
    // Reset active section when tab changes
    if (activeTab && activeTab.sections.length > 0) {
      setActiveSectionId(activeTab.sections[0].id);
    }
  }, [activeTabId, activeTab]);

  useEffect(() => {
    // Setup IntersectionObserver for scroll spy
    const observer = new IntersectionObserver(
      (entries) => {
        // Find the most recently intersecting entry
        const visibleEntries = entries.filter((entry) => entry.isIntersecting);
        if (visibleEntries.length > 0) {
          // Sort by top position to get the highest visible one
          visibleEntries.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
          setActiveSectionId(visibleEntries[0].target.id);
        }
      },
      {
        rootMargin: '-100px 0px -60% 0px',
      }
    );

    // Observe all section elements
    if (activeTab) {
      activeTab.sections.forEach((section) => {
        const el = document.getElementById(section.id);
        if (el) observer.observe(el);
      });
    }

    return () => observer.disconnect();
  }, [activeTabId, activeTab]);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      // Smooth scroll with offset for sticky headers if any
      const y = el.getBoundingClientRect().top + window.scrollY - 120;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <main className="min-h-screen doc-root" style={{ backgroundColor: 'var(--doc-bg)', color: 'var(--doc-text)' }}>
      <div className="max-w-6xl mx-auto py-16 px-6">
        <Link href="/#projects" className="inline-flex items-center gap-2 text-sm text-[var(--doc-text)] hover:text-white transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to Projects
        </Link>

        {/* Header Card */}
        <div 
          className="rounded-3xl p-8 md:p-12 mb-8 relative overflow-hidden"
          style={{ backgroundColor: 'var(--doc-card)', border: '1px solid var(--doc-border)' }}
        >
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-xs font-mono tracking-widest uppercase" style={{ color: 'var(--doc-accent)' }}>
                Project Documentation
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-6 flex items-center gap-4" style={{ color: 'var(--doc-heading)' }}>
              {project.title} <Boxes className="w-8 h-8" style={{ color: 'var(--doc-accent)' }} />
            </h1>
            
            <p className="text-lg md:text-xl font-medium mb-6 max-w-2xl" style={{ color: 'var(--doc-text)' }}>
              {project.subtitle}
            </p>

            <p className="text-base max-w-3xl leading-relaxed mb-8 opacity-80">
              {project.oneLiner}
            </p>
          </div>
        </div>

        {/* Version Banner */}
        <div className="flex items-center gap-4 mb-6 px-2">
          <span className="text-xs font-mono uppercase tracking-widest opacity-60">Versions</span>
          <span className="px-3 py-1 rounded-full text-xs font-mono" style={{ border: '1px solid var(--doc-accent)', color: 'var(--doc-accent)', backgroundColor: 'rgba(56, 189, 248, 0.1)' }}>
            {project.version}
          </span>
        </div>

        {/* Version Summary Box */}
        <div 
          className="rounded-2xl p-6 mb-12"
          style={{ backgroundColor: 'var(--doc-card)', border: '1px solid var(--doc-border)' }}
        >
          <div className="text-xs font-mono tracking-widest uppercase mb-4 opacity-60">Version Summary</div>
          <p className="text-sm leading-relaxed font-mono opacity-80">
            {project.versionSummary}
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-12 border-b border-[var(--doc-border)] pb-4">
          {project.tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTabId(tab.id)}
              className="px-5 py-2.5 rounded-full text-sm font-medium transition-all"
              style={{
                backgroundColor: activeTabId === tab.id ? 'var(--doc-card-hover)' : 'transparent',
                color: activeTabId === tab.id ? 'var(--doc-heading)' : 'var(--doc-text)',
                border: activeTabId === tab.id ? '1px solid var(--doc-border)' : '1px solid transparent',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Main Content Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Sidebar */}
          <div className="lg:col-span-3 hidden lg:block">
            <div className="sticky top-24 space-y-6">
              
              {/* Current Document Box */}
              <div 
                className="rounded-2xl p-6"
                style={{ backgroundColor: 'var(--doc-card)', border: '1px solid var(--doc-border)' }}
              >
                <div className="text-xs font-mono tracking-widest uppercase mb-3 opacity-60">Current Document</div>
                <h3 className="text-lg font-bold mb-3" style={{ color: 'var(--doc-heading)' }}>
                  {activeTab.documentTitle}
                </h3>
                <p className="text-sm opacity-80 leading-relaxed">
                  {activeTab.documentDescription}
                </p>
              </div>

              {/* On This Page Nav */}
              <div 
                className="rounded-2xl p-6"
                style={{ backgroundColor: 'var(--doc-card)', border: '1px solid var(--doc-border)' }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="text-xs font-mono tracking-widest uppercase opacity-60">On This Page</div>
                  <a href="#top" className="text-xs opacity-60 hover:opacity-100 flex items-center gap-1">
                    Top <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                
                <nav className="space-y-1">
                  {activeTab.sections.map((section) => {
                    const isActive = activeSectionId === section.id;
                    return (
                      <a
                        key={section.id}
                        href={`#${section.id}`}
                        onClick={(e) => scrollToSection(e, section.id)}
                        className="block px-3 py-2 text-sm rounded-lg transition-all"
                        style={{
                          color: isActive ? 'var(--doc-heading)' : 'var(--doc-text)',
                          backgroundColor: isActive ? 'rgba(255,255,255,0.03)' : 'transparent',
                          boxShadow: isActive ? 'inset 3px 0 8px rgba(255,255,255,0.05)' : 'none',
                          borderLeft: isActive ? '2px solid var(--doc-accent)' : '2px solid transparent'
                        }}
                      >
                        {section.title}
                      </a>
                    );
                  })}
                </nav>
              </div>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="lg:col-span-9">
            
            {/* Tab Header inside content */}
            <div className="mb-12">
              <div className="text-xs font-mono tracking-widest uppercase mb-4 opacity-60">{activeTab.label}</div>
              <h2 className="text-4xl font-bold" style={{ color: 'var(--doc-heading)' }}>
                {activeTab.documentTitle}
              </h2>
              <p className="text-lg mt-4 opacity-80 font-mono border-b border-[var(--doc-border)] pb-8">
                {activeTab.documentDescription}
              </p>
            </div>

            {/* Sections */}
            <div className="space-y-16">
              {activeTab.sections.map((section) => (
                <section key={section.id} id={section.id} className="scroll-mt-32">
                  <h3 className="text-2xl font-bold mb-6" style={{ color: 'var(--doc-heading)' }}>
                    {section.title}
                  </h3>
                  
                  {/* The content renderer */}
                  <div className="doc-content prose prose-invert max-w-none">
                    {/* Add global styles for tables inside .doc-content if needed, or rely on Tailwind classes provided in the content JSX */}
                    <style dangerouslySetInnerHTML={{__html: `
                      .doc-content p {
                        margin-bottom: 1.5rem;
                        line-height: 1.8;
                        opacity: 0.85;
                      }
                      .doc-content table {
                        width: 100%;
                        border-collapse: collapse;
                        border-radius: 12px;
                        overflow: hidden;
                        border: 1px solid var(--doc-border);
                        margin-bottom: 2rem;
                      }
                      .doc-content th {
                        background-color: var(--doc-card);
                        padding: 1rem;
                        text-align: left;
                        font-weight: 600;
                        border-bottom: 1px solid var(--doc-border);
                        color: var(--doc-heading);
                      }
                      .doc-content td {
                        padding: 1rem;
                        border-bottom: 1px solid var(--doc-border);
                        background-color: rgba(255,255,255,0.01);
                      }
                      .doc-content tr:last-child td {
                        border-bottom: none;
                      }
                      .doc-content td:first-child {
                        font-family: monospace;
                        color: var(--doc-accent);
                        font-size: 0.9em;
                      }
                      .doc-content code {
                        background-color: var(--doc-card);
                        padding: 0.2rem 0.4rem;
                        border-radius: 4px;
                        font-family: monospace;
                        font-size: 0.9em;
                        color: var(--doc-accent);
                      }
                    `}} />
                    {section.content}
                  </div>
                </section>
              ))}
            </div>

            {/* Links at the bottom */}
            <div className="mt-16 pt-8 border-t border-[var(--doc-border)] flex gap-4">
              {project.liveUrl && project.liveUrl !== '#' && (
                <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-mono flex items-center gap-2 hover:text-white transition-colors" style={{ color: 'var(--doc-accent)' }}>
                  Live at: {project.liveUrl}
                </a>
              )}
              {project.githubUrl && project.githubUrl !== '#' && (
                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-mono flex items-center gap-2 hover:text-white transition-colors" style={{ color: 'var(--doc-accent)' }}>
                  Docs at: {project.githubUrl}
                </a>
              )}
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}
