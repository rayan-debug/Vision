'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import clsx from 'clsx';

const NAV = [
  { href: '/', label: 'Dashboard', icon: '◆' },
  { href: '/pages', label: 'Pages', icon: '▤' },
  { href: '/projects', label: 'Projects', icon: '▢' },
  { href: '/services', label: 'Services', icon: '◐' },
  { href: '/testimonials', label: 'Testimonials', icon: '❝' },
  { href: '/media', label: 'Media', icon: '◉' },
  { href: '/inquiries', label: 'Inquiries', icon: '✉' },
  { href: '/settings', label: 'Site settings', icon: '✦' },
];

const COLLAPSED_KEY = 'admin:sidebar:collapsed';

export function AdminShell({
  email,
  unreadInquiries = 0,
  children,
}: {
  email: string;
  unreadInquiries?: number;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  // Desktop: collapsed vs expanded. Persisted to localStorage.
  const [collapsed, setCollapsed] = useState(false);
  // Mobile: drawer open or closed. Always starts closed.
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(COLLAPSED_KEY);
      if (stored === '1') setCollapsed(true);
    } catch {
      /* ignore — storage disabled */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(COLLAPSED_KEY, collapsed ? '1' : '0');
    } catch {
      /* ignore */
    }
  }, [collapsed]);

  // Close mobile drawer on route change.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock body scroll while the mobile drawer is open.
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const original = document.body.style.overflow;
    document.body.style.overflow = mobileOpen ? 'hidden' : original;
    return () => {
      document.body.style.overflow = original;
    };
  }, [mobileOpen]);

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.replace('/login');
  }

  const currentLabel =
    NAV.find((item) =>
      item.href === '/' ? pathname === '/' : pathname.startsWith(item.href),
    )?.label ?? 'Admin';

  return (
    <div className="flex min-h-screen">
      {/* Mobile-only backdrop */}
      {mobileOpen && (
        <button
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-ink/60 md:hidden"
        />
      )}

      <SidebarPanel
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        unreadInquiries={unreadInquiries}
        email={email}
        pathname={pathname}
        onToggleCollapsed={() => setCollapsed((c) => !c)}
        onCloseMobile={() => setMobileOpen(false)}
        onLogout={logout}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile top bar */}
        <header className="md:hidden sticky top-0 z-30 bg-ink text-bone border-b border-bone/10 px-4 py-3 flex items-center gap-3">
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
            className="p-1 -ml-1 text-bone hover:text-accent"
          >
            <HamburgerIcon />
          </button>
          <span className="font-display text-base flex-1 truncate">{currentLabel}</span>
          {unreadInquiries > 0 && (
            <Link
              href="/inquiries"
              className="text-[10px] font-mono bg-accent text-ink px-1.5 py-0.5"
            >
              {unreadInquiries} new
            </Link>
          )}
        </header>

        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}

function SidebarPanel({
  collapsed,
  mobileOpen,
  unreadInquiries,
  email,
  pathname,
  onToggleCollapsed,
  onCloseMobile,
  onLogout,
}: {
  collapsed: boolean;
  mobileOpen: boolean;
  unreadInquiries: number;
  email: string;
  pathname: string;
  onToggleCollapsed: () => void;
  onCloseMobile: () => void;
  onLogout: () => void;
}) {
  return (
    <aside
      className={clsx(
        'bg-ink text-bone flex flex-col transition-[width,transform] duration-200 ease-out',
        // Mobile: fixed drawer that slides in.
        'fixed inset-y-0 left-0 z-50 w-72 md:static md:translate-x-0',
        mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        // Desktop: full or collapsed width.
        collapsed ? 'md:w-16' : 'md:w-64',
      )}
    >
      <div
        className={clsx(
          'border-b border-bone/10 flex items-center gap-2',
          collapsed ? 'px-3 py-4 md:justify-center' : 'px-6 py-6',
        )}
      >
        <Link href="/" className="flex items-center gap-2 flex-1 min-w-0">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-accent shrink-0">
            <path
              d="M3 13C8 12 11 9 12 4C13 9 16 12 21 13C16 14 13 17 12 22C11 17 8 14 3 13Z"
              fill="currentColor"
            />
          </svg>
          {!collapsed && (
            <span className="font-display text-lg truncate">The Vision</span>
          )}
        </Link>

        {/* Mobile close button */}
        <button
          type="button"
          aria-label="Close menu"
          onClick={onCloseMobile}
          className="md:hidden p-1 text-bone/70 hover:text-bone"
        >
          <CloseIcon />
        </button>

        {/* Desktop collapse toggle */}
        <button
          type="button"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          onClick={onToggleCollapsed}
          className={clsx(
            'hidden md:block p-1 text-bone/60 hover:text-accent transition-colors',
            collapsed && 'md:hidden',
          )}
        >
          <ChevronLeftIcon />
        </button>
      </div>

      {!collapsed && (
        <p className="px-6 text-[10px] uppercase tracking-widest text-bone/40 -mt-4 mb-2 md:block hidden">
          Admin
        </p>
      )}

      <nav className={clsx('flex-1 py-3 space-y-0.5 overflow-y-auto', collapsed ? 'px-2' : 'px-3')}>
        {NAV.map((item) => {
          const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={clsx(
                'flex items-center gap-3 text-sm transition-colors',
                collapsed ? 'px-2 py-2 justify-center md:justify-center' : 'px-3 py-2',
                active ? 'bg-accent text-ink' : 'text-bone/70 hover:text-bone hover:bg-ink-50',
              )}
            >
              <span className="text-base w-5 text-center shrink-0">{item.icon}</span>
              {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
              {item.href === '/inquiries' && unreadInquiries > 0 && (
                <span
                  className={clsx(
                    'text-[10px] px-1.5 py-0.5 font-mono shrink-0',
                    collapsed && 'absolute -mt-5 -mr-5 right-3',
                    active ? 'bg-ink text-accent' : 'bg-accent text-ink',
                  )}
                >
                  {collapsed ? '•' : unreadInquiries}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className={clsx('border-t border-bone/10 py-3', collapsed ? 'px-2' : 'px-3')}>
        <a
          href={process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}
          target="_blank"
          rel="noreferrer"
          title={collapsed ? 'View live site' : undefined}
          className={clsx(
            'flex items-center gap-3 text-sm text-bone/70 hover:text-accent transition-colors',
            collapsed ? 'px-2 py-2 justify-center' : 'px-3 py-2',
          )}
        >
          <span className="text-base w-5 text-center shrink-0">↗</span>
          {!collapsed && <span className="truncate">View live site</span>}
        </a>
        <button
          onClick={onLogout}
          title={collapsed ? `${email} · Log out` : undefined}
          className={clsx(
            'w-full flex items-center gap-3 text-sm text-bone/70 hover:text-bone transition-colors',
            collapsed ? 'px-2 py-2 justify-center' : 'px-3 py-2',
          )}
        >
          <span className="text-base w-5 text-center shrink-0">⏻</span>
          {!collapsed && <span className="truncate">{email} · Log out</span>}
        </button>

        {/* Desktop expand button when collapsed */}
        {collapsed && (
          <button
            type="button"
            aria-label="Expand sidebar"
            onClick={onToggleCollapsed}
            className="hidden md:flex w-full items-center justify-center px-2 py-2 mt-1 text-bone/60 hover:text-accent transition-colors"
          >
            <ChevronRightIcon />
          </button>
        )}
      </div>
    </aside>
  );
}

function HamburgerIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

function ChevronLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
      <path d="M15 6l-6 6 6 6" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}
