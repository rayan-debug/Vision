import Link from 'next/link';
import { prisma } from '@roua/db';

export default async function ProjectsIndex() {
  const projects = await prisma.project.findMany({
    orderBy: [{ featured: 'desc' }, { order: 'asc' }, { createdAt: 'desc' }],
  });

  return (
    <div className="p-8 md:p-12 max-w-6xl">
      <div className="flex items-center justify-between mb-10">
        <div>
          <p className="text-xs uppercase tracking-widest text-accent mb-2">Content</p>
          <h1 className="font-display text-5xl">Projects</h1>
        </div>
        <Link href="/projects/new" className="btn-accent">+ New project</Link>
      </div>

      {projects.length === 0 ? (
        <p className="text-muted">
          No projects yet. <Link href="/projects/new" className="underline text-accent">Add the first.</Link>
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p) => {
            const meta = (p.i18n as Record<string, { title: string; description: string }>).en;
            return (
              <Link
                key={p.id}
                href={`/projects/${p.id}`}
                className="group border border-ink/10 bg-surface hover:border-accent transition-colors"
              >
                <div className="aspect-[4/3] overflow-hidden bg-surface-100">
                  {p.coverImage && (
                    <img
                      src={p.coverImage}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h2 className="font-display text-lg leading-tight group-hover:text-accent transition-colors">
                      {meta?.title ?? p.slugEn}
                    </h2>
                    {p.featured && <span className="text-accent text-xs">★</span>}
                  </div>
                  <p className="text-xs text-muted">
                    {p.category ?? '—'} · {p.year ?? '—'}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <span
                      className={
                        p.status === 'PUBLISHED' ? 'tag border-accent text-accent' : 'tag text-muted'
                      }
                    >
                      {p.status}
                    </span>
                    <span className="text-xs text-muted font-mono">/{p.slugEn}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
