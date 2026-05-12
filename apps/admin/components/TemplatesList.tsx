'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type Row = {
  id: string;
  key: string;
  name: string;
  description: string;
  preview: string;
  blocksCount: number;
  isStarter: boolean;
  order: number;
};

export function TemplatesList({ initial }: { initial: Row[] }) {
  const router = useRouter();
  const [rows, setRows] = useState(initial);
  const [busy, setBusy] = useState<string | null>(null);

  async function remove(id: string) {
    if (!confirm('Delete this template? Pages already created from it are unaffected.')) return;
    setBusy(id);
    const res = await fetch(`/api/templates/${id}`, { method: 'DELETE' });
    setBusy(null);
    if (res.ok) setRows((p) => p.filter((r) => r.id !== id));
  }

  if (rows.length === 0) {
    return (
      <div className="border border-dashed border-ink/15 p-8 text-center">
        <p className="text-muted mb-3">No templates yet.</p>
        <p className="text-xs text-muted mb-4">
          The 6 starter templates seed on first run. Run{' '}
          <code className="text-xs">npm run seed:templates --workspace packages/db</code>{' '}
          to populate them.
        </p>
        <Link href="/templates/new" className="btn-accent">+ Create your first template</Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {rows.map((t) => (
        <div key={t.id} className="border border-ink/10 bg-surface flex flex-col">
          <Link href={`/templates/${t.id}`} className="block hover:border-accent transition-colors p-4 flex-1">
            <div className="flex items-start justify-between gap-2 mb-3">
              <h2 className="font-display text-lg leading-tight">{t.name}</h2>
              {t.isStarter && <span className="tag text-[9px]">STARTER</span>}
            </div>
            <pre className="font-mono text-[8px] leading-[1.1] whitespace-pre text-muted overflow-hidden mb-3 max-h-32">
              {t.preview || '\n   (no preview)\n'}
            </pre>
            <p className="text-xs text-muted leading-snug mb-2 line-clamp-3">{t.description}</p>
            <p className="text-[10px] text-muted font-mono">
              {t.blocksCount} block{t.blocksCount === 1 ? '' : 's'} · {t.key}
            </p>
          </Link>
          <div className="border-t border-ink/10 flex">
            <Link
              href={`/templates/${t.id}`}
              className="flex-1 text-xs py-2 hover:bg-surface-100 text-muted hover:text-ink text-center"
            >
              Edit
            </Link>
            <button
              onClick={() => remove(t.id)}
              disabled={busy === t.id}
              className="flex-1 text-xs py-2 hover:bg-red-50 text-muted hover:text-red-700 border-l border-ink/10"
              title={t.isStarter ? 'Re-seed with `npm run seed:templates` to restore' : undefined}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
