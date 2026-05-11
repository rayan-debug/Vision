import type { Block, Locale } from '@roua/db';
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

// Dispatches each block to its renderer. Unknown block types are skipped
// silently so renamed/removed types don't break old pages.
export function BlockRenderer({ blocks, locale }: { blocks: Block[]; locale: Locale }) {
  return (
    <>
      {blocks.map((b) => {
        switch (b.type) {
          case 'hero':
            return <Hero key={b.id} block={b} locale={locale} />;
          case 'text':
            return <TextBlock key={b.id} block={b} locale={locale} />;
          case 'image':
            return <ImageBlock key={b.id} block={b} locale={locale} />;
          case 'gallery':
            return <Gallery key={b.id} block={b} locale={locale} />;
          case 'projects':
            return <Projects key={b.id} block={b} locale={locale} />;
          case 'services':
            return <Services key={b.id} block={b} locale={locale} />;
          case 'faq':
            return <FAQ key={b.id} block={b} locale={locale} />;
          case 'contact':
            return <Contact key={b.id} block={b} locale={locale} />;
          case 'cta':
            return <CTA key={b.id} block={b} locale={locale} />;
          case 'marquee':
            return <Marquee key={b.id} block={b} locale={locale} />;
          case 'spacer':
            return <Spacer key={b.id} block={b} />;
          default:
            return null;
        }
      })}
    </>
  );
}
