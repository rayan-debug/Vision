'use client';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';

type Inquiry = {
  id: string;
  name: string;
  email: string;
  message: string;
  source: string | null;
  locale: string | null;
  status: 'NEW' | 'READ' | 'ARCHIVED';
  createdAt: string;
};

type Filter = 'ALL' | 'NEW' | 'READ' | 'ARCHIVED';

const FILTERS: Filter[] = ['ALL', 'NEW', 'READ', 'ARCHIVED'];

export function InquiriesList({ initial }: { initial: Inquiry[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [filter, setFilter] = useState<Filter>('ALL');
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((i) => {
      if (filter !== 'ALL' && i.status !== filter) return false;
      if (!q) return true;
      return (
        i.name.toLowerCase().includes(q) ||
        i.email.toLowerCase().includes(q) ||
        i.message.toLowerCase().includes(q)
      );
    });
  }, [items, filter, query]);

  const counts = useMemo(() => {
    return {
      ALL: items.length,
      NEW: items.filter((i) => i.status === 'NEW').length,
      READ: items.filter((i) => i.status === 'READ').length,
      ARCHIVED: items.filter((i) => i.status === 'ARCHIVED').length,
    } as Record<Filter, number>;
  }, [items]);

  async function setStatus(id: string, status: Inquiry['status']) {
    setItems((p) => p.map((i) => (i.id === id ? { ...i, status } : i)));
    await fetch(`/api/inquiries/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm('Permanently delete this inquiry?')) return;
    setItems((p) => p.filter((i) => i.id !== id));
    if (openId === id) setOpenId(null);
    await fetch(`/api/inquiries/${id}`, { method: 'DELETE' });
    router.refresh();
  }

  function openMail(i: Inquiry) {
    const subject = encodeURIComponent(`Re: your message`);
    const body = encodeURIComponent(`Hi ${i.name.split(' ')[0]},\n\n`);
    window.location.href = `mailto:${i.email}?subject=${subject}&body=${body}`;
    if (i.status === 'NEW') setStatus(i.id, 'READ');
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
              {f} <span className="opacity-60 ml-1">{counts[f]}</span>
            </button>
          ))}
        </div>
        <input
          className="input max-w-xs"
          placeholder="Search name, email, or text…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="border border-ink/10 bg-surface divide-y divide-ink/10">
        {filtered.length === 0 && (
          <div className="px-4 py-12 text-center text-muted text-sm">
            {items.length === 0 ? 'No inquiries yet.' : 'No matches for this filter.'}
          </div>
        )}
        {filtered.map((i) => {
          const open = openId === i.id;
          return (
            <div key={i.id} className={clsx(i.status === 'NEW' && 'bg-accent/5')}>
              <button
                type="button"
                onClick={() => {
                  setOpenId(open ? null : i.id);
                  if (!open && i.status === 'NEW') setStatus(i.id, 'READ');
                }}
                className="w-full grid grid-cols-12 gap-4 px-4 py-3 text-left hover:bg-surface-100 transition-colors"
              >
                <div className="col-span-3 flex items-center gap-2 min-w-0">
                  {i.status === 'NEW' && <span className="w-2 h-2 rounded-full bg-accent shrink-0" />}
                  <span className="font-medium truncate">{i.name}</span>
                </div>
                <div className="col-span-3 text-sm text-muted truncate">{i.email}</div>
                <div className="col-span-4 text-sm text-muted truncate">{i.message}</div>
                <div className="col-span-2 text-right text-xs text-muted">
                  {new Date(i.createdAt).toLocaleDateString()}
                </div>
              </button>
              {open && (
                <div className="px-4 pb-4 pt-1 bg-surface-50">
                  <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4">
                    <div className="text-sm whitespace-pre-wrap leading-relaxed text-ink/80">
                      {i.message}
                    </div>
                    <div className="flex md:flex-col gap-2 shrink-0">
                      <button onClick={() => openMail(i)} className="btn-accent text-xs">Reply →</button>
                      {i.status !== 'ARCHIVED' ? (
                        <button onClick={() => setStatus(i.id, 'ARCHIVED')} className="btn-outline text-xs">Archive</button>
                      ) : (
                        <button onClick={() => setStatus(i.id, 'READ')} className="btn-outline text-xs">Restore</button>
                      )}
                      {i.status === 'READ' && (
                        <button onClick={() => setStatus(i.id, 'NEW')} className="btn-ghost text-xs">Mark unread</button>
                      )}
                      <button onClick={() => remove(i.id)} className="btn-danger text-xs">Delete</button>
                    </div>
                  </div>
                  <p className="text-[10px] text-muted mt-3 uppercase tracking-widest">
                    {new Date(i.createdAt).toLocaleString()}
                    {i.locale && ` · ${i.locale}`}
                    {i.source && ` · ${i.source}`}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
