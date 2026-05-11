import type { MarqueeBlock, Locale } from '@roua/db';
import { t } from '@roua/db';

export function Marquee({ block, locale }: { block: MarqueeBlock; locale: Locale }) {
  const text = t(block.words, locale);
  const loop = Array(2).fill(text).join('   ◆   ');

  return (
    <section className="py-8 md:py-12 border-y border-bone/10 overflow-hidden bg-ink-100">
      <div className="flex whitespace-nowrap animate-marquee">
        <span className="font-display text-4xl md:text-6xl italic text-bone/90 px-6">{loop}</span>
        <span
          className="font-display text-4xl md:text-6xl italic text-bone/90 px-6"
          aria-hidden
        >
          {loop}
        </span>
      </div>
    </section>
  );
}
