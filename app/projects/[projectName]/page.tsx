import { notFound } from 'next/navigation';
import { projectDocs } from '../../data/projectDocs';
import ProjectDocViewer from '../../components/projects/ProjectDocViewer';

export default async function ProjectPage({ params }: { params: Promise<{ projectName: string }> }) {
  const resolvedParams = await params;
  // Match the route parameter exactly with the keys in projectDocs
  const project = projectDocs[resolvedParams.projectName];

  if (!project) {
    notFound();
  }

  return <ProjectDocViewer project={project} />;
}

