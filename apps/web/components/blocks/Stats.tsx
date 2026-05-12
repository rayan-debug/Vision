import type { StatsBlock, Locale } from '@roua/db';
import { t } from '@roua/db';

export function Stats({ block, locale }: { block: StatsBlock; locale: Locale }) {
  if (block.items.length === 0) return null;
  const heading = block.heading ? t(block.heading, locale) : '';
  return (
    <section className="px-6 md:px-10 py-24 md:py-32 border-y border-bone/10">
      {heading && (
        <h2 className="font-display text-display mb-12 text-accent" data-reveal>
          {heading}
        </h2>
      )}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
        {block.items.map((item, i) => (
          <div key={i} data-reveal>
            <p className="font-display text-super leading-none">{item.value}</p>
            <p className="text-xs uppercase tracking-widest text-bone/60 mt-3">
              {t(item.label, locale)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
