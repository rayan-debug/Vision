import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma, isLocale } from '@roua/db';
import { pageMetadata } from '@/lib/seo';
import { JsonLd, itemListLd, breadcrumbLd } from '@/lib/jsonld';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const title = locale === 'ar' ? 'الأعمال — ذا فيجن' : 'Work — The Vision';
  const description =
    locale === 'ar'
      ? 'مختارات من أعمال روى بو غانم: هويات بصرية، تصميم تحريري، تصوير، بودكاست ومونتاج فيديو.'
      : 'Selected work by Roua Bou Ghanem — brand identity, editorial, photography, podcast, and video editing.';
  return pageMetadata({
    title,
    description,
    path: `/${locale}/projects`,
    locale,
    alternates: { en: '/en/projects', ar: '/ar/projects' },
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
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const indexUrl = `${baseUrl}/${locale}/projects`;

  return (
    <>
      <JsonLd
        data={[
          itemListLd({
            name: locale === 'ar' ? 'الأعمال' : 'Work',
            url: indexUrl,
            items: projects.map((p) => {
              const meta = (p.i18n as Record<string, { title: string; description: string }>)[locale];
              const slug = locale === 'ar' ? p.slugAr : p.slugEn;
              return {
                name: meta?.title ?? p.slugEn,
                url: `${baseUrl}/${locale}/projects/${slug}`,
                image: p.coverImage,
                description: meta?.description,
              };
            }),
          }),
          breadcrumbLd([
            { name: locale === 'ar' ? 'الرئيسية' : 'Home', url: `${baseUrl}/${locale}` },
            { name: locale === 'ar' ? 'الأعمال' : 'Work', url: indexUrl },
          ]),
        ]}
      />
      <section className="px-6 md:px-10 pt-40 pb-12">
        <p className="text-xs uppercase tracking-[0.3em] text-accent mb-6">
          ◆ {locale === 'ar' ? 'مختارات من الأعمال' : 'Selected work'}
        </p>
        <h1 className="font-display text-super">
          {locale === 'ar' ? 'الأعمال.' : 'The work.'}
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
          const slug = locale === 'ar' ? p.slugAr : p.slugEn;
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
