'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import clsx from 'clsx';
import { BlockList } from './BlockList';
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

export function TemplateEditor({ template }: { template: Template }) {
  const router = useRouter();
  const [s, setS] = useState(template);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);

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

  return (
    <div className="p-4 md:p-8 lg:p-12 max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-accent mb-2">Template</p>
          <h1 className="font-display text-3xl md:text-5xl">{s.name || 'Untitled'}</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className={clsx('tag', dirty ? 'text-accent border-accent' : 'text-muted')}>
            {dirty ? 'UNSAVED' : 'SAVED'}
          </span>
          {s.isStarter && <span className="tag text-[9px]">STARTER</span>}
        </div>
      </div>
      <p className="text-sm text-muted mb-8 md:mb-10 max-w-2xl">
        Edit the name, description, preview, and blocks. Changes apply to <em>new</em> pages created from this template — existing pages are unaffected.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-4">
          <section className="card">
            <h2 className="font-display text-xl mb-3">Blocks</h2>
            <p className="text-xs text-muted mb-4">
              Same builder as any page. Drag, duplicate, restyle — all of it works.
            </p>
            <BlockList
              blocks={s.blocks as unknown as Block[]}
              onChange={(blocks) => update('blocks', blocks as unknown as unknown[])}
              blockTypes={BLOCK_TYPES}
            />
          </section>
        </div>

        <aside className="space-y-4">
          <section className="card">
            <h2 className="font-display text-lg mb-3">Meta</h2>
            <label className="block mb-3">
              <span className="label">Name</span>
              <input
                className="input"
                value={s.name}
                onChange={(e) => update('name', e.target.value)}
              />
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
            <label className="block mb-3">
              <span className="label">ASCII preview</span>
              <textarea
                rows={8}
                className="textarea font-mono text-[10px] leading-[1.2]"
                value={s.preview}
                onChange={(e) => update('preview', e.target.value)}
                placeholder={'─────────────\n  HERO       \n─────────────\n  text       \n─────────────'}
              />
              <span className="text-[10px] text-muted mt-1 block">
                A tiny outline shown in the picker. Use box-drawing characters.
              </span>
            </label>
            <label className="block">
              <span className="label">Sort order</span>
              <input
                type="number"
                className="input w-24"
                value={s.order}
                onChange={(e) => update('order', Number(e.target.value) || 0)}
              />
            </label>
            <p className="text-[10px] text-muted mt-3 font-mono">key: {s.key}</p>
          </section>

          <section className="card">
            <h2 className="font-display text-lg mb-3">Actions</h2>
            <div className="flex flex-col gap-2">
              <button onClick={save} disabled={busy || !dirty} className="btn-accent">
                {busy ? 'Saving…' : 'Save template'}
              </button>
              <button onClick={remove} className="btn-danger">Delete template</button>
            </div>
            {error && <p className="text-sm text-red-700 mt-3">{error}</p>}
            <p className="text-[10px] text-muted mt-3">
              Updated {new Date(s.updatedAt).toLocaleString()}
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
