import Link from 'next/link';
import { prisma, type Block } from '@roua/db';
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
      </div>
      <p className="text-sm text-muted mb-6 max-w-2xl">
        Saved page layouts. Pick one when creating a new page to skip the blank canvas. Edit any template here and every new page made from it inherits the change. Hover a card for a quick block outline; click <strong>✦ AI generate template</strong> to draft a new one from a brief.
      </p>

      <TemplatesList
        initial={templates.map((t) => ({
          id: t.id,
          key: t.key,
          name: t.name,
          description: t.description,
          preview: t.preview,
          blocks: (t.blocks as unknown as Block[]) ?? [],
          isStarter: t.isStarter,
          order: t.order,
        }))}
      />
    </div>
  );
}
