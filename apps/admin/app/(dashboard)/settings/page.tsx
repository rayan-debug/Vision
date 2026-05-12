import { prisma } from '@roua/db';
import { SettingsEditor } from '@/components/SettingsEditor';

export default async function Settings() {
  const settings = await prisma.siteSettings.upsert({
    where: { id: 'singleton' },
    update: {},
    create: {
      id: 'singleton',
      i18n: { en: { siteName: 'The Vision', tagline: '', bio: '' }, ar: { siteName: 'ذا فيجن', tagline: '', bio: '' } },
    },
  });

  return (
    <div className="p-8 md:p-12 max-w-5xl">
      <p className="text-xs uppercase tracking-widest text-accent mb-2">Studio</p>
      <h1 className="font-display text-5xl mb-2">Site settings</h1>
      <p className="text-muted mb-10">
        Global brand information, theme, analytics, SEO defaults, and FAQs. Every change is live the moment you save.
      </p>
      <SettingsEditor
        initial={{
          i18n: settings.i18n as Record<string, { siteName: string; tagline?: string; bio?: string }>,
          email: settings.email,
          phone: settings.phone,
          location: settings.location,
          instagram: settings.instagram,
          behance: settings.behance,
          dribbble: settings.dribbble,
          linkedin: settings.linkedin,
          twitter: settings.twitter,
          youtube: settings.youtube,
          tiktok: settings.tiktok,
          pinterest: settings.pinterest,
          logoUrl: settings.logoUrl,
          faviconUrl: settings.faviconUrl,
          defaultOgImage: settings.defaultOgImage,
          primaryColor: settings.primaryColor,
          accentColor: settings.accentColor,
          gaId: settings.gaId,
          plausibleDomain: settings.plausibleDomain,
          customCss: settings.customCss,
          navLabels: (settings.navLabels as Record<string, { work?: string; contact?: string }> | null) ?? null,
          displayFont: settings.displayFont,
          bodyFont: settings.bodyFont,
          monoFont: settings.monoFont,
          fontScale: settings.fontScale,
          sectionSpacing: settings.sectionSpacing,
          letterSpacing: settings.letterSpacing,
          faqs: (settings.faqs as { q: Record<string, string>; a: Record<string, string> }[]) ?? [],
        }}
      />
    </div>
  );
}
