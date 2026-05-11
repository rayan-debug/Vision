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
  const category = String(body.category ?? '').trim();

  if (!titleEn || !titleFr || !slugEn || !slugFr) {
    return NextResponse.json({ error: 'All title and slug fields required.' }, { status: 400 });
  }
  try {
    const project = await prisma.project.create({
      data: {
        slugEn,
        slugFr,
        category: category || null,
        coverImage: '',
        i18n: {
          en: { title: titleEn, description: '', fullContent: '', client: '', role: '' },
          fr: { title: titleFr, description: '', fullContent: '', client: '', role: '' },
        },
        status: 'DRAFT',
      },
    });
    return NextResponse.json({ id: project.id });
  } catch (e) {
    const msg = (e as { code?: string })?.code === 'P2002'
      ? 'A project with that slug already exists.'
      : 'Could not create.';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
