'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import ReactMarkdown, { defaultUrlTransform, type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowLeft, ArrowUp, ChevronDown, Gauge, GraduationCap, X } from 'lucide-react';
import type { ProjectDocMeta } from '../../data/projectDocsMeta';
import type { ProjectDocument } from '../../lib/docs';

interface Props {
  meta: ProjectDocMeta;
  documents: ProjectDocument[];
}

// Mirrors slugify() in app/lib/docs.ts so heading anchors match the extracted TOC.
const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

// Diagrams are referenced as `asset:<id>`; react-markdown's default urlTransform
// strips unknown URI schemes, so resolve them to their real path up front.
const ASSET_PREFIX = 'asset:';
const resolveAsset = (url: string) =>
  url.startsWith(ASSET_PREFIX)
    ? `/projects/diagrams/${url.slice(ASSET_PREFIX.length)}.svg`
    : defaultUrlTransform(url);

const textOf = (node: React.ReactNode): string =>
  React.Children.toArray(node)
    .map((child) =>
      typeof child === 'string' || typeof child === 'number'
        ? String(child)
        : React.isValidElement<{ children?: React.ReactNode }>(child)
          ? textOf(child.props.children)
          : ''
    )
    .join('');

const StatPill = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) => (
  <div
    className="flex items-center gap-2 rounded-full px-4 py-2"
    style={{ backgroundColor: 'var(--doc-card)', border: '1px solid var(--doc-border)' }}
  >
    {icon}
    <span className="text-xs uppercase tracking-[0.2em] opacity-60">{label}</span>
    <span className="text-sm font-semibold" style={{ color: 'var(--doc-heading)' }}>
      {value}
    </span>
  </div>
);

export default function ProjectDocViewer({ meta, documents }: Props) {
  const [versionId, setVersionId] = useState(meta.versions[0]?.id ?? '');
  const [documentId, setDocumentId] = useState(documents[0]?.id ?? '');
  const [activeHeadingId, setActiveHeadingId] = useState('');
  const [tocOpen, setTocOpen] = useState(false);
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const activeVersion = meta.versions.find((v) => v.id === versionId) ?? meta.versions[0];
  const activeDoc = documents.find((d) => d.id === documentId) ?? documents[0];

  useEffect(() => {
    if (!activeDoc) return;
    window.scrollTo({ top: 0, behavior: 'auto' });
    setActiveHeadingId(activeDoc.headings[0]?.id ?? '');
    setTocOpen(false);
  }, [activeDoc]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (!activeDoc || !contentRef.current) return;
    const targets = Array.from(contentRef.current.querySelectorAll("[data-doc-heading='true']"));
    if (!targets.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const top = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (top?.target?.id) setActiveHeadingId(top.target.id);
      },
      { rootMargin: '-110px 0px -55% 0px', threshold: [0, 1] }
    );

    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, [activeDoc]);

  const goToHeading = useCallback((id: string) => {
    setActiveHeadingId(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const components = useMemo<Components>(
    () => ({
      h2: ({ children }) => {
        const title = textOf(children);
        return (
          <h2
            id={slugify(title)}
            data-doc-heading="true"
            className="scroll-mt-32 text-2xl font-bold mt-14 mb-6 first:mt-0"
            style={{ color: 'var(--doc-heading)' }}
          >
            {children}
          </h2>
        );
      },
      h3: ({ children }) => (
        <h3 className="text-lg font-semibold mt-10 mb-4" style={{ color: 'var(--doc-heading)' }}>
          {children}
        </h3>
      ),
      p: ({ children }) => <p className="mb-6 leading-8 opacity-85">{children}</p>,
      ul: ({ children }) => <ul className="mb-6 space-y-2 pl-5 list-disc marker:text-[var(--doc-accent)]">{children}</ul>,
      ol: ({ children }) => <ol className="mb-6 space-y-2 pl-5 list-decimal marker:text-[var(--doc-accent)]">{children}</ol>,
      li: ({ children }) => <li className="leading-8 opacity-85">{children}</li>,
      strong: ({ children }) => (
        <strong className="font-semibold" style={{ color: 'var(--doc-heading)' }}>
          {children}
        </strong>
      ),
      blockquote: ({ children }) => (
        <blockquote
          className="mb-6 rounded-xl px-5 py-1 border-l-2"
          style={{ backgroundColor: 'var(--doc-card)', borderColor: 'var(--doc-accent)' }}
        >
          {children}
        </blockquote>
      ),
      a: ({ href, children }) => (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 transition-colors hover:text-white"
          style={{ color: 'var(--doc-accent)' }}
        >
          {children}
        </a>
      ),
      table: ({ children }) => (
        <div className="mb-8 overflow-x-auto rounded-xl" style={{ border: '1px solid var(--doc-border)' }}>
          <table className="w-full border-collapse text-sm">{children}</table>
        </div>
      ),
      th: ({ children }) => (
        <th
          className="px-4 py-3 text-left font-semibold"
          style={{
            backgroundColor: 'var(--doc-card)',
            borderBottom: '1px solid var(--doc-border)',
            color: 'var(--doc-heading)',
          }}
        >
          {children}
        </th>
      ),
      td: ({ children }) => (
        <td
          className="px-4 py-3 align-top opacity-85 [&:first-child]:font-mono [&:first-child]:text-[var(--doc-accent)]"
          style={{ borderBottom: '1px solid var(--doc-border)' }}
        >
          {children}
        </td>
      ),
      code: ({ children, className }) => {
        // Fenced blocks carry a language- class; inline code does not.
        if (className) {
          return (
            <code className="block font-mono text-[13px] leading-6 opacity-90">{children}</code>
          );
        }
        return (
          <code
            className="rounded px-1.5 py-0.5 font-mono text-[0.9em]"
            style={{ backgroundColor: 'var(--doc-card)', color: 'var(--doc-accent)' }}
          >
            {children}
          </code>
        );
      },
      pre: ({ children }) => (
        <pre
          className="mb-8 overflow-x-auto rounded-xl p-5"
          style={{ backgroundColor: 'var(--doc-card)', border: '1px solid var(--doc-border)' }}
        >
          {children}
        </pre>
      ),
      img: ({ src, alt }) => {
        const resolved = typeof src === 'string' ? src : '';
        const caption = alt ?? '';
        return (
          <figure className="mb-8">
            <button
              type="button"
              onClick={() => setLightbox({ src: resolved, alt: caption })}
              className="block w-full cursor-zoom-in rounded-2xl p-4 transition-colors"
              style={{ backgroundColor: 'var(--doc-card)', border: '1px solid var(--doc-border)' }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={resolved} alt={caption} className="w-full h-auto" loading="lazy" />
            </button>
            {caption && (
              <figcaption className="mt-3 text-center text-xs opacity-60">{caption}</figcaption>
            )}
          </figure>
        );
      },
    }),
    []
  );

  if (!activeDoc) {
    return (
      <main className="doc-root min-h-screen px-6 py-20 font-mono" style={{ backgroundColor: 'var(--doc-bg)', color: 'var(--doc-text)' }}>
        <div className="mx-auto max-w-3xl rounded-[32px] p-8" style={{ border: '1px solid var(--doc-border)', backgroundColor: 'var(--doc-card)' }}>
          <Link href="/#projects" className="mb-8 inline-flex items-center gap-2 text-sm transition-colors hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Back to Projects
          </Link>
          <h1 className="text-3xl font-semibold" style={{ color: 'var(--doc-heading)' }}>{meta.title}</h1>
          <p className="mt-3 leading-8 opacity-80">Documentation for this project has not been published yet.</p>
        </div>
      </main>
    );
  }

  return (
    <main
      className="doc-root min-h-screen px-6 py-10 font-mono md:px-10 lg:px-16"
      style={{ backgroundColor: 'var(--doc-bg)', color: 'var(--doc-text)' }}
    >
      <div className="mx-auto max-w-7xl">
        {meta.notice && (
          <div
            className="mb-6 rounded-xl px-4 py-3 text-sm"
            style={{
              border: '1px solid rgba(16, 185, 129, 0.4)',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              color: '#d1fae5',
            }}
          >
            <p>{meta.notice.text}</p>
            {meta.notice.links && (
              <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                {meta.notice.links.map((link) => (
                  <a
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-2 transition-colors hover:text-white"
                  >
                    {link.label}
                  </a>
                ))}
              </p>
            )}
          </div>
        )}

        <Link href="/#projects" className="mb-8 inline-flex items-center gap-2 text-sm transition-colors hover:text-white">
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
        </Link>

        {/* Header card */}
        <header
          className="relative overflow-hidden rounded-[36px] p-8 md:p-10"
          style={{ backgroundColor: 'var(--doc-card)', border: '1px solid var(--doc-border)' }}
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs uppercase tracking-[0.35em]" style={{ color: 'var(--doc-accent)' }}>
                Project Documentation
              </p>
              <h1 className="mt-4 text-4xl font-semibold md:text-5xl" style={{ color: 'var(--doc-heading)' }}>
                {meta.title}
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-8" style={{ color: 'var(--doc-heading)', opacity: 0.85 }}>
                {meta.tagline}
              </p>
              <p className="mt-4 max-w-2xl leading-8 opacity-80">{meta.description}</p>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <StatPill
                icon={<Gauge className="h-4 w-4" style={{ color: 'var(--doc-accent)' }} />}
                label="Diff"
                value={meta.difficulty}
              />
              <StatPill
                icon={<GraduationCap className="h-4 w-4" style={{ color: 'var(--doc-accent)' }} />}
                label="Learn"
                value={meta.learning}
              />
            </div>
          </div>
        </header>

        {/* Versions */}
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <p className="text-xs uppercase tracking-[0.28em] opacity-50">Versions</p>
          {meta.versions.map((version) => {
            const isActive = version.id === activeVersion?.id;
            return (
              <button
                key={version.id}
                type="button"
                onClick={() => setVersionId(version.id)}
                className="rounded-full px-4 py-2 text-sm transition-all"
                style={{
                  border: `1px solid ${isActive ? 'var(--doc-accent)' : 'var(--doc-border)'}`,
                  backgroundColor: isActive ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                  color: isActive ? 'var(--doc-accent)' : 'var(--doc-text)',
                }}
              >
                {version.label}
              </button>
            );
          })}
        </div>

        {activeVersion?.description && (
          <div className="mt-4 rounded-2xl p-4" style={{ backgroundColor: 'var(--doc-card)', border: '1px solid var(--doc-border)' }}>
            <p className="text-xs uppercase tracking-[0.28em] opacity-50">Version Summary</p>
            <p className="mt-2 text-sm leading-7 opacity-85">{activeVersion.description}</p>
          </div>
        )}

        {/* Document tabs */}
        <div className="mt-8 flex flex-wrap gap-3">
          {documents.map((doc) => {
            const isActive = doc.id === activeDoc.id;
            return (
              <button
                key={doc.id}
                type="button"
                onClick={() => setDocumentId(doc.id)}
                className="rounded-full px-4 py-2 text-sm transition-all"
                style={{
                  border: `1px solid ${isActive ? 'var(--doc-accent)' : 'var(--doc-border)'}`,
                  backgroundColor: isActive ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                  color: isActive ? 'var(--doc-accent)' : 'var(--doc-text)',
                }}
              >
                {doc.label}
              </button>
            );
          })}
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
          {/* Sidebar */}
          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-[28px] p-5" style={{ backgroundColor: 'var(--doc-card)', border: '1px solid var(--doc-border)' }}>
              <p className="text-xs uppercase tracking-[0.28em] opacity-50">Current Document</p>
              <h2 className="mt-3 text-xl font-semibold" style={{ color: 'var(--doc-heading)' }}>
                {activeDoc.title}
              </h2>
              {activeDoc.description && <p className="mt-3 text-sm leading-7 opacity-70">{activeDoc.description}</p>}
            </div>

            {activeDoc.headings.length > 0 && (
              <div className="rounded-[28px] p-5" style={{ backgroundColor: 'var(--doc-card)', border: '1px solid var(--doc-border)' }}>
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.28em] opacity-50">On This Page</p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => goToHeading(activeDoc.headings[0].id)}
                      className="inline-flex items-center gap-1 text-xs opacity-60 transition-opacity hover:opacity-100"
                    >
                      Top
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      aria-label="Toggle section list"
                      onClick={() => setTocOpen((open) => !open)}
                      className="inline-flex rounded-full p-2 lg:hidden"
                      style={{ border: '1px solid var(--doc-border)' }}
                    >
                      <ChevronDown className={`h-3.5 w-3.5 transition-transform ${tocOpen ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                </div>

                <nav className={`space-y-1 ${tocOpen ? 'block' : 'hidden'} lg:block`}>
                  {activeDoc.headings.map((heading) => {
                    const isActive = activeHeadingId === heading.id;
                    return (
                      <a
                        key={heading.id}
                        href={`#${heading.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          goToHeading(heading.id);
                        }}
                        className="block rounded-lg px-3 py-2 text-sm transition-all"
                        style={{
                          color: isActive ? 'var(--doc-heading)' : 'var(--doc-text)',
                          backgroundColor: isActive ? 'rgba(255,255,255,0.03)' : 'transparent',
                          borderLeft: `2px solid ${isActive ? 'var(--doc-accent)' : 'transparent'}`,
                        }}
                      >
                        {heading.title}
                      </a>
                    );
                  })}
                </nav>
                {!tocOpen && (
                  <p className="mt-2 text-xs opacity-50 lg:hidden">Tap the expand icon to open the section list.</p>
                )}
              </div>
            )}
          </aside>

          {/* Content */}
          <div>
            <div className="mb-12">
              <p className="text-xs uppercase tracking-[0.28em] opacity-50">{activeDoc.label}</p>
              <h2 className="mt-4 text-4xl font-bold" style={{ color: 'var(--doc-heading)' }}>
                {activeDoc.title}
              </h2>
              {activeDoc.description && (
                <p className="mt-4 pb-8 text-lg leading-8 opacity-80" style={{ borderBottom: '1px solid var(--doc-border)' }}>
                  {activeDoc.description}
                </p>
              )}
            </div>

            <div ref={contentRef}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={components}
                urlTransform={resolveAsset}
              >
                {activeDoc.body}
              </ReactMarkdown>
            </div>

            {(meta.liveUrl || meta.githubUrl || meta.externalLinks?.length) && (
              <div className="mt-16 flex flex-wrap gap-4 pt-8" style={{ borderTop: '1px solid var(--doc-border)' }}>
                {meta.liveUrl && (
                  <a
                    href={meta.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm transition-colors hover:text-white"
                    style={{ color: 'var(--doc-accent)' }}
                  >
                    Live at: {meta.liveUrl}
                  </a>
                )}
                {meta.githubUrl && (
                  <a
                    href={meta.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm transition-colors hover:text-white"
                    style={{ color: 'var(--doc-accent)' }}
                  >
                    Code at: {meta.githubUrl}
                  </a>
                )}
                {meta.externalLinks?.map((link) => (
                  <a
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm transition-colors hover:text-white"
                    style={{ color: 'var(--doc-accent)' }}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {lightbox && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={lightbox.alt}
          onClick={() => setLightbox(null)}
          className="fixed inset-0 z-50 flex cursor-zoom-out items-center justify-center p-6"
          style={{ backgroundColor: 'rgba(0,0,0,0.92)' }}
        >
          <button
            type="button"
            aria-label="Close diagram"
            onClick={() => setLightbox(null)}
            className="absolute right-6 top-6 rounded-full p-2"
            style={{ border: '1px solid var(--doc-border)', color: 'var(--doc-text)' }}
          >
            <X className="h-4 w-4" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={lightbox.src} alt={lightbox.alt} className="max-h-full max-w-full" />
        </div>
      )}
    </main>
  );
}
