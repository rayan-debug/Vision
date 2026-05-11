import { NextResponse } from 'next/server';
import { prisma } from '@roua/db';
import { requireSession } from '@/lib/session';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireSession();
  const { id } = await params;
  const body = await req.json();

  const data: Record<string, unknown> = {};
  if (typeof body.slugEn === 'string') data.slugEn = body.slugEn.trim().toLowerCase();
  if (typeof body.slugFr === 'string') data.slugFr = body.slugFr.trim().toLowerCase();
  if (body.i18n) data.i18n = body.i18n;
  if (Array.isArray(body.blocks)) data.blocks = body.blocks;
  if (typeof body.ogImage === 'string') data.ogImage = body.ogImage;
  if (typeof body.showInNav === 'boolean') data.showInNav = body.showInNav;
  if (typeof body.navOrder === 'number') data.navOrder = body.navOrder;
  if (typeof body.isHome === 'boolean') data.isHome = body.isHome;

  if (body.status === 'PUBLISHED' || body.status === 'DRAFT') {
    data.status = body.status;
    if (body.status === 'PUBLISHED') data.publishedAt = new Date();
  }

  try {
    if (data.isHome === true) {
      // Only one home page at a time — clear the flag on any other.
      await prisma.page.updateMany({
        where: { id: { not: id }, isHome: true },
        data: { isHome: false },
      });
    }
    const page = await prisma.page.update({ where: { id }, data });
    return NextResponse.json({ ok: true, page });
  } catch (e) {
    const msg = (e as { code?: string })?.code === 'P2002'
      ? 'Slug already in use.'
      : 'Could not save.';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireSession();
  const { id } = await params;
  const page = await prisma.page.findUnique({ where: { id } });
  if (page?.isHome) {
    return NextResponse.json({ error: 'Cannot delete the home page.' }, { status: 400 });
  }
  await prisma.page.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
