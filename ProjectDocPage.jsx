import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { projectDocs } from '../data/projectDocs';
import './ProjectDocPage.css';

// ─── Content block renderer ───────────────────────────────────────────────────

function Block({ block }) {
  switch (block.type) {
    case 'p':
      return <p className="doc-p">{block.text}</p>;
    case 'h2':
      return <h2 className="doc-h2">{block.text}</h2>;
    case 'h3':
      return <h3 className="doc-h3">{block.text}</h3>;
    case 'callout':
      return <div className="doc-callout">{block.text}</div>;
    case 'ul':
      return (
        <ul className="doc-ul">
          {block.items.map((item, i) => <li key={i}>{item}</li>)}
        </ul>
      );
    case 'badge-row':
      return (
        <div className="doc-badge-row">
          {block.items.map((item, i) => <span key={i} className="doc-badge">{item}</span>)}
        </div>
      );
    case 'table':
      return (
        <div className="doc-table-wrap">
          <table className="doc-table">
            <thead>
              <tr>{block.headers.map((h, i) => <th key={i}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {block.rows.map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => <td key={j}>{cell}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    default:
      return null;
  }
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ProjectDocPage() {
  // ⚠️ Change 'projectName' to match your route param (e.g. 'id', 'slug')
  const { projectName } = useParams();
  const project = projectDocs[projectName];

  const [activeTab, setActiveTab] = useState(0);
  const [activeSection, setActiveSection] = useState('');
  const observerRef = useRef(null);

  const tab = project?.tabs[activeTab];

  // Scroll spy
  useEffect(() => {
    if (!tab?.sections?.length) return;
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const topmost = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (topmost) setActiveSection(topmost.target.id);
      },
      { rootMargin: '-52px 0px -60% 0px', threshold: 0 }
    );

    const timer = setTimeout(() => {
      tab.sections.forEach(s => {
        const el = document.getElementById(s.id);
        if (el) observerRef.current.observe(el);
      });
    }, 50);

    return () => {
      clearTimeout(timer);
      observerRef.current?.disconnect();
    };
  }, [activeTab, tab]);

  // Reset on tab switch
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (tab?.sections?.length) setActiveSection(tab.sections[0].id);
  }, [activeTab]);

  const scrollTo = useCallback((id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  if (!project) {
    return (
      <div className="doc-not-found">
        <p>No documentation found for this project.</p>
        <Link to="/" className="doc-back-link">← Back to projects</Link>
      </div>
    );
  }

  return (
    <div className="doc-root">

      {/* ── Header card ─────────────────────────────────────────────── */}
      <div className="doc-header">
        <div className="doc-header-top">
          <span className="doc-label">{project.label}</span>
          <div className="doc-header-links">
            {project.github && (
              <a href={project.github} target="_blank" rel="noreferrer" className="doc-ext-link">
                <GitHubIcon /> GitHub
              </a>
            )}
            {project.live && (
              <a href={project.live} target="_blank" rel="noreferrer" className="doc-ext-link doc-ext-link--accent">
                Live Site ↗
              </a>
            )}
          </div>
        </div>

        <h1 className="doc-title">{project.title}</h1>
        <p className="doc-subtitle">{project.subtitle}</p>
        <p className="doc-oneliner">{project.oneLiner}</p>

        {project.tags?.length > 0 && (
          <div className="doc-tags">
            {project.tags.map((tag, i) => <span key={i} className="doc-tag">{tag}</span>)}
          </div>
        )}
      </div>

      {/* ── Tab bar ──────────────────────────────────────────────────── */}
      <div className="doc-tabbar">
        <div className="doc-tabbar-inner">
          {project.tabs.map((t, i) => (
            <button
              key={i}
              className={`doc-tab ${activeTab === i ? 'doc-tab--active' : ''}`}
              onClick={() => setActiveTab(i)}
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>

      {/* ── Version banner ───────────────────────────────────────────── */}
      {project.version && (
        <div className="doc-version-bar">
          <div className="doc-version-bar-inner">
            <span className="doc-version-pill">{project.version}</span>
            {project.versionNote && <span className="doc-version-note">{project.versionNote}</span>}
          </div>
        </div>
      )}

      {/* ── Two-column body ──────────────────────────────────────────── */}
      <div className="doc-body">

        {/* Sidebar */}
        <aside className="doc-sidebar">
          <div className="doc-current-doc">
            <div className="doc-micro-label">CURRENT DOCUMENT</div>
            <div className="doc-current-doc-title">{tab?.document?.title}</div>
            <div className="doc-current-doc-desc">{tab?.document?.description}</div>
          </div>

          <nav className="doc-toc">
            <div className="doc-micro-label">ON THIS PAGE</div>
            {tab?.sections?.map(section => (
              <button
                key={section.id}
                className={`doc-toc-item ${activeSection === section.id ? 'doc-toc-item--active' : ''}`}
                onClick={() => scrollTo(section.id)}
              >
                {section.title}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="doc-main">
          {tab?.sections?.map(section => (
            <section key={section.id} id={section.id} className="doc-section">
              {section.content.map((block, i) => <Block key={i} block={block} />)}
            </section>
          ))}
        </main>

      </div>
    </div>
  );
}

function GitHubIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
    </svg>
  );
}
