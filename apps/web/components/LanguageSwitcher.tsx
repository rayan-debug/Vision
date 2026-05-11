'use client';
import { usePathname, useRouter } from 'next/navigation';
import { LOCALES, type Locale } from '@roua/db';

export function LanguageSwitcher({ current }: { current: Locale }) {
  const pathname = usePathname();
  const router = useRouter();

  const switchTo = (next: Locale) => {
    document.cookie = `NEXT_LOCALE=${next}; path=/; max-age=31536000; SameSite=Lax`;
    const segments = pathname.split('/').filter(Boolean);
    if (segments[0] && (LOCALES as readonly string[]).includes(segments[0])) {
      segments[0] = next;
    } else {
      segments.unshift(next);
    }
    router.push('/' + segments.join('/'));
  };

  return (
    <div className="flex items-center gap-1 text-xs tracking-widest uppercase">
      {LOCALES.map((loc, i) => (
        <span key={loc} className="flex items-center gap-1">
          <button
            onClick={() => switchTo(loc)}
            className={
              loc === current
                ? 'text-accent'
                : 'text-bone/60 hover:text-bone transition-colors'
            }
            aria-current={loc === current ? 'true' : undefined}
          >
            {loc.toUpperCase()}
          </button>
          {i < LOCALES.length - 1 && <span className="text-bone/30">/</span>}
        </span>
      ))}
    </div>
  );
}
