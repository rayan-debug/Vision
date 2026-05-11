import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma, isLocale } from '@roua/db';
import { pageMetadata } from '@/lib/seo';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const title = locale === 'fr' ? 'Réalisations — The Vision' : 'Work — The Vision';
  const description =
    locale === 'fr'
      ? 'Sélection de projets de Roua Bou Ghanem : identité, édition, photographie, podcast et montage vidéo.'
      : 'Selected work by Roua Bou Ghanem — brand identity, editorial, photography, podcast, and video editing.';
  return pageMetadata({
    title,
    description,
    path: `/${locale}/projects`,
    locale,
    alternates: { en: '/en/projects', fr: '/fr/projects' },
  });
}

export default async function ProjectsIndex({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const projects = await prisma.project.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: [{ featured: 'desc' }, { order: 'asc' }, { year: 'desc' }],
  });

  const categories = Array.from(new Set(projects.map((p) => p.category).filter(Boolean) as string[]));

  return (
    <>
      <section className="px-6 md:px-10 pt-40 pb-12">
        <p className="text-xs uppercase tracking-[0.3em] text-accent mb-6">
          ◆ {locale === 'fr' ? 'Réalisations' : 'Selected work'}
        </p>
        <h1 className="font-display text-super">
          {locale === 'fr' ? 'Le travail.' : 'The work.'}
        </h1>
        {categories.length > 0 && (
          <ul className="mt-10 flex flex-wrap gap-2 text-xs uppercase tracking-widest">
            {categories.map((c) => (
              <li
                key={c}
                className="px-3 py-1.5 border border-bone/20 text-bone/70 hover:border-accent hover:text-accent transition-colors"
              >
                {c}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="px-6 md:px-10 pb-32 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-16 md:gap-y-24">
        {projects.map((p, i) => {
          const meta = (p.i18n as Record<string, { title: string; description: string }>)[locale];
          const slug = locale === 'fr' ? p.slugFr : p.slugEn;
          return (
            <Link
              key={p.id}
              href={`/${locale}/projects/${slug}`}
              className={`block group card-tilt ${i % 2 === 1 ? 'md:mt-24' : ''}`}
              data-reveal
            >
              <div className="aspect-[4/5] overflow-hidden bg-ink-50 mb-5 photo-frame">
                <img
                  src={p.coverImage}
                  alt={meta?.title ?? p.slugEn}
                  className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700"
                  loading={i < 4 ? 'eager' : 'lazy'}
                />
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <div>
                  <h2 className="font-display text-2xl md:text-3xl group-hover:text-accent transition-colors">
                    {meta?.title}
                  </h2>
                  <p className="text-bone/50 text-sm mt-1">{meta?.description}</p>
                </div>
                <span className="text-xs uppercase tracking-widest text-bone/40 shrink-0">
                  {p.year} · {p.category}
                </span>
              </div>
            </Link>
          );
        })}
      </section>
    </>
  );
}
