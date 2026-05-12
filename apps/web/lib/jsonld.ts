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

// WebSite with a SearchAction tells Google to render the sitelinks searchbox
// in the SERP. Even when the site doesn't have its own search page yet, this
// is required for the Person/Organization knowledge panel to anchor to.
export function websiteLd(opts: {
  name: string;
  url: string;
  description: string;
  searchUrlTemplate?: string;
  inLanguage: string;
}): Json {
  const ld: Json = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: opts.name,
    url: opts.url,
    description: opts.description,
    inLanguage: opts.inLanguage,
  };
  if (opts.searchUrlTemplate) {
    ld.potentialAction = {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: opts.searchUrlTemplate,
      },
      'query-input': 'required name=search_term_string',
    };
  }
  return ld;
}

// ItemList is what AI engines and Google use to enumerate the projects index
// page. Each item references the project's own URL so detail-page schema can
// be picked up via the link.
export function itemListLd(opts: {
  name: string;
  url: string;
  items: { name: string; url: string; image?: string; description?: string }[];
}): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: opts.name,
    url: opts.url,
    numberOfItems: opts.items.length,
    itemListElement: opts.items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: it.url,
      name: it.name,
      ...(it.image ? { image: it.image } : {}),
      ...(it.description ? { description: it.description } : {}),
    })),
  };
}

// ProfilePage wraps the home page when its purpose is to introduce a person /
// studio. AI engines surface this as a citation anchor for "who is X" queries.
export function profilePageLd(opts: {
  name: string;
  url: string;
  description: string;
  mainEntityName: string;
  mainEntityUrl: string;
  inLanguage: string;
}): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    name: opts.name,
    url: opts.url,
    description: opts.description,
    inLanguage: opts.inLanguage,
    mainEntityOfPage: { '@type': 'Person', name: opts.mainEntityName, url: opts.mainEntityUrl },
  };
}

// Article — used on project detail and any long-form/blog page.
export function articleLd(opts: {
  headline: string;
  description: string;
  url: string;
  image: string;
  author: string;
  datePublished?: string;
  dateModified?: string;
  inLanguage: string;
  keywords?: string[];
  articleSection?: string;
}): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: opts.headline,
    description: opts.description,
    image: opts.image,
    url: opts.url,
    author: { '@type': 'Person', name: opts.author },
    publisher: { '@type': 'Person', name: opts.author },
    datePublished: opts.datePublished,
    dateModified: opts.dateModified ?? opts.datePublished,
    inLanguage: opts.inLanguage,
    articleSection: opts.articleSection,
    keywords: opts.keywords?.join(', '),
  };
}

// Speakable hints AI engines about which selectors hold the answer-worthy
// text. Used on FAQ-rich pages so voice/AI summaries pick the right chunks.
export function speakableLd(cssSelectors: string[]): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: cssSelectors,
    },
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

export function localeLabel(locale: Locale): 'en-US' | 'ar' {
  return locale === 'ar' ? 'ar' : 'en-US';
}
