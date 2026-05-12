'use client';
import { useMemo } from 'react';
import clsx from 'clsx';
import { checkPageSeo, type Check } from '@/lib/seo-health';
import type { Block } from '@roua/db';

type PageLike = {
  slugEn: string;
  slugAr: string;
  i18n: Record<string, { title?: string; description?: string; keywords?: string }>;
  blocks: unknown[];
  ogImage?: string | null;
  noindex?: boolean;
  isHome?: boolean;
};

const LEVEL_CHIP: Record<Check['level'], string> = {
  pass: 'bg-emerald-100 text-emerald-800',
  warn: 'bg-amber-100 text-amber-800',
  fail: 'bg-red-100 text-red-800',
};

const LEVEL_DOT: Record<Check['level'], string> = {
  pass: 'bg-emerald-500',
  warn: 'bg-amber-500',
  fail: 'bg-red-500',
};

export function SeoHealth({ page }: { page: PageLike }) {
  const report = useMemo(() => checkPageSeo({
    ...page,
    blocks: page.blocks as Block[],
  }), [page]);

  const scoreColor =
    report.score >= 85 ? 'text-emerald-700' :
    report.score >= 60 ? 'text-amber-700' :
    'text-red-700';

  const ringColor =
    report.score >= 85 ? 'stroke-emerald-500' :
    report.score >= 60 ? 'stroke-amber-500' :
    'stroke-red-500';

  const counts = report.checks.reduce(
    (acc, c) => {
      acc[c.level] += 1;
      return acc;
    },
    { pass: 0, warn: 0, fail: 0 } as Record<Check['level'], number>,
  );

  // Stroke-dashoffset for the ring (circumference 2πr where r=20 → ~126).
  const circumference = 2 * Math.PI * 20;
  const dashOffset = circumference * (1 - report.score / 100);

  return (
    <section className="card">
      <div className="flex items-center gap-4 mb-4">
        <div className="relative w-14 h-14 shrink-0">
          <svg viewBox="0 0 48 48" className="-rotate-90 w-full h-full">
            <circle cx="24" cy="24" r="20" className="fill-none stroke-ink/10" strokeWidth="3" />
            <circle
              cx="24"
              cy="24"
              r="20"
              className={`fill-none ${ringColor} transition-all duration-500`}
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
            />
          </svg>
          <span className={`absolute inset-0 flex items-center justify-center text-sm font-display font-bold ${scoreColor}`}>
            {report.score}
          </span>
        </div>
        <div>
          <h3 className="font-display text-lg leading-none">SEO health</h3>
          <p className="text-[11px] text-muted mt-1">
            {counts.pass} good · {counts.warn} warning · {counts.fail} critical
          </p>
        </div>
      </div>

      <ul className="space-y-2">
        {report.checks.map((c) => (
          <li key={c.id} className="flex items-start gap-2 text-xs">
            <span className={clsx('mt-1.5 w-1.5 h-1.5 rounded-full shrink-0', LEVEL_DOT[c.level])} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium">{c.label}</span>
                <span className={clsx('text-[9px] uppercase tracking-widest px-1.5 py-0.5', LEVEL_CHIP[c.level])}>
                  {c.level === 'pass' ? 'good' : c.level}
                </span>
              </div>
              <p className="text-muted leading-snug mt-0.5">{c.message}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
