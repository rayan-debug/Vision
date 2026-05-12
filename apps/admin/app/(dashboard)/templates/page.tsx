import Link from 'next/link';
import { prisma } from '@roua/db';
import { TemplatesList } from '@/components/TemplatesList';

export const dynamic = 'force-dynamic';

export default async function TemplatesIndex() {
  const templates = await prisma.pageTemplate.findMany({
    orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
  });

  return (
    <div className="p-4 md:p-8 lg:p-12 max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-accent mb-2">Content</p>
          <h1 className="font-display text-3xl md:text-5xl">Page templates</h1>
        </div>
        <Link href="/templates/new" className="btn-accent">+ New template</Link>
      </div>
      <p className="text-sm text-muted mb-8 md:mb-10 max-w-2xl">
        Saved page layouts. Pick one when creating a new page to skip the blank canvas. Edit any template here and every new page made from it inherits the change. The 6 starter templates are pre-seeded and fully editable.
      </p>

      <TemplatesList
        initial={templates.map((t) => ({
          id: t.id,
          key: t.key,
          name: t.name,
          description: t.description,
          preview: t.preview,
          blocksCount: Array.isArray(t.blocks) ? (t.blocks as unknown[]).length : 0,
          isStarter: t.isStarter,
          order: t.order,
        }))}
      />
    </div>
  );
}
