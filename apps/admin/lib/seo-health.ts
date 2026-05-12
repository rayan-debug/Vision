import type { Block, Locale } from '@roua/db';

export type CheckLevel = 'pass' | 'warn' | 'fail';

export type Check = {
  id: string;
  label: string;
  level: CheckLevel;
  message: string;
};

export type HealthReport = {
  score: number; // 0–100
  checks: Check[];
};

const LOCALES_TO_CHECK: Locale[] = ['en', 'ar'];

type PageLike = {
  slugEn: string;
  slugAr: string;
  i18n: Record<string, { title?: string; description?: string; keywords?: string }>;
  blocks: unknown[];
  ogImage?: string | null;
  noindex?: boolean;
  isHome?: boolean;
};

// Compute an SEO health score for a page. Returns 0–100 plus a per-check
// breakdown the editor shows in the SEO sidebar. The scoring rewards filling
// the things AI engines and Google's algorithm actually rank: title + meta
// description in every locale, OG image, alt text coverage, slug quality, and
// reasonable content density. Failures hurt more than warnings.
export function checkPageSeo(page: PageLike): HealthReport {
  const checks: Check[] = [];

  // ── Title ────────────────────────────────────────────────────────────
  for (const loc of LOCALES_TO_CHECK) {
    const title = (page.i18n[loc]?.title ?? '').trim();
    if (!title) {
      checks.push({
        id: `title-${loc}`,
        label: `Meta title (${loc.toUpperCase()})`,
        level: 'fail',
        message: 'Missing — search engines and AI engines need a title to cite the page.',
      });
    } else if (title.length < 20) {
      checks.push({
        id: `title-${loc}`,
        label: `Meta title (${loc.toUpperCase()})`,
        level: 'warn',
        message: `Only ${title.length} chars — aim for 30–60 to fill the SERP line.`,
      });
    } else if (title.length > 65) {
      checks.push({
        id: `title-${loc}`,
        label: `Meta title (${loc.toUpperCase()})`,
        level: 'warn',
        message: `${title.length} chars — Google may truncate after ~60.`,
      });
    } else {
      checks.push({
        id: `title-${loc}`,
        label: `Meta title (${loc.toUpperCase()})`,
        level: 'pass',
        message: `${title.length} chars — good length.`,
      });
    }
  }

  // ── Meta description ─────────────────────────────────────────────────
  for (const loc of LOCALES_TO_CHECK) {
    const desc = (page.i18n[loc]?.description ?? '').trim();
    if (!desc) {
      checks.push({
        id: `desc-${loc}`,
        label: `Meta description (${loc.toUpperCase()})`,
        level: 'fail',
        message: 'Missing — AI engines pull this verbatim when summarising the page.',
      });
    } else if (desc.length < 70) {
      checks.push({
        id: `desc-${loc}`,
        label: `Meta description (${loc.toUpperCase()})`,
        level: 'warn',
        message: `${desc.length} chars — under 70 is thin. Aim for 120–160.`,
      });
    } else if (desc.length > 170) {
      checks.push({
        id: `desc-${loc}`,
        label: `Meta description (${loc.toUpperCase()})`,
        level: 'warn',
        message: `${desc.length} chars — Google truncates after ~160.`,
      });
    } else {
      checks.push({
        id: `desc-${loc}`,
        label: `Meta description (${loc.toUpperCase()})`,
        level: 'pass',
        message: `${desc.length} chars — good length.`,
      });
    }
  }

  // ── OG image ──────────────────────────────────────────────────────────
  if (page.ogImage) {
    checks.push({
      id: 'og',
      label: 'Social share image',
      level: 'pass',
      message: 'Page has its own OG image.',
    });
  } else {
    checks.push({
      id: 'og',
      label: 'Social share image',
      level: 'warn',
      message: 'No page-specific OG image. The site default will be used. Use a 1200×630 image for best previews.',
    });
  }

  // ── Slug ─────────────────────────────────────────────────────────────
  const slugRx = /^[a-z0-9]+(-[a-z0-9]+)*$/;
  if (!slugRx.test(page.slugEn)) {
    checks.push({
      id: 'slug-en',
      label: 'Slug (EN)',
      level: 'fail',
      message: 'Must be lowercase letters, numbers, and dashes.',
    });
  } else if (page.slugEn.length > 60) {
    checks.push({
      id: 'slug-en',
      label: 'Slug (EN)',
      level: 'warn',
      message: 'Long slug — keep under 60 chars for cleaner URLs.',
    });
  } else {
    checks.push({
      id: 'slug-en',
      label: 'Slug (EN)',
      level: 'pass',
      message: page.slugEn,
    });
  }

  // ── noindex ──────────────────────────────────────────────────────────
  if (page.noindex) {
    checks.push({
      id: 'noindex',
      label: 'Search visibility',
      level: 'warn',
      message: 'noindex is on — this page won\'t appear in Google, Bing, or AI engines.',
    });
  } else {
    checks.push({
      id: 'noindex',
      label: 'Search visibility',
      level: 'pass',
      message: 'Page is open to search engines.',
    });
  }

  // ── Image alt-text coverage ──────────────────────────────────────────
  const imageBlocks = (page.blocks as Block[]).filter((b): b is Extract<Block, { type: 'image' }> => b.type === 'image');
  const galleryBlocks = (page.blocks as Block[]).filter((b): b is Extract<Block, { type: 'gallery' }> => b.type === 'gallery');
  const heroBlocks = (page.blocks as Block[]).filter((b): b is Extract<Block, { type: 'hero' }> => b.type === 'hero');

  let totalImages = 0;
  let missingAlt = 0;
  for (const b of imageBlocks) {
    totalImages += 1;
    const alt = (b.alt?.en ?? '').trim() || (b.alt?.ar ?? '').trim();
    if (!alt) missingAlt += 1;
  }
  for (const b of galleryBlocks) {
    for (const img of b.images ?? []) {
      totalImages += 1;
      const alt = (img.alt?.en ?? '').trim() || (img.alt?.ar ?? '').trim();
      if (!alt) missingAlt += 1;
    }
  }
  if (totalImages > 0) {
    if (missingAlt === 0) {
      checks.push({
        id: 'alt',
        label: 'Image alt text',
        level: 'pass',
        message: `All ${totalImages} images have alt text.`,
      });
    } else {
      checks.push({
        id: 'alt',
        label: 'Image alt text',
        level: missingAlt > totalImages / 2 ? 'fail' : 'warn',
        message: `${missingAlt} of ${totalImages} images missing alt text — hurts accessibility & image search.`,
      });
    }
  }

  // ── Hero quality ──────────────────────────────────────────────────────
  if (page.isHome) {
    const hero = heroBlocks[0];
    if (!hero) {
      checks.push({
        id: 'home-hero',
        label: 'Home hero',
        level: 'warn',
        message: 'No hero block on the home page — first impression matters.',
      });
    } else {
      const headingEn = (hero.heading?.en ?? '').trim();
      const headingAr = (hero.heading?.ar ?? '').trim();
      if (!headingEn || !headingAr) {
        checks.push({
          id: 'home-hero',
          label: 'Home hero',
          level: 'warn',
          message: 'Hero is missing a heading in one locale.',
        });
      } else {
        checks.push({
          id: 'home-hero',
          label: 'Home hero',
          level: 'pass',
          message: 'Hero headline set in both locales.',
        });
      }
    }
  }

  // ── Content density ──────────────────────────────────────────────────
  const totalBlocks = (page.blocks as Block[]).length;
  if (totalBlocks === 0) {
    checks.push({
      id: 'content',
      label: 'Page content',
      level: 'fail',
      message: 'No blocks on the page — nothing to crawl.',
    });
  } else if (totalBlocks < 3) {
    checks.push({
      id: 'content',
      label: 'Page content',
      level: 'warn',
      message: `Only ${totalBlocks} block${totalBlocks === 1 ? '' : 's'} — thin content ranks poorly.`,
    });
  } else {
    checks.push({
      id: 'content',
      label: 'Page content',
      level: 'pass',
      message: `${totalBlocks} blocks.`,
    });
  }

  // ── CTA presence ──────────────────────────────────────────────────────
  const hasCta = (page.blocks as Block[]).some((b) => b.type === 'cta' || b.type === 'contact');
  if (!hasCta && totalBlocks > 0) {
    checks.push({
      id: 'cta',
      label: 'Call to action',
      level: 'warn',
      message: 'No CTA or contact block — visitors have nowhere to go.',
    });
  } else if (hasCta) {
    checks.push({
      id: 'cta',
      label: 'Call to action',
      level: 'pass',
      message: 'Page has at least one CTA.',
    });
  }

  // ── Score ─────────────────────────────────────────────────────────────
  const weights: Record<CheckLevel, number> = { pass: 1, warn: 0.5, fail: 0 };
  const score = checks.length === 0
    ? 100
    : Math.round((checks.reduce((sum, c) => sum + weights[c.level], 0) / checks.length) * 100);

  return { score, checks };
}
