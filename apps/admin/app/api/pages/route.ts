import { NextResponse } from 'next/server';
import { prisma } from '@roua/db';
import { requireSession } from '@/lib/session';

export async function POST(req: Request) {
  await requireSession();
  const body = await req.json();
  const titleEn = String(body.titleEn ?? '').trim();
  const titleFr = String(body.titleFr ?? '').trim();
  const slugEn = String(body.slugEn ?? '').trim().toLowerCase();
  const slugFr = String(body.slugFr ?? '').trim().toLowerCase();

  if (!titleEn || !titleFr || !slugEn || !slugFr) {
    return NextResponse.json({ error: 'All fields required.' }, { status: 400 });
  }
  if (!/^[a-z0-9-]+$/.test(slugEn) || !/^[a-z0-9-]+$/.test(slugFr)) {
    return NextResponse.json({ error: 'Slugs must be lowercase letters, numbers, and dashes.' }, { status: 400 });
  }

  try {
    const page = await prisma.page.create({
      data: {
        slugEn,
        slugFr,
        i18n: {
          en: { title: titleEn, description: '', keywords: '' },
          fr: { title: titleFr, description: '', keywords: '' },
        },
        blocks: [],
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
