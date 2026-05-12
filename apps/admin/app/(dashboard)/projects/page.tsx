import Link from 'next/link';
import { prisma } from '@roua/db';
import { ProjectsList } from '@/components/ProjectsList';

export const dynamic = 'force-dynamic';

export default async function ProjectsIndex() {
  const projects = await prisma.project.findMany({
    orderBy: [{ featured: 'desc' }, { order: 'asc' }, { createdAt: 'desc' }],
  });

  const categories = Array.from(
    new Set(projects.map((p) => p.category).filter((c): c is string => !!c)),
  ).sort();

  return (
    <div className="p-8 md:p-12 max-w-6xl">
      <div className="flex items-center justify-between mb-10">
        <div>
          <p className="text-xs uppercase tracking-widest text-accent mb-2">Content</p>
          <h1 className="font-display text-5xl">Projects</h1>
        </div>
        <Link href="/projects/new" className="btn-accent">+ New project</Link>
      </div>

      <ProjectsList
        initial={projects.map((p) => {
          const meta = (p.i18n as Record<string, { title: string; description: string }>).en;
          return {
            id: p.id,
            slugEn: p.slugEn,
            title: meta?.title ?? '',
            description: meta?.description ?? '',
            coverImage: p.coverImage,
            category: p.category,
            year: p.year,
            featured: p.featured,
            status: p.status,
            updatedAt: p.updatedAt.toISOString(),
          };
        })}
        categories={categories}
      />
    </div>
  );
}
