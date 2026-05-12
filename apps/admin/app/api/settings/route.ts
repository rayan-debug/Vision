import { NextResponse } from 'next/server';
import { prisma } from '@roua/db';
import { requireSession } from '@/lib/session';

const NULLABLE_STRING_FIELDS = [
  'email',
  'phone',
  'location',
  'instagram',
  'behance',
  'dribbble',
  'linkedin',
  'twitter',
  'youtube',
  'tiktok',
  'pinterest',
  'logoUrl',
  'faviconUrl',
  'defaultOgImage',
  'gaId',
  'plausibleDomain',
  'customCss',
  'googleVerification',
  'bingVerification',
  'yandexVerification',
  'displayFont',
  'bodyFont',
  'monoFont',
] as const;

const VALID_LETTER_SPACING = new Set(['tight', 'normal', 'loose']);

export async function PATCH(req: Request) {
  await requireSession();
  const body = await req.json();
  const data: Record<string, unknown> = {};

  for (const k of NULLABLE_STRING_FIELDS) {
    if (body[k] !== undefined) data[k] = body[k] === '' ? null : body[k];
  }
  if (typeof body.primaryColor === 'string') data.primaryColor = body.primaryColor;
  if (typeof body.accentColor === 'string') data.accentColor = body.accentColor;
  if (typeof body.fontScale === 'number' && body.fontScale > 0 && body.fontScale < 5) {
    data.fontScale = body.fontScale;
  }
  if (typeof body.sectionSpacing === 'number' && body.sectionSpacing > 0 && body.sectionSpacing < 5) {
    data.sectionSpacing = body.sectionSpacing;
  }
  if (typeof body.letterSpacing === 'string' && VALID_LETTER_SPACING.has(body.letterSpacing)) {
    data.letterSpacing = body.letterSpacing;
  }
  if (body.i18n !== undefined) data.i18n = body.i18n;
  if (body.navLabels !== undefined) data.navLabels = body.navLabels;
  if (body.faqs !== undefined) data.faqs = body.faqs;

  if (typeof data.primaryColor === 'string' && !/^#[0-9a-f]{6}$/i.test(data.primaryColor)) {
    return NextResponse.json({ error: 'Primary color must be a 6-digit hex like #0a0a0a.' }, { status: 400 });
  }
  if (typeof data.accentColor === 'string' && !/^#[0-9a-f]{6}$/i.test(data.accentColor)) {
    return NextResponse.json({ error: 'Accent color must be a 6-digit hex like #ff5a1f.' }, { status: 400 });
  }

  await prisma.siteSettings.upsert({
    where: { id: 'singleton' },
    update: data,
    create: { id: 'singleton', i18n: body.i18n ?? { en: { siteName: '' }, ar: { siteName: '' } }, ...data },
  });
  return NextResponse.json({ ok: true });
}
