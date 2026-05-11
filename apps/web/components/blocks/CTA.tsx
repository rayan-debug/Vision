import Link from 'next/link';
import type { CtaBlock, Locale } from '@roua/db';
import { t } from '@roua/db';

export function CTA({ block, locale }: { block: CtaBlock; locale: Locale }) {
  const heading = t(block.heading, locale);
  const sub = block.subheading ? t(block.subheading, locale) : '';
  const label = t(block.button.label, locale);

  return (
    <section className="px-6 md:px-10 py-24 md:py-32">
      <div className="border border-bone/15 p-10 md:p-20 text-center" data-reveal>
        <h2 className="font-display text-super text-bone mb-6">{heading}</h2>
        {sub && <p className="text-bone/60 max-w-xl mx-auto mb-10">{sub}</p>}
        <Link
          href={`/${locale}${block.button.href.startsWith('/') ? block.button.href : '/' + block.button.href}`}
          className="inline-flex items-center gap-3 px-8 py-4 bg-accent text-ink uppercase tracking-widest text-sm hover:bg-accent-light transition-colors"
        >
          {label} →
        </Link>
      </div>
    </section>
  );
}
