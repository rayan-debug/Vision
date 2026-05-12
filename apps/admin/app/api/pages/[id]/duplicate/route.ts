import { NextResponse } from 'next/server';
import { prisma } from '@roua/db';
import { requireSession } from '@/lib/session';

// POST /api/pages/:id/duplicate — clones a page (drafts the copy, suffixes
// the slugs with "-copy", strips isHome).
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireSession();
  const { id } = await params;
  const source = await prisma.page.findUnique({ where: { id } });
  if (!source) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const uniqueSlug = async (base: string) => {
    let candidate = `${base}-copy`;
    let n = 2;
    while (await prisma.page.findFirst({ where: { OR: [{ slugEn: candidate }, { slugAr: candidate }] } })) {
      candidate = `${base}-copy-${n++}`;
    }
    return candidate;
  };

  const slugEn = await uniqueSlug(source.slugEn);
  const slugAr = await uniqueSlug(source.slugAr);

  const i18n = source.i18n as Record<string, { title: string; description?: string; keywords?: string }>;
  const cloneI18n: typeof i18n = {};
  for (const [loc, meta] of Object.entries(i18n)) {
    cloneI18n[loc] = { ...meta, title: meta.title ? `${meta.title} (copy)` : '' };
  }

  const cloned = await prisma.page.create({
    data: {
      slugEn,
      slugAr,
      i18n: cloneI18n,
      blocks: source.blocks as object,
      ogImage: source.ogImage,
      status: 'DRAFT',
      isHome: false,
      showInNav: source.showInNav,
      navOrder: source.navOrder,
    },
  });
  return NextResponse.json({ id: cloned.id });
}
