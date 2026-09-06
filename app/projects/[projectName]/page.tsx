import { notFound } from 'next/navigation';
import { projectDocsMeta } from '../../data/projectDocsMeta';
import { getProjectDocuments } from '../../lib/docs';
import ProjectDocViewer from '../../components/projects/ProjectDocViewer';

export function generateStaticParams() {
  return Object.keys(projectDocsMeta).map((projectName) => ({ projectName }));
}

export default async function ProjectPage({ params }: { params: Promise<{ projectName: string }> }) {
  const { projectName } = await params;
  const meta = projectDocsMeta[projectName];

  if (!meta) {
    notFound();
  }

  return <ProjectDocViewer meta={meta} documents={getProjectDocuments(projectName)} />;
}
