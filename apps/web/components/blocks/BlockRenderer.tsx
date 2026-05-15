import { Fragment } from 'react';
import type { Block, BlockStyle, Locale } from '@roua/db';
import { Hero } from './Hero';
import { TextBlock } from './TextBlock';
import { ImageBlock } from './ImageBlock';
import { Gallery } from './Gallery';
import { Projects } from './Projects';
import { Services } from './Services';
import { FAQ } from './FAQ';
import { Contact } from './Contact';
import { CTA } from './CTA';
import { Marquee } from './Marquee';
import { Spacer } from './Spacer';
import { Testimonials } from './Testimonials';
import { Stats } from './Stats';
import { Video } from './Video';
import { Embed } from './Embed';

// Dispatches each block to its renderer. Unknown block types are skipped
// silently so renamed/removed types don't break old pages.
export function BlockRenderer({ blocks, locale }: { blocks: Block[]; locale: Locale }) {
  return (
    <>
      {blocks.map((b) => {
        const node = renderOne(b, locale);
        if (!node) return null;
        const style = (b as { style?: BlockStyle }).style;
        const anim = style?.animation;
        if (!anim || anim === 'none') return <Fragment key={b.id}>{node}</Fragment>;
        // Wrap with a data-reveal target so the IntersectionObserver in
        // Reveal.tsx picks it up. Variants ("fade" | "slide-up" | "slide-in"
        // | "zoom") map to CSS in globals.css.
        return (
          <div key={b.id} data-reveal={anim === 'slide-up' ? '' : anim}>
            {node}
          </div>
        );
      })}
    </>
  );
}

function renderOne(b: Block, locale: Locale) {
  switch (b.type) {
    case 'hero':
      return <Hero block={b} locale={locale} />;
    case 'text':
      return <TextBlock block={b} locale={locale} />;
    case 'image':
      return <ImageBlock block={b} locale={locale} />;
    case 'gallery':
      return <Gallery block={b} locale={locale} />;
    case 'projects':
      return <Projects block={b} locale={locale} />;
    case 'services':
      return <Services block={b} locale={locale} />;
    case 'faq':
      return <FAQ block={b} locale={locale} />;
    case 'contact':
      return <Contact block={b} locale={locale} />;
    case 'cta':
      return <CTA block={b} locale={locale} />;
    case 'marquee':
      return <Marquee block={b} locale={locale} />;
    case 'spacer':
      return <Spacer block={b} />;
    case 'testimonials':
      return <Testimonials block={b} locale={locale} />;
    case 'stats':
      return <Stats block={b} locale={locale} />;
    case 'video':
      return <Video block={b} locale={locale} />;
    case 'embed':
      return <Embed block={b} locale={locale} />;
    default:
      return null;
  }
}
