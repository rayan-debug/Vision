// JSON-LD helpers for SEO + AEO. The schemas below are the ones that AI
// search engines (Google AI Overviews, Perplexity, ChatGPT browsing) actually
// surface in citations — Person, Organization, CreativeWork, FAQPage,
// BreadcrumbList.
import { createElement, Fragment } from 'react';
import type { Locale } from '@roua/db';

type Json = Record<string, unknown>;

export function personLd(opts: {
  name: string;
  jobTitle: string;
  url: string;
  description: string;
  sameAs: string[];
  image?: string;
}): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: opts.name,
    jobTitle: opts.jobTitle,
    url: opts.url,
    description: opts.description,
    sameAs: opts.sameAs,
    image: opts.image,
  };
}

export function organizationLd(opts: {
  name: string;
  url: string;
  logo?: string;
  description: string;
  sameAs: string[];
  email?: string;
  areaServed?: string;
}): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: opts.name,
    url: opts.url,
    logo: opts.logo,
    description: opts.description,
    sameAs: opts.sameAs,
    email: opts.email,
    areaServed: opts.areaServed,
  };
}

export function creativeWorkLd(opts: {
  name: string;
  description: string;
  url: string;
  image: string;
  creator: string;
  datePublished?: string;
  keywords?: string[];
}): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: opts.name,
    description: opts.description,
    url: opts.url,
    image: opts.image,
    creator: { '@type': 'Person', name: opts.creator },
    datePublished: opts.datePublished,
    keywords: opts.keywords?.join(', '),
  };
}

export function faqPageLd(items: { q: string; a: string }[]): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((it) => ({
      '@type': 'Question',
      name: it.q,
      acceptedAnswer: { '@type': 'Answer', text: it.a },
    })),
  };
}

export function breadcrumbLd(items: { name: string; url: string }[]): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}

// Component renders a list of <script type="application/ld+json"> tags.
// Uses createElement instead of JSX so this file can stay .ts.
export function JsonLd({ data }: { data: Json | Json[] }) {
  const json = Array.isArray(data) ? data : [data];
  return createElement(
    Fragment,
    null,
    ...json.map((d, i) =>
      createElement('script', {
        key: i,
        type: 'application/ld+json',
        dangerouslySetInnerHTML: { __html: JSON.stringify(d) },
      })
    )
  );
}

export function localeLabel(locale: Locale): 'en-US' | 'fr-FR' {
  return locale === 'fr' ? 'fr-FR' : 'en-US';
}
