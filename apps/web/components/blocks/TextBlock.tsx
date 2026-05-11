import type { TextBlock as TextBlockType, Locale } from '@roua/db';
import { t } from '@roua/db';

export function TextBlock({ block, locale }: { block: TextBlockType; locale: Locale }) {
  const heading = block.heading ? t(block.heading, locale) : '';
  const content = t(block.content, locale);
  const align = block.align ?? 'left';

  return (
    <section className="px-6 md:px-10 py-20 md:py-32">
      <div
        className={
          align === 'center' ? 'max-w-3xl mx-auto text-center' : 'max-w-3xl'
        }
      >
        {heading && (
          <h2
            className="font-display text-display mb-8 text-accent"
            data-reveal
          >
            {heading}
          </h2>
        )}
        <div
          className="text-lg md:text-xl leading-relaxed text-bone/80 whitespace-pre-line"
          data-reveal
        >
          {content}
        </div>
      </div>
    </section>
  );
}
