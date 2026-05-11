// Single source of truth for supported locales. Change this array to add,
// remove, or rename languages — both apps and the schema pick it up.
export const LOCALES = ['en', 'fr'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  fr: 'Français',
};

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

// Pick a localized string out of a translatable JSON field. Falls back to the
// default locale, then to the first non-empty value, then to an empty string —
// so half-translated drafts still render without crashing.
export function t(
  field: unknown,
  locale: Locale,
  fallback: Locale = DEFAULT_LOCALE
): string {
  if (!field || typeof field !== 'object') return '';
  const map = field as Record<string, unknown>;
  const direct = map[locale];
  if (typeof direct === 'string' && direct.length > 0) return direct;
  const fb = map[fallback];
  if (typeof fb === 'string' && fb.length > 0) return fb;
  for (const v of Object.values(map)) {
    if (typeof v === 'string' && v.length > 0) return v;
  }
  return '';
}

// Helper to build a localized JSON value from an object of locale → string.
export function localized(values: Partial<Record<Locale, string>>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const loc of LOCALES) out[loc] = values[loc] ?? '';
  return out;
}
