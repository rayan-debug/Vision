import type { ServicesBlock, Locale } from '@roua/db';
import { prisma, t } from '@roua/db';

export async function Services({
  block,
  locale,
}: {
  block: ServicesBlock;
  locale: Locale;
}) {
  const services = await prisma.service.findMany({ orderBy: { order: 'asc' } });
  const heading = block.heading ? t(block.heading, locale) : '';

  return (
    <section className="px-6 md:px-10 py-24 md:py-32 bg-ink-100">
      {heading && (
        <h2 className="font-display text-display mb-12 md:mb-16 text-accent" data-reveal>
          {heading}
        </h2>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-bone/10">
        {services.map((s, i) => {
          const meta = (s.i18n as Record<string, { title: string; description: string }>)[locale];
          return (
            <article
              key={s.id}
              className="group p-8 md:p-10 bg-ink-100 hover:bg-ink-50 transition-colors min-h-[280px] flex flex-col"
              data-reveal
            >
              <div className="flex items-start justify-between mb-8">
                <span className="text-3xl text-accent">{s.icon}</span>
                <span className="text-xs text-bone/40">0{i + 1}</span>
              </div>
              <h3 className="font-display text-2xl md:text-3xl mb-4 group-hover:text-accent transition-colors">
                {meta?.title}
              </h3>
              <p className="text-bone/60 text-sm leading-relaxed mt-auto">
                {meta?.description}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
