import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface DocHeading {
  id: string;
  title: string;
}

export interface ProjectDocument {
  id: string;
  label: string;
  title: string;
  description: string;
  order: number;
  body: string;
  headings: DocHeading[];
}

const CONTENT_ROOT = path.join(process.cwd(), 'content', 'projects');

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

// Headings drive both the "On This Page" nav and the scroll spy, so they are
// derived from the same `##` lines the renderer turns into anchored sections.
const extractHeadings = (body: string): DocHeading[] =>
  body
    .split('\n')
    .filter((line) => line.startsWith('## '))
    .map((line) => {
      const title = line.slice(3).trim();
      return { id: slugify(title), title };
    });

export const getProjectDocuments = (projectId: string): ProjectDocument[] => {
  const dir = path.join(CONTENT_ROOT, projectId);
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith('.md'))
    .map((file) => {
      const { data, content } = matter(fs.readFileSync(path.join(dir, file), 'utf8'));
      const body = content.trim();
      return {
        id: file.replace(/\.md$/, '').replace(new RegExp(`^${projectId}-`), ''),
        label: String(data.label ?? ''),
        title: String(data.title ?? ''),
        description: String(data.description ?? ''),
        order: Number(data.order ?? 0),
        body,
        headings: extractHeadings(body),
      };
    })
    .sort((a, b) => a.order - b.order);
};
