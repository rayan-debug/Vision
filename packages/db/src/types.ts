import type { Locale } from './i18n';

// A localized string field is stored in the DB as JSON `{ en: "...", ar: "..." }`.
export type LocalizedString = Record<Locale, string>;

// ----- Page block schema -----
// Pages are an ordered array of these blocks. The admin editor reads/writes
// this shape; the public site's <BlockRenderer> reads it and dispatches to the
// matching React component. Add a new block by: (1) extending this union,
// (2) adding an editor in apps/admin/components/blocks, (3) adding a renderer
// in apps/web/components/blocks.

export type CtaButton = {
  label: LocalizedString;
  href: string;
};

export type HeroBlock = {
  id: string;
  type: 'hero';
  eyebrow?: LocalizedString;
  heading: LocalizedString;
  subheading?: LocalizedString;
  image?: string;
  cta?: CtaButton;
  variant?: 'fullscreen' | 'split' | 'minimal';
};

export type TextBlock = {
  id: string;
  type: 'text';
  heading?: LocalizedString;
  content: LocalizedString;
  align?: 'left' | 'center';
};

export type ImageBlock = {
  id: string;
  type: 'image';
  src: string;
  alt: LocalizedString;
  caption?: LocalizedString;
  width?: 'narrow' | 'wide' | 'full';
};

export type GalleryBlock = {
  id: string;
  type: 'gallery';
  heading?: LocalizedString;
  images: { src: string; alt: LocalizedString }[];
  columns?: 2 | 3 | 4;
};

export type ProjectsBlock = {
  id: string;
  type: 'projects';
  heading?: LocalizedString;
  limit?: number;
  category?: string;
  featuredOnly?: boolean;
};

export type ServicesBlock = {
  id: string;
  type: 'services';
  heading?: LocalizedString;
};

export type FaqBlock = {
  id: string;
  type: 'faq';
  heading?: LocalizedString;
  items: { q: LocalizedString; a: LocalizedString }[];
};

export type ContactBlock = {
  id: string;
  type: 'contact';
  heading?: LocalizedString;
};

export type CtaBlock = {
  id: string;
  type: 'cta';
  heading: LocalizedString;
  subheading?: LocalizedString;
  button: CtaButton;
};

export type MarqueeBlock = {
  id: string;
  type: 'marquee';
  words: LocalizedString;
};

export type SpacerBlock = {
  id: string;
  type: 'spacer';
  size: 'sm' | 'md' | 'lg' | 'xl';
};

export type Block =
  | HeroBlock
  | TextBlock
  | ImageBlock
  | GalleryBlock
  | ProjectsBlock
  | ServicesBlock
  | FaqBlock
  | ContactBlock
  | CtaBlock
  | MarqueeBlock
  | SpacerBlock;

export type BlockType = Block['type'];

export const BLOCK_TYPES: { type: BlockType; label: string }[] = [
  { type: 'hero', label: 'Hero' },
  { type: 'text', label: 'Text' },
  { type: 'image', label: 'Image' },
  { type: 'gallery', label: 'Gallery' },
  { type: 'projects', label: 'Projects grid' },
  { type: 'services', label: 'Services' },
  { type: 'faq', label: 'FAQ (AEO)' },
  { type: 'contact', label: 'Contact form' },
  { type: 'cta', label: 'Call to action' },
  { type: 'marquee', label: 'Marquee' },
  { type: 'spacer', label: 'Spacer' },
];

// Page meta stored under Page.i18n[locale].
export type PageMeta = {
  title: string;
  description?: string;
  keywords?: string;
};
