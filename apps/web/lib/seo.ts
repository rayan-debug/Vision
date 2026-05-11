import type { Metadata } from 'next';
import type { Locale } from '@roua/db';

export function siteUrl(path = ''): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  return new URL(path, base).toString();
}

export function pageMetadata(opts: {
  title: string;
  description?: string;
  keywords?: string;
  path: string;
  locale: Locale;
  ogImage?: string;
  alternates?: Partial<Record<Locale, string>>;
}): Metadata {
  const url = siteUrl(opts.path);
  const languages: Record<string, string> = {};
  if (opts.alternates) {
    for (const [loc, p] of Object.entries(opts.alternates)) {
      if (p) languages[loc === 'fr' ? 'fr-FR' : 'en-US'] = siteUrl(p);
    }
  }
  return {
    title: opts.title,
    description: opts.description,
    keywords: opts.keywords,
    alternates: { canonical: url, languages },
    openGraph: {
      title: opts.title,
      description: opts.description,
      url,
      locale: opts.locale === 'fr' ? 'fr_FR' : 'en_US',
      images: opts.ogImage ? [{ url: opts.ogImage }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: opts.title,
      description: opts.description,
      images: opts.ogImage ? [opts.ogImage] : [],
    },
  };
}
