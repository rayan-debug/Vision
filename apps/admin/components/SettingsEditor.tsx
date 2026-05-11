'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LOCALES, type Locale } from '@roua/db';

type Settings = {
  i18n: Record<string, { siteName: string; tagline?: string; bio?: string }>;
  email: string | null;
  phone: string | null;
  location: string | null;
  instagram: string | null;
  behance: string | null;
  dribbble: string | null;
  linkedin: string | null;
  twitter: string | null;
  logoUrl: string | null;
  faviconUrl: string | null;
  primaryColor: string;
  accentColor: string;
  faqs: { q: Record<string, string>; a: Record<string, string> }[];
};

export function SettingsEditor({ initial }: { initial: Settings }) {
  const router = useRouter();
  const [s, setS] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  function u<K extends keyof Settings>(k: K, v: Settings[K]) {
    setS((p) => ({ ...p, [k]: v }));
    setSaved(false);
  }
  function uI18n(loc: Locale, k: 'siteName' | 'tagline' | 'bio', v: string) {
    setS((p) => ({
      ...p,
      i18n: { ...p.i18n, [loc]: { ...(p.i18n[loc] ?? { siteName: '' }), [k]: v } },
    }));
    setSaved(false);
  }

  async function save() {
    setBusy(true);
    await fetch('/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(s),
    });
    setBusy(false);
    setSaved(true);
    router.refresh();
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-6">
      <section className="card">
        <h2 className="font-display text-xl mb-4">Brand</h2>
        {LOCALES.map((loc) => (
          <div key={loc} className="mb-4 last:mb-0">
            <p className="text-[10px] uppercase tracking-widest text-accent mb-2">{loc}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <label className="block">
                <span className="label">Site name</span>
                <input
                  className="input"
                  value={s.i18n[loc]?.siteName ?? ''}
                  onChange={(e) => uI18n(loc, 'siteName', e.target.value)}
                />
              </label>
              <label className="block">
                <span className="label">Tagline</span>
                <input
                  className="input"
                  value={s.i18n[loc]?.tagline ?? ''}
                  onChange={(e) => uI18n(loc, 'tagline', e.target.value)}
                />
              </label>
            </div>
            <label className="block">
              <span className="label">Bio</span>
              <textarea
                rows={3}
                className="textarea"
                value={s.i18n[loc]?.bio ?? ''}
                onChange={(e) => uI18n(loc, 'bio', e.target.value)}
              />
            </label>
          </div>
        ))}
      </section>

      <section className="card">
        <h2 className="font-display text-xl mb-4">Contact</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <label className="block">
            <span className="label">Email</span>
            <input className="input" value={s.email ?? ''} onChange={(e) => u('email', e.target.value)} />
          </label>
          <label className="block">
            <span className="label">Phone</span>
            <input className="input" value={s.phone ?? ''} onChange={(e) => u('phone', e.target.value)} />
          </label>
          <label className="block">
            <span className="label">Location</span>
            <input className="input" value={s.location ?? ''} onChange={(e) => u('location', e.target.value)} />
          </label>
        </div>
      </section>

      <section className="card">
        <h2 className="font-display text-xl mb-4">Social</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {(['instagram', 'behance', 'dribbble', 'linkedin', 'twitter'] as const).map((key) => (
            <label key={key} className="block">
              <span className="label capitalize">{key}</span>
              <input className="input" value={s[key] ?? ''} onChange={(e) => u(key, e.target.value)} />
            </label>
          ))}
        </div>
      </section>

      <section className="card">
        <h2 className="font-display text-xl mb-1">FAQ (AEO)</h2>
        <p className="text-xs text-muted mb-4">
          These render as FAQPage structured data on the home page so AI search engines can cite them.
        </p>
        {s.faqs.map((f, i) => (
          <div key={i} className="border border-ink/10 p-3 mb-3 space-y-2">
            <div className="flex justify-end">
              <button
                onClick={() => u('faqs', s.faqs.filter((_, j) => j !== i))}
                className="text-xs text-muted hover:text-red-700"
              >
                Remove
              </button>
            </div>
            {LOCALES.map((loc) => (
              <div key={loc} className="grid grid-cols-1 md:grid-cols-2 gap-2 items-start">
                <label className="block">
                  <span className="label">{loc} · Question</span>
                  <input
                    className="input"
                    value={f.q[loc] ?? ''}
                    onChange={(e) =>
                      u('faqs', s.faqs.map((x, j) => (j === i ? { ...x, q: { ...x.q, [loc]: e.target.value } } : x)))
                    }
                  />
                </label>
                <label className="block">
                  <span className="label">{loc} · Answer</span>
                  <textarea
                    rows={2}
                    className="textarea"
                    value={f.a[loc] ?? ''}
                    onChange={(e) =>
                      u('faqs', s.faqs.map((x, j) => (j === i ? { ...x, a: { ...x.a, [loc]: e.target.value } } : x)))
                    }
                  />
                </label>
              </div>
            ))}
          </div>
        ))}
        <button
          onClick={() => u('faqs', [...s.faqs, { q: { en: '', ar: '' }, a: { en: '', ar: '' } }])}
          className="btn-ghost text-xs"
        >
          + Add FAQ
        </button>
      </section>

      <section className="card">
        <h2 className="font-display text-xl mb-4">Theme</h2>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <label className="block">
            <span className="label">Primary color</span>
            <input
              type="color"
              className="input h-10"
              value={s.primaryColor}
              onChange={(e) => u('primaryColor', e.target.value)}
            />
          </label>
          <label className="block">
            <span className="label">Accent color</span>
            <input
              type="color"
              className="input h-10"
              value={s.accentColor}
              onChange={(e) => u('accentColor', e.target.value)}
            />
          </label>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="label">Logo URL</span>
            <input className="input" value={s.logoUrl ?? ''} onChange={(e) => u('logoUrl', e.target.value)} />
          </label>
          <label className="block">
            <span className="label">Favicon URL</span>
            <input className="input" value={s.faviconUrl ?? ''} onChange={(e) => u('faviconUrl', e.target.value)} />
          </label>
        </div>
      </section>

      <div className="sticky bottom-0 bg-surface-50/80 backdrop-blur py-4 -mx-4 px-4 flex items-center justify-end gap-3 border-t border-ink/10">
        {saved && <span className="text-sm text-accent">✓ Saved</span>}
        <button onClick={save} disabled={busy} className="btn-accent">
          {busy ? 'Saving…' : 'Save settings'}
        </button>
      </div>
    </div>
  );
}
