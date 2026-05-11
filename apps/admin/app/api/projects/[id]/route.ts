import { NextResponse } from 'next/server';
import { prisma } from '@roua/db';
import { requireSession } from '@/lib/session';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireSession();
  const { id } = await params;
  const body = await req.json();
  const data: Record<string, unknown> = {};
  for (const k of [
    'slugEn',
    'slugAr',
    'i18n',
    'category',
    'tags',
    'coverImage',
    'images',
    'featured',
    'order',
  ]) {
    if (body[k] !== undefined) data[k] = body[k];
  }
  if (typeof body.year === 'number' || body.year === null) data.year = body.year;
  if (body.status === 'PUBLISHED' || body.status === 'DRAFT') {
    data.status = body.status;
    if (body.status === 'PUBLISHED') data.publishedAt = new Date();
  }
  try {
    const project = await prisma.project.update({ where: { id }, data });
    return NextResponse.json({ ok: true, project });
  } catch (e) {
    const msg = (e as { code?: string })?.code === 'P2002' ? 'Slug already in use.' : 'Could not save.';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireSession();
  const { id } = await params;
  await prisma.project.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
