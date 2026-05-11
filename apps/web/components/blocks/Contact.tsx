import type { ContactBlock, Locale } from '@roua/db';
import { prisma, t } from '@roua/db';
import { ContactForm } from '../ContactForm';

export async function Contact({ block, locale }: { block: ContactBlock; locale: Locale }) {
  const heading = block.heading ? t(block.heading, locale) : '';
  const s = await prisma.siteSettings.findUnique({ where: { id: 'singleton' } });

  return (
    <section className="px-6 md:px-10 py-24 md:py-32">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
        <div className="md:col-span-5">
          {heading && (
            <h2 className="font-display text-display mb-8 text-accent" data-reveal>
              {heading}
            </h2>
          )}
          <ul className="space-y-3 text-bone/70">
            {s?.email && (
              <li>
                <a href={`mailto:${s.email}`} className="link-underline">
                  {s.email}
                </a>
              </li>
            )}
            {s?.phone && <li>{s.phone}</li>}
            {s?.location && <li>{s.location}</li>}
          </ul>
        </div>
        <div className="md:col-span-7">
          <ContactForm locale={locale} />
        </div>
      </div>
    </section>
  );
}
