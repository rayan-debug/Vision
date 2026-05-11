'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LOCALES, type Locale } from '@roua/db';

type Service = {
  id: string;
  icon: string | null;
  order: number;
  i18n: Record<string, { title: string; description: string }>;
};

export function ServicesEditor({ services: initial }: { services: Service[] }) {
  const router = useRouter();
  const [list, setList] = useState<Service[]>(initial);
  const [busy, setBusy] = useState<string | null>(null);

  function u(id: string, fn: (s: Service) => Service) {
    setList((l) => l.map((s) => (s.id === id ? fn(s) : s)));
  }

  async function save(s: Service) {
    setBusy(s.id);
    await fetch(`/api/services/${s.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ icon: s.icon, order: s.order, i18n: s.i18n }),
    });
    setBusy(null);
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm('Delete this service?')) return;
    await fetch(`/api/services/${id}`, { method: 'DELETE' });
    setList((l) => l.filter((s) => s.id !== id));
    router.refresh();
  }

  async function create() {
    const res = await fetch('/api/services', { method: 'POST' });
    const json = await res.json();
    setList((l) => [...l, { id: json.id, icon: '◇', order: l.length, i18n: { en: { title: '', description: '' }, fr: { title: '', description: '' } } }]);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {list.map((s) => (
        <div key={s.id} className="card">
          <div className="flex items-start gap-4">
            <label className="block w-24 shrink-0">
              <span className="label">Icon</span>
              <input
                className="input text-center text-xl"
                value={s.icon ?? ''}
                onChange={(e) => u(s.id, (x) => ({ ...x, icon: e.target.value }))}
              />
            </label>
            <label className="block w-24 shrink-0">
              <span className="label">Order</span>
              <input
                type="number"
                className="input"
                value={s.order}
                onChange={(e) => u(s.id, (x) => ({ ...x, order: Number(e.target.value) || 0 }))}
              />
            </label>
            <div className="flex-1 grid grid-cols-2 gap-3">
              {LOCALES.map((loc) => (
                <div key={loc}>
                  <span className="label">{loc.toUpperCase()}</span>
                  <input
                    className="input mb-2"
                    placeholder="Title"
                    value={s.i18n[loc]?.title ?? ''}
                    onChange={(e) =>
                      u(s.id, (x) => ({
                        ...x,
                        i18n: { ...x.i18n, [loc as Locale]: { ...(x.i18n[loc] ?? { title: '', description: '' }), title: e.target.value } },
                      }))
                    }
                  />
                  <textarea
                    rows={2}
                    className="textarea"
                    placeholder="Description"
                    value={s.i18n[loc]?.description ?? ''}
                    onChange={(e) =>
                      u(s.id, (x) => ({
                        ...x,
                        i18n: { ...x.i18n, [loc as Locale]: { ...(x.i18n[loc] ?? { title: '', description: '' }), description: e.target.value } },
                      }))
                    }
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-3">
            <button onClick={() => remove(s.id)} className="btn-danger text-xs">Delete</button>
            <button onClick={() => save(s)} className="btn-accent text-xs">
              {busy === s.id ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      ))}

      <button
        onClick={create}
        className="w-full border-2 border-dashed border-ink/15 hover:border-accent hover:text-accent py-4 text-sm uppercase tracking-widest text-muted transition-colors"
      >
        + Add service
      </button>
    </div>
  );
}
