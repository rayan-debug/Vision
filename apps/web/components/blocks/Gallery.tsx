import type { GalleryBlock, Locale } from '@roua/db';
import { t } from '@roua/db';

export function Gallery({ block, locale }: { block: GalleryBlock; locale: Locale }) {
  const heading = block.heading ? t(block.heading, locale) : '';
  const cols = block.columns ?? 3;
  const gridCols = cols === 2 ? 'md:grid-cols-2' : cols === 4 ? 'md:grid-cols-4' : 'md:grid-cols-3';

  return (
    <section className="px-6 md:px-10 py-20">
      {heading && (
        <h2 className="font-display text-display mb-10 text-accent" data-reveal>
          {heading}
        </h2>
      )}
      <div className={`grid grid-cols-1 ${gridCols} gap-4 md:gap-6`}>
        {block.images.map((img, i) => (
          <figure key={i} className="overflow-hidden bg-ink-50" data-reveal>
            <img
              src={img.src}
              alt={t(img.alt, locale)}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              loading="lazy"
            />
          </figure>
        ))}
      </div>
    </section>
  );
}
