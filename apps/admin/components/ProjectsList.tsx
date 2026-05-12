'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';

type Row = {
  id: string;
  slugEn: string;
  title: string;
  description: string;
  coverImage: string;
  category: string | null;
  year: number | null;
  featured: boolean;
  status: 'DRAFT' | 'PUBLISHED';
  updatedAt: string;
};

type Filter = 'ALL' | 'PUBLISHED' | 'DRAFT' | 'FEATURED';
const FILTERS: Filter[] = ['ALL', 'PUBLISHED', 'DRAFT', 'FEATURED'];

export function ProjectsList({ initial, categories }: { initial: Row[]; categories: string[] }) {
  const router = useRouter();
  const [rows, setRows] = useState(initial);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('ALL');
  const [category, setCategory] = useState<string>('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (filter === 'PUBLISHED' && r.status !== 'PUBLISHED') return false;
      if (filter === 'DRAFT' && r.status !== 'DRAFT') return false;
      if (filter === 'FEATURED' && !r.featured) return false;
      if (category && r.category !== category) return false;
      if (!q) return true;
      return r.title.toLowerCase().includes(q) || r.slugEn.toLowerCase().includes(q);
    });
  }, [rows, query, filter, category]);

  async function duplicate(id: string) {
    setBusyId(id);
    const res = await fetch(`/api/projects/${id}/duplicate`, { method: 'POST' });
    setBusyId(null);
    if (res.ok) {
      const { id: newId } = await res.json();
      router.push(`/projects/${newId}`);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-6">
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
        <select className="select max-w-xs" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <input
          className="input max-w-xs"
          placeholder="Search…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <p className="text-xs text-muted ml-auto">{filtered.length} of {rows.length}</p>
      </div>

      {filtered.length === 0 ? (
        <p className="text-muted">No projects match.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <div key={p.id} className="border border-ink/10 bg-surface group">
              <Link href={`/projects/${p.id}`} className="block hover:border-accent transition-colors">
                <div className="aspect-[4/3] overflow-hidden bg-surface-100">
                  {p.coverImage && (
                    <img
                      src={p.coverImage}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h2 className="font-display text-lg leading-tight group-hover:text-accent transition-colors">
                      {p.title || p.slugEn}
                    </h2>
                    {p.featured && <span className="text-accent text-xs">★</span>}
                  </div>
                  <p className="text-xs text-muted">{p.category ?? '—'} · {p.year ?? '—'}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className={p.status === 'PUBLISHED' ? 'tag border-accent text-accent' : 'tag text-muted'}>
                      {p.status}
                    </span>
                    <span className="text-xs text-muted font-mono">/{p.slugEn}</span>
                  </div>
                </div>
              </Link>
              <div className="border-t border-ink/10 flex">
                <button
                  onClick={() => duplicate(p.id)}
                  disabled={busyId === p.id}
                  className="flex-1 text-xs py-2 hover:bg-surface-100 text-muted hover:text-ink"
                >
                  Duplicate
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
