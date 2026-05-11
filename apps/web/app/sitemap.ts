import type { MetadataRoute } from 'next';
import { prisma, LOCALES, type Locale } from '@roua/db';

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [pages, projects] = await Promise.all([
    prisma.page.findMany({ where: { status: 'PUBLISHED' } }),
    prisma.project.findMany({ where: { status: 'PUBLISHED' } }),
  ]);

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of LOCALES) {
    entries.push({
      url: `${BASE}/${locale}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
      alternates: { languages: altMap(LOCALES, (l) => `${BASE}/${l}`) },
    });
    entries.push({
      url: `${BASE}/${locale}/projects`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
      alternates: { languages: altMap(LOCALES, (l) => `${BASE}/${l}/projects`) },
    });
  }

  for (const p of pages) {
    if (p.isHome) continue;
    for (const locale of LOCALES) {
      const slug = locale === 'fr' ? p.slugFr : p.slugEn;
      entries.push({
        url: `${BASE}/${locale}/${slug}`,
        lastModified: p.updatedAt,
        changeFrequency: 'monthly',
        priority: 0.7,
        alternates: {
          languages: altMap(LOCALES, (l) =>
            `${BASE}/${l}/${l === 'fr' ? p.slugFr : p.slugEn}`
          ),
        },
      });
    }
  }

  for (const project of projects) {
    for (const locale of LOCALES) {
      const slug = locale === 'fr' ? project.slugFr : project.slugEn;
      entries.push({
        url: `${BASE}/${locale}/projects/${slug}`,
        lastModified: project.updatedAt,
        changeFrequency: 'monthly',
        priority: 0.8,
        alternates: {
          languages: altMap(LOCALES, (l) =>
            `${BASE}/${l}/projects/${l === 'fr' ? project.slugFr : project.slugEn}`
          ),
        },
      });
    }
  }

  return entries;
}

function altMap(locales: readonly Locale[], make: (l: Locale) => string) {
  const out: Record<string, string> = {};
  for (const l of locales) out[l === 'fr' ? 'fr-FR' : 'en-US'] = make(l);
  return out;
}
