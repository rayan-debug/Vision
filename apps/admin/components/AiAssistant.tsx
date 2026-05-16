'use client';
import { useState } from 'react';
import clsx from 'clsx';
import type { Block, Locale } from '@roua/db';
import { BlockHtmlPreview } from './BlockHtmlPreview';

type Tab = 'generate' | 'improve' | 'translate' | 'tagline' | 'alt';

const TABS: { id: Tab; label: string; desc: string }[] = [
  { id: 'generate', label: 'Generate page', desc: 'Build a full page from a brief' },
  { id: 'improve', label: 'Improve text', desc: 'Tighten, polish, or restyle copy' },
  { id: 'translate', label: 'Translate', desc: 'EN â†” AR with on-brand tone' },
  { id: 'tagline', label: 'Taglines', desc: 'Short brand lines from name + bio' },
  { id: 'alt', label: 'Alt text', desc: 'Accessibility captions for images' },
];

type Props = {
  // When set, the assistant can insert generated blocks into a page editor.
  onAppendBlocks?: (blocks: Block[]) => void;
  onReplaceBlocks?: (blocks: Block[]) => void;
  pageTitle?: string;
};

export function AiAssistant({ onAppendBlocks, onReplaceBlocks, pageTitle }: Props) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>(onAppendBlocks ? 'generate' : 'improve');
  const close = () => setOpen(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 bg-accent text-ink shadow-lg px-4 py-3 rounded-full text-sm font-medium hover:scale-105 transition-transform flex items-center gap-2"
        title="AI assistant"
      >
        <SparkleIcon /> AI assistant
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex" onClick={() => setOpen(false)}>
          <div className="flex-1 bg-ink/40" />
          <aside
            className="w-full max-w-md bg-surface border-l border-ink/10 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="px-5 py-4 border-b border-ink/10 flex items-center gap-3">
              <SparkleIcon />
              <div className="flex-1 min-w-0">
                <h2 className="font-display text-lg leading-none">AI assistant</h2>
                <p className="text-[10px] text-muted uppercase tracking-widest mt-1">
                  Claude Â· opus 4.7
                </p>
              </div>
              <button onClick={() => setOpen(false)} className="btn-ghost text-xs">Close</button>
            </header>

            <nav className="flex overflow-x-auto border-b border-ink/10">
              {TABS.filter((t) => (onAppendBlocks ? true : t.id !== 'generate')).map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={clsx(
                    'px-3 py-2.5 text-xs uppercase tracking-widest shrink-0 border-b-2 -mb-px transition-colors',
                    tab === t.id ? 'border-accent text-ink' : 'border-transparent text-muted hover:text-ink',
                  )}
                >
                  {t.label}
                </button>
              ))}
            </nav>

            <div className="flex-1 overflow-y-auto p-5">
              {tab === 'generate' && (
                <GeneratePagePanel
                  pageTitle={pageTitle}
                  onAppend={(blocks) => { onAppendBlocks?.(blocks); close(); }}
                  onReplace={(blocks) => { onReplaceBlocks?.(blocks); close(); }}
                  canReplace={Boolean(onReplaceBlocks)}
                />
              )}
              {tab === 'improve' && <ImproveCopyPanel />}
              {tab === 'translate' && <TranslatePanel />}
              {tab === 'tagline' && <TaglinePanel />}
              {tab === 'alt' && <AltTextPanel />}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Generate page
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function GeneratePagePanel({
  pageTitle,
  onAppend,
  onReplace,
  canReplace,
}: {
  pageTitle?: string;
  onAppend: (blocks: Block[]) => void;
  onReplace: (blocks: Block[]) => void;
  canReplace: boolean;
}) {
  const [brief, setBrief] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<Block[] | null>(null);
  const [confirmReplace, setConfirmReplace] = useState(false);

  async function run() {
    setBusy(true);
    setError(null);
    setPreview(null);
    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ intent: 'generate-page', brief, title: pageTitle }),
    });
    setBusy(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? 'Generation failed.');
      return;
    }
    const j = await res.json();
    setPreview(j.blocks ?? []);
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted">
        Write a one- or two-sentence brief. Claude generates a full block-by-block page in both English and Arabic.
      </p>
      <textarea
        className="textarea"
        rows={6}
        placeholder="e.g. A studio about page for Roua Bou Ghanem â€” a Beirut-based graphic designer who works on identity, editorial, and photography. Confident editorial tone."
        value={brief}
        onChange={(e) => setBrief(e.target.value)}
      />
      <button onClick={run} disabled={busy || !brief.trim()} className="btn-accent w-full">
        {busy ? 'Thinkingâ€¦' : 'Generate â†’'}
      </button>
      {error && <p className="text-sm text-red-700">{error}</p>}
      {preview && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-widest text-muted">
              {preview.length} blocks Â· live preview
            </p>
            <button
              onClick={() => setPreview(null)}
              className="btn-ghost text-xs"
              title="Discard preview"
            >
              Discard
            </button>
          </div>
          <div className="border border-ink/10 rounded overflow-hidden bg-ink">
            <div className="max-h-[420px] overflow-y-auto">
              <BlockHtmlPreview blocks={preview} />
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => { onAppend(preview); setPreview(null); setConfirmReplace(false); }}
              className="btn-outline text-xs flex-1"
            >
              Append to page
            </button>
            {canReplace && (
              <button
                onClick={() => {
                  if (!confirmReplace) {
                    setConfirmReplace(true);
                    return;
                  }
                  onReplace(preview);
                  setPreview(null);
                  setConfirmReplace(false);
                }}
                onBlur={() => setConfirmReplace(false)}
                className={`text-xs flex-1 ${confirmReplace ? 'btn-danger' : 'btn-accent'}`}
              >
                {confirmReplace ? 'Click again to confirm' : 'Replace all'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Improve copy
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function ImproveCopyPanel() {
  const [text, setText] = useState('');
  const [locale, setLocale] = useState<Locale>('en');
  const [instruction, setInstruction] = useState('Tighten and improve, keep meaning intact.');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function run() {
    setBusy(true);
    setError(null);
    setResult(null);
    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ intent: 'improve-copy', text, locale, instruction }),
    });
    setBusy(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? 'Request failed.');
      return;
    }
    const j = await res.json();
    setResult(j.text ?? '');
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="label">Locale</span>
          <select className="select" value={locale} onChange={(e) => setLocale(e.target.value as Locale)}>
            <option value="en">English</option>
            <option value="ar">Arabic</option>
          </select>
        </label>
      </div>
      <label className="block">
        <span className="label">Instruction</span>
        <input
          className="input"
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          placeholder="Tighten and improve, keep meaning intact."
        />
      </label>
      <label className="block">
        <span className="label">Text</span>
        <textarea
          className="textarea"
          rows={6}
          value={text}
          dir={locale === 'ar' ? 'rtl' : 'ltr'}
          onChange={(e) => setText(e.target.value)}
        />
      </label>
      <button onClick={run} disabled={busy || !text.trim()} className="btn-accent w-full">
        {busy ? 'Thinkingâ€¦' : 'Improve â†’'}
      </button>
      {error && <p className="text-sm text-red-700">{error}</p>}
      {result !== null && (
        <div className="border border-ink/10 bg-surface-50 p-3">
          <p className="text-xs uppercase tracking-widest text-muted mb-2">Suggested</p>
          <p className="text-sm leading-relaxed whitespace-pre-wrap" dir={locale === 'ar' ? 'rtl' : 'ltr'}>{result}</p>
          <button
            onClick={() => {
              navigator.clipboard.writeText(result);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
            className="mt-2 btn-outline text-xs"
          >
            {copied ? 'âœ“ Copied' : 'Copy to clipboard'}
          </button>
        </div>
      )}
    </div>
  );
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Translate
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function TranslatePanel() {
  const [text, setText] = useState('');
  const [from, setFrom] = useState<Locale>('en');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const to: Locale = from === 'en' ? 'ar' : 'en';

  async function run() {
    setBusy(true);
    setError(null);
    setResult(null);
    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ intent: 'translate', text, from, to }),
    });
    setBusy(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? 'Request failed.');
      return;
    }
    const j = await res.json();
    setResult(j.text ?? '');
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <select className="select" value={from} onChange={(e) => setFrom(e.target.value as Locale)}>
          <option value="en">English</option>
          <option value="ar">Arabic</option>
        </select>
        <span className="text-muted">â†’</span>
        <select className="select" value={to} disabled>
          <option value="en">English</option>
          <option value="ar">Arabic</option>
        </select>
      </div>
      <textarea
        className="textarea"
        rows={6}
        value={text}
        dir={from === 'ar' ? 'rtl' : 'ltr'}
        onChange={(e) => setText(e.target.value)}
      />
      <button onClick={run} disabled={busy || !text.trim()} className="btn-accent w-full">
        {busy ? 'Translatingâ€¦' : 'Translate â†’'}
      </button>
      {error && <p className="text-sm text-red-700">{error}</p>}
      {result !== null && (
        <div className="border border-ink/10 bg-surface-50 p-3">
          <p className="text-xs uppercase tracking-widest text-muted mb-2">Translation</p>
          <p className="text-sm leading-relaxed whitespace-pre-wrap" dir={to === 'ar' ? 'rtl' : 'ltr'}>{result}</p>
          <button
            onClick={() => {
              navigator.clipboard.writeText(result);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
            className="mt-2 btn-outline text-xs"
          >
            {copied ? 'âœ“ Copied' : 'Copy to clipboard'}
          </button>
        </div>
      )}
    </div>
  );
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Taglines
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function TaglinePanel() {
  const [siteName, setSiteName] = useState('');
  const [bio, setBio] = useState('');
  const [locale, setLocale] = useState<Locale>('en');
  const [count, setCount] = useState(5);
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setBusy(true);
    setError(null);
    setResults(null);
    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ intent: 'tagline', siteName, bio, locale, count }),
    });
    setBusy(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? 'Request failed.');
      return;
    }
    const j = await res.json();
    setResults(j.taglines ?? []);
  }

  return (
    <div className="space-y-4">
      <label className="block">
        <span className="label">Site name</span>
        <input className="input" value={siteName} onChange={(e) => setSiteName(e.target.value)} />
      </label>
      <label className="block">
        <span className="label">Studio bio (optional)</span>
        <textarea className="textarea" rows={4} value={bio} onChange={(e) => setBio(e.target.value)} />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="label">Language</span>
          <select className="select" value={locale} onChange={(e) => setLocale(e.target.value as Locale)}>
            <option value="en">English</option>
            <option value="ar">Arabic</option>
          </select>
        </label>
        <label className="block">
          <span className="label">How many?</span>
          <input
            type="number"
            min={1}
            max={8}
            className="input"
            value={count}
            onChange={(e) => setCount(Number(e.target.value) || 5)}
          />
        </label>
      </div>
      <button onClick={run} disabled={busy || !siteName.trim()} className="btn-accent w-full">
        {busy ? 'Thinkingâ€¦' : 'Generate â†’'}
      </button>
      {error && <p className="text-sm text-red-700">{error}</p>}
      {results && (
        <ul className="space-y-2">
          {results.map((t, i) => (
            <li key={i} className="border border-ink/10 bg-surface-50 p-3 flex items-center gap-2">
              <span className="text-sm flex-1" dir={locale === 'ar' ? 'rtl' : 'ltr'}>{t}</span>
              <button
                onClick={() => navigator.clipboard.writeText(t)}
                className="btn-ghost text-xs"
                title="Copy"
              >
                âŽ˜
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Alt text
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function AltTextPanel() {
  const [contextText, setContextText] = useState('');
  const [locale, setLocale] = useState<Locale>('en');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setBusy(true);
    setError(null);
    setResult(null);
    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ intent: 'alt-text', contextText, locale }),
    });
    setBusy(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? 'Request failed.');
      return;
    }
    const j = await res.json();
    setResult(j.text ?? '');
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted">
        Describe what the image shows or what page section it&apos;s for. Claude writes a short alt text caption.
      </p>
      <label className="block">
        <span className="label">Image context</span>
        <textarea
          className="textarea"
          rows={4}
          value={contextText}
          onChange={(e) => setContextText(e.target.value)}
          placeholder="Studio bookshelf, terracotta and bone palette, late afternoon light"
        />
      </label>
      <label className="block">
        <span className="label">Locale</span>
        <select className="select" value={locale} onChange={(e) => setLocale(e.target.value as Locale)}>
          <option value="en">English</option>
          <option value="ar">Arabic</option>
        </select>
      </label>
      <button onClick={run} disabled={busy || !contextText.trim()} className="btn-accent w-full">
        {busy ? 'Thinkingâ€¦' : 'Generate alt text â†’'}
      </button>
      {error && <p className="text-sm text-red-700">{error}</p>}
      {result !== null && (
        <div className="border border-ink/10 bg-surface-50 p-3">
          <p className="text-sm" dir={locale === 'ar' ? 'rtl' : 'ltr'}>{result}</p>
          <button
            onClick={() => navigator.clipboard.writeText(result)}
            className="mt-2 btn-outline text-xs"
          >
            Copy
          </button>
        </div>
      )}
    </div>
  );
}


function SparkleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2l1.8 5.4L19 9l-5.2 1.6L12 16l-1.8-5.4L5 9l5.2-1.6L12 2zM19 14l.9 2.7L22 18l-2.1.6L19 22l-.9-3.4L16 18l2.1-.6L19 14zM5 14l.9 2.7L8 18l-2.1.6L5 22l-.9-3.4L2 18l2.1-.6L5 14z"/>
    </svg>
  );
}
