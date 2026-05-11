'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function NewPage() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        titleFr: data.get('titleFr'),
        slugEn: data.get('slugEn'),
        slugFr: data.get('slugFr'),
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
    <div className="p-8 md:p-12 max-w-2xl">
      <p className="text-xs uppercase tracking-widest text-accent mb-2">New</p>
      <h1 className="font-display text-5xl mb-10">Create a page</h1>

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="label">Title · English</span>
            <input name="titleEn" required className="input" placeholder="About" />
          </label>
          <label className="block">
            <span className="label">Title · Français</span>
            <input name="titleFr" required className="input" placeholder="À propos" />
          </label>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="label">Slug · English</span>
            <input
              name="slugEn"
              required
              pattern="[a-z0-9\-]+"
              className="input font-mono"
              placeholder="about"
            />
          </label>
          <label className="block">
            <span className="label">Slug · Français</span>
            <input
              name="slugFr"
              required
              pattern="[a-z0-9\-]+"
              className="input font-mono"
              placeholder="a-propos"
            />
          </label>
        </div>

        {error && <p className="text-sm text-red-700">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={busy} className="btn-accent">
            {busy ? 'Creating…' : 'Create page →'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="btn-ghost"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
