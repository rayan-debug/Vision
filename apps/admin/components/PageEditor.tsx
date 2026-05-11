'use client';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import clsx from 'clsx';
import { BlockList } from './BlockList';
import { BLOCK_TYPES, LOCALES, type Block, type Locale } from '@roua/db';

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

  const update = useCallback(<K extends keyof Page>(key: K, value: Page[K]) => {
    setState((s) => ({ ...s, [key]: value }));
    setDirty(true);
  }, []);

  const updateI18n = useCallback((locale: Locale, key: keyof Meta, value: string) => {
    setState((s) => ({
      ...s,
      i18n: { ...s.i18n, [locale]: { ...(s.i18n[locale] ?? { title: '' }), [key]: value } },
    }));
    setDirty(true);
  }, []);

  const updateBlocks = useCallback((blocks: Block[]) => {
    setState((s) => ({ ...s, blocks: blocks as unknown as unknown[] }));
    setDirty(true);
  }, []);

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
    <div className="flex h-screen overflow-hidden">
      {/* Left: editor */}
      <div className="w-[480px] shrink-0 border-r border-ink/10 bg-surface-50 flex flex-col">
        <header className="px-6 py-4 border-b border-ink/10 bg-surface flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-widest text-muted">Editing</p>
            <h1 className="font-display text-xl truncate">
              {state.i18n.en?.title || state.slugEn}
            </h1>
          </div>
          <span
            className={clsx(
              'tag',
              state.status === 'PUBLISHED' ? 'border-accent text-accent' : 'text-muted'
            )}
          >
            {dirty ? 'UNSAVED' : state.status}
          </span>
        </header>

        <div className="px-6 pt-4 flex gap-1 border-b border-ink/10 -mb-px">
          {(['content', 'seo', 'settings'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={clsx(
                'px-3 py-2 text-xs uppercase tracking-widest border-b-2 -mb-px transition-colors',
                tab === t ? 'border-accent text-ink' : 'border-transparent text-muted hover:text-ink'
              )}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {tab === 'content' && (
            <BlockList
              blocks={(state.blocks as unknown) as Block[]}
              onChange={updateBlocks}
              blockTypes={BLOCK_TYPES}
            />
          )}

          {tab === 'seo' && (
            <div className="space-y-6">
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
                  <span className="label">Slug · FR</span>
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

        <footer className="px-6 py-4 border-t border-ink/10 bg-surface flex items-center justify-between gap-2">
          <div className="text-xs text-muted">
            {dirty ? 'Unsaved changes' : `Saved ${new Date(state.updatedAt).toLocaleTimeString()}`}
            {error && <span className="ml-2 text-red-700">· {error}</span>}
          </div>
          <div className="flex gap-2">
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

      {/* Right: live preview */}
      <div className="flex-1 flex flex-col bg-ink-100">
        <div className="px-4 py-3 bg-ink text-bone flex items-center justify-between text-xs">
          <span className="uppercase tracking-widest text-bone/60">Live preview</span>
          <div className="flex items-center gap-2">
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
              className="ml-2 px-2 py-1 hover:bg-ink-50 uppercase tracking-widest text-[10px]"
            >
              Open ↗
            </a>
          </div>
        </div>
        <iframe
          key={previewUrl}
          src={previewUrl}
          className="flex-1 w-full bg-ink"
          title="Page preview"
        />
      </div>
    </div>
  );
}
