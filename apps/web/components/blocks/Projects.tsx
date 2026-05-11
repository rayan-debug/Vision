import Link from 'next/link';
import type { ProjectsBlock, Locale } from '@roua/db';
import { prisma, t } from '@roua/db';

export async function Projects({
  block,
  locale,
}: {
  block: ProjectsBlock;
  locale: Locale;
}) {
  const projects = await prisma.project.findMany({
    where: {
      status: 'PUBLISHED',
      ...(block.featuredOnly ? { featured: true } : {}),
      ...(block.category ? { category: block.category } : {}),
    },
    orderBy: [{ featured: 'desc' }, { order: 'asc' }, { createdAt: 'desc' }],
    take: block.limit ?? 12,
  });

  const heading = block.heading ? t(block.heading, locale) : '';

  return (
    <section className="px-6 md:px-10 py-24 md:py-32">
      {heading && (
        <div className="flex items-baseline justify-between mb-12 md:mb-16">
          <h2 className="font-display text-display text-accent" data-reveal>
            {heading}
          </h2>
          <Link
            href={`/${locale}/projects`}
            className="text-xs uppercase tracking-widest link-underline"
          >
            {locale === 'fr' ? 'Tout voir ↗' : 'See all ↗'}
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-16 md:gap-y-24">
        {projects.map((p, i) => {
          const meta = (p.i18n as Record<string, { title: string; description: string }>)[locale];
          const slug = locale === 'fr' ? p.slugFr : p.slugEn;
          const offset = i % 2 === 1 ? 'md:mt-24' : '';
          return (
            <Link
              key={p.id}
              href={`/${locale}/projects/${slug}`}
              className={`block group card-tilt ${offset}`}
              data-reveal
            >
              <div className="aspect-[4/5] overflow-hidden bg-ink-50 mb-5 photo-frame">
                <img
                  src={p.coverImage}
                  alt={meta?.title ?? p.slugEn}
                  className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700"
                  loading="lazy"
                />
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <div>
                  <h3 className="font-display text-2xl md:text-3xl group-hover:text-accent transition-colors">
                    {meta?.title}
                  </h3>
                  <p className="text-bone/50 text-sm mt-1">{meta?.description}</p>
                </div>
                <span className="text-xs uppercase tracking-widest text-bone/40 shrink-0">
                  {p.year} · {p.category}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
