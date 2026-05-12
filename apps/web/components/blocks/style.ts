import type { BlockStyle } from '@roua/db';

const MAX_WIDTH_CLASS: Record<NonNullable<BlockStyle['maxWidth']>, string> = {
  narrow: 'max-w-2xl mx-auto',
  normal: 'max-w-5xl mx-auto',
  wide: 'max-w-7xl mx-auto',
  full: '',
};

const PADDING_X_CLASS: Record<NonNullable<BlockStyle['paddingX']>, string> = {
  tight: 'px-4 md:px-6',
  normal: 'px-6 md:px-10',
  wide: 'px-8 md:px-16',
  edge: 'px-0',
};

const ALIGN_CLASS: Record<NonNullable<BlockStyle['align']>, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

const HIDE_CLASS: Record<NonNullable<BlockStyle['hideOn']>, string> = {
  mobile: 'hidden md:block',
  desktop: 'md:hidden',
};

// Translate a BlockStyle into Tailwind classes + inline CSS variables. Returns
// `{ className, style }` for spreading onto the outer section element.
export function blockStyle(style?: BlockStyle): { className: string; style: React.CSSProperties } {
  const classes: string[] = [];
  const css: React.CSSProperties & Record<string, string | number> = {};

  if (style?.background) css.background = style.background;
  if (style?.textColor) css.color = style.textColor;

  if (typeof style?.headingScale === 'number' && Number.isFinite(style.headingScale)) {
    css['--font-scale' as never] = String(style.headingScale);
  }
  if (typeof style?.textScale === 'number' && Number.isFinite(style.textScale)) {
    css.fontSize = `${style.textScale}rem`;
  }
  if (typeof style?.paddingY === 'number' && Number.isFinite(style.paddingY)) {
    css['--section-spacing' as never] = String(style.paddingY);
  }

  if (style?.paddingX) classes.push(PADDING_X_CLASS[style.paddingX]);
  if (style?.align) classes.push(ALIGN_CLASS[style.align]);
  if (style?.maxWidth && MAX_WIDTH_CLASS[style.maxWidth]) classes.push(MAX_WIDTH_CLASS[style.maxWidth]);
  if (style?.hideOn) classes.push(HIDE_CLASS[style.hideOn]);

  return { className: classes.join(' '), style: css as React.CSSProperties };
}
