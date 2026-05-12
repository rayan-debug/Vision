import { NextResponse } from 'next/server';
import { prisma } from '@roua/db';
import { requireSession } from '@/lib/session';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireSession();
  const { id } = await params;
  const body = await req.json();
  const data: Record<string, unknown> = {};

  if (typeof body.name === 'string') data.name = body.name.trim();
  if (typeof body.description === 'string') data.description = body.description;
  if (typeof body.preview === 'string') data.preview = body.preview;
  if (typeof body.order === 'number') data.order = body.order;
  if (Array.isArray(body.blocks)) data.blocks = body.blocks;

  const t = await prisma.pageTemplate.update({ where: { id }, data });
  return NextResponse.json({ ok: true, template: t });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireSession();
  const { id } = await params;
  await prisma.pageTemplate.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
