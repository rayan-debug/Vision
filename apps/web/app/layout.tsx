import type { Metadata } from 'next';
import { Inter, Playfair_Display, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { prisma, t, type Locale } from '@roua/db';
import { getLocaleFromHeaders } from '@/lib/locale';
import Reveal from '@/components/Reveal';

const sans = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const display = Playfair_Display({ subsets: ['latin'], variable: '--font-display', display: 'swap' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' });

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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocaleFromHeaders();
  return (
    <html lang={locale} className={`${sans.variable} ${display.variable} ${mono.variable}`}>
      <body className="grain min-h-screen bg-ink text-bone font-sans">
        {children}
        <Reveal />
      </body>
    </html>
  );
}
