import type { FaqBlock, Locale } from '@roua/db';
import { t } from '@roua/db';
import { faqPageLd, JsonLd } from '@/lib/jsonld';

// FAQ block is also the AEO workhorse — it emits FAQPage JSON-LD that AI
// search engines pick up and cite when answering questions.
export function FAQ({ block, locale }: { block: FaqBlock; locale: Locale }) {
  const heading = block.heading ? t(block.heading, locale) : '';
  const items = block.items.map((it) => ({
    q: t(it.q, locale),
    a: t(it.a, locale),
  }));

  return (
    <section className="px-6 md:px-10 py-24 md:py-32">
      <JsonLd data={faqPageLd(items)} />
      <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
        <div className="md:col-span-4">
          <p className="text-xs uppercase tracking-[0.3em] text-accent mb-4">FAQ</p>
          <h2 className="font-display text-display sticky top-32" data-reveal>
            {heading}
          </h2>
        </div>
        <div className="md:col-span-8">
          <dl className="divide-y divide-bone/10 border-y border-bone/10">
            {items.map((it, i) => (
              <details key={i} className="group py-6" data-reveal>
                <summary className="flex items-start justify-between cursor-pointer list-none gap-8">
                  <dt className="font-display text-xl md:text-2xl text-bone group-hover:text-accent transition-colors">
                    {it.q}
                  </dt>
                  <span className="text-accent text-2xl shrink-0 transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <dd className="mt-4 text-bone/70 leading-relaxed max-w-2xl">{it.a}</dd>
              </details>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
