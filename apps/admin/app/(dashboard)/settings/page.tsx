import { prisma } from '@roua/db';
import { SettingsEditor } from '@/components/SettingsEditor';

export default async function Settings() {
  const settings = await prisma.siteSettings.upsert({
    where: { id: 'singleton' },
    update: {},
    create: {
      id: 'singleton',
      i18n: { en: { siteName: 'The Vision', tagline: '', bio: '' }, fr: { siteName: 'The Vision', tagline: '', bio: '' } },
    },
  });

  return (
    <div className="p-8 md:p-12 max-w-4xl">
      <p className="text-xs uppercase tracking-widest text-accent mb-2">Studio</p>
      <h1 className="font-display text-5xl mb-2">Site settings</h1>
      <p className="text-muted mb-10">
        Global brand information, social links, AEO FAQs. Affects every page.
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
          logoUrl: settings.logoUrl,
          faviconUrl: settings.faviconUrl,
          primaryColor: settings.primaryColor,
          accentColor: settings.accentColor,
          faqs: (settings.faqs as { q: Record<string, string>; a: Record<string, string> }[]) ?? [],
        }}
      />
    </div>
  );
}
