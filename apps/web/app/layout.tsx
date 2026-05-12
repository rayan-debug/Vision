import type { Metadata } from 'next';
import { Inter, Playfair_Display, JetBrains_Mono, Noto_Naskh_Arabic } from 'next/font/google';
import './globals.css';
import { prisma, t, type Locale } from '@roua/db';
import { getLocaleFromHeaders } from '@/lib/locale';
import Reveal from '@/components/Reveal';

const sans = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const display = Playfair_Display({ subsets: ['latin'], variable: '--font-display', display: 'swap' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' });
// Arabic-friendly serif/sans pairing — Noto Naskh covers both display and body.
const arabic = Noto_Naskh_Arabic({ subsets: ['arabic'], variable: '--font-arabic', display: 'swap' });

export async function generateMetadata(): Promise<Metadata> {
  const settings = await prisma.siteSettings.findUnique({ where: { id: 'singleton' } });
  const locale: Locale = 'en';
  const name = settings ? t(settings.i18n, locale) : 'The Vision';
  const tagline = settings
    ? (settings.i18n as Record<string, { tagline?: string }>)[locale]?.tagline ?? ''
    : '';
  const ogImage = settings?.defaultOgImage ?? settings?.logoUrl ?? null;

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
    title: { default: `${name} — Roua Bou Ghanem`, template: `%s · ${name}` },
    description: tagline,
    openGraph: {
      type: 'website',
      siteName: name,
      title: name,
      description: tagline,
      images: ogImage ? [{ url: ogImage }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: name,
      description: tagline,
      images: ogImage ? [ogImage] : undefined,
    },
    icons: { icon: settings?.faviconUrl ?? '/favicon.ico' },
    robots: { index: true, follow: true },
  };
}

function hexToRgbTriple(hex: string | null | undefined, fallback: string): string {
  const m = /^#?([0-9a-f]{6})$/i.exec((hex ?? '').trim());
  if (!m) return fallback;
  const n = parseInt(m[1], 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
}

function shadeTriple(triple: string, delta: number): string {
  const [r, g, b] = triple.split(' ').map(Number);
  const clamp = (v: number) => Math.max(0, Math.min(255, v));
  return `${clamp(r + delta)} ${clamp(g + delta)} ${clamp(b + delta)}`;
}

function fontFamilyOverride(name: string | null | undefined, fallback: string): string {
  if (!name) return fallback;
  return `'${name}', ${fallback}`;
}

function googleFontHref(families: (string | null | undefined)[]): string | null {
  const unique = Array.from(new Set(families.filter((f): f is string => !!f && f.trim().length > 0)));
  if (unique.length === 0) return null;
  const params = unique
    .map((f) => `family=${encodeURIComponent(f)}:wght@400;500;600;700`)
    .join('&');
  return `https://fonts.googleapis.com/css2?${params}&display=swap`;
}

const LETTER_SPACING_MAP: Record<string, string> = {
  tight: '-0.04em',
  normal: '-0.02em',
  loose: '0em',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocaleFromHeaders();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const settings = await prisma.siteSettings.findUnique({ where: { id: 'singleton' } });
  const inkRgb = hexToRgbTriple(settings?.primaryColor, '10 10 10');
  const accentRgb = hexToRgbTriple(settings?.accentColor, '255 90 31');
  const accentDark = shadeTriple(accentRgb, -28);
  const accentLight = shadeTriple(accentRgb, 32);

  const displayFamily = fontFamilyOverride(settings?.displayFont, "Playfair Display, Georgia, serif");
  const sansFamily = fontFamilyOverride(settings?.bodyFont, "Inter, system-ui, sans-serif");
  const monoFamily = fontFamilyOverride(settings?.monoFont, "JetBrains Mono, ui-monospace, monospace");
  const fontScale = settings?.fontScale ?? 1;
  const sectionSpacing = settings?.sectionSpacing ?? 1;
  const letterSpacing = LETTER_SPACING_MAP[settings?.letterSpacing ?? 'normal'] ?? '-0.02em';
  const googleFontUrl = googleFontHref([settings?.displayFont, settings?.bodyFont, settings?.monoFont]);

  const themeVars =
    `:root{--ink-rgb:${inkRgb};--accent-rgb:${accentRgb};--accent-dark-rgb:${accentDark};` +
    `--accent-light-rgb:${accentLight};--accent:rgb(${accentRgb});` +
    `--font-display-override:${displayFamily};--font-sans-override:${sansFamily};--font-mono-override:${monoFamily};` +
    `--font-scale:${fontScale};--section-spacing:${sectionSpacing};--heading-tracking:${letterSpacing};}`;

  const gaId = settings?.gaId?.trim();
  const plausible = settings?.plausibleDomain?.trim();
  const customCss = settings?.customCss?.trim();

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${sans.variable} ${display.variable} ${mono.variable} ${arabic.variable}`}
    >
      <head>
        {googleFontUrl && (
          <>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            <link rel="stylesheet" href={googleFontUrl} />
          </>
        )}
        <style dangerouslySetInnerHTML={{ __html: themeVars }} />
        {customCss && <style dangerouslySetInnerHTML={{ __html: customCss }} />}
        {gaId && /^G-[A-Z0-9]+$/i.test(gaId) && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} />
            <script
              dangerouslySetInnerHTML={{
                __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}');`,
              }}
            />
          </>
        )}
        {plausible && /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(plausible) && (
          <script
            defer
            data-domain={plausible}
            src="https://plausible.io/js/script.js"
          />
        )}
      </head>
      <body className="grain min-h-screen bg-ink text-bone font-sans">
        {children}
        <Reveal />
      </body>
    </html>
  );
}
