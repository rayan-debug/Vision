import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma, isLocale, type Locale } from '@roua/db';
import { pageMetadata } from '@/lib/seo';
import { JsonLd, creativeWorkLd, articleLd, breadcrumbLd } from '@/lib/jsonld';

async function findProject(slug: string) {
  return prisma.project.findFirst({
    where: { status: 'PUBLISHED', OR: [{ slugEn: slug }, { slugAr: slug }] },
  });
}

type Meta = { title: string; description: string; fullContent?: string; client?: string; role?: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const project = await findProject(slug);
  if (!project) return {};
  const meta = (project.i18n as Record<string, Meta>)[locale];
  return pageMetadata({
    title: `${meta?.title} — The Vision`,
    description: meta?.description,
    path: `/${locale}/projects/${slug}`,
    locale,
    ogImage: project.coverImage,
    ogType: 'article',
    publishedTime: project.publishedAt?.toISOString(),
    modifiedTime: project.updatedAt.toISOString(),
    alternates: {
      en: `/en/projects/${project.slugEn}`,
      ar: `/ar/projects/${project.slugAr}`,
    },
  });
}

export default async function ProjectDetail({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();

  const project = await findProject(slug);
  if (!project) notFound();

  const meta = (project.i18n as Record<Locale, Meta>)[locale];
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const url = `${baseUrl}/${locale}/projects/${slug}`;

  const next = await prisma.project.findFirst({
    where: {
      status: 'PUBLISHED',
      id: { not: project.id },
      order: { gt: project.order },
    },
    orderBy: { order: 'asc' },
  });

  return (
    <>
      <JsonLd
        data={[
          creativeWorkLd({
            name: meta?.title ?? '',
            description: meta?.description ?? '',
            url,
            image: project.coverImage,
            creator: 'Roua Bou Ghanem',
            datePublished: project.publishedAt?.toISOString(),
            keywords: project.tags,
          }),
          articleLd({
            headline: meta?.title ?? '',
            description: meta?.description ?? '',
            url,
            image: project.coverImage,
            author: 'Roua Bou Ghanem',
            datePublished: project.publishedAt?.toISOString(),
            dateModified: project.updatedAt.toISOString(),
            inLanguage: locale === 'ar' ? 'ar' : 'en',
            keywords: project.tags,
            articleSection: project.category ?? undefined,
          }),
          breadcrumbLd([
            { name: locale === 'ar' ? 'الرئيسية' : 'Home', url: `${baseUrl}/${locale}` },
            { name: locale === 'ar' ? 'الأعمال' : 'Work', url: `${baseUrl}/${locale}/projects` },
            { name: meta?.title ?? slug, url },
          ]),
        ]}
      />

      <article>
        <header className="px-6 md:px-10 pt-40 pb-12">
          <p className="text-xs uppercase tracking-[0.3em] text-accent mb-6">
            {project.category} · {project.year}
          </p>
          <h1 className="font-display text-super">{meta?.title}</h1>
          <p className="mt-8 max-w-2xl text-xl text-bone/70">{meta?.description}</p>

          <dl className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
            {meta?.client && (
              <div>
                <dt className="text-xs uppercase tracking-widest text-bone/40 mb-1">
                  {locale === 'ar' ? 'العميل' : 'Client'}
                </dt>
                <dd>{meta.client}</dd>
              </div>
            )}
            {meta?.role && (
              <div>
                <dt className="text-xs uppercase tracking-widest text-bone/40 mb-1">
                  {locale === 'ar' ? 'الدور' : 'Role'}
                </dt>
                <dd>{meta.role}</dd>
              </div>
            )}
            {project.year && (
              <div>
                <dt className="text-xs uppercase tracking-widest text-bone/40 mb-1">
                  {locale === 'ar' ? 'السنة' : 'Year'}
                </dt>
                <dd>{project.year}</dd>
              </div>
            )}
            {project.tags.length > 0 && (
              <div>
                <dt className="text-xs uppercase tracking-widest text-bone/40 mb-1">Tags</dt>
                <dd>{project.tags.join(', ')}</dd>
              </div>
            )}
          </dl>
        </header>

        <div className="px-6 md:px-10 mb-16">
          <img src={project.coverImage} alt={meta?.title ?? ''} className="w-full" />
        </div>

        {meta?.fullContent && (
          <section className="px-6 md:px-10 py-12 max-w-3xl">
            <div className="text-lg leading-relaxed text-bone/80 whitespace-pre-line">
              {meta.fullContent}
            </div>
          </section>
        )}

        {project.images.length > 0 && (
          <section className="px-6 md:px-10 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 pb-24">
            {project.images.map((src, i) => (
              <img key={i} src={src} alt="" className="w-full" loading="lazy" data-reveal />
            ))}
          </section>
        )}

        {next && (
          <section className="px-6 md:px-10 py-24 border-t border-bone/10">
            <p className="text-xs uppercase tracking-[0.3em] text-bone/40 mb-4">
              {locale === 'ar' ? 'المشروع التالي' : 'Next project'}
            </p>
            <Link
              href={`/${locale}/projects/${locale === 'ar' ? next.slugAr : next.slugEn}`}
              className="font-display text-super hover:text-accent transition-colors"
            >
              {(next.i18n as Record<Locale, Meta>)[locale]?.title} →
            </Link>
          </section>
        )}
      </article>
    </>
  );
}
