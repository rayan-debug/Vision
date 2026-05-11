'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import clsx from 'clsx';
import { LOCALES, type Locale } from '@roua/db';

type Meta = { title: string; description: string; fullContent?: string; client?: string; role?: string };
type Project = {
  id: string;
  slugEn: string;
  slugFr: string;
  i18n: Record<string, Meta>;
  category: string | null;
  year: number | null;
  tags: string[];
  coverImage: string;
  images: string[];
  featured: boolean;
  order: number;
  status: 'DRAFT' | 'PUBLISHED';
  updatedAt: string;
};

export function ProjectEditor({ project }: { project: Project }) {
  const router = useRouter();
  const [s, setS] = useState(project);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);

  const u = <K extends keyof Project>(k: K, v: Project[K]) => {
    setS((p) => ({ ...p, [k]: v }));
    setDirty(true);
  };
  const uI18n = (loc: Locale, k: keyof Meta, v: string) => {
    setS((p) => ({ ...p, i18n: { ...p.i18n, [loc]: { ...(p.i18n[loc] ?? { title: '', description: '' }), [k]: v } } }));
    setDirty(true);
  };

  async function save(opts: { publish?: boolean; unpublish?: boolean } = {}) {
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/projects/${s.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slugEn: s.slugEn,
        slugFr: s.slugFr,
        i18n: s.i18n,
        category: s.category,
        year: s.year,
        tags: s.tags,
        coverImage: s.coverImage,
        images: s.images,
        featured: s.featured,
        order: s.order,
        status: opts.publish ? 'PUBLISHED' : opts.unpublish ? 'DRAFT' : undefined,
      }),
    });
    setBusy(false);
    if (res.ok) {
      const json = await res.json();
      setS((p) => ({ ...p, status: json.project.status, updatedAt: json.project.updatedAt }));
      setDirty(false);
      router.refresh();
    } else {
      const b = await res.json().catch(() => ({}));
      setError(b.error ?? 'Save failed.');
    }
  }

  async function destroy() {
    if (!confirm('Delete this project?')) return;
    const res = await fetch(`/api/projects/${s.id}`, { method: 'DELETE' });
    if (res.ok) router.push('/projects');
  }

  return (
    <div className="p-8 md:p-12 max-w-5xl">
      <div className="flex items-start justify-between mb-10 gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-accent mb-2">Project</p>
          <h1 className="font-display text-4xl">{s.i18n.en?.title || s.slugEn}</h1>
        </div>
        <div className="flex gap-2">
          <span className={clsx('tag self-start mt-2', s.status === 'PUBLISHED' ? 'border-accent text-accent' : 'text-muted')}>
            {dirty ? 'UNSAVED' : s.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {LOCALES.map((loc) => (
            <div key={loc} className="card">
              <p className="text-xs uppercase tracking-widest text-accent mb-3">{loc}</p>
              <label className="block mb-3">
                <span className="label">Title</span>
                <input
                  className="input"
                  value={s.i18n[loc]?.title ?? ''}
                  onChange={(e) => uI18n(loc, 'title', e.target.value)}
                />
              </label>
              <label className="block mb-3">
                <span className="label">Short description</span>
                <input
                  className="input"
                  value={s.i18n[loc]?.description ?? ''}
                  onChange={(e) => uI18n(loc, 'description', e.target.value)}
                />
              </label>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <label className="block">
                  <span className="label">Client</span>
                  <input
                    className="input"
                    value={s.i18n[loc]?.client ?? ''}
                    onChange={(e) => uI18n(loc, 'client', e.target.value)}
                  />
                </label>
                <label className="block">
                  <span className="label">Role</span>
                  <input
                    className="input"
                    value={s.i18n[loc]?.role ?? ''}
                    onChange={(e) => uI18n(loc, 'role', e.target.value)}
                  />
                </label>
              </div>
              <label className="block">
                <span className="label">Long description</span>
                <textarea
                  rows={6}
                  className="textarea"
                  value={s.i18n[loc]?.fullContent ?? ''}
                  onChange={(e) => uI18n(loc, 'fullContent', e.target.value)}
                />
              </label>
            </div>
          ))}

          <div className="card">
            <p className="text-xs uppercase tracking-widest text-muted mb-3">Images</p>
            <label className="block mb-3">
              <span className="label">Cover image URL</span>
              <input
                className="input"
                value={s.coverImage}
                onChange={(e) => u('coverImage', e.target.value)}
              />
              {s.coverImage && (
                <img src={s.coverImage} alt="" className="mt-2 max-h-48 object-cover" />
              )}
            </label>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="label mb-0">Additional images (URLs)</span>
                <button
                  onClick={() => u('images', [...s.images, ''])}
                  className="btn-ghost text-xs"
                >+ Add</button>
              </div>
              {s.images.map((img, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <input
                    className="input font-mono text-xs flex-1"
                    value={img}
                    onChange={(e) => u('images', s.images.map((x, j) => (j === i ? e.target.value : x)))}
                  />
                  <button
                    onClick={() => u('images', s.images.filter((_, j) => j !== i))}
                    className="btn-ghost text-xs"
                  >×</button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="card">
            <p className="text-xs uppercase tracking-widest text-muted mb-3">Meta</p>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <label className="block">
                <span className="label">Slug · EN</span>
                <input
                  className="input font-mono text-xs"
                  value={s.slugEn}
                  onChange={(e) => u('slugEn', e.target.value.toLowerCase())}
                />
              </label>
              <label className="block">
                <span className="label">Slug · FR</span>
                <input
                  className="input font-mono text-xs"
                  value={s.slugFr}
                  onChange={(e) => u('slugFr', e.target.value.toLowerCase())}
                />
              </label>
            </div>
            <label className="block mb-3">
              <span className="label">Category</span>
              <input className="input" value={s.category ?? ''} onChange={(e) => u('category', e.target.value)} />
            </label>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <label className="block">
                <span className="label">Year</span>
                <input
                  type="number"
                  className="input"
                  value={s.year ?? ''}
                  onChange={(e) => u('year', e.target.value ? Number(e.target.value) : null)}
                />
              </label>
              <label className="block">
                <span className="label">Order</span>
                <input
                  type="number"
                  className="input"
                  value={s.order}
                  onChange={(e) => u('order', Number(e.target.value) || 0)}
                />
              </label>
            </div>
            <label className="block mb-3">
              <span className="label">Tags (comma-separated)</span>
              <input
                className="input"
                value={s.tags.join(', ')}
                onChange={(e) => u('tags', e.target.value.split(',').map((t) => t.trim()).filter(Boolean))}
              />
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={s.featured}
                onChange={(e) => u('featured', e.target.checked)}
              />
              <span className="text-sm">Featured on home</span>
            </label>
          </div>

          <div className="card">
            <p className="text-xs uppercase tracking-widest text-muted mb-3">Actions</p>
            <div className="flex flex-col gap-2">
              <button onClick={() => save()} disabled={busy || !dirty} className="btn-outline">
                {busy ? 'Saving…' : 'Save'}
              </button>
              {s.status === 'PUBLISHED' ? (
                <button onClick={() => save({ unpublish: true })} disabled={busy} className="btn-ghost">
                  Unpublish
                </button>
              ) : (
                <button onClick={() => save({ publish: true })} disabled={busy} className="btn-accent">
                  Publish →
                </button>
              )}
              <button onClick={destroy} className="btn-danger mt-4">Delete project</button>
            </div>
            {error && <p className="text-sm text-red-700 mt-3">{error}</p>}
            <p className="text-[10px] text-muted mt-3">
              Updated {new Date(s.updatedAt).toLocaleString()}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
