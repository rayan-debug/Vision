'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function NewTemplate() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const data = new FormData(e.currentTarget);
    const res = await fetch('/api/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: data.get('name'),
        description: data.get('description'),
      }),
    });
    setBusy(false);
    if (res.ok) {
      const json = await res.json();
      router.push(`/templates/${json.id}`);
    } else {
      const b = await res.json().catch(() => ({}));
      setError(b.error ?? 'Could not create template.');
    }
  }

  return (
    <div className="p-4 md:p-8 lg:p-12 max-w-2xl">
      <p className="text-xs uppercase tracking-widest text-accent mb-2">New</p>
      <h1 className="font-display text-3xl md:text-5xl mb-2">Create a template</h1>
      <p className="text-muted mb-8 md:mb-10">
        Name it and describe what it&apos;s for. You&apos;ll build the blocks on the next screen.
      </p>

      <form onSubmit={onSubmit} className="space-y-4">
        <label className="block">
          <span className="label">Name</span>
          <input name="name" required className="input" placeholder="Photographer's reel" />
        </label>
        <label className="block">
          <span className="label">Description</span>
          <textarea
            name="description"
            rows={3}
            className="textarea"
            placeholder="Image-heavy, no text. For photography portfolios."
          />
        </label>

        {error && <p className="text-sm text-red-700">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={busy} className="btn-accent">
            {busy ? 'Creating…' : 'Create template →'}
          </button>
          <button type="button" onClick={() => router.back()} className="btn-ghost">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
