import { NextResponse } from 'next/server';
import { prisma } from '@roua/db';
import { requireSession } from '@/lib/session';
import { logActivity } from '@/lib/activity';

const MAX_REVISIONS_PER_PAGE = 30;

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  const { id } = await params;
  const body = await req.json();

  // Snapshot the current row before applying changes. Skip when the only
  // change is metadata like nav order — keeps the history readable.
  const current = await prisma.page.findUnique({ where: { id } });
  if (!current) return NextResponse.json({ error: 'Page not found.' }, { status: 404 });

  const blocksChanged =
    Array.isArray(body.blocks) && JSON.stringify(body.blocks) !== JSON.stringify(current.blocks);
  const i18nChanged = body.i18n && JSON.stringify(body.i18n) !== JSON.stringify(current.i18n);
  const statusChanged =
    (body.status === 'PUBLISHED' || body.status === 'DRAFT') && body.status !== current.status;
  const shouldRevision = blocksChanged || i18nChanged || statusChanged;

  if (shouldRevision) {
    try {
      await prisma.pageRevision.create({
        data: {
          pageId: id,
          i18n: current.i18n as object,
          blocks: current.blocks as object,
          status: current.status,
          ogImage: current.ogImage,
          noindex: current.noindex,
          showInNav: current.showInNav,
          navOrder: current.navOrder,
          isHome: current.isHome,
          editorEmail: session.email,
        },
      });
      // Cap history to MAX_REVISIONS_PER_PAGE.
      const old = await prisma.pageRevision.findMany({
        where: { pageId: id },
        orderBy: { createdAt: 'desc' },
        skip: MAX_REVISIONS_PER_PAGE,
        select: { id: true },
      });
      if (old.length > 0) {
        await prisma.pageRevision.deleteMany({ where: { id: { in: old.map((r) => r.id) } } });
      }
    } catch {
      // Swallow — revision write must not block the save.
    }
  }

  const data: Record<string, unknown> = {};
  if (typeof body.slugEn === 'string') data.slugEn = body.slugEn.trim().toLowerCase();
  if (typeof body.slugAr === 'string') data.slugAr = body.slugAr.trim().toLowerCase();
  if (body.i18n) data.i18n = body.i18n;
  if (Array.isArray(body.blocks)) data.blocks = body.blocks;
  if (typeof body.ogImage === 'string') data.ogImage = body.ogImage;
  if (typeof body.showInNav === 'boolean') data.showInNav = body.showInNav;
  if (typeof body.navOrder === 'number') data.navOrder = body.navOrder;
  if (typeof body.isHome === 'boolean') data.isHome = body.isHome;
  if (typeof body.noindex === 'boolean') data.noindex = body.noindex;

  if (body.status === 'PUBLISHED' || body.status === 'DRAFT') {
    data.status = body.status;
    if (body.status === 'PUBLISHED') data.publishedAt = new Date();
  }

  try {
    if (data.isHome === true) {
      await prisma.page.updateMany({
        where: { id: { not: id }, isHome: true },
        data: { isHome: false },
      });
    }
    const page = await prisma.page.update({ where: { id }, data });

    const action = statusChanged
      ? body.status === 'PUBLISHED' ? 'published' : 'unpublished'
      : 'updated';
    await logActivity({
      userEmail: session.email,
      entityType: 'page',
      entityId: page.id,
      entityName: (page.i18n as Record<string, { title?: string }>).en?.title ?? page.slugEn,
      action,
    });

    return NextResponse.json({ ok: true, page });
  } catch (e) {
    const msg = (e as { code?: string })?.code === 'P2002'
      ? 'Slug already in use.'
      : 'Could not save.';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  const { id } = await params;
  const page = await prisma.page.findUnique({ where: { id } });
  if (page?.isHome) {
    return NextResponse.json({ error: 'Cannot delete the home page.' }, { status: 400 });
  }
  await prisma.page.delete({ where: { id } });
  if (page) {
    await logActivity({
      userEmail: session.email,
      entityType: 'page',
      entityId: page.id,
      entityName: (page.i18n as Record<string, { title?: string }>).en?.title ?? page.slugEn,
      action: 'deleted',
    });
  }
  return NextResponse.json({ ok: true });
}
