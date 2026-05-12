'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import clsx from 'clsx';
import { PAGE_TEMPLATES } from '@roua/db';

export default function NewPage() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [templateId, setTemplateId] = useState<string>('blank');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const data = new FormData(e.currentTarget);
    const res = await fetch('/api/pages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        titleEn: data.get('titleEn'),
        titleAr: data.get('titleAr'),
        slugEn: data.get('slugEn'),
        slugAr: data.get('slugAr'),
        templateId,
      }),
    });
    setBusy(false);
    if (res.ok) {
      const json = await res.json();
      router.push(`/pages/${json.id}`);
    } else {
      const b = await res.json().catch(() => ({}));
      setError(b.error ?? 'Could not create page.');
    }
  }

  return (
    <div className="p-4 md:p-8 lg:p-12 max-w-4xl">
      <p className="text-xs uppercase tracking-widest text-accent mb-2">New</p>
      <h1 className="font-display text-3xl md:text-5xl mb-2">Create a page</h1>
      <p className="text-muted mb-8 md:mb-10">
        Pick a layout to start from. You can change everything later — the template just gives you a head start.
      </p>

      <form onSubmit={onSubmit} className="space-y-8">
        <div>
          <p className="label">Layout template</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {PAGE_TEMPLATES.map((t) => {
              const active = templateId === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTemplateId(t.id)}
                  className={clsx(
                    'text-left border p-3 transition-colors flex flex-col gap-2',
                    active ? 'border-accent ring-1 ring-accent bg-surface-100' : 'border-ink/10 hover:border-ink/30 bg-surface',
                  )}
                >
                  <pre
                    className={clsx(
                      'font-mono text-[8px] leading-[1.1] whitespace-pre overflow-hidden',
                      active ? 'text-accent' : 'text-muted',
                    )}
                  >
                    {t.preview}
                  </pre>
                  <div>
                    <p className="font-medium text-sm">{t.name}</p>
                    <p className="text-[11px] text-muted leading-snug mt-0.5">{t.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="label">Page meta</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <label className="block">
              <span className="label">Title · English</span>
              <input name="titleEn" required className="input" placeholder="About" />
            </label>
            <label className="block">
              <span className="label">Title · العربية</span>
              <input name="titleAr" required className="input" placeholder="من نحن" dir="rtl" />
            </label>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block">
              <span className="label">Slug · English</span>
              <input
                name="slugEn"
                required
                pattern="[a-z0-9\-]+"
                className="input font-mono"
                placeholder="about"
              />
              <span className="text-[10px] text-muted mt-1 block">
                Used in the URL: <code>/en/your-slug</code>
              </span>
            </label>
            <label className="block">
              <span className="label">Slug · Arabic page</span>
              <input
                name="slugAr"
                required
                pattern="[a-z0-9\-]+"
                className="input font-mono"
                placeholder="about"
              />
              <span className="text-[10px] text-muted mt-1 block">
                URLs must be ASCII — use a latin slug even for the Arabic page.
              </span>
            </label>
          </div>
        </div>

        {error && <p className="text-sm text-red-700">{error}</p>}

        <div className="flex gap-3 pt-2 border-t border-ink/10">
          <button type="submit" disabled={busy} className="btn-accent">
            {busy ? 'Creating…' : 'Create page →'}
          </button>
          <button type="button" onClick={() => router.back()} className="btn-ghost">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
