import Link from 'next/link';
import { prisma, t, type Locale } from '@roua/db';
import { LanguageSwitcher } from './LanguageSwitcher';

const NAV_DEFAULTS: Record<Locale, { work: string; contact: string }> = {
  en: { work: 'Work', contact: 'Contact' },
  ar: { work: 'الأعمال', contact: 'تواصل' },
};

export async function Header({ locale }: { locale: Locale }) {
  const [settings, pages] = await Promise.all([
    prisma.siteSettings.findUnique({ where: { id: 'singleton' } }),
    prisma.page.findMany({
      where: { status: 'PUBLISHED', showInNav: true, isHome: false },
      orderBy: { navOrder: 'asc' },
      select: { slugEn: true, slugAr: true, i18n: true },
    }),
  ]);

  const siteName = settings ? t(settings.i18n, locale) : 'The Vision';
  const navLabels = (settings?.navLabels as Record<string, { work?: string; contact?: string }> | null) ?? null;
  const workLabel = navLabels?.[locale]?.work || NAV_DEFAULTS[locale].work;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-6 md:px-10 py-5 md:py-6 bg-gradient-to-b from-ink to-transparent backdrop-blur-[2px]">
      <div className="flex items-center justify-between gap-8">
        <Link href={`/${locale}`} className="flex items-center gap-2 group">
          {settings?.logoUrl ? (
            <img src={settings.logoUrl} alt="" className="h-6 w-auto" />
          ) : (
            <Logo />
          )}
          <span className="font-display text-lg tracking-tight">{siteName}</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm tracking-wide uppercase">
          <Link href={`/${locale}/projects`} className="link-underline">
            {workLabel}
          </Link>
          {pages.map((p) => {
            const meta = (p.i18n as Record<string, { title: string }>)[locale];
            const slug = locale === 'ar' ? p.slugAr : p.slugEn;
            return (
              <Link key={slug} href={`/${locale}/${slug}`} className="link-underline">
                {meta?.title?.split('—')[0].trim() ?? slug}
              </Link>
            );
          })}
        </nav>

        <LanguageSwitcher current={locale} />
      </div>
    </header>
  );
}

function Logo() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-accent">
      <path
        d="M3 13C8 12 11 9 12 4C13 9 16 12 21 13C16 14 13 17 12 22C11 17 8 14 3 13Z"
        fill="currentColor"
      />
    </svg>
  );
}
