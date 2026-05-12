import { NextResponse } from 'next/server';
import { prisma } from '@roua/db';
import { requireSession } from '@/lib/session';

export async function GET() {
  await requireSession();
  const items = await prisma.media.findMany({
    where: { mimeType: { startsWith: 'image/' } },
    orderBy: { createdAt: 'desc' },
    take: 200,
  });
  return NextResponse.json({
    items: items.map((m) => ({ id: m.id, url: m.url, filename: m.filename, alt: m.alt })),
  });
}
