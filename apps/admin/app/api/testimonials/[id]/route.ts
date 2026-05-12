import { NextResponse } from 'next/server';
import { prisma } from '@roua/db';
import { requireSession } from '@/lib/session';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireSession();
  const { id } = await params;
  const body = await req.json();

  const data: Record<string, unknown> = {};
  if (body.i18n !== undefined) data.i18n = body.i18n;
  if (body.avatarUrl !== undefined) data.avatarUrl = body.avatarUrl || null;
  if (typeof body.rating === 'number') data.rating = body.rating;
  else if (body.rating === null) data.rating = null;
  if (typeof body.order === 'number') data.order = body.order;
  if (typeof body.featured === 'boolean') data.featured = body.featured;

  const t = await prisma.testimonial.update({ where: { id }, data });
  return NextResponse.json({ ok: true, testimonial: t });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireSession();
  const { id } = await params;
  await prisma.testimonial.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
