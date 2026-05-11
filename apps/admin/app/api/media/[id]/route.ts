import { NextResponse } from 'next/server';
import { prisma } from '@roua/db';
import { requireSession } from '@/lib/session';

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireSession();
  const { id } = await params;
  await prisma.media.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
