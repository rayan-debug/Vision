import { NextResponse } from 'next/server';
import { prisma } from '@roua/db';
import { requireSession } from '@/lib/session';

// GET — list all templates (used by the new-page form picker).
export async function GET() {
  await requireSession();
  const items = await prisma.pageTemplate.findMany({
    orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
  });
  return NextResponse.json({ items });
}

// POST — create a new (user-defined) template. Empty blocks; admin fills it in.
export async function POST(req: Request) {
  await requireSession();
  const body = await req.json().catch(() => ({}));
  const name = String(body.name ?? '').trim() || 'Untitled template';
  const description = String(body.description ?? '').trim();

  // Generate a unique key. Slugify the name; on collision, append numbers.
  const baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'template';
  let key = baseSlug;
  let n = 2;
  while (await prisma.pageTemplate.findUnique({ where: { key } })) {
    key = `${baseSlug}-${n++}`;
  }

  const count = await prisma.pageTemplate.count();
  const t = await prisma.pageTemplate.create({
    data: {
      key,
      name,
      description,
      blocks: [],
      isStarter: false,
      order: count,
    },
  });
  return NextResponse.json({ id: t.id, key: t.key });
}
