import { notFound } from 'next/navigation';
import { prisma } from '@roua/db';
import { TemplateEditor } from '@/components/TemplateEditor';

export default async function EditTemplate({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = await prisma.pageTemplate.findUnique({ where: { id } });
  if (!t) notFound();

  return (
    <TemplateEditor
      template={{
        id: t.id,
        key: t.key,
        name: t.name,
        description: t.description,
        preview: t.preview,
        blocks: (t.blocks as unknown as { type: string }[]) ?? [],
        isStarter: t.isStarter,
        order: t.order,
        updatedAt: t.updatedAt.toISOString(),
      }}
    />
  );
}
