'use client';
import { useState } from 'react';
import clsx from 'clsx';

type Scope = 'pages' | 'projects' | 'services' | 'testimonials' | 'templates' | 'settings';
type Preview = { scope: Scope; id: string; name: string; matches: number };

const ALL_SCOPES: { id: Scope; label: string }[] = [
  { id: 'pages', label: 'Pages' },
  { id: 'projects', label: 'Projects' },
  { id: 'services', label: 'Services' },
  { id: 'testimonials', label: 'Testimonials' },
  { id: 'templates', label: 'Templates' },
  { id: 'settings', label: 'Site settings' },
];

export default function FindReplacePage() {
  const [search, setSearch] = useState('');
  const [replace, setReplace] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [scopes, setScopes] = useState<Scope[]>(['pages', 'projects', 'services', 'testimonials']);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    dryRun: boolean;
    totalMatches: number;
    appliedCount: number;
    previews: Preview[];
  } | null>(null);

  function toggleScope(s: Scope) {
    setScopes((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]));
  }

  async function run(dryRun: boolean) {
    setBusy(true);
    setError(null);
    if (!dryRun) setResult(null);
    const res = await fetch('/api/find-replace', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ search, replace, scopes, caseSensitive, dryRun }),
    });
    setBusy(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? 'Request failed.');
      return;
    }
    const j = await res.json();
    setResult(j);
  }

  return (
    <div className="p-4 md:p-8 lg:p-12 max-w-4xl">
      <p className="text-xs uppercase tracking-widest text-accent mb-2">Studio</p>
      <h1 className="font-display text-3xl md:text-5xl mb-2">Find & replace</h1>
      <p className="text-muted mb-8 md:mb-10 max-w-2xl">
        Search across pages, projects, services, testimonials, templates, and settings. Always preview first — replacement runs on every matching string across every translatable field.
      </p>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="block">
            <span className="label">Find</span>
            <input
              className="input"
              placeholder="old text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="label">Replace with</span>
            <input
              className="input"
              placeholder="new text"
              value={replace}
              onChange={(e) => setReplace(e.target.value)}
            />
          </label>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={caseSensitive}
            onChange={(e) => setCaseSensitive(e.target.checked)}
          />
          <span className="text-sm">Case sensitive</span>
        </label>

        <div>
          <p className="label">Scope</p>
          <div className="flex flex-wrap gap-2">
            {ALL_SCOPES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => toggleScope(s.id)}
                className={clsx(
                  'px-3 py-1.5 text-xs uppercase tracking-widest border transition-colors',
                  scopes.includes(s.id)
                    ? 'bg-ink text-bone border-ink'
                    : 'border-ink/15 text-muted hover:border-ink/30',
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-2">
          <button
            onClick={() => run(true)}
            disabled={busy || !search}
            className="btn-outline"
          >
            {busy ? 'Searching…' : 'Preview matches'}
          </button>
          <button
            onClick={() => {
              if (!confirm(`Replace "${search}" with "${replace}" everywhere in selected scopes? This cannot be undone.`)) return;
              run(false);
            }}
            disabled={busy || !search || !result || result.totalMatches === 0}
            className="btn-accent"
          >
            Apply replacement →
          </button>
        </div>

        {error && <p className="text-sm text-red-700">{error}</p>}

        {result && (
          <div className="border border-ink/10 bg-surface mt-4">
            <header className="px-4 py-3 border-b border-ink/10 flex items-center justify-between">
              <span className="text-sm font-medium">
                {result.dryRun
                  ? `${result.totalMatches} match${result.totalMatches === 1 ? '' : 'es'} across ${result.previews.length} record${result.previews.length === 1 ? '' : 's'}`
                  : `Replaced ${result.totalMatches} occurrence${result.totalMatches === 1 ? '' : 's'} in ${result.appliedCount} record${result.appliedCount === 1 ? '' : 's'}.`}
              </span>
              <span className={clsx('tag', result.dryRun ? '' : 'border-accent text-accent')}>
                {result.dryRun ? 'Preview' : 'Done'}
              </span>
            </header>
            {result.previews.length === 0 ? (
              <p className="px-4 py-6 text-sm text-muted">No matches found.</p>
            ) : (
              <ul className="divide-y divide-ink/10">
                {result.previews.map((p) => (
                  <li key={`${p.scope}-${p.id}`} className="px-4 py-2.5 flex items-center gap-3 text-sm">
                    <span className="text-[10px] uppercase tracking-widest text-muted w-24 shrink-0">
                      {p.scope}
                    </span>
                    <span className="flex-1 truncate">{p.name}</span>
                    <span className="text-xs font-mono text-accent shrink-0">
                      {p.matches} match{p.matches === 1 ? '' : 'es'}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
