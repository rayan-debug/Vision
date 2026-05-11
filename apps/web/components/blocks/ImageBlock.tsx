import type { ImageBlock as ImageBlockType, Locale } from '@roua/db';
import { t } from '@roua/db';

export function ImageBlock({ block, locale }: { block: ImageBlockType; locale: Locale }) {
  const width = block.width ?? 'wide';
  const sizing =
    width === 'full' ? 'w-full' : width === 'narrow' ? 'max-w-2xl mx-auto' : 'max-w-5xl mx-auto';
  const alt = t(block.alt, locale);
  const caption = block.caption ? t(block.caption, locale) : '';

  return (
    <section className="px-6 md:px-10 py-12">
      <figure className={sizing} data-reveal>
        <img src={block.src} alt={alt} className="w-full h-auto" loading="lazy" />
        {caption && (
          <figcaption className="mt-3 text-sm text-bone/50">{caption}</figcaption>
        )}
      </figure>
    </section>
  );
}
