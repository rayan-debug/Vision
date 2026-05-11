'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import clsx from 'clsx';

const NAV = [
  { href: '/', label: 'Dashboard', icon: '◆' },
  { href: '/pages', label: 'Pages', icon: '▤' },
  { href: '/projects', label: 'Projects', icon: '▢' },
  { href: '/services', label: 'Services', icon: '◐' },
  { href: '/media', label: 'Media', icon: '◉' },
  { href: '/settings', label: 'Site settings', icon: '✦' },
];

export function Sidebar({ email }: { email: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.replace('/login');
  }

  return (
    <aside className="w-64 shrink-0 bg-ink text-bone min-h-screen flex flex-col">
      <div className="px-6 py-6 border-b border-bone/10">
        <Link href="/" className="flex items-center gap-2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-accent">
            <path
              d="M3 13C8 12 11 9 12 4C13 9 16 12 21 13C16 14 13 17 12 22C11 17 8 14 3 13Z"
              fill="currentColor"
            />
          </svg>
          <span className="font-display text-lg">The Vision</span>
        </Link>
        <p className="text-[10px] uppercase tracking-widest text-bone/40 mt-1">Admin</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map((item) => {
          const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2 text-sm transition-colors',
                active
                  ? 'bg-accent text-ink'
                  : 'text-bone/70 hover:text-bone hover:bg-ink-50'
              )}
            >
              <span className="text-base w-5 text-center">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-bone/10">
        <a
          href={process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 px-3 py-2 text-sm text-bone/70 hover:text-accent transition-colors"
        >
          <span className="text-base w-5 text-center">↗</span>
          View live site
        </a>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-bone/70 hover:text-bone transition-colors"
        >
          <span className="text-base w-5 text-center">⏻</span>
          {email} · Log out
        </button>
      </div>
    </aside>
  );
}
