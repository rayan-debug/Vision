'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';

type Row = {
  id: string;
  slugEn: string;
  slugAr: string;
  title: string;
  status: 'DRAFT' | 'PUBLISHED';
  isHome: boolean;
  updatedAt: string;
};

type Filter = 'ALL' | 'PUBLISHED' | 'DRAFT';

const FILTERS: Filter[] = ['ALL', 'PUBLISHED', 'DRAFT'];

export function PagesList({ initial }: { initial: Row[] }) {
  const router = useRouter();
  const [rows, setRows] = useState(initial);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('ALL');
  const [busyId, setBusyId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (filter !== 'ALL' && r.status !== filter) return false;
      if (!q) return true;
      return r.title.toLowerCase().includes(q) || r.slugEn.toLowerCase().includes(q);
    });
  }, [rows, query, filter]);

  async function duplicate(id: string) {
    setBusyId(id);
    const res = await fetch(`/api/pages/${id}/duplicate`, { method: 'POST' });
    setBusyId(null);
    if (res.ok) {
      const { id: newId } = await res.json();
      router.push(`/pages/${newId}`);
    }
  }

  async function remove(id: string) {
    if (!confirm('Delete this page permanently?')) return;
    setBusyId(id);
    const res = await fetch(`/api/pages/${id}`, { method: 'DELETE' });
    setBusyId(null);
    if (res.ok) setRows((p) => p.filter((r) => r.id !== id));
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex border border-ink/15">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={clsx(
                'px-3 py-1.5 text-xs uppercase tracking-widest border-r border-ink/15 last:border-r-0 transition-colors',
                filter === f ? 'bg-ink text-bone' : 'hover:bg-surface-100'
              )}
            >
              {f}
            </button>
          ))}
        </div>
        <input
          className="input max-w-xs"
          placeholder="Search title or slug…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <p className="text-xs text-muted ml-auto">{filtered.length} of {rows.length}</p>
      </div>

      <div className="border border-ink/10 bg-surface">
        <div className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-ink/10 text-xs uppercase tracking-widest text-muted">
          <div className="col-span-5">Title</div>
          <div className="col-span-2">Slug</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Updated</div>
          <div className="col-span-1" />
        </div>
        {filtered.map((p) => (
          <div
            key={p.id}
            className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-ink/10 last:border-b-0 hover:bg-surface-100 transition-colors items-center"
          >
            <Link href={`/pages/${p.id}`} className="col-span-5 flex items-center gap-2 min-w-0">
              {p.isHome && <span className="text-accent text-xs shrink-0">★</span>}
              <span className="font-medium truncate">{p.title || p.slugEn}</span>
            </Link>
            <div className="col-span-2 text-muted text-sm font-mono truncate">/{p.slugEn}</div>
            <div className="col-span-2">
              <span className={p.status === 'PUBLISHED' ? 'tag border-accent text-accent' : 'tag text-muted'}>
                {p.status}
              </span>
            </div>
            <div className="col-span-2 text-xs text-muted">{new Date(p.updatedAt).toLocaleDateString()}</div>
            <div className="col-span-1 flex justify-end gap-1">
              <button
                onClick={() => duplicate(p.id)}
                disabled={busyId === p.id}
                className="btn-ghost text-xs px-1.5 py-1"
                title="Duplicate"
              >
                ⎘
              </button>
              {!p.isHome && (
                <button
                  onClick={() => remove(p.id)}
                  disabled={busyId === p.id}
                  className="btn-ghost text-xs px-1.5 py-1 hover:text-red-700"
                  title="Delete"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="px-4 py-12 text-center text-muted">
            {rows.length === 0 ? (
              <>No pages yet. <Link href="/pages/new" className="text-accent underline">Create the first.</Link></>
            ) : (
              'No matches for these filters.'
            )}
          </div>
        )}
      </div>
    </div>
  );
}
