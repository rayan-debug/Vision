import { NextResponse } from 'next/server';
import { prisma } from '@roua/db';
import { requireSession } from '@/lib/session';

export async function GET(req: Request) {
  await requireSession();
  const url = new URL(req.url);
  const kind = url.searchParams.get('kind'); // 'image' | 'video' | null (= image, default)
  const prefix = kind === 'video' ? 'video/' : 'image/';
  const items = await prisma.media.findMany({
    where: { mimeType: { startsWith: prefix } },
    orderBy: { createdAt: 'desc' },
    take: 200,
  });
  return NextResponse.json({
    items: items.map((m) => ({
      id: m.id,
      url: m.url,
      filename: m.filename,
      alt: m.alt,
      mimeType: m.mimeType,
    })),
  });
}
