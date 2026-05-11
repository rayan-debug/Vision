import { headers, cookies } from 'next/headers';
import { LOCALES, DEFAULT_LOCALE, isLocale, type Locale } from '@roua/db';

const COOKIE = 'NEXT_LOCALE';

export async function getLocaleFromHeaders(): Promise<Locale> {
  const cookieStore = await cookies();
  const fromCookie = cookieStore.get(COOKIE)?.value;
  if (fromCookie && isLocale(fromCookie)) return fromCookie;

  const headerList = await headers();
  const accept = headerList.get('accept-language') ?? '';
  for (const part of accept.split(',')) {
    const tag = part.split(';')[0].trim().toLowerCase().split('-')[0];
    if (isLocale(tag)) return tag;
  }
  return DEFAULT_LOCALE;
}

export function alternateLocale(current: Locale): Locale {
  return (LOCALES.find((l) => l !== current) ?? DEFAULT_LOCALE) as Locale;
}

export { LOCALES, DEFAULT_LOCALE };
export type { Locale };
