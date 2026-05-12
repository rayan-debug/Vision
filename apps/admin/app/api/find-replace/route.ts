import { NextResponse } from 'next/server';
import { prisma } from '@roua/db';
import { requireSession } from '@/lib/session';
import { logActivity } from '@/lib/activity';

// Recursively walk an arbitrary JSON value and apply a string transform to
// every string leaf, returning a new value plus a per-string match count.
function transformStrings(
  value: unknown,
  fn: (s: string) => { next: string; matches: number },
): { value: unknown; matches: number } {
  if (typeof value === 'string') {
    const { next, matches } = fn(value);
    return { value: next, matches };
  }
  if (Array.isArray(value)) {
    let total = 0;
    const out = value.map((v) => {
      const { value: nv, matches } = transformStrings(v, fn);
      total += matches;
      return nv;
    });
    return { value: out, matches: total };
  }
  if (value && typeof value === 'object') {
    let total = 0;
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      const { value: nv, matches } = transformStrings(v, fn);
      total += matches;
      out[k] = nv;
    }
    return { value: out, matches: total };
  }
  return { value, matches: 0 };
}

type Scope = 'pages' | 'projects' | 'services' | 'testimonials' | 'templates' | 'settings';

export async function POST(req: Request) {
  const session = await requireSession();
  const body = await req.json();
  const search = String(body.search ?? '');
  const replace = String(body.replace ?? '');
  const dryRun = body.dryRun !== false;
  const caseSensitive = Boolean(body.caseSensitive);
  const scopes: Scope[] = Array.isArray(body.scopes) ? body.scopes : ['pages'];

  if (!search) {
    return NextResponse.json({ error: 'Search string is required.' }, { status: 400 });
  }

  // Build a global regex with `g` so .replace() can count occurrences.
  const flags = caseSensitive ? 'g' : 'gi';
  const re = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
  const transform = (s: string) => {
    const matches = (s.match(re) ?? []).length;
    return { next: matches > 0 ? s.replace(re, replace) : s, matches };
  };

  const previews: { scope: Scope; id: string; name: string; matches: number }[] = [];
  let totalMatches = 0;
  let appliedCount = 0;

  // Pages
  if (scopes.includes('pages')) {
    const items = await prisma.page.findMany();
    for (const p of items) {
      const { value: nextI18n, matches: m1 } = transformStrings(p.i18n, transform);
      const { value: nextBlocks, matches: m2 } = transformStrings(p.blocks, transform);
      const matches = m1 + m2;
      if (matches > 0) {
        totalMatches += matches;
        previews.push({
          scope: 'pages',
          id: p.id,
          name: (p.i18n as Record<string, { title?: string }>).en?.title ?? p.slugEn,
          matches,
        });
        if (!dryRun) {
          await prisma.page.update({
            where: { id: p.id },
            data: { i18n: nextI18n as object, blocks: nextBlocks as object },
          });
          appliedCount++;
        }
      }
    }
  }

  // Projects
  if (scopes.includes('projects')) {
    const items = await prisma.project.findMany();
    for (const p of items) {
      const { value: next, matches } = transformStrings(p.i18n, transform);
      if (matches > 0) {
        totalMatches += matches;
        previews.push({
          scope: 'projects',
          id: p.id,
          name: (p.i18n as Record<string, { title?: string }>).en?.title ?? p.slugEn,
          matches,
        });
        if (!dryRun) {
          await prisma.project.update({ where: { id: p.id }, data: { i18n: next as object } });
          appliedCount++;
        }
      }
    }
  }

  if (scopes.includes('services')) {
    const items = await prisma.service.findMany();
    for (const s of items) {
      const { value: next, matches } = transformStrings(s.i18n, transform);
      if (matches > 0) {
        totalMatches += matches;
        previews.push({
          scope: 'services',
          id: s.id,
          name: (s.i18n as Record<string, { title?: string }>).en?.title ?? s.id,
          matches,
        });
        if (!dryRun) {
          await prisma.service.update({ where: { id: s.id }, data: { i18n: next as object } });
          appliedCount++;
        }
      }
    }
  }

  if (scopes.includes('testimonials')) {
    const items = await prisma.testimonial.findMany();
    for (const t of items) {
      const { value: next, matches } = transformStrings(t.i18n, transform);
      if (matches > 0) {
        totalMatches += matches;
        previews.push({
          scope: 'testimonials',
          id: t.id,
          name: (t.i18n as Record<string, { name?: string }>).en?.name ?? t.id,
          matches,
        });
        if (!dryRun) {
          await prisma.testimonial.update({ where: { id: t.id }, data: { i18n: next as object } });
          appliedCount++;
        }
      }
    }
  }

  if (scopes.includes('templates')) {
    const items = await prisma.pageTemplate.findMany();
    for (const t of items) {
      const { value: next, matches } = transformStrings(t.blocks, transform);
      if (matches > 0) {
        totalMatches += matches;
        previews.push({
          scope: 'templates',
          id: t.id,
          name: t.name,
          matches,
        });
        if (!dryRun) {
          await prisma.pageTemplate.update({ where: { id: t.id }, data: { blocks: next as object } });
          appliedCount++;
        }
      }
    }
  }

  if (scopes.includes('settings')) {
    const item = await prisma.siteSettings.findUnique({ where: { id: 'singleton' } });
    if (item) {
      const { value: nextI18n, matches: m1 } = transformStrings(item.i18n, transform);
      const { value: nextFaqs, matches: m2 } = transformStrings(item.faqs, transform);
      const matches = m1 + m2;
      if (matches > 0) {
        totalMatches += matches;
        previews.push({ scope: 'settings', id: 'singleton', name: 'Site settings', matches });
        if (!dryRun) {
          await prisma.siteSettings.update({
            where: { id: 'singleton' },
            data: { i18n: nextI18n as object, faqs: nextFaqs as object },
          });
          appliedCount++;
        }
      }
    }
  }

  if (!dryRun && appliedCount > 0) {
    await logActivity({
      userEmail: session.email,
      entityType: 'settings',
      entityId: 'find-replace',
      entityName: `${search} → ${replace}`,
      action: 'find_replace',
      meta: { totalMatches, appliedCount, scopes },
    });
  }

  return NextResponse.json({
    dryRun,
    totalMatches,
    appliedCount,
    previews,
  });
}
