import type { TextBlock as TextBlockType, Locale } from '@roua/db';
import { t } from '@roua/db';
import { blockStyle } from './style';

export function TextBlock({ block, locale }: { block: TextBlockType; locale: Locale }) {
  const heading = block.heading ? t(block.heading, locale) : '';
  const content = t(block.content, locale);
  const align = block.style?.align ?? block.align ?? 'left';
  const { className, style } = blockStyle(block.style);

  return (
    <section
      className={`section-spacing ${block.style?.paddingX ? '' : 'px-6 md:px-10'} ${className}`}
      style={style}
    >
      <div
        className={
          align === 'center'
            ? 'max-w-3xl mx-auto text-center'
            : align === 'right'
            ? 'max-w-3xl ml-auto text-right'
            : 'max-w-3xl'
        }
      >
        {heading && (
          <h2 className="font-display text-display mb-8 text-accent" data-reveal>
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
