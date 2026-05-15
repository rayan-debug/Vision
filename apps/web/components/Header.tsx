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

  const logoHeight = settings?.logoHeight ?? 24;
  const logoPosition = settings?.logoPosition ?? 'left';
  const logoShape = settings?.logoShape ?? 'none';
  const logoShowText = settings?.logoShowText ?? true;
  const centered = logoPosition === 'center';
  const radius =
    logoShape === 'circle' ? '9999px' : logoShape === 'rounded' ? '6px' : '0';

  const brand = (
    <Link href={`/${locale}`} className="flex items-center gap-2 group">
      {settings?.logoUrl ? (
        <img
          src={settings.logoUrl}
          alt=""
          style={{ height: `${logoHeight}px`, width: 'auto', borderRadius: radius, objectFit: 'contain' }}
        />
      ) : (
        <Logo size={logoHeight} />
      )}
      {logoShowText && (
        <span className="font-display text-lg tracking-tight">{siteName}</span>
      )}
    </Link>
  );

  const nav = (
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
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-6 md:px-10 py-5 md:py-6 bg-gradient-to-b from-ink to-transparent backdrop-blur-[2px]">
      {centered ? (
        <div className="flex flex-col items-center gap-3">
          {brand}
          <div className="flex items-center gap-6">
            {nav}
            <LanguageSwitcher current={locale} />
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-8">
          {brand}
          {nav}
          <LanguageSwitcher current={locale} />
        </div>
      )}
    </header>
  );
}

function Logo({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="text-accent">
      <path
        d="M3 13C8 12 11 9 12 4C13 9 16 12 21 13C16 14 13 17 12 22C11 17 8 14 3 13Z"
        fill="currentColor"
      />
    </svg>
  );
}
