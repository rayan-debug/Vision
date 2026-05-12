import type { EmbedBlock, Locale } from '@roua/db';
import { t } from '@roua/db';

export function Embed({ block, locale }: { block: EmbedBlock; locale: Locale }) {
  if (!block.html) return null;
  const caption = block.caption ? t(block.caption, locale) : '';
  return (
    <section className="px-6 md:px-10 py-12 md:py-20" data-reveal>
      <div
        className="prose-embed [&_iframe]:w-full [&_iframe]:aspect-video"
        dangerouslySetInnerHTML={{ __html: block.html }}
      />
      {caption && (
        <p className="mt-3 text-xs uppercase tracking-widest text-bone/50">{caption}</p>
      )}
    </section>
  );
}
