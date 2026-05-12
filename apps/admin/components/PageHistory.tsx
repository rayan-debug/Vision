'use client';
import { useEffect, useState } from 'react';

type Revision = {
  id: string;
  createdAt: string;
  editorEmail: string | null;
  note: string | null;
  status: 'DRAFT' | 'PUBLISHED';
  i18n: Record<string, { title: string; description?: string; keywords?: string }>;
  blocks: unknown[];
  ogImage: string | null;
  noindex: boolean;
  showInNav: boolean;
  navOrder: number;
  isHome: boolean;
};

export function PageHistory({
  pageId,
  onClose,
  onRestore,
}: {
  pageId: string;
  onClose: () => void;
  onRestore: (snapshot: Revision) => void;
}) {
  const [items, setItems] = useState<Revision[] | null>(null);
  const [selected, setSelected] = useState<Revision | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/pages/${pageId}/revisions`)
      .then((r) => r.json())
      .then((j) => setItems(j.items ?? []))
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load history'));
  }, [pageId]);

  return (
    <div className="fixed inset-0 z-50 bg-ink/70 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-surface w-full max-w-5xl max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="px-5 py-4 border-b border-ink/10 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <h2 className="font-display text-xl leading-none">Version history</h2>
            <p className="text-xs text-muted mt-1">
              Restore any earlier save. The current page is also captured first — restoring won&apos;t lose anything until you save over it.
            </p>
          </div>
          <button onClick={onClose} className="btn-ghost text-xs">Close</button>
        </header>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-[280px_1fr] overflow-hidden">
          <aside className="border-r border-ink/10 overflow-y-auto bg-surface-50">
            {items === null && <p className="p-4 text-sm text-muted">Loading…</p>}
            {error && <p className="p-4 text-sm text-red-700">{error}</p>}
            {items && items.length === 0 && (
              <p className="p-4 text-sm text-muted">
                No revisions yet. The next save will be the first.
              </p>
            )}
            <ul className="divide-y divide-ink/10">
              {items?.map((r) => {
                const active = selected?.id === r.id;
                return (
                  <li key={r.id}>
                    <button
                      onClick={() => setSelected(r)}
                      className={`w-full text-left px-4 py-3 transition-colors ${active ? 'bg-surface-100' : 'hover:bg-surface-100'}`}
                    >
                      <p className="text-sm font-medium truncate">
                        {new Date(r.createdAt).toLocaleString()}
                      </p>
                      <p className="text-[11px] text-muted truncate">
                        {r.editorEmail ?? 'unknown'} · {r.status.toLowerCase()}
                      </p>
                      {r.note && (
                        <p className="text-[11px] text-muted truncate italic mt-0.5">{r.note}</p>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </aside>

          <section className="flex-1 overflow-y-auto p-5">
            {!selected ? (
              <p className="text-sm text-muted">Select a revision on the left to preview.</p>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <h3 className="font-display text-lg">
                      {selected.i18n.en?.title || '(untitled)'}
                    </h3>
                    <p className="text-xs text-muted">
                      Saved {new Date(selected.createdAt).toLocaleString()}
                      {selected.editorEmail && ` by ${selected.editorEmail}`}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm('Restore this revision into the editor? You can still cancel by not saving.')) {
                        onRestore(selected);
                      }
                    }}
                    className="btn-accent text-xs"
                  >
                    Restore this version
                  </button>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-widest text-muted mb-2">
                    {(selected.blocks as { type: string }[]).length} blocks
                  </p>
                  <ol className="border border-ink/10 divide-y divide-ink/10 text-sm">
                    {(selected.blocks as { type: string; heading?: { en?: string } }[]).map((b, i) => (
                      <li key={i} className="px-3 py-2 flex items-center gap-3">
                        <span className="text-muted text-xs w-6 font-mono">{String(i + 1).padStart(2, '0')}</span>
                        <code className="text-xs uppercase tracking-wider">{b.type}</code>
                        {b.heading?.en && <span className="text-muted text-xs truncate flex-1">{b.heading.en}</span>}
                      </li>
                    ))}
                  </ol>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-widest text-muted mb-2">Meta</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    {(['en', 'ar'] as const).map((loc) => (
                      <div key={loc} className="border border-ink/10 p-3">
                        <p className="text-[10px] uppercase tracking-widest text-accent">{loc}</p>
                        <p className="font-medium mt-1">{selected.i18n[loc]?.title || '—'}</p>
                        <p className="text-muted mt-0.5 leading-snug">
                          {selected.i18n[loc]?.description || '—'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
