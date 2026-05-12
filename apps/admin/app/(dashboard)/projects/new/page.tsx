'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function NewProject() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const data = new FormData(e.currentTarget);
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        titleEn: data.get('titleEn'),
        titleAr: data.get('titleAr'),
        slugEn: data.get('slugEn'),
        slugAr: data.get('slugAr'),
        category: data.get('category'),
      }),
    });
    setBusy(false);
    if (res.ok) {
      const json = await res.json();
      router.push(`/projects/${json.id}`);
    } else {
      const b = await res.json().catch(() => ({}));
      setError(b.error ?? 'Could not create.');
    }
  }

  return (
    <div className="p-4 md:p-8 lg:p-12 max-w-2xl">
      <p className="text-xs uppercase tracking-widest text-accent mb-2">New</p>
      <h1 className="font-display text-3xl md:text-5xl mb-10">Add a project</h1>
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="label">Title Â· EN</span>
            <input name="titleEn" required className="input" />
          </label>
          <label className="block">
            <span className="label">Title Â· AR</span>
            <input name="titleAr" required className="input" dir="rtl" />
          </label>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="label">Slug Â· EN</span>
            <input name="slugEn" required pattern="[a-z0-9\-]+" className="input font-mono" />
          </label>
          <label className="block">
            <span className="label">Slug Â· AR</span>
            <input name="slugAr" required pattern="[a-z0-9\-]+" className="input font-mono" />
          </label>
        </div>
        <label className="block">
          <span className="label">Category</span>
          <input
            name="category"
            className="input"
            placeholder="Brand identity, Editorial, Packaging, â€¦"
          />
        </label>
        {error && <p className="text-sm text-red-700">{error}</p>}
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={busy} className="btn-accent">
            {busy ? 'Creatingâ€¦' : 'Create â†’'}
          </button>
          <button type="button" onClick={() => router.back()} className="btn-ghost">Cancel</button>
        </div>
      </form>
    </div>
  );
}
