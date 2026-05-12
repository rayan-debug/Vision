'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LOCALES, type Locale } from '@roua/db';
import { MediaPicker } from './MediaPicker';

type Meta = { quote: string; name: string; role: string };

type Testimonial = {
  id: string;
  i18n: Record<string, Meta>;
  avatarUrl: string | null;
  rating: number | null;
  order: number;
  featured: boolean;
};

export function TestimonialsEditor({ initial }: { initial: Testimonial[] }) {
  const router = useRouter();
  const [list, setList] = useState<Testimonial[]>(initial);
  const [busy, setBusy] = useState<string | null>(null);

  function u(id: string, fn: (t: Testimonial) => Testimonial) {
    setList((l) => l.map((t) => (t.id === id ? fn(t) : t)));
  }

  async function save(t: Testimonial) {
    setBusy(t.id);
    await fetch(`/api/testimonials/${t.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        i18n: t.i18n,
        avatarUrl: t.avatarUrl,
        rating: t.rating,
        order: t.order,
        featured: t.featured,
      }),
    });
    setBusy(null);
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm('Delete this testimonial?')) return;
    await fetch(`/api/testimonials/${id}`, { method: 'DELETE' });
    setList((l) => l.filter((t) => t.id !== id));
    router.refresh();
  }

  async function create() {
    const res = await fetch('/api/testimonials', { method: 'POST' });
    const json = await res.json();
    setList((l) => [
      ...l,
      {
        id: json.id,
        i18n: { en: { quote: '', name: '', role: '' }, ar: { quote: '', name: '', role: '' } },
        avatarUrl: null,
        rating: null,
        order: l.length,
        featured: false,
      },
    ]);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {list.map((t) => (
        <div key={t.id} className="card">
          <div className="grid grid-cols-1 md:grid-cols-[120px_1fr] gap-4">
            <div className="space-y-2">
              <div className="block">
                <span className="label">Avatar</span>
                <MediaPicker
                  value={t.avatarUrl ?? ''}
                  onChange={(url) => u(t.id, (x) => ({ ...x, avatarUrl: url || null }))}
                  aspect="square"
                />
              </div>
              <label className="block">
                <span className="label">Rating</span>
                <select
                  className="select"
                  value={t.rating ?? ''}
                  onChange={(e) => u(t.id, (x) => ({ ...x, rating: e.target.value ? Number(e.target.value) : null }))}
                >
                  <option value="">—</option>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>{'★'.repeat(n)}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="label">Order</span>
                <input
                  type="number"
                  className="input"
                  value={t.order}
                  onChange={(e) => u(t.id, (x) => ({ ...x, order: Number(e.target.value) || 0 }))}
                />
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={t.featured}
                  onChange={(e) => u(t.id, (x) => ({ ...x, featured: e.target.checked }))}
                />
                <span className="text-xs">Featured</span>
              </label>
            </div>

            <div className="space-y-4">
              {LOCALES.map((loc) => (
                <div key={loc} className="border-l-2 border-accent/30 pl-3">
                  <p className="text-[10px] uppercase tracking-widest text-accent mb-2">{loc}</p>
                  <label className="block mb-2">
                    <span className="label">Quote</span>
                    <textarea
                      rows={3}
                      className="textarea"
                      value={t.i18n[loc]?.quote ?? ''}
                      onChange={(e) =>
                        u(t.id, (x) => ({
                          ...x,
                          i18n: { ...x.i18n, [loc as Locale]: { ...(x.i18n[loc] ?? { quote: '', name: '', role: '' }), quote: e.target.value } },
                        }))
                      }
                    />
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="block">
                      <span className="label">Name</span>
                      <input
                        className="input"
                        value={t.i18n[loc]?.name ?? ''}
                        onChange={(e) =>
                          u(t.id, (x) => ({
                            ...x,
                            i18n: { ...x.i18n, [loc as Locale]: { ...(x.i18n[loc] ?? { quote: '', name: '', role: '' }), name: e.target.value } },
                          }))
                        }
                      />
                    </label>
                    <label className="block">
                      <span className="label">Role / company</span>
                      <input
                        className="input"
                        value={t.i18n[loc]?.role ?? ''}
                        onChange={(e) =>
                          u(t.id, (x) => ({
                            ...x,
                            i18n: { ...x.i18n, [loc as Locale]: { ...(x.i18n[loc] ?? { quote: '', name: '', role: '' }), role: e.target.value } },
                          }))
                        }
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-3">
            <button onClick={() => remove(t.id)} className="btn-danger text-xs">Delete</button>
            <button onClick={() => save(t)} disabled={busy === t.id} className="btn-accent text-xs">
              {busy === t.id ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      ))}

      <button
        onClick={create}
        className="w-full border-2 border-dashed border-ink/15 hover:border-accent hover:text-accent py-4 text-sm uppercase tracking-widest text-muted transition-colors"
      >
        + Add testimonial
      </button>
    </div>
  );
}
