import { NextResponse } from 'next/server';
import { prisma } from '@roua/db';
import { requireSession } from '@/lib/session';
import { logActivity } from '@/lib/activity';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  const { id } = await params;
  const body = await req.json();
  const data: Record<string, unknown> = {};
  for (const k of [
    'slugEn',
    'slugAr',
    'i18n',
    'category',
    'tags',
    'coverImage',
    'images',
    'featured',
    'order',
  ]) {
    if (body[k] !== undefined) data[k] = body[k];
  }
  if (typeof body.year === 'number' || body.year === null) data.year = body.year;

  const existing = await prisma.project.findUnique({ where: { id } });
  let action: 'updated' | 'published' | 'unpublished' = 'updated';
  if (body.status === 'PUBLISHED' || body.status === 'DRAFT') {
    data.status = body.status;
    if (body.status === 'PUBLISHED') data.publishedAt = new Date();
    if (existing && existing.status !== body.status) {
      action = body.status === 'PUBLISHED' ? 'published' : 'unpublished';
    }
  }
  try {
    const project = await prisma.project.update({ where: { id }, data });
    await logActivity({
      userEmail: session.email,
      entityType: 'project',
      entityId: project.id,
      entityName: (project.i18n as Record<string, { title?: string }>).en?.title ?? project.slugEn,
      action,
    });
    return NextResponse.json({ ok: true, project });
  } catch (e) {
    const msg = (e as { code?: string })?.code === 'P2002' ? 'Slug already in use.' : 'Could not save.';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  const { id } = await params;
  const existing = await prisma.project.findUnique({ where: { id } });
  await prisma.project.delete({ where: { id } });
  if (existing) {
    await logActivity({
      userEmail: session.email,
      entityType: 'project',
      entityId: existing.id,
      entityName: (existing.i18n as Record<string, { title?: string }>).en?.title ?? existing.slugEn,
      action: 'deleted',
    });
  }
  return NextResponse.json({ ok: true });
}
