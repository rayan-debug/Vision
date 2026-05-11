import Link from 'next/link';
import { prisma } from '@roua/db';

export default async function PagesIndex() {
  const pages = await prisma.page.findMany({ orderBy: [{ isHome: 'desc' }, { navOrder: 'asc' }] });

  return (
    <div className="p-8 md:p-12 max-w-6xl">
      <div className="flex items-center justify-between mb-10">
        <div>
          <p className="text-xs uppercase tracking-widest text-accent mb-2">Content</p>
          <h1 className="font-display text-5xl">Pages</h1>
        </div>
        <Link href="/pages/new" className="btn-accent">+ New page</Link>
      </div>

      <div className="border border-ink/10 bg-surface">
        <div className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-ink/10 text-xs uppercase tracking-widest text-muted">
          <div className="col-span-5">Title</div>
          <div className="col-span-3">Slug</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2 text-right">Updated</div>
        </div>
        {pages.map((p) => {
          const meta = (p.i18n as Record<string, { title: string }>).en;
          return (
            <Link
              key={p.id}
              href={`/pages/${p.id}`}
              className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-ink/10 last:border-b-0 hover:bg-surface-100 transition-colors"
            >
              <div className="col-span-5 flex items-center gap-2">
                {p.isHome && <span className="text-accent text-xs">★</span>}
                <span className="font-medium truncate">{meta?.title ?? p.slugEn}</span>
              </div>
              <div className="col-span-3 text-muted text-sm font-mono">/{p.slugEn}</div>
              <div className="col-span-2">
                <span
                  className={
                    p.status === 'PUBLISHED' ? 'tag border-accent text-accent' : 'tag text-muted'
                  }
                >
                  {p.status}
                </span>
              </div>
              <div className="col-span-2 text-right text-xs text-muted">
                {new Date(p.updatedAt).toLocaleDateString()}
              </div>
            </Link>
          );
        })}
        {pages.length === 0 && (
          <div className="px-4 py-12 text-center text-muted">
            No pages yet. <Link href="/pages/new" className="text-accent underline">Create the first one.</Link>
          </div>
        )}
      </div>
    </div>
  );
}
