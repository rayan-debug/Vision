'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Block } from '@roua/db';
import { BlockHtmlPreview } from './BlockHtmlPreview';

// Dialog for asking Claude to draft a new template. Reuses /api/ai
// generate-page intent (templates are just block lists), then on save
// POSTs to /api/templates with the chosen name + description + blocks.
export function AiTemplateModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [brief, setBrief] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imagery, setImagery] = useState(true);
  const [animations, setAnimations] = useState(true);
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<Block[] | null>(null);

  async function generate() {
    setBusy(true);
    setError(null);
    setPreview(null);
    // Prepend explicit, machine-readable directives that the AI route already
    // understands (Unsplash image URLs + style.animation per block).
    const directives: string[] = [];
    if (imagery)
      directives.push(
        'Include real imagery. For every image src (hero, image, gallery, video poster) use https://source.unsplash.com/featured/1600x1000/?<keywords> with specific keywords.',
      );
    if (animations)
      directives.push(
        'Add reveal animations: set block.style.animation to one of "fade", "slide-up", "slide-in", "zoom". Use slide-up on hero, vary slide-in/fade through the body, zoom on stats/CTA. None on marquee/spacer.',
      );
    const composed = [...directives, brief.trim()].filter(Boolean).join('\n\n');
    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ intent: 'generate-page', brief: composed, title: name || undefined }),
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

          <div className="flex flex-wrap gap-2">
            <Chip on={imagery} onClick={() => setImagery((v) => !v)} label="Include imagery" />
            <Chip on={animations} onClick={() => setAnimations((v) => !v)} label="Add animations" />
          </div>

          <button onClick={generate} disabled={busy || !brief.trim()} className="btn-accent w-full">
            {busy ? 'Generating…' : 'Generate preview →'}
          </button>

          {error && <p className="text-sm text-red-700">{error}</p>}

          {preview && (
            <div className="border border-ink/10 bg-surface-50">
              <header className="px-3 py-2 border-b border-ink/10 text-xs uppercase tracking-widest text-muted flex items-center justify-between">
                <span>{preview.length} block{preview.length === 1 ? '' : 's'} · live HTML preview</span>
                <span className="text-[10px] normal-case tracking-normal">
                  {preview.some((b) => (b as { style?: { animation?: string } }).style?.animation && (b as { style?: { animation?: string } }).style?.animation !== 'none') && '✦ animated'}
                </span>
              </header>
              {/* Render the AI draft as the real page it will become — same
                  component the public site uses for block rendering shape. */}
              <div className="bg-ink max-h-[480px] overflow-y-auto">
                <BlockHtmlPreview blocks={preview} />
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

function Chip({ on, onClick, label }: { on: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-[11px] uppercase tracking-widest px-2.5 py-1 border transition-colors ${
        on
          ? 'border-accent text-ink bg-accent/10'
          : 'border-ink/15 text-muted hover:border-ink/30 hover:text-ink'
      }`}
    >
      {on ? '✓ ' : ''}
      {label}
    </button>
  );
}
