import { notFound } from 'next/navigation';
import { prisma, isLocale, type Block } from '@roua/db';
import { BlockRenderer } from '@/components/blocks/BlockRenderer';
import { pageMetadata } from '@/lib/seo';
import {
  JsonLd,
  personLd,
  organizationLd,
  breadcrumbLd,
  websiteLd,
  profilePageLd,
} from '@/lib/jsonld';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const page = await prisma.page.findFirst({
    where: { isHome: true, status: 'PUBLISHED' },
  });
  if (!page) return {};
  const meta = (page.i18n as Record<string, { title: string; description?: string; keywords?: string }>)[
    locale
  ];
  return pageMetadata({
    title: meta?.title ?? '',
    description: meta?.description,
    keywords: meta?.keywords,
    path: `/${locale}`,
    locale,
    ogImage: page.ogImage ?? undefined,
    alternates: { en: '/en', ar: '/ar' },
  });
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const [page, settings] = await Promise.all([
    prisma.page.findFirst({ where: { isHome: true, status: 'PUBLISHED' } }),
    prisma.siteSettings.findUnique({ where: { id: 'singleton' } }),
  ]);
  if (!page) notFound();

  const blocks = (page.blocks as unknown as Block[]) ?? [];
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const siteName =
    (settings?.i18n as Record<string, { siteName: string }>)[locale]?.siteName ?? 'The Vision';
  const bio =
    (settings?.i18n as Record<string, { bio?: string }>)[locale]?.bio ?? '';

  const socials = [
    settings?.instagram,
    settings?.behance,
    settings?.dribbble,
    settings?.linkedin,
    settings?.twitter,
    settings?.youtube,
    settings?.tiktok,
    settings?.pinterest,
  ].filter((x): x is string => !!x);

  const tagline =
    (settings?.i18n as Record<string, { tagline?: string }> | undefined)?.[locale]?.tagline ?? '';
  const lang = locale === 'ar' ? 'ar' : 'en';

  return (
    <>
      <JsonLd
        data={[
          websiteLd({
            name: siteName,
            url: `${baseUrl}/${locale}`,
            description: tagline || bio,
            // Sitelinks searchbox — Google renders this when present.
            // Replace with a real search route if/when we add one.
            inLanguage: lang,
          }),
          profilePageLd({
            name: siteName,
            url: `${baseUrl}/${locale}`,
            description: bio,
            mainEntityName: 'Roua Bou Ghanem',
            mainEntityUrl: `${baseUrl}/${locale}`,
            inLanguage: lang,
          }),
          personLd({
            name: 'Roua Bou Ghanem',
            jobTitle: locale === 'ar' ? 'مصمّمة جرافيك' : 'Graphic Designer',
            url: `${baseUrl}/${locale}`,
            description: bio,
            sameAs: socials,
            image: page.ogImage ?? settings?.logoUrl ?? undefined,
          }),
          organizationLd({
            name: siteName,
            url: `${baseUrl}/${locale}`,
            description: bio,
            sameAs: socials,
            email: settings?.email ?? undefined,
            areaServed: 'Worldwide',
            logo: settings?.logoUrl ?? undefined,
          }),
          breadcrumbLd([{ name: locale === 'ar' ? 'الرئيسية' : 'Home', url: `${baseUrl}/${locale}` }]),
        ]}
      />
      <BlockRenderer blocks={blocks} locale={locale} />
    </>
  );
}
