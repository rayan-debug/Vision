import { notFound } from 'next/navigation';
import { prisma } from '@roua/db';
import { ProjectEditor } from '@/components/ProjectEditor';

export default async function EditProject({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) notFound();
  return (
    <ProjectEditor
      project={{
        id: project.id,
        slugEn: project.slugEn,
        slugFr: project.slugFr,
        i18n: project.i18n as Record<string, { title: string; description: string; fullContent?: string; client?: string; role?: string }>,
        category: project.category,
        year: project.year,
        tags: project.tags,
        coverImage: project.coverImage,
        images: project.images,
        featured: project.featured,
        order: project.order,
        status: project.status,
        updatedAt: project.updatedAt.toISOString(),
      }}
    />
  );
}
