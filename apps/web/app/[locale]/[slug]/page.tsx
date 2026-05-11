import { notFound } from 'next/navigation';
import { prisma, isLocale, type Block, type Locale } from '@roua/db';
import { BlockRenderer } from '@/components/blocks/BlockRenderer';
import { pageMetadata } from '@/lib/seo';
import { JsonLd, breadcrumbLd } from '@/lib/jsonld';

async function findPage(locale: Locale, slug: string) {
  return prisma.page.findFirst({
    where: {
      status: 'PUBLISHED',
      OR: [{ slugEn: slug }, { slugFr: slug }],
    },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const page = await findPage(locale, slug);
  if (!page) return {};
  const meta = (page.i18n as Record<string, { title: string; description?: string; keywords?: string }>)[
    locale
  ];
  return pageMetadata({
    title: meta?.title ?? '',
    description: meta?.description,
    keywords: meta?.keywords,
    path: `/${locale}/${slug}`,
    locale,
    ogImage: page.ogImage ?? undefined,
    alternates: { en: `/en/${page.slugEn}`, fr: `/fr/${page.slugFr}` },
  });
}

export default async function DynamicPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();

  const page = await findPage(locale, slug);
  if (!page || page.isHome) notFound();

  const blocks = (page.blocks as unknown as Block[]) ?? [];
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const meta = (page.i18n as Record<string, { title: string }>)[locale];

  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: 'Home', url: `${baseUrl}/${locale}` },
          { name: meta?.title ?? slug, url: `${baseUrl}/${locale}/${slug}` },
        ])}
      />
      <BlockRenderer blocks={blocks} locale={locale} />
    </>
  );
}
