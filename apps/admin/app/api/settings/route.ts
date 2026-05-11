import { NextResponse } from 'next/server';
import { prisma } from '@roua/db';
import { requireSession } from '@/lib/session';

export async function PATCH(req: Request) {
  await requireSession();
  const body = await req.json();
  const data: Record<string, unknown> = {};
  for (const k of [
    'i18n',
    'email',
    'phone',
    'location',
    'instagram',
    'behance',
    'dribbble',
    'linkedin',
    'twitter',
    'logoUrl',
    'faviconUrl',
    'primaryColor',
    'accentColor',
    'faqs',
  ]) {
    if (body[k] !== undefined) data[k] = body[k];
  }
  await prisma.siteSettings.upsert({
    where: { id: 'singleton' },
    update: data,
    create: { id: 'singleton', i18n: body.i18n ?? { en: { siteName: '' }, fr: { siteName: '' } }, ...data },
  });
  return NextResponse.json({ ok: true });
}
