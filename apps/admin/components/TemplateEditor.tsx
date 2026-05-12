'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { BlockList } from './BlockList';
import { BlockThumbnail } from './BlockThumbnail';
import { BLOCK_TYPES, type Block } from '@roua/db';

type Template = {
  id: string;
  key: string;
  name: string;
  description: string;
  preview: string;
  blocks: unknown[];
  isStarter: boolean;
  order: number;
  updatedAt: string;
};

type Device = 'desktop' | 'tablet' | 'mobile';
const DEVICE_WIDTH: Record<Device, string> = {
  desktop: '100%',
  tablet: '768px',
  mobile: '390px',
};

export function TemplateEditor({
  template,
  previewToken,
  publicSiteUrl,
}: {
  template: Template;
  previewToken: string;
  publicSiteUrl: string;
}) {
  const router = useRouter();
  const [s, setS] = useState(template);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [device, setDevice] = useState<Device>('desktop');
  const [showPreview, setShowPreview] = useState(true);
  const [previewLocale, setPreviewLocale] = useState<'en' | 'ar'>('en');

  function update<K extends keyof Template>(k: K, v: Template[K]) {
    setS((p) => ({ ...p, [k]: v }));
    setDirty(true);
  }

  async function save() {
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/templates/${s.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: s.name,
        description: s.description,
        preview: s.preview,
        order: s.order,
        blocks: s.blocks,
      }),
    });
    setBusy(false);
    if (res.ok) {
      const json = await res.json();
      setS((p) => ({ ...p, updatedAt: json.template.updatedAt }));
      setDirty(false);
      router.refresh();
    } else {
      const b = await res.json().catch(() => ({}));
      setError(b.error ?? 'Save failed');
    }
  }

  async function remove() {
    if (!confirm('Delete this template?')) return;
    const res = await fetch(`/api/templates/${s.id}`, { method: 'DELETE' });
    if (res.ok) router.push('/templates');
  }

  // Bust the iframe cache whenever the saved blocks change.
  const previewUrl = useMemo(
    () => `${publicSiteUrl}/preview/template/${s.id}?token=${encodeURIComponent(previewToken)}&locale=${previewLocale}&t=${s.updatedAt}`,
    [publicSiteUrl, s.id, previewToken, previewLocale, s.updatedAt],
  );

  const blocks = s.blocks as unknown as Block[];

  return (
    <div className="flex flex-col lg:flex-row lg:h-[calc(100vh-0px)] lg:overflow-hidden">
      {/* Editor pane */}
      <div className="w-full lg:w-[480px] xl:w-[520px] shrink-0 border-b lg:border-b-0 lg:border-r border-ink/10 bg-surface-50 flex flex-col min-h-screen lg:min-h-0">
        <header className="px-4 md:px-6 py-4 border-b border-ink/10 bg-surface flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <Link href="/templates" className="text-[11px] text-muted hover:text-accent transition-colors inline-flex items-center gap-1">
              ← All templates
            </Link>
            <p className="text-[10px] uppercase tracking-widest text-muted mt-1">Template</p>
            <h1 className="font-display text-lg md:text-xl truncate">{s.name || 'Untitled'}</h1>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className={clsx('tag', dirty ? 'text-accent border-accent' : 'text-muted')}>
              {dirty ? 'UNSAVED' : 'SAVED'}
            </span>
            {s.isStarter && <span className="tag text-[9px]">STARTER</span>}
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="lg:hidden btn-outline text-xs"
              title="Toggle preview"
            >
              {showPreview ? 'Hide preview' : 'Preview'}
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-4 md:px-6 py-5 space-y-5">
          <section className="card">
            <h2 className="font-display text-lg mb-3">Identity</h2>
            <label className="block mb-3">
              <span className="label">Name</span>
              <input className="input" value={s.name} onChange={(e) => update('name', e.target.value)} />
            </label>
            <label className="block mb-3">
              <span className="label">Description</span>
              <textarea
                rows={3}
                className="textarea"
                value={s.description}
                onChange={(e) => update('description', e.target.value)}
              />
              <span className="text-[10px] text-muted mt-1 block">
                Shown next to the template in the picker.
              </span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="label">Sort order</span>
                <input
                  type="number"
                  className="input"
                  value={s.order}
                  onChange={(e) => update('order', Number(e.target.value) || 0)}
                />
              </label>
              <div>
                <span className="label">Key</span>
                <p className="text-xs font-mono text-muted py-2">{s.key}</p>
              </div>
            </div>
          </section>

          <section className="card">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-lg">Thumbnail</h2>
              <span className="text-[10px] text-muted">Auto-generated from blocks</span>
            </div>
            <div className="aspect-[4/5] w-40 mx-auto">
              <BlockThumbnail blocks={blocks} maxBlocks={8} />
            </div>
          </section>

          <section className="card">
            <h2 className="font-display text-lg mb-3">Blocks</h2>
            <p className="text-xs text-muted mb-4">
              Same builder as any page. Drag, duplicate, restyle — all of it works. Live preview on the right updates as you save.
            </p>
            <BlockList
              blocks={blocks}
              onChange={(b) => update('blocks', b as unknown as unknown[])}
              blockTypes={BLOCK_TYPES}
            />
          </section>
        </div>

        <footer className="sticky bottom-0 px-4 md:px-6 py-3 border-t border-ink/10 bg-surface flex items-center justify-between gap-2">
          <p className="text-[10px] text-muted">
            Updated {new Date(s.updatedAt).toLocaleString()}
          </p>
          <div className="flex gap-2">
            <button onClick={remove} className="btn-danger text-xs">Delete</button>
            <button onClick={save} disabled={busy || !dirty} className="btn-accent">
              {busy ? 'Saving…' : 'Save template'}
            </button>
          </div>
        </footer>
        {error && <p className="px-6 pb-3 text-sm text-red-700">{error}</p>}
      </div>

      {/* Live preview pane */}
      <div
        className={clsx(
          'flex flex-col bg-ink-100',
          'hidden lg:flex flex-1',
          showPreview && 'fixed inset-0 z-50 !flex lg:static',
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
                >
                  {d === 'mobile' ? '▯' : d === 'tablet' ? '▭' : '▭▭'}
                </button>
              ))}
            </div>
            {(['en', 'ar'] as const).map((l) => (
              <button
                key={l}
                onClick={() => setPreviewLocale(l)}
                className={clsx(
                  'px-2 py-1 uppercase tracking-widest text-[10px]',
                  l === previewLocale ? 'bg-accent text-ink' : 'hover:bg-ink-50',
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
              onClick={() => setShowPreview(false)}
              className="lg:hidden px-2 py-1 hover:bg-ink-50 uppercase tracking-widest text-[10px]"
            >
              Close
            </button>
          </div>
        </div>
        <div className="flex-1 bg-ink-100 overflow-auto flex justify-center">
          {dirty ? (
            <div className="flex items-center justify-center text-bone/50 text-sm p-8 text-center">
              Save to refresh the preview.
            </div>
          ) : (
            <iframe
              key={previewUrl}
              src={previewUrl}
              className="h-full bg-ink transition-[width] duration-200"
              style={{ width: DEVICE_WIDTH[device], maxWidth: '100%' }}
              title="Template preview"
            />
          )}
        </div>
      </div>
    </div>
  );
}
