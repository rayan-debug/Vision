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

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
    title: { default: `${name} — Roua Bou Ghanem`, template: `%s · ${name}` },
    description: tagline,
    openGraph: {
      type: 'website',
      siteName: name,
      title: name,
      description: tagline,
      images: settings?.logoUrl ? [{ url: settings.logoUrl }] : [],
    },
    twitter: { card: 'summary_large_image', title: name, description: tagline },
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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocaleFromHeaders();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const settings = await prisma.siteSettings.findUnique({ where: { id: 'singleton' } });
  const inkRgb = hexToRgbTriple(settings?.primaryColor, '10 10 10');
  const accentRgb = hexToRgbTriple(settings?.accentColor, '255 90 31');
  const accentDark = shadeTriple(accentRgb, -28);
  const accentLight = shadeTriple(accentRgb, 32);
  const themeVars = `:root{--ink-rgb:${inkRgb};--accent-rgb:${accentRgb};--accent-dark-rgb:${accentDark};--accent-light-rgb:${accentLight};--accent:rgb(${accentRgb});}`;

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${sans.variable} ${display.variable} ${mono.variable} ${arabic.variable}`}
    >
      <head>
        <style dangerouslySetInnerHTML={{ __html: themeVars }} />
      </head>
      <body className="grain min-h-screen bg-ink text-bone font-sans">
        {children}
        <Reveal />
      </body>
    </html>
  );
}
