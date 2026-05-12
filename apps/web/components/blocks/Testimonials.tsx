import type { TestimonialsBlock, Locale } from '@roua/db';
import { prisma, t } from '@roua/db';

export async function Testimonials({ block, locale }: { block: TestimonialsBlock; locale: Locale }) {
  const items = await prisma.testimonial.findMany({
    where: block.featuredOnly ? { featured: true } : undefined,
    orderBy: [{ featured: 'desc' }, { order: 'asc' }, { createdAt: 'desc' }],
    take: block.limit ?? 6,
  });

  if (items.length === 0) return null;

  const heading = block.heading ? t(block.heading, locale) : '';
  const variant = block.variant ?? 'cards';

  return (
    <section className="px-6 md:px-10 py-24 md:py-32">
      {heading && (
        <h2 className="font-display text-display mb-12 md:mb-16 text-accent" data-reveal>
          {heading}
        </h2>
      )}

      {variant === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => {
            const meta = (item.i18n as Record<string, { quote: string; name: string; role: string }>)[locale]
              ?? (item.i18n as Record<string, { quote: string; name: string; role: string }>).en;
            return (
              <figure
                key={item.id}
                className="border border-bone/10 p-6 md:p-8 flex flex-col gap-4"
                data-reveal
              >
                {item.rating != null && (
                  <div className="text-accent text-sm tracking-widest">
                    {'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}
                  </div>
                )}
                <blockquote className="text-base md:text-lg leading-relaxed text-bone/90">
                  &ldquo;{meta?.quote}&rdquo;
                </blockquote>
                <figcaption className="flex items-center gap-3 mt-auto pt-2">
                  {item.avatarUrl && (
                    <img src={item.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
                  )}
                  <div>
                    <p className="text-sm font-medium">{meta?.name}</p>
                    {meta?.role && <p className="text-xs text-bone/50">{meta.role}</p>}
                  </div>
                </figcaption>
              </figure>
            );
          })}
        </div>
      ) : (
        <div className="max-w-3xl mx-auto space-y-16 md:space-y-24">
          {items.map((item) => {
            const meta = (item.i18n as Record<string, { quote: string; name: string; role: string }>)[locale]
              ?? (item.i18n as Record<string, { quote: string; name: string; role: string }>).en;
            return (
              <figure key={item.id} className="text-center" data-reveal>
                <blockquote className="font-display text-2xl md:text-4xl leading-tight">
                  &ldquo;{meta?.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-6 text-xs uppercase tracking-widest text-bone/60">
                  — {meta?.name}{meta?.role ? `, ${meta.role}` : ''}
                </figcaption>
              </figure>
            );
          })}
        </div>
      )}
    </section>
  );
}
