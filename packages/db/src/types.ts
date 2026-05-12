import type { Locale } from './i18n';

// A localized string field is stored in the DB as JSON `{ en: "...", ar: "..." }`.
export type LocalizedString = Record<Locale, string>;

// Optional per-block style overrides. Every block accepts these as an
// optional `style` field; renderers translate them to inline styles + class
// names so any block can be tinted, resized, or padded without code changes.
export type BlockStyle = {
  // Hex colors. Background tints the section; textColor overrides body copy
  // and headings within the section.
  background?: string;
  textColor?: string;
  // Heading scale multiplier. 1 = default; 1.5 = 50% bigger; 0.75 = smaller.
  headingScale?: number;
  // Body text scale multiplier.
  textScale?: number;
  // Vertical padding multiplier on top/bottom of the section (1 = default).
  paddingY?: number;
  // Horizontal padding override — defaults match container.
  paddingX?: 'tight' | 'normal' | 'wide' | 'edge';
  // Alignment override for text-heavy blocks.
  align?: 'left' | 'center' | 'right';
  // Constrain inner content width.
  maxWidth?: 'narrow' | 'normal' | 'wide' | 'full';
  // Hide on small screens or large screens.
  hideOn?: 'mobile' | 'desktop';
};

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
  style?: BlockStyle;
};

export type TextBlock = {
  id: string;
  type: 'text';
  heading?: LocalizedString;
  content: LocalizedString;
  align?: 'left' | 'center';
  style?: BlockStyle;
};

export type ImageBlock = {
  id: string;
  type: 'image';
  src: string;
  alt: LocalizedString;
  caption?: LocalizedString;
  width?: 'narrow' | 'wide' | 'full';
  style?: BlockStyle;
};

export type GalleryBlock = {
  id: string;
  type: 'gallery';
  heading?: LocalizedString;
  images: { src: string; alt: LocalizedString }[];
  columns?: 2 | 3 | 4;
  style?: BlockStyle;
};

export type ProjectsBlock = {
  id: string;
  type: 'projects';
  heading?: LocalizedString;
  limit?: number;
  category?: string;
  featuredOnly?: boolean;
  style?: BlockStyle;
};

export type ServicesBlock = {
  id: string;
  type: 'services';
  heading?: LocalizedString;
  style?: BlockStyle;
};

export type FaqBlock = {
  id: string;
  type: 'faq';
  heading?: LocalizedString;
  items: { q: LocalizedString; a: LocalizedString }[];
  style?: BlockStyle;
};

export type ContactBlock = {
  id: string;
  type: 'contact';
  heading?: LocalizedString;
  style?: BlockStyle;
};

export type CtaBlock = {
  id: string;
  type: 'cta';
  heading: LocalizedString;
  subheading?: LocalizedString;
  button: CtaButton;
  style?: BlockStyle;
};

export type MarqueeBlock = {
  id: string;
  type: 'marquee';
  words: LocalizedString;
  style?: BlockStyle;
};

export type SpacerBlock = {
  id: string;
  type: 'spacer';
  size: 'sm' | 'md' | 'lg' | 'xl';
  style?: BlockStyle;
};

export type TestimonialsBlock = {
  id: string;
  type: 'testimonials';
  heading?: LocalizedString;
  // Optional filter — when true, only show testimonials marked featured.
  featuredOnly?: boolean;
  limit?: number;
  variant?: 'cards' | 'quote-stack';
  style?: BlockStyle;
};

export type StatsBlock = {
  id: string;
  type: 'stats';
  heading?: LocalizedString;
  items: { value: string; label: LocalizedString }[];
  style?: BlockStyle;
};

export type EmbedBlock = {
  id: string;
  type: 'embed';
  // Raw HTML / iframe markup the admin pastes in. Rendered with
  // dangerouslySetInnerHTML, so admin-only.
  html: string;
  caption?: LocalizedString;
  style?: BlockStyle;
};

export type VideoBlock = {
  id: string;
  type: 'video';
  // YouTube/Vimeo URL or direct mp4. The renderer normalises to a responsive
  // iframe/<video>.
  url: string;
  caption?: LocalizedString;
  poster?: string;
  style?: BlockStyle;
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
  | SpacerBlock
  | TestimonialsBlock
  | StatsBlock
  | EmbedBlock
  | VideoBlock;

export type BlockType = Block['type'];

// Each block carries a description shown in the add-block picker so editors
// know exactly what they're inserting and where it appears.
export const BLOCK_TYPES: { type: BlockType; label: string; description: string }[] = [
  { type: 'hero', label: 'Hero', description: 'Full-width opener with a big headline. Goes at the top of the page.' },
  { type: 'text', label: 'Text', description: 'A heading + body paragraph. Great for intros, about, and editorial copy.' },
  { type: 'image', label: 'Image', description: 'A single image with optional caption. Narrow, wide, or full-bleed.' },
  { type: 'gallery', label: 'Gallery', description: 'A 2/3/4-column image grid with alt text.' },
  { type: 'video', label: 'Video', description: 'YouTube, Vimeo, or self-hosted MP4. Renders as a 16:9 player.' },
  { type: 'projects', label: 'Projects grid', description: 'Pulls from Projects with optional category & limit. Used on the home page.' },
  { type: 'services', label: 'Services', description: 'Lists everything you set in the Services section.' },
  { type: 'testimonials', label: 'Testimonials', description: 'Client quotes from the Testimonials section. Cards or quote-stack.' },
  { type: 'stats', label: 'Stats / numbers', description: 'Big numbers + labels — projects shipped, years, awards.' },
  { type: 'faq', label: 'FAQ (AEO)', description: 'Question & answer list. Also outputs FAQPage schema for AI search.' },
  { type: 'contact', label: 'Contact form', description: 'Inline form that writes to the Inquiries inbox.' },
  { type: 'cta', label: 'Call to action', description: 'Bordered banner with a heading + button. Use to close a page.' },
  { type: 'marquee', label: 'Marquee', description: 'Auto-scrolling text strip. Brand keywords or services.' },
  { type: 'embed', label: 'Embed / HTML', description: 'Paste raw HTML/iframe markup. Anything custom you can\'t do with a block.' },
  { type: 'spacer', label: 'Spacer', description: 'Empty vertical space between sections.' },
];

// Translatable navigation labels stored on SiteSettings.navLabels.
export type NavLabels = Record<Locale, {
  work?: string;
  contact?: string;
}>;

// 6 ready-made color presets — surfaced in the settings editor for one-click
// theming.
export const THEME_PRESETS = [
  { name: 'Vision (default)', primary: '#0a0a0a', accent: '#ff5a1f' },
  { name: 'Midnight ink',     primary: '#0b1220', accent: '#7c5cff' },
  { name: 'Bone & rust',      primary: '#1a1410', accent: '#c2410c' },
  { name: 'Forest noir',      primary: '#0e1410', accent: '#10b981' },
  { name: 'Mono',             primary: '#111111', accent: '#e5e5e5' },
  { name: 'Plum',             primary: '#1a0f1f', accent: '#d946ef' },
  { name: 'Ocean',            primary: '#0a1929', accent: '#38bdf8' },
  { name: 'Sahara',           primary: '#1c1208', accent: '#facc15' },
] as const;

// Page meta stored under Page.i18n[locale].
export type PageMeta = {
  title: string;
  description?: string;
  keywords?: string;
};

// Curated Google Fonts catalogue — surfaced as a dropdown in the settings
// editor. Each `display` font is suitable for big headlines, each `sans` for
// body copy. Extend freely.
export const FONT_OPTIONS = {
  display: [
    'Playfair Display',
    'Cormorant Garamond',
    'EB Garamond',
    'Fraunces',
    'DM Serif Display',
    'Libre Caslon Display',
    'Italiana',
    'Tenor Sans',
    'Inter',
    'Manrope',
    'Space Grotesk',
    'Syne',
    'Archivo',
    'Bebas Neue',
    'Anton',
  ],
  body: [
    'Inter',
    'Manrope',
    'Work Sans',
    'DM Sans',
    'Space Grotesk',
    'Geist',
    'IBM Plex Sans',
    'Source Sans 3',
    'Nunito Sans',
    'Karla',
    'Lato',
    'Public Sans',
  ],
  mono: [
    'JetBrains Mono',
    'Fira Code',
    'IBM Plex Mono',
    'Space Mono',
    'Source Code Pro',
    'Geist Mono',
  ],
} as const;

// Letter-spacing presets keyed off SiteSettings.letterSpacing.
export const LETTER_SPACING_PRESETS: Record<string, string> = {
  tight: '-0.04em',
  normal: '-0.02em',
  loose: '0em',
};
