import { prisma, t, type Locale } from '@roua/db';

// /llms.txt — an emerging convention (llmstxt.org) that lets AI crawlers
// discover a structured, human-written summary of the site without having to
// crawl rendered HTML. Engines like Perplexity, ChatGPT browsing, and Claude
// look for this file alongside robots.txt.
//
// We emit a markdown document with:
//   • site identity + tagline + bio (per primary locale)
//   • a links table to every published page and project
//   • contact and social
//   • FAQs from settings (great answer fuel)
//
// Re-fetched on every request so admin edits are visible immediately.

export const dynamic = 'force-dynamic';

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
const LOCALE: Locale = 'en';

export async function GET() {
  const [settings, pages, projects] = await Promise.all([
    prisma.siteSettings.findUnique({ where: { id: 'singleton' } }),
    prisma.page.findMany({ where: { status: 'PUBLISHED' }, orderBy: { navOrder: 'asc' } }),
    prisma.project.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: [{ featured: 'desc' }, { order: 'asc' }, { year: 'desc' }],
    }),
  ]);

  const name = settings ? t(settings.i18n, LOCALE) : 'The Vision';
  const tagline =
    (settings?.i18n as Record<string, { tagline?: string }> | undefined)?.[LOCALE]?.tagline ?? '';
  const bio =
    (settings?.i18n as Record<string, { bio?: string }> | undefined)?.[LOCALE]?.bio ?? '';

  const socials: [string, string][] = [
    ['Instagram', settings?.instagram ?? ''],
    ['Behance', settings?.behance ?? ''],
    ['Dribbble', settings?.dribbble ?? ''],
    ['LinkedIn', settings?.linkedin ?? ''],
    ['Twitter / X', settings?.twitter ?? ''],
    ['YouTube', settings?.youtube ?? ''],
    ['TikTok', settings?.tiktok ?? ''],
    ['Pinterest', settings?.pinterest ?? ''],
  ].filter(([, url]) => Boolean(url)) as [string, string][];

  const faqs = (settings?.faqs as { q: Record<string, string>; a: Record<string, string> }[] | null) ?? [];

  const lines: string[] = [];
  lines.push(`# ${name}`);
  if (tagline) lines.push('', `> ${tagline}`);
  lines.push('');
  if (bio) {
    lines.push(bio.replace(/\n+/g, ' '), '');
  }

  lines.push('## Pages');
  lines.push('');
  for (const p of pages) {
    const meta = (p.i18n as Record<string, { title?: string; description?: string }>)[LOCALE];
    const title = meta?.title ?? p.slugEn;
    const description = meta?.description ?? '';
    const path = p.isHome ? `/${LOCALE}` : `/${LOCALE}/${p.slugEn}`;
    lines.push(`- [${title}](${BASE}${path})${description ? `: ${description}` : ''}`);
  }

  if (projects.length > 0) {
    lines.push('', '## Projects');
    lines.push('');
    for (const project of projects) {
      const meta = (project.i18n as Record<string, { title?: string; description?: string }>)[LOCALE];
      const title = meta?.title ?? project.slugEn;
      const summary = meta?.description ?? '';
      const tagSuffix = project.category ? ` (${project.category}, ${project.year ?? 'undated'})` : '';
      lines.push(
        `- [${title}](${BASE}/${LOCALE}/projects/${project.slugEn})${tagSuffix}${summary ? ` — ${summary}` : ''}`,
      );
    }
  }

  if (socials.length > 0 || settings?.email) {
    lines.push('', '## Contact');
    lines.push('');
    if (settings?.email) lines.push(`- Email: ${settings.email}`);
    if (settings?.location) lines.push(`- Based in: ${settings.location}`);
    for (const [label, url] of socials) {
      lines.push(`- ${label}: ${url}`);
    }
  }

  if (faqs.length > 0) {
    lines.push('', '## FAQs');
    lines.push('');
    for (const item of faqs) {
      const q = item.q?.[LOCALE] ?? item.q?.en ?? '';
      const a = item.a?.[LOCALE] ?? item.a?.en ?? '';
      if (!q || !a) continue;
      lines.push(`### ${q}`, '', a, '');
    }
  }

  lines.push('', '## Site map');
  lines.push('', `- Sitemap (XML): ${BASE}/sitemap.xml`);
  lines.push(`- Robots: ${BASE}/robots.txt`);
  lines.push(`- Languages: en, ar`);

  const body = lines.join('\n') + '\n';

  return new Response(body, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=300',
    },
  });
}
