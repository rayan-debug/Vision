'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { Block } from '@roua/db';
import { BlockHtmlThumbnail } from './BlockHtmlPreview';
import { AiTemplateModal } from './AiTemplateModal';

type Row = {
  id: string;
  key: string;
  name: string;
  description: string;
  preview: string;
  blocks: Block[];
  isStarter: boolean;
  order: number;
};

export function TemplatesList({ initial }: { initial: Row[] }) {
  const router = useRouter();
  const [rows, setRows] = useState(initial);
  const [busy, setBusy] = useState<string | null>(null);
  const [aiOpen, setAiOpen] = useState(false);
  const [hoverId, setHoverId] = useState<string | null>(null);

  async function remove(id: string) {
    if (!confirm('Delete this template? Pages already created from it are unaffected.')) return;
    setBusy(id);
    const res = await fetch(`/api/templates/${id}`, { method: 'DELETE' });
    setBusy(null);
    if (res.ok) setRows((p) => p.filter((r) => r.id !== id));
  }

  async function duplicate(source: Row) {
    setBusy(source.id);
    const res = await fetch('/api/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `${source.name} (copy)`,
        description: source.description,
        blocks: source.blocks,
      }),
    });
    setBusy(null);
    if (res.ok) {
      const j = await res.json();
      router.push(`/templates/${j.id}`);
    }
  }

  if (rows.length === 0) {
    return (
      <>
        <div className="border border-dashed border-ink/15 p-8 text-center">
          <p className="text-muted mb-3">No templates yet.</p>
          <p className="text-xs text-muted mb-4">
            Six starter templates seed on first run. Run{' '}
            <code className="text-xs">npm run seed:templates --workspace packages/db</code>{' '}
            to populate them — or generate one with AI right now.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Link href="/templates/new" className="btn-outline">+ Empty template</Link>
            <button onClick={() => setAiOpen(true)} className="btn-accent">✦ AI generate template</button>
          </div>
        </div>
        {aiOpen && <AiTemplateModal onClose={() => setAiOpen(false)} />}
      </>
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <button onClick={() => setAiOpen(true)} className="btn-accent text-sm">
          ✦ AI generate template
        </button>
        <Link href="/templates/new" className="btn-outline text-sm">+ Empty template</Link>
        <p className="text-xs text-muted ml-auto">{rows.length} templates</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {rows.map((t) => (
          <div
            key={t.id}
            className="border border-ink/10 bg-surface flex flex-col group relative transition-colors hover:border-accent"
            onMouseEnter={() => setHoverId(t.id)}
            onMouseLeave={() => setHoverId(null)}
          >
            <Link href={`/templates/${t.id}`} className="block flex-1">
              {/* HTML mini-page preview — looks like a real webpage, not blocks */}
              <div className="aspect-[4/5] overflow-hidden border-b border-ink/10">
                <BlockHtmlThumbnail blocks={t.blocks} />
              </div>
              <div className="p-3">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h2 className="font-display text-lg leading-tight line-clamp-1">{t.name}</h2>
                  {t.isStarter && <span className="tag text-[9px] shrink-0">STARTER</span>}
                </div>
                <p className="text-xs text-muted leading-snug line-clamp-2 mb-2">{t.description}</p>
                <p className="text-[10px] text-muted font-mono">
                  {t.blocks.length} block{t.blocks.length === 1 ? '' : 's'} · {t.key}
                </p>
              </div>
            </Link>

            {/* Hover popover with block outline */}
            {hoverId === t.id && t.blocks.length > 0 && (
              <div className="hidden md:block absolute left-full top-0 ml-2 z-30 w-64 bg-surface border border-ink/15 shadow-lg p-3 pointer-events-none">
                <p className="text-[10px] uppercase tracking-widest text-muted mb-2">Blocks</p>
                <ol className="text-xs space-y-0.5 list-decimal list-inside text-muted">
                  {t.blocks.slice(0, 12).map((b, i) => (
                    <li key={i}>
                      <code className="text-ink">{b.type}</code>
                    </li>
                  ))}
                  {t.blocks.length > 12 && (
                    <li className="text-[10px] italic list-none ml-2">+{t.blocks.length - 12} more</li>
                  )}
                </ol>
              </div>
            )}

            <div className="border-t border-ink/10 flex text-xs">
              <Link
                href={`/templates/${t.id}`}
                className="flex-1 py-2 hover:bg-surface-100 text-muted hover:text-ink text-center"
              >
                Edit
              </Link>
              <button
                onClick={() => duplicate(t)}
                disabled={busy === t.id}
                className="flex-1 py-2 hover:bg-surface-100 text-muted hover:text-ink border-l border-ink/10"
                title="Duplicate"
              >
                Duplicate
              </button>
              <button
                onClick={() => remove(t.id)}
                disabled={busy === t.id}
                className="flex-1 py-2 hover:bg-red-50 text-muted hover:text-red-700 border-l border-ink/10"
                title={t.isStarter ? 'Re-seed with `npm run seed:templates` to restore' : undefined}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {aiOpen && <AiTemplateModal onClose={() => setAiOpen(false)} />}
    </>
  );
}
