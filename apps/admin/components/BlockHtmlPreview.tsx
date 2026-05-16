import type {
  Block,
  HeroBlock,
  TextBlock as TextBlockT,
  ImageBlock as ImageBlockT,
  GalleryBlock,
  StatsBlock,
  TestimonialsBlock,
  CtaBlock,
  MarqueeBlock,
  FaqBlock,
  ProjectsBlock,
  ServicesBlock,
  ContactBlock,
  VideoBlock,
  SpacerBlock,
  Locale,
} from '@roua/db';

// Renders a Block[] as a real HTML page mirror (dark editorial), suitable for
// glancing at the layout of a template or AI draft before committing. Used by
// the AI assistant live preview, the templates list, the AI template modal,
// and the page-creator template picker.

export function BlockHtmlPreview({
  blocks,
  locale = 'en',
  animate = true,
}: {
  blocks: Block[];
  locale?: Locale;
  animate?: boolean;
}) {
  return (
    <div style={{ background: '#0a0a0a', color: '#f5f1ea' }} className="text-bone">
      <PreviewAnimStyles />
      {blocks.map((b, i) => {
        const anim = (b as { style?: { animation?: string } }).style?.animation;
        const cls =
          animate && anim && anim !== 'none' ? `bhp-anim bhp-${anim}` : '';
        const delay = animate && anim && anim !== 'none' ? `${i * 90}ms` : undefined;
        return (
          <div key={b.id} className={cls} style={{ animationDelay: delay }}>
            <PreviewBlock block={b} locale={locale} />
          </div>
        );
      })}
    </div>
  );
}

// Scoped keyframes so preview blocks animate in on mount, mirroring what the
// public site does on scroll. Re-rendered each preview cycle (changing blocks
// remounts the wrapper divs, replaying the animation).
function PreviewAnimStyles() {
  return (
    <style>{`
      .bhp-anim { animation-duration: 0.9s; animation-fill-mode: both; animation-timing-function: cubic-bezier(0.16,1,0.3,1); }
      @keyframes bhp-slide-up { from { opacity: 0; transform: translateY(28px); } to { opacity: 1; transform: none; } }
      @keyframes bhp-fade { from { opacity: 0; } to { opacity: 1; } }
      @keyframes bhp-slide-in { from { opacity: 0; transform: translateX(-40px); } to { opacity: 1; transform: none; } }
      @keyframes bhp-zoom { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: none; } }
      .bhp-slide-up { animation-name: bhp-slide-up; }
      .bhp-fade     { animation-name: bhp-fade; }
      .bhp-slide-in { animation-name: bhp-slide-in; }
      .bhp-zoom     { animation-name: bhp-zoom; }
    `}</style>
  );
}

// Compact "thumbnail" wrapper — renders the full HTML preview at a fixed
// virtual width and scales it down to fit a small card. This way every
// preview looks like a miniature page, not a block silhouette.
export function BlockHtmlThumbnail({
  blocks,
  locale = 'en',
  virtualWidth = 480,
  className = '',
}: {
  blocks: Block[];
  locale?: Locale;
  virtualWidth?: number;
  className?: string;
}) {
  return (
    <div className={`relative w-full h-full overflow-hidden bg-ink ${className}`}>
      <div
        style={{
          width: virtualWidth,
          transform: `scale(var(--thumb-scale, 0.42))`,
          transformOrigin: 'top left',
        }}
      >
        <BlockHtmlPreview blocks={blocks} locale={locale} animate={false} />
      </div>
      {blocks.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-bone/40 text-[10px] uppercase tracking-widest">
          empty
        </div>
      )}
    </div>
  );
}

function PreviewBlock({ block, locale }: { block: Block; locale: Locale }) {
  switch (block.type) {
    case 'hero':         return <PreviewHero block={block as HeroBlock} locale={locale} />;
    case 'text':         return <PreviewText block={block as TextBlockT} locale={locale} />;
    case 'image':        return <PreviewImage block={block as ImageBlockT} locale={locale} />;
    case 'gallery':      return <PreviewGallery block={block as GalleryBlock} locale={locale} />;
    case 'stats':        return <PreviewStats block={block as StatsBlock} locale={locale} />;
    case 'testimonials': return <PreviewPlaceholder label="Testimonials" sub="Pulled from your Testimonials list" block={block as TestimonialsBlock} locale={locale} />;
    case 'cta':          return <PreviewCta block={block as CtaBlock} locale={locale} />;
    case 'marquee':      return <PreviewMarquee block={block as MarqueeBlock} locale={locale} />;
    case 'faq':          return <PreviewFaq block={block as FaqBlock} locale={locale} />;
    case 'contact':      return <PreviewPlaceholder label="Contact form" sub="Inline inquiry form" block={block as ContactBlock} locale={locale} />;
    case 'services':     return <PreviewPlaceholder label="Services" sub="Pulled from your Services list" block={block as ServicesBlock} locale={locale} />;
    case 'projects':     return <PreviewPlaceholder label="Projects grid" sub={`${(block as ProjectsBlock).limit ?? 6} projects, ${(block as ProjectsBlock).featuredOnly ? 'featured only' : 'most recent'}`} block={block as ProjectsBlock} locale={locale} />;
    case 'video':        return <PreviewVideo block={block as VideoBlock} locale={locale} />;
    case 'spacer':       return <div style={{ height: spacerHeight((block as SpacerBlock).size) }} />;
    default:             return null;
  }
}

function spacerHeight(size: 'sm' | 'md' | 'lg' | 'xl'): number {
  return { sm: 16, md: 32, lg: 56, xl: 88 }[size] ?? 32;
}

function pickLocalized(v: { en: string; ar: string } | undefined, locale: Locale): string {
  if (!v) return '';
  return v[locale] || v.en || '';
}

function PreviewHero({ block, locale }: { block: HeroBlock; locale: Locale }) {
  const heading = pickLocalized(block.heading, locale);
  const sub = pickLocalized(block.subheading, locale);
  const eyebrow = pickLocalized(block.eyebrow, locale);
  return (
    <section className="relative px-5 py-8" style={{ background: block.image ? 'transparent' : '#0a0a0a' }}>
      {block.image && (
        <img
          src={block.image}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-50"
          loading="lazy"
        />
      )}
      <div className="relative">
        {eyebrow && <p className="text-[10px] uppercase tracking-[0.3em] text-accent mb-2">{eyebrow}</p>}
        <h3 className="font-display text-2xl leading-tight">{heading || 'Hero heading'}</h3>
        {sub && <p className="mt-2 text-sm opacity-70 max-w-[36ch]">{sub}</p>}
        {block.cta && (
          <span className="inline-block mt-3 px-3 py-1.5 text-[11px] uppercase tracking-widest border border-bone/30">
            {pickLocalized(block.cta.label, locale) || 'Learn more'}
          </span>
        )}
      </div>
    </section>
  );
}

function PreviewText({ block, locale }: { block: TextBlockT; locale: Locale }) {
  return (
    <section className="px-5 py-6 border-t border-white/5" style={{ textAlign: block.align ?? 'left' }}>
      {block.heading && (
        <h3 className="font-display text-lg mb-2">{pickLocalized(block.heading, locale)}</h3>
      )}
      <p className="text-sm opacity-80 leading-relaxed whitespace-pre-wrap">
        {pickLocalized(block.content, locale)}
      </p>
    </section>
  );
}

function PreviewImage({ block, locale }: { block: ImageBlockT; locale: Locale }) {
  return (
    <section className="px-5 py-5 border-t border-white/5">
      {block.src ? (
        <img src={block.src} alt={pickLocalized(block.alt, locale)} className="w-full h-40 object-cover" loading="lazy" />
      ) : (
        <div className="w-full h-32 bg-white/5 flex items-center justify-center text-xs opacity-50">
          (image)
        </div>
      )}
      {block.caption && (
        <p className="text-[11px] opacity-60 mt-2 italic">{pickLocalized(block.caption, locale)}</p>
      )}
    </section>
  );
}

function PreviewGallery({ block, locale }: { block: GalleryBlock; locale: Locale }) {
  const cols = block.columns ?? 3;
  return (
    <section className="px-5 py-5 border-t border-white/5">
      {block.heading && (
        <h3 className="font-display text-lg mb-3">{pickLocalized(block.heading, locale)}</h3>
      )}
      <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {block.images.slice(0, cols * 2).map((img, i) =>
          img.src ? (
            <img key={i} src={img.src} alt="" className="w-full h-16 object-cover" loading="lazy" />
          ) : (
            <div key={i} className="w-full h-16 bg-white/5" />
          ),
        )}
      </div>
    </section>
  );
}

function PreviewStats({ block, locale }: { block: StatsBlock; locale: Locale }) {
  return (
    <section className="px-5 py-6 border-t border-white/5">
      {block.heading && (
        <h3 className="font-display text-lg mb-3">{pickLocalized(block.heading, locale)}</h3>
      )}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {block.items.slice(0, 4).map((it, i) => (
          <div key={i}>
            <p className="font-display text-2xl text-accent leading-none">{it.value}</p>
            <p className="text-[10px] uppercase tracking-widest opacity-70 mt-1">
              {pickLocalized(it.label, locale)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function PreviewCta({ block, locale }: { block: CtaBlock; locale: Locale }) {
  return (
    <section className="px-5 py-6 border-t border-white/5">
      <div className="border border-bone/15 px-4 py-5 text-center">
        <h3 className="font-display text-lg">{pickLocalized(block.heading, locale)}</h3>
        {block.subheading && (
          <p className="text-xs opacity-70 mt-1">{pickLocalized(block.subheading, locale)}</p>
        )}
        <span className="inline-block mt-3 px-3 py-1.5 text-[11px] uppercase tracking-widest bg-accent text-ink">
          {pickLocalized(block.button.label, locale)}
        </span>
      </div>
    </section>
  );
}

function PreviewMarquee({ block, locale }: { block: MarqueeBlock; locale: Locale }) {
  const text = pickLocalized(block.words, locale);
  return (
    <section className="border-y border-white/5 py-3 overflow-hidden">
      <div className="text-sm uppercase tracking-[0.3em] whitespace-nowrap opacity-80 px-5">
        {text} · {text} · {text}
      </div>
    </section>
  );
}

function PreviewFaq({ block, locale }: { block: FaqBlock; locale: Locale }) {
  return (
    <section className="px-5 py-5 border-t border-white/5">
      {block.heading && (
        <h3 className="font-display text-lg mb-3">{pickLocalized(block.heading, locale)}</h3>
      )}
      <ul className="space-y-2">
        {block.items.slice(0, 3).map((it, i) => (
          <li key={i} className="border-b border-white/5 pb-2">
            <p className="text-xs font-medium">Q. {pickLocalized(it.q, locale)}</p>
            <p className="text-[11px] opacity-70 mt-1">{pickLocalized(it.a, locale).slice(0, 120)}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function PreviewVideo({ block, locale }: { block: VideoBlock; locale: Locale }) {
  return (
    <section className="px-5 py-5 border-t border-white/5">
      <div className="relative w-full h-40 bg-white/5 overflow-hidden flex items-center justify-center">
        {block.poster && (
          <img src={block.poster} alt="" className="absolute inset-0 w-full h-full object-cover opacity-70" loading="lazy" />
        )}
        <span className="relative text-3xl text-bone/80">▶</span>
      </div>
      {block.caption && (
        <p className="text-[11px] opacity-60 mt-2 italic">{pickLocalized(block.caption, locale)}</p>
      )}
    </section>
  );
}

function PreviewPlaceholder({
  label,
  sub,
  block,
  locale,
}: {
  label: string;
  sub: string;
  block: { heading?: { en: string; ar: string } };
  locale: Locale;
}) {
  return (
    <section className="px-5 py-5 border-t border-white/5">
      {block.heading && (
        <h3 className="font-display text-lg mb-1">{pickLocalized(block.heading, locale)}</h3>
      )}
      <div className="border border-dashed border-white/10 px-3 py-4 text-center">
        <p className="text-[10px] uppercase tracking-widest opacity-60">{label}</p>
        <p className="text-[11px] opacity-50 mt-1">{sub}</p>
      </div>
    </section>
  );
}
