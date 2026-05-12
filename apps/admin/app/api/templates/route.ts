import { NextResponse } from 'next/server';
import { prisma } from '@roua/db';
import { requireSession } from '@/lib/session';
import { logActivity } from '@/lib/activity';

export async function GET() {
  await requireSession();
  const items = await prisma.pageTemplate.findMany({
    orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
  });
  return NextResponse.json({ items });
}

// Accepts optional `blocks` payload (e.g. from AI generation) so a template
// can be saved fully populated in one shot.
export async function POST(req: Request) {
  const session = await requireSession();
  const body = await req.json().catch(() => ({}));
  const name = String(body.name ?? '').trim() || 'Untitled template';
  const description = String(body.description ?? '').trim();
  const blocks = Array.isArray(body.blocks) ? body.blocks : [];

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
      blocks: blocks as object,
      isStarter: false,
      order: count,
    },
  });

  await logActivity({
    userEmail: session.email,
    entityType: 'template',
    entityId: t.id,
    entityName: t.name,
    action: blocks.length > 0 ? 'ai_generated' : 'created',
    meta: blocks.length > 0 ? { blockCount: blocks.length } : undefined,
  });

  return NextResponse.json({ id: t.id, key: t.key });
}
