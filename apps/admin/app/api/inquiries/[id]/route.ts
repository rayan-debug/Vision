import { NextResponse } from 'next/server';
import { prisma } from '@roua/db';
import { requireSession } from '@/lib/session';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireSession();
  const { id } = await params;
  const body = await req.json();

  const data: Record<string, unknown> = {};
  if (body.status === 'NEW' || body.status === 'READ' || body.status === 'ARCHIVED') {
    data.status = body.status;
  }

  const inquiry = await prisma.inquiry.update({ where: { id }, data });
  return NextResponse.json({ ok: true, inquiry });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireSession();
  const { id } = await params;
  await prisma.inquiry.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
