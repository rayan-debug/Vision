'use client';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import { FONT_OPTIONS, LOCALES, THEME_PRESETS, type Locale } from '@roua/db';
import { MediaPicker } from './MediaPicker';

type NavLabels = Record<string, { work?: string; contact?: string }>;

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
  youtube: string | null;
  tiktok: string | null;
  pinterest: string | null;
  logoUrl: string | null;
  faviconUrl: string | null;
  defaultOgImage: string | null;
  primaryColor: string;
  accentColor: string;
  gaId: string | null;
  plausibleDomain: string | null;
  customCss: string | null;
  navLabels: NavLabels | null;
  displayFont: string | null;
  bodyFont: string | null;
  monoFont: string | null;
  fontScale: number;
  sectionSpacing: number;
  letterSpacing: string;
  faqs: { q: Record<string, string>; a: Record<string, string> }[];
};

type Tab = 'brand' | 'theme' | 'typography' | 'contact' | 'navigation' | 'seo' | 'analytics' | 'advanced' | 'faqs';

const TABS: { id: Tab; label: string; hint: string }[] = [
  { id: 'brand', label: 'Brand', hint: 'Name, tagline, bio' },
  { id: 'theme', label: 'Theme', hint: 'Colors, presets, preview' },
  { id: 'typography', label: 'Typography', hint: 'Fonts, sizes, spacing' },
  { id: 'contact', label: 'Contact & social', hint: 'Email, phone, links' },
  { id: 'navigation', label: 'Navigation', hint: 'Menu labels per language' },
  { id: 'seo', label: 'SEO & assets', hint: 'Logo, favicon, OG image' },
  { id: 'analytics', label: 'Analytics', hint: 'GA, Plausible' },
  { id: 'advanced', label: 'Advanced', hint: 'Custom CSS' },
  { id: 'faqs', label: 'FAQs (AEO)', hint: 'Schema.org Q&A' },
];

export function SettingsEditor({ initial }: { initial: Settings }) {
  const router = useRouter();
  const [s, setS] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('brand');
  const [dirty, setDirty] = useState(false);

  function u<K extends keyof Settings>(k: K, v: Settings[K]) {
    setS((p) => ({ ...p, [k]: v }));
    setDirty(true);
    setSaved(false);
  }
  function uI18n(loc: Locale, k: 'siteName' | 'tagline' | 'bio', v: string) {
    setS((p) => ({
      ...p,
      i18n: { ...p.i18n, [loc]: { ...(p.i18n[loc] ?? { siteName: '' }), [k]: v } },
    }));
    setDirty(true);
    setSaved(false);
  }
  function uNav(loc: Locale, k: 'work' | 'contact', v: string) {
    setS((p) => ({
      ...p,
      navLabels: { ...(p.navLabels ?? {}), [loc]: { ...(p.navLabels?.[loc] ?? {}), [k]: v } },
    }));
    setDirty(true);
    setSaved(false);
  }

  function applyPreset(primary: string, accent: string) {
    setS((p) => ({ ...p, primaryColor: primary, accentColor: accent }));
    setDirty(true);
    setSaved(false);
  }

  async function save() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(s),
      });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error(b.error ?? 'Save failed');
      }
      setDirty(false);
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setBusy(false);
    }
  }

  const previewStyle = useMemo<React.CSSProperties>(() => {
    const ink = hexToRgbTriple(s.primaryColor) ?? '10 10 10';
    const accent = hexToRgbTriple(s.accentColor) ?? '255 90 31';
    return {
      ['--ink-rgb' as never]: ink,
      ['--accent-rgb' as never]: accent,
    } as React.CSSProperties;
  }, [s.primaryColor, s.accentColor]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6">
      <nav className="md:sticky md:top-6 self-start space-y-0.5">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={clsx(
              'w-full text-left px-3 py-2 text-sm transition-colors border-l-2',
              tab === t.id
                ? 'border-accent bg-surface-100 text-ink'
                : 'border-transparent text-muted hover:text-ink hover:bg-surface-100'
            )}
          >
            <span className="block font-medium">{t.label}</span>
            <span className="block text-[10px] uppercase tracking-widest opacity-60">{t.hint}</span>
          </button>
        ))}
      </nav>

      <div className="space-y-6">
        {tab === 'brand' && (
          <section className="card">
            <h2 className="font-display text-xl mb-4">Brand</h2>
            {LOCALES.map((loc) => (
              <div key={loc} className="mb-6 last:mb-0 pb-6 border-b last:border-b-0 last:pb-0 border-ink/10">
                <p className="text-[10px] uppercase tracking-widest text-accent mb-3">{loc}</p>
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
                    rows={4}
                    className="textarea"
                    value={s.i18n[loc]?.bio ?? ''}
                    onChange={(e) => uI18n(loc, 'bio', e.target.value)}
                  />
                </label>
              </div>
            ))}
          </section>
        )}

        {tab === 'theme' && (
          <section className="card">
            <h2 className="font-display text-xl mb-1">Theme</h2>
            <p className="text-xs text-muted mb-5">
              Primary controls page background. Accent controls buttons, links, and highlights. Pick a preset or set custom values.
            </p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <label className="block">
                <span className="label">Primary color</span>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    className="input h-10 w-16 p-1"
                    value={s.primaryColor}
                    onChange={(e) => u('primaryColor', e.target.value)}
                  />
                  <input
                    className="input font-mono"
                    value={s.primaryColor}
                    onChange={(e) => u('primaryColor', e.target.value)}
                  />
                </div>
              </label>
              <label className="block">
                <span className="label">Accent color</span>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    className="input h-10 w-16 p-1"
                    value={s.accentColor}
                    onChange={(e) => u('accentColor', e.target.value)}
                  />
                  <input
                    className="input font-mono"
                    value={s.accentColor}
                    onChange={(e) => u('accentColor', e.target.value)}
                  />
                </div>
              </label>
            </div>

            <p className="label">Presets</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
              {THEME_PRESETS.map((p) => {
                const active = p.primary.toLowerCase() === s.primaryColor.toLowerCase() &&
                               p.accent.toLowerCase() === s.accentColor.toLowerCase();
                return (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => applyPreset(p.primary, p.accent)}
                    className={clsx(
                      'border p-2 text-left text-xs transition-colors',
                      active ? 'border-accent ring-1 ring-accent' : 'border-ink/10 hover:border-ink/30'
                    )}
                  >
                    <div className="flex gap-1 mb-1.5">
                      <span className="inline-block w-6 h-6 border border-ink/15" style={{ background: p.primary }} />
                      <span className="inline-block w-6 h-6 border border-ink/15" style={{ background: p.accent }} />
                    </div>
                    <span className="block font-medium">{p.name}</span>
                  </button>
                );
              })}
            </div>

            <p className="label">Live preview</p>
            <div
              className="border border-ink/10 p-6 grid gap-3"
              style={{ ...previewStyle, background: `rgb(var(--ink-rgb))`, color: '#f5f1ea' }}
            >
              <span className="text-[10px] uppercase tracking-widest opacity-60">@studio</span>
              <span className="font-display text-2xl">The Vision — visual power, in every frame.</span>
              <div className="flex items-center gap-3 mt-2">
                <span
                  className="px-4 py-2 text-xs uppercase tracking-widest"
                  style={{ background: `rgb(var(--accent-rgb))`, color: `rgb(var(--ink-rgb))` }}
                >
                  See the work
                </span>
                <span
                  className="text-xs uppercase tracking-widest border-b"
                  style={{ borderColor: `rgb(var(--accent-rgb))` }}
                >
                  Learn more
                </span>
              </div>
            </div>
          </section>
        )}

        {tab === 'typography' && (
          <section className="card">
            <h2 className="font-display text-xl mb-1">Typography</h2>
            <p className="text-xs text-muted mb-5">
              Pick fonts from Google Fonts. The web app loads them dynamically — no redeploy needed.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
              <label className="block">
                <span className="label">Display font (headings)</span>
                <select
                  className="select"
                  value={s.displayFont ?? ''}
                  onChange={(e) => u('displayFont', e.target.value || null)}
                >
                  <option value="">Default (Playfair Display)</option>
                  {FONT_OPTIONS.display.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
                <span
                  className="block mt-2 text-2xl truncate"
                  style={{ fontFamily: s.displayFont ? `'${s.displayFont}', serif` : "'Playfair Display', serif" }}
                >
                  Visual power.
                </span>
              </label>

              <label className="block">
                <span className="label">Body font</span>
                <select
                  className="select"
                  value={s.bodyFont ?? ''}
                  onChange={(e) => u('bodyFont', e.target.value || null)}
                >
                  <option value="">Default (Inter)</option>
                  {FONT_OPTIONS.body.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
                <span
                  className="block mt-2 text-sm truncate"
                  style={{ fontFamily: s.bodyFont ? `'${s.bodyFont}', sans-serif` : "'Inter', sans-serif" }}
                >
                  The quick brown fox jumps over the lazy dog.
                </span>
              </label>

              <label className="block">
                <span className="label">Mono font (captions, code)</span>
                <select
                  className="select"
                  value={s.monoFont ?? ''}
                  onChange={(e) => u('monoFont', e.target.value || null)}
                >
                  <option value="">Default (JetBrains Mono)</option>
                  {FONT_OPTIONS.mono.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
                <span
                  className="block mt-2 text-xs uppercase tracking-widest truncate"
                  style={{ fontFamily: s.monoFont ? `'${s.monoFont}', monospace` : "'JetBrains Mono', monospace" }}
                >
                  /work · 01 — studio
                </span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
              <label className="block">
                <span className="label">Heading scale ({s.fontScale.toFixed(2)}×)</span>
                <input
                  type="range"
                  min="0.75"
                  max="1.5"
                  step="0.05"
                  value={s.fontScale}
                  onChange={(e) => u('fontScale', Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-[10px] text-muted">
                  <span>Smaller</span><span>Default</span><span>Bigger</span>
                </div>
              </label>

              <label className="block">
                <span className="label">Section spacing ({s.sectionSpacing.toFixed(2)}×)</span>
                <input
                  type="range"
                  min="0.5"
                  max="1.75"
                  step="0.05"
                  value={s.sectionSpacing}
                  onChange={(e) => u('sectionSpacing', Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-[10px] text-muted">
                  <span>Tight</span><span>Default</span><span>Roomy</span>
                </div>
              </label>

              <label className="block">
                <span className="label">Letter spacing</span>
                <select
                  className="select"
                  value={s.letterSpacing}
                  onChange={(e) => u('letterSpacing', e.target.value)}
                >
                  <option value="tight">Tight (-0.04em)</option>
                  <option value="normal">Normal (-0.02em)</option>
                  <option value="loose">Loose (0em)</option>
                </select>
              </label>
            </div>

            <p className="label">Preview</p>
            <div
              className="border border-ink/10 p-6 grid gap-3 bg-ink text-bone"
              style={{
                fontFamily: s.bodyFont ? `'${s.bodyFont}', sans-serif` : undefined,
              }}
            >
              <span className="text-[10px] uppercase tracking-widest text-bone/60">@studio</span>
              <span
                className="leading-tight"
                style={{
                  fontFamily: s.displayFont ? `'${s.displayFont}', serif` : "'Playfair Display', serif",
                  fontSize: `${3 * s.fontScale}rem`,
                  letterSpacing:
                    s.letterSpacing === 'tight' ? '-0.04em' :
                    s.letterSpacing === 'loose' ? '0em' : '-0.02em',
                }}
              >
                The Vision — visual power.
              </span>
              <p className="text-base text-bone/80 leading-relaxed">
                Body copy preview. The quick brown fox jumps over the lazy dog. لمحة سريعة على النص العربي.
              </p>
            </div>
          </section>
        )}

        {tab === 'contact' && (
          <>
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
                {(['instagram', 'behance', 'dribbble', 'linkedin', 'twitter', 'youtube', 'tiktok', 'pinterest'] as const).map((key) => (
                  <label key={key} className="block">
                    <span className="label capitalize">{key}</span>
                    <input
                      className="input"
                      placeholder="https://…"
                      value={s[key] ?? ''}
                      onChange={(e) => u(key, e.target.value)}
                    />
                  </label>
                ))}
              </div>
            </section>
          </>
        )}

        {tab === 'navigation' && (
          <section className="card">
            <h2 className="font-display text-xl mb-1">Navigation labels</h2>
            <p className="text-xs text-muted mb-5">
              Override the built-in header labels per language. Leave blank to use the defaults.
            </p>
            <div className="space-y-6">
              {LOCALES.map((loc) => (
                <div key={loc}>
                  <p className="text-[10px] uppercase tracking-widest text-accent mb-2">{loc}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <label className="block">
                      <span className="label">"Work" link</span>
                      <input
                        className="input"
                        placeholder={loc === 'ar' ? 'الأعمال' : 'Work'}
                        value={s.navLabels?.[loc]?.work ?? ''}
                        onChange={(e) => uNav(loc, 'work', e.target.value)}
                      />
                    </label>
                    <label className="block">
                      <span className="label">"Contact" link</span>
                      <input
                        className="input"
                        placeholder={loc === 'ar' ? 'تواصل' : 'Contact'}
                        value={s.navLabels?.[loc]?.contact ?? ''}
                        onChange={(e) => uNav(loc, 'contact', e.target.value)}
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {tab === 'seo' && (
          <section className="card">
            <h2 className="font-display text-xl mb-4">SEO & brand assets</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <div className="block">
                <span className="label">Logo</span>
                <MediaPicker value={s.logoUrl ?? ''} onChange={(url) => u('logoUrl', url || null)} aspect="square" />
              </div>
              <div className="block">
                <span className="label">Favicon</span>
                <MediaPicker value={s.faviconUrl ?? ''} onChange={(url) => u('faviconUrl', url || null)} aspect="square" />
              </div>
            </div>
            <div className="block">
              <span className="label">Default OG image (used by pages without their own)</span>
              <MediaPicker
                value={s.defaultOgImage ?? ''}
                onChange={(url) => u('defaultOgImage', url || null)}
                aspect="video"
              />
            </div>
          </section>
        )}

        {tab === 'analytics' && (
          <section className="card">
            <h2 className="font-display text-xl mb-1">Analytics</h2>
            <p className="text-xs text-muted mb-5">
              Each is opt-in. Leave blank to skip injection on the public site.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="block">
                <span className="label">Google Analytics ID</span>
                <input
                  className="input font-mono"
                  placeholder="G-XXXXXXXXXX"
                  value={s.gaId ?? ''}
                  onChange={(e) => u('gaId', e.target.value.trim())}
                />
              </label>
              <label className="block">
                <span className="label">Plausible domain</span>
                <input
                  className="input font-mono"
                  placeholder="thevision.studio"
                  value={s.plausibleDomain ?? ''}
                  onChange={(e) => u('plausibleDomain', e.target.value.trim())}
                />
              </label>
            </div>
          </section>
        )}

        {tab === 'advanced' && (
          <section className="card">
            <h2 className="font-display text-xl mb-1">Custom CSS</h2>
            <p className="text-xs text-muted mb-3">
              Injected at the end of the public site&apos;s &lt;head&gt;. Use to tweak typography, spacing, or override accent shades without redeploying.
            </p>
            <textarea
              rows={14}
              className="textarea"
              placeholder={`/* Example */\n.hero h1 { letter-spacing: -0.05em; }`}
              value={s.customCss ?? ''}
              onChange={(e) => u('customCss', e.target.value)}
            />
          </section>
        )}

        {tab === 'faqs' && (
          <section className="card">
            <h2 className="font-display text-xl mb-1">FAQ (AEO)</h2>
            <p className="text-xs text-muted mb-4">
              These render as FAQPage structured data on the home page so AI search engines can cite them.
            </p>
            {s.faqs.map((f, i) => (
              <div key={i} className="border border-ink/10 p-3 mb-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted">#{i + 1}</span>
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
        )}

        <div className="sticky bottom-0 bg-surface-50/90 backdrop-blur py-4 -mx-4 px-4 flex items-center justify-between gap-3 border-t border-ink/10 z-10">
          <div className="text-xs text-muted">
            {dirty ? 'Unsaved changes' : saved ? <span className="text-accent">✓ Saved</span> : 'All changes saved'}
            {error && <span className="ml-2 text-red-700">· {error}</span>}
          </div>
          <button onClick={save} disabled={busy || !dirty} className="btn-accent">
            {busy ? 'Saving…' : 'Save settings'}
          </button>
        </div>
      </div>
    </div>
  );
}

function hexToRgbTriple(hex: string): string | null {
  const m = /^#?([0-9a-f]{6})$/i.exec((hex ?? '').trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
}
