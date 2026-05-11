import Link from 'next/link';
import type { HeroBlock, Locale } from '@roua/db';
import { t } from '@roua/db';

export function Hero({ block, locale }: { block: HeroBlock; locale: Locale }) {
  const heading = t(block.heading, locale);
  const sub = block.subheading ? t(block.subheading, locale) : '';
  const eyebrow = block.eyebrow ? t(block.eyebrow, locale) : '';
  const variant = block.variant ?? 'fullscreen';

  if (variant === 'minimal') {
    return (
      <section className="px-6 md:px-10 pt-40 pb-16 md:pb-24">
        <div className="max-w-6xl">
          {eyebrow && (
            <p className="text-xs uppercase tracking-[0.3em] text-accent mb-6">{eyebrow}</p>
          )}
          <h1 className="font-display text-super text-bone" data-reveal>
            {heading}
          </h1>
          {sub && (
            <p className="mt-6 max-w-2xl text-lg md:text-xl text-bone/70" data-reveal>
              {sub}
            </p>
          )}
        </div>
      </section>
    );
  }

  // Fullscreen and split share the dramatic large-type treatment from the
  // reference PDF: huge serif with accent color on key word, photo behind.
  const words = heading.split(' ');
  const first = words[0];
  const rest = words.slice(1).join(' ');

  return (
    <section className="relative min-h-screen flex flex-col justify-center px-6 md:px-10 pt-32 pb-12 overflow-hidden">
      {block.image && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{ backgroundImage: `url(${block.image})` }}
          aria-hidden
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-ink/60 via-ink/40 to-ink" aria-hidden />

      <div className="relative">
        {eyebrow && (
          <p className="text-xs md:text-sm uppercase tracking-[0.3em] text-accent mb-8 md:mb-12">
            ◆ {eyebrow}
          </p>
        )}

        <h1 className="font-display text-mega leading-[0.85] tracking-tight" data-reveal>
          <span className="block text-accent italic">{first}</span>
          {rest && <span className="block text-bone text-right md:pl-[20%]">{rest}</span>}
        </h1>

        {sub && (
          <p
            className="mt-10 md:mt-16 max-w-xl text-base md:text-lg text-bone/70 leading-relaxed"
            data-reveal
          >
            {sub}
          </p>
        )}

        {block.cta && (
          <div className="mt-12" data-reveal>
            <Link
              href={`/${locale}${block.cta.href.startsWith('/') ? '' : '/'}${block.cta.href}`.replace(
                /\/\//g,
                '/'
              )}
              className="group inline-flex items-center gap-3 px-7 py-4 bg-accent text-ink text-sm uppercase tracking-widest hover:bg-accent-light transition-colors"
            >
              {t(block.cta.label, locale)}
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
        )}
      </div>

      <div className="absolute bottom-8 right-6 md:right-10 text-xs uppercase tracking-widest text-bone/40">
        scroll ↓
      </div>
    </section>
  );
}
