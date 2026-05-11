import Link from 'next/link';
import { prisma, t, type Locale } from '@roua/db';

const COPY: Record<Locale, { rights: string; built: string; back: string; contact: string }> = {
  en: { rights: 'All rights reserved', built: 'Studio site by The Vision', back: 'Back to top', contact: 'Get in touch' },
  fr: { rights: 'Tous droits réservés', built: 'Site studio par The Vision', back: 'Retour en haut', contact: 'Me contacter' },
};

export async function Footer({ locale }: { locale: Locale }) {
  const s = await prisma.siteSettings.findUnique({ where: { id: 'singleton' } });
  const siteName = s ? t(s.i18n, locale) : 'The Vision';
  const year = new Date().getFullYear();
  const socials = [
    { label: 'Instagram', href: s?.instagram },
    { label: 'Behance', href: s?.behance },
    { label: 'Dribbble', href: s?.dribbble },
    { label: 'LinkedIn', href: s?.linkedin },
    { label: 'Twitter', href: s?.twitter },
  ].filter((x) => x.href);

  return (
    <footer className="px-6 md:px-10 pt-32 pb-10 border-t border-bone/10">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-20">
        <div className="md:col-span-6">
          <h2 className="font-display text-super text-bone">
            {locale === 'fr' ? 'Construisons quelque chose.' : "Let's build something."}
          </h2>
          <Link
            href={`/${locale}/contact`}
            className="inline-block mt-8 px-6 py-3 border border-accent text-accent hover:bg-accent hover:text-ink transition-colors text-sm uppercase tracking-widest"
          >
            {COPY[locale].contact} →
          </Link>
        </div>

        <div className="md:col-span-3 text-sm">
          <p className="text-bone/50 uppercase tracking-widest text-xs mb-3">
            {locale === 'fr' ? 'Contact' : 'Contact'}
          </p>
          {s?.email && (
            <a href={`mailto:${s.email}`} className="block link-underline mb-1">
              {s.email}
            </a>
          )}
          {s?.phone && <p className="mb-1">{s.phone}</p>}
          {s?.location && <p className="text-bone/60">{s.location}</p>}
        </div>

        <div className="md:col-span-3 text-sm">
          <p className="text-bone/50 uppercase tracking-widest text-xs mb-3">
            {locale === 'fr' ? 'Suivre' : 'Follow'}
          </p>
          <ul className="space-y-1">
            {socials.map((s) => (
              <li key={s.label}>
                <a href={s.href!} target="_blank" rel="noreferrer" className="link-underline">
                  {s.label} ↗
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs text-bone/40 uppercase tracking-widest">
        <p>© {year} {siteName}. {COPY[locale].rights}.</p>
        <p>{COPY[locale].built}</p>
      </div>
    </footer>
  );
}
