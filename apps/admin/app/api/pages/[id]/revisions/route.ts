import { NextResponse } from 'next/server';
import { prisma } from '@roua/db';
import { requireSession } from '@/lib/session';

// GET /api/pages/:id/revisions — most recent 30, newest first.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireSession();
  const { id } = await params;
  const items = await prisma.pageRevision.findMany({
    where: { pageId: id },
    orderBy: { createdAt: 'desc' },
    take: 30,
  });
  return NextResponse.json({ items });
}
