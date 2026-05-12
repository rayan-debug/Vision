import { NextResponse } from 'next/server';
import { prisma } from '@roua/db';
import { requireSession } from '@/lib/session';

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireSession();
  const { id } = await params;
  const source = await prisma.project.findUnique({ where: { id } });
  if (!source) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const uniqueSlug = async (base: string) => {
    let candidate = `${base}-copy`;
    let n = 2;
    while (await prisma.project.findFirst({ where: { OR: [{ slugEn: candidate }, { slugAr: candidate }] } })) {
      candidate = `${base}-copy-${n++}`;
    }
    return candidate;
  };

  const slugEn = await uniqueSlug(source.slugEn);
  const slugAr = await uniqueSlug(source.slugAr);

  const i18n = source.i18n as Record<string, { title: string; description: string; fullContent?: string; client?: string; role?: string }>;
  const cloneI18n: typeof i18n = {};
  for (const [loc, meta] of Object.entries(i18n)) {
    cloneI18n[loc] = { ...meta, title: meta.title ? `${meta.title} (copy)` : '' };
  }

  const cloned = await prisma.project.create({
    data: {
      slugEn,
      slugAr,
      i18n: cloneI18n,
      category: source.category,
      year: source.year,
      tags: source.tags,
      coverImage: source.coverImage,
      images: source.images,
      featured: false,
      order: source.order,
      status: 'DRAFT',
    },
  });
  return NextResponse.json({ id: cloned.id });
}
