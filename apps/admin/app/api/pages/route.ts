import { NextResponse } from 'next/server';
import { prisma } from '@roua/db';
import { requireSession } from '@/lib/session';

export async function POST(req: Request) {
  await requireSession();
  const body = await req.json();
  const titleEn = String(body.titleEn ?? '').trim();
  const titleAr = String(body.titleAr ?? '').trim();
  const slugEn = String(body.slugEn ?? '').trim().toLowerCase();
  const slugAr = String(body.slugAr ?? '').trim().toLowerCase();

  if (!titleEn || !titleAr || !slugEn || !slugAr) {
    return NextResponse.json({ error: 'All fields required.' }, { status: 400 });
  }
  if (!/^[a-z0-9-]+$/.test(slugEn) || !/^[a-z0-9-]+$/.test(slugAr)) {
    return NextResponse.json({ error: 'Slugs must be lowercase letters, numbers, and dashes.' }, { status: 400 });
  }

  // The form may send `blocks` (the user's customized block list, possibly
  // derived from a template) or `templateId` (apply a stored template as-is).
  let blocks: unknown[] = [];
  if (Array.isArray(body.blocks)) {
    blocks = body.blocks;
  } else if (typeof body.templateId === 'string' && body.templateId) {
    const template = await prisma.pageTemplate.findUnique({ where: { id: body.templateId } });
    if (template) blocks = template.blocks as unknown[];
  }

  try {
    const page = await prisma.page.create({
      data: {
        slugEn,
        slugAr,
        i18n: {
          en: { title: titleEn, description: '', keywords: '' },
          ar: { title: titleAr, description: '', keywords: '' },
        },
        blocks: blocks as object,
        status: 'DRAFT',
      },
    });
    return NextResponse.json({ id: page.id });
  } catch (e) {
    const msg = (e as { code?: string })?.code === 'P2002'
      ? 'A page with that slug already exists.'
      : 'Could not create page.';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
