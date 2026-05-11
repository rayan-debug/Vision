import { NextResponse } from 'next/server';
import { prisma } from '@roua/db';
import { requireSession } from '@/lib/session';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireSession();
  const { id } = await params;
  const body = await req.json();
  const data: Record<string, unknown> = {};
  if (typeof body.icon === 'string') data.icon = body.icon;
  if (typeof body.order === 'number') data.order = body.order;
  if (body.i18n) data.i18n = body.i18n;
  const s = await prisma.service.update({ where: { id }, data });
  return NextResponse.json({ ok: true, service: s });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireSession();
  const { id } = await params;
  await prisma.service.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
