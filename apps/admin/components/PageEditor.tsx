'use client';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import { BlockList } from './BlockList';
import { SeoHealth } from './SeoHealth';
import { BLOCK_TYPES, LOCALES, type Block, type Locale } from '@roua/db';

type Device = 'desktop' | 'tablet' | 'mobile';
const DEVICE_WIDTH: Record<Device, string> = {
  desktop: '100%',
  tablet: '768px',
  mobile: '390px',
};

type Meta = { title: string; description?: string; keywords?: string };

type Page = {
  id: string;
  slugEn: string;
  slugAr: string;
  i18n: Record<string, Meta>;
  blocks: unknown[];
  status: 'DRAFT' | 'PUBLISHED';
  isHome: boolean;
  showInNav: boolean;
  navOrder: number;
  ogImage: string | null;
  noindex: boolean;
  updatedAt: string;
};

export function PageEditor({
  page,
  previewToken,
  publicSiteUrl,
}: {
  page: Page;
  previewToken: string;
  publicSiteUrl: string;
}) {
  const router = useRouter();
  const [state, setState] = useState(page);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [previewLocale, setPreviewLocale] = useState<Locale>('en');
  const [tab, setTab] = useState<'content' | 'seo' | 'settings'>('content');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [device, setDevice] = useState<Device>('desktop');

  // Undo/redo history. The current state always lives at history[index].
  // History is in-memory only and resets on reload — that's fine: it's a
  // "undo recent typing" tool, not version control.
  const historyRef = useRef<Page[]>([page]);
  const indexRef = useRef(0);
  const [historyVersion, setHistoryVersion] = useState(0);
  const HISTORY_LIMIT = 80;

  const pushHistory = useCallback((next: Page) => {
    const h = historyRef.current.slice(0, indexRef.current + 1);
    h.push(next);
    // Cap memory: drop oldest entries past the limit.
    while (h.length > HISTORY_LIMIT) h.shift();
    historyRef.current = h;
    indexRef.current = h.length - 1;
    setHistoryVersion((v) => v + 1);
  }, []);

  const commit = useCallback((nextState: Page) => {
    setState(nextState);
    setDirty(true);
    pushHistory(nextState);
  }, [pushHistory]);

  const update = useCallback(<K extends keyof Page>(key: K, value: Page[K]) => {
    setState((prev) => {
      const next = { ...prev, [key]: value };
      pushHistory(next);
      return next;
    });
    setDirty(true);
  }, [pushHistory]);

  const updateI18n = useCallback((locale: Locale, key: keyof Meta, value: string) => {
    setState((prev) => {
      const next = {
        ...prev,
        i18n: { ...prev.i18n, [locale]: { ...(prev.i18n[locale] ?? { title: '' }), [key]: value } },
      };
      pushHistory(next);
      return next;
    });
    setDirty(true);
  }, [pushHistory]);

  const updateBlocks = useCallback((blocks: Block[]) => {
    setState((prev) => {
      const next = { ...prev, blocks: blocks as unknown as unknown[] };
      pushHistory(next);
      return next;
    });
    setDirty(true);
  }, [pushHistory]);

  const canUndo = indexRef.current > 0;
  const canRedo = indexRef.current < historyRef.current.length - 1;

  const undo = useCallback(() => {
    if (indexRef.current <= 0) return;
    indexRef.current -= 1;
    setState(historyRef.current[indexRef.current]);
    setHistoryVersion((v) => v + 1);
    setDirty(true);
  }, []);

  const redo = useCallback(() => {
    if (indexRef.current >= historyRef.current.length - 1) return;
    indexRef.current += 1;
    setState(historyRef.current[indexRef.current]);
    setHistoryVersion((v) => v + 1);
    setDirty(true);
  }, []);

  // Warn before leaving with unsaved changes.
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);

  const saveRef = useRef<((opts?: { publish?: boolean; unpublish?: boolean }) => void) | null>(null);

  // Keyboard shortcuts: Cmd/Ctrl+S, Cmd/Ctrl+Z, Cmd/Ctrl+Shift+Z.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const mod = e.ctrlKey || e.metaKey;
      if (!mod) return;
      const key = e.key.toLowerCase();
      if (key === 's') {
        e.preventDefault();
        saveRef.current?.();
      } else if (key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if ((key === 'z' && e.shiftKey) || key === 'y') {
        e.preventDefault();
        redo();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [undo, redo]);

  async function save(opts: { publish?: boolean; unpublish?: boolean } = {}) {
    setBusy(true);
    setError(null);
    const payload = {
      slugEn: state.slugEn,
      slugAr: state.slugAr,
      i18n: state.i18n,
      blocks: state.blocks,
      showInNav: state.showInNav,
      navOrder: state.navOrder,
      isHome: state.isHome,
      ogImage: state.ogImage,
      noindex: state.noindex,
      status: opts.publish ? 'PUBLISHED' : opts.unpublish ? 'DRAFT' : undefined,
    };
    const res = await fetch(`/api/pages/${state.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    setBusy(false);
    if (res.ok) {
      const { page: saved } = await res.json();
      setState((s) => ({ ...s, status: saved.status, updatedAt: saved.updatedAt }));
      setDirty(false);
      router.refresh();
    } else {
      const b = await res.json().catch(() => ({}));
      setError(b.error ?? 'Save failed.');
    }
  }
  saveRef.current = save;

  async function destroy() {
    if (!confirm('Delete this page permanently?')) return;
    const res = await fetch(`/api/pages/${state.id}`, { method: 'DELETE' });
    if (res.ok) router.push('/pages');
    else {
      const b = await res.json().catch(() => ({}));
      setError(b.error ?? 'Delete failed.');
    }
  }

  const previewUrl = useMemo(
    () => `${publicSiteUrl}/preview/${state.id}?token=${encodeURIComponent(previewToken)}&locale=${previewLocale}&t=${state.updatedAt}`,
    [publicSiteUrl, state.id, previewToken, previewLocale, state.updatedAt]
  );

  return (
    <div className="flex flex-col lg:flex-row lg:h-[calc(100vh-0px)] lg:overflow-hidden">
      {/* Left: editor */}
      <div className="w-full lg:w-[480px] shrink-0 border-b lg:border-b-0 lg:border-r border-ink/10 bg-surface-50 flex flex-col min-h-screen lg:min-h-0">
        <header className="px-4 md:px-6 py-4 border-b border-ink/10 bg-surface flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] uppercase tracking-widest text-muted">Editing</p>
            <h1 className="font-display text-lg md:text-xl truncate">
              {state.i18n.en?.title || state.slugEn}
            </h1>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={undo}
              disabled={!canUndo}
              title="Undo (Ctrl/Cmd+Z)"
              className="btn-ghost text-xs px-2 py-1 disabled:opacity-30"
              aria-label="Undo"
            >
              ↶
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              title="Redo (Ctrl/Cmd+Shift+Z)"
              className="btn-ghost text-xs px-2 py-1 disabled:opacity-30"
              aria-label="Redo"
            >
              ↷
            </button>
            <span
              className={clsx(
                'tag',
                state.status === 'PUBLISHED' ? 'border-accent text-accent' : 'text-muted'
              )}
            >
              {dirty ? 'UNSAVED' : state.status}
            </span>
            <button
              onClick={() => setPreviewOpen(true)}
              className="lg:hidden btn-outline text-xs"
              title="Show live preview"
            >
              Preview
            </button>
          </div>
        </header>

        <div className="px-4 md:px-6 pt-4 flex gap-1 border-b border-ink/10 -mb-px overflow-x-auto">
          {(['content', 'seo', 'settings'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={clsx(
                'px-3 py-2 text-xs uppercase tracking-widest border-b-2 -mb-px transition-colors shrink-0',
                tab === t ? 'border-accent text-ink' : 'border-transparent text-muted hover:text-ink'
              )}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6">
          {tab === 'content' && (
            <BlockList
              blocks={(state.blocks as unknown) as Block[]}
              onChange={updateBlocks}
              blockTypes={BLOCK_TYPES}
            />
          )}

          {tab === 'seo' && (
            <div className="space-y-6">
              <SeoHealth
                page={{
                  slugEn: state.slugEn,
                  slugAr: state.slugAr,
                  i18n: state.i18n,
                  blocks: state.blocks,
                  ogImage: state.ogImage,
                  noindex: state.noindex,
                  isHome: state.isHome,
                }}
              />
              {LOCALES.map((loc) => (
                <div key={loc} className="card">
                  <p className="text-xs uppercase tracking-widest text-accent mb-3">{loc}</p>
                  <label className="block mb-3">
                    <span className="label">Meta title</span>
                    <input
                      value={state.i18n[loc]?.title ?? ''}
                      onChange={(e) => updateI18n(loc, 'title', e.target.value)}
                      className="input"
                    />
                  </label>
                  <label className="block mb-3">
                    <span className="label">Meta description</span>
                    <textarea
                      value={state.i18n[loc]?.description ?? ''}
                      onChange={(e) => updateI18n(loc, 'description', e.target.value)}
                      rows={3}
                      className="textarea"
                    />
                    <span className="text-[10px] text-muted mt-1 block">
                      {(state.i18n[loc]?.description ?? '').length} chars · aim for 140–160
                    </span>
                  </label>
                  <label className="block">
                    <span className="label">Keywords</span>
                    <input
                      value={state.i18n[loc]?.keywords ?? ''}
                      onChange={(e) => updateI18n(loc, 'keywords', e.target.value)}
                      className="input"
                      placeholder="graphic designer, brand, …"
                    />
                  </label>
                </div>
              ))}
              <label className="block">
                <span className="label">OpenGraph image URL</span>
                <input
                  value={state.ogImage ?? ''}
                  onChange={(e) => update('ogImage', e.target.value)}
                  className="input"
                  placeholder="https://…"
                />
                <span className="text-[10px] text-muted mt-1 block">
                  Used by Google, social, and AI search previews. Leave blank to fall back to the site-wide default in Settings.
                </span>
              </label>
              <label className="flex items-start gap-2 cursor-pointer pt-2 border-t border-ink/10">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={state.noindex}
                  onChange={(e) => update('noindex', e.target.checked)}
                />
                <span className="text-sm">
                  Hide from search engines (<code>noindex</code>)
                  <span className="block text-[10px] text-muted mt-0.5">
                    Page stays publicly reachable but Google, Bing, and AI crawlers skip it. Use for thank-you pages, internal links, or drafts you don&apos;t want surfaced.
                  </span>
                </span>
              </label>
            </div>
          )}

          {tab === 'settings' && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="label">Slug · EN</span>
                  <input
                    value={state.slugEn}
                    onChange={(e) => update('slugEn', e.target.value.toLowerCase())}
                    className="input font-mono"
                  />
                </label>
                <label className="block">
                  <span className="label">Slug · AR</span>
                  <input
                    value={state.slugAr}
                    onChange={(e) => update('slugAr', e.target.value.toLowerCase())}
                    className="input font-mono"
                  />
                </label>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={state.isHome}
                  onChange={(e) => update('isHome', e.target.checked)}
                />
                <span className="text-sm">This is the home page (landing)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={state.showInNav}
                  onChange={(e) => update('showInNav', e.target.checked)}
                />
                <span className="text-sm">Show in main navigation</span>
              </label>

              <label className="block">
                <span className="label">Navigation order</span>
                <input
                  type="number"
                  value={state.navOrder}
                  onChange={(e) => update('navOrder', Number(e.target.value) || 0)}
                  className="input w-24"
                />
              </label>

              <div className="pt-6 border-t border-ink/10">
                <button onClick={destroy} className="btn-danger">
                  Delete page
                </button>
              </div>
            </div>
          )}
        </div>

        <footer className="sticky bottom-0 px-4 md:px-6 py-3 md:py-4 border-t border-ink/10 bg-surface flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs text-muted">
            {dirty ? 'Unsaved changes' : `Saved ${new Date(state.updatedAt).toLocaleTimeString()}`}
            {error && <span className="ml-2 text-red-700">· {error}</span>}
          </div>
          <div className="flex gap-2 ml-auto">
            <button onClick={() => save()} disabled={busy || !dirty} className="btn-outline text-xs">
              {busy ? 'Saving…' : 'Save draft'}
            </button>
            {state.status === 'PUBLISHED' ? (
              <button
                onClick={() => save({ unpublish: true })}
                disabled={busy}
                className="btn-ghost text-xs"
              >
                Unpublish
              </button>
            ) : (
              <button
                onClick={() => save({ publish: true })}
                disabled={busy}
                className="btn-accent text-xs"
              >
                Publish →
              </button>
            )}
          </div>
        </footer>
      </div>

      {/* Right: live preview (desktop) / modal (mobile) */}
      <div
        className={clsx(
          'flex flex-col bg-ink-100',
          'hidden lg:flex flex-1',
          previewOpen && 'fixed inset-0 z-50 !flex',
        )}
      >
        <div className="px-4 py-3 bg-ink text-bone flex items-center justify-between gap-2 text-xs flex-wrap">
          <span className="uppercase tracking-widest text-bone/60">Live preview</span>
          <div className="flex items-center gap-1 flex-wrap justify-end">
            <div className="flex border border-bone/15 mr-2">
              {(['mobile', 'tablet', 'desktop'] as Device[]).map((d) => (
                <button
                  key={d}
                  onClick={() => setDevice(d)}
                  className={clsx(
                    'px-2 py-1 uppercase tracking-widest text-[10px] border-r border-bone/15 last:border-r-0',
                    device === d ? 'bg-accent text-ink' : 'hover:bg-ink-50',
                  )}
                  title={`${d} — ${DEVICE_WIDTH[d]}`}
                >
                  {d === 'mobile' ? '▯' : d === 'tablet' ? '▭' : '▭▭'}
                </button>
              ))}
            </div>
            {LOCALES.map((l) => (
              <button
                key={l}
                onClick={() => setPreviewLocale(l)}
                className={clsx(
                  'px-2 py-1 uppercase tracking-widest text-[10px]',
                  l === previewLocale ? 'bg-accent text-ink' : 'hover:bg-ink-50'
                )}
              >
                {l}
              </button>
            ))}
            <a
              href={previewUrl}
              target="_blank"
              rel="noreferrer"
              className="px-2 py-1 hover:bg-ink-50 uppercase tracking-widest text-[10px]"
            >
              Open ↗
            </a>
            <button
              onClick={() => setPreviewOpen(false)}
              className="lg:hidden px-2 py-1 hover:bg-ink-50 uppercase tracking-widest text-[10px]"
            >
              Close
            </button>
          </div>
        </div>
        <div className="flex-1 bg-ink-100 overflow-auto flex justify-center">
          <iframe
            key={previewUrl}
            src={previewUrl}
            className="h-full bg-ink transition-[width] duration-200"
            style={{ width: DEVICE_WIDTH[device], maxWidth: '100%' }}
            title="Page preview"
          />
        </div>
      </div>
    </div>
  );
}
