import Link from 'next/link';
import { prisma, t, type Locale } from '@roua/db';

const COPY: Record<Locale, { rights: string; built: string; back: string; contact: string; contactLabel: string; followLabel: string; ctaHeading: string }> = {
  en: {
    rights: 'All rights reserved',
    built: 'Studio site by The Vision',
    back: 'Back to top',
    contact: 'Get in touch',
    contactLabel: 'Contact',
    followLabel: 'Follow',
    ctaHeading: "Let's build something.",
  },
  ar: {
    rights: 'جميع الحقوق محفوظة',
    built: 'موقع الستوديو من ذا فيجن',
    back: 'العودة للأعلى',
    contact: 'تواصل معي',
    contactLabel: 'تواصل',
    followLabel: 'متابعة',
    ctaHeading: 'لنبنِ شيئاً معاً.',
  },
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
  const c = COPY[locale];

  return (
    <footer className="px-6 md:px-10 pt-32 pb-10 border-t border-bone/10">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-20">
        <div className="md:col-span-6">
          <h2 className="font-display text-super text-bone">{c.ctaHeading}</h2>
          <Link
            href={`/${locale}/contact`}
            className="inline-block mt-8 px-6 py-3 border border-accent text-accent hover:bg-accent hover:text-ink transition-colors text-sm uppercase tracking-widest"
          >
            {c.contact} →
          </Link>
        </div>

        <div className="md:col-span-3 text-sm">
          <p className="text-bone/50 uppercase tracking-widest text-xs mb-3">{c.contactLabel}</p>
          {s?.email && (
            <a href={`mailto:${s.email}`} className="block link-underline mb-1">
              {s.email}
            </a>
          )}
          {s?.phone && <p className="mb-1">{s.phone}</p>}
          {s?.location && <p className="text-bone/60">{s.location}</p>}
        </div>

        <div className="md:col-span-3 text-sm">
          <p className="text-bone/50 uppercase tracking-widest text-xs mb-3">{c.followLabel}</p>
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
        <p>© {year} {siteName}. {c.rights}.</p>
        <p>{c.built}</p>
      </div>
    </footer>
  );
}
