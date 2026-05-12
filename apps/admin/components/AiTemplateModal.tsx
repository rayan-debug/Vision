'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Block } from '@roua/db';
import { BlockThumbnail } from './BlockThumbnail';

// Dialog for asking Claude to draft a new template. Reuses /api/ai
// generate-page intent (templates are just block lists), then on save
// POSTs to /api/templates with the chosen name + description + blocks.
export function AiTemplateModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [brief, setBrief] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<Block[] | null>(null);

  async function generate() {
    setBusy(true);
    setError(null);
    setPreview(null);
    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ intent: 'generate-page', brief, title: name || undefined }),
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

  async function save() {
    if (!preview) return;
    setSaving(true);
    setError(null);
    const res = await fetch('/api/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name || 'AI-generated template',
        description,
        blocks: preview,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? 'Save failed.');
      return;
    }
    const j = await res.json();
    router.push(`/templates/${j.id}`);
  }

  return (
    <div className="fixed inset-0 z-50 bg-ink/70 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-surface w-full max-w-3xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="px-5 py-4 border-b border-ink/10 flex items-center gap-3">
          <span className="text-accent">✦</span>
          <div className="flex-1">
            <h2 className="font-display text-xl leading-none">Generate template with AI</h2>
            <p className="text-[11px] text-muted mt-1">Claude · opus 4.7 · ~$0.10 per generation</p>
          </div>
          <button onClick={onClose} className="btn-ghost text-xs">Close</button>
        </header>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="block">
              <span className="label">Name</span>
              <input
                className="input"
                placeholder="e.g. Photographer's reel"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="label">Short description</span>
              <input
                className="input"
                placeholder="What it's for"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </label>
          </div>

          <label className="block">
            <span className="label">Brief</span>
            <textarea
              className="textarea"
              rows={5}
              placeholder="Describe the kind of page this template should produce. Mention layout cues like 'image-heavy', 'editorial', 'lots of negative space'. Example: A long-form journal layout — quiet hero, alternating wide text and full-bleed images, ending in a single CTA."
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
            />
          </label>

          <button onClick={generate} disabled={busy || !brief.trim()} className="btn-accent w-full">
            {busy ? 'Generating…' : 'Generate preview →'}
          </button>

          {error && <p className="text-sm text-red-700">{error}</p>}

          {preview && (
            <div className="border border-ink/10 bg-surface-50">
              <header className="px-3 py-2 border-b border-ink/10 text-xs uppercase tracking-widest text-muted">
                {preview.length} block{preview.length === 1 ? '' : 's'} preview
              </header>
              <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-3 p-3">
                <BlockThumbnail blocks={preview} maxBlocks={12} />
                <ol className="text-sm space-y-1 list-decimal list-inside text-muted">
                  {preview.map((b, i) => (
                    <li key={i}>
                      <code className="text-ink">{b.type}</code>
                      {(b as { heading?: { en?: string } }).heading?.en && (
                        <span> — {(b as { heading: { en: string } }).heading.en.slice(0, 60)}</span>
                      )}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}
        </div>

        {preview && (
          <footer className="px-5 py-4 border-t border-ink/10 flex items-center justify-end gap-2">
            <button onClick={generate} disabled={busy || saving} className="btn-outline text-xs">
              Regenerate
            </button>
            <button onClick={save} disabled={saving} className="btn-accent">
              {saving ? 'Saving…' : 'Save as template →'}
            </button>
          </footer>
        )}
      </div>
    </div>
  );
}
