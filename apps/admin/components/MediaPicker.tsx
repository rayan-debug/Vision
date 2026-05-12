'use client';
import { useEffect, useMemo, useState } from 'react';

type Media = { id: string; url: string; filename: string; alt: string | null };

// Reusable image input. Renders a thumbnail when a URL is set; clicking it
// opens a modal listing the media library. Falls back to a raw text field so
// external URLs still work.
export function MediaPicker({
  value,
  onChange,
  placeholder = 'https://… or pick from media',
  aspect = 'square',
}: {
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  aspect?: 'square' | 'video' | 'tall';
}) {
  const [open, setOpen] = useState(false);

  const aspectClass =
    aspect === 'video' ? 'aspect-video' : aspect === 'tall' ? 'aspect-[3/4]' : 'aspect-square';

  return (
    <>
      <div className="flex gap-2 items-start">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={`shrink-0 w-20 ${aspectClass} border border-ink/15 bg-surface-100 hover:border-accent transition-colors flex items-center justify-center overflow-hidden`}
          title="Open media library"
        >
          {value ? (
            <img src={value} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-xl text-muted">+</span>
          )}
        </button>
        <input
          className="input font-mono text-xs"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="btn-ghost text-xs"
            title="Clear"
          >
            ×
          </button>
        )}
      </div>
      {open && <MediaPickerModal onPick={(url) => { onChange(url); setOpen(false); }} onClose={() => setOpen(false)} />}
    </>
  );
}

function MediaPickerModal({ onPick, onClose }: { onPick: (url: string) => void; onClose: () => void }) {
  const [items, setItems] = useState<Media[] | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    fetch('/api/media')
      .then((r) => r.json())
      .then((j) => setItems(j.items ?? []))
      .catch(() => setItems([]));
  }, []);

  const filtered = useMemo(() => {
    if (!items) return [];
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (i) => i.filename.toLowerCase().includes(q) || (i.alt ?? '').toLowerCase().includes(q),
    );
  }, [items, query]);

  return (
    <div className="fixed inset-0 z-50 bg-ink/70 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-surface w-full max-w-4xl max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 py-3 border-b border-ink/10 flex items-center gap-3">
          <h3 className="font-display text-lg flex-1">Media library</h3>
          <input
            className="input max-w-xs"
            placeholder="Search…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button onClick={onClose} className="btn-ghost text-xs">Close</button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {items === null ? (
            <p className="text-sm text-muted">Loading…</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted">
              {items.length === 0 ? 'No media uploaded yet. Visit the Media page first.' : 'No matches.'}
            </p>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
              {filtered.map((m) => (
                <button
                  key={m.id}
                  onClick={() => onPick(m.url)}
                  className="group border border-ink/10 hover:border-accent transition-colors text-left"
                >
                  <div className="aspect-square overflow-hidden bg-surface-100">
                    <img src={m.url} alt={m.alt ?? ''} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <p className="p-1.5 text-[10px] truncate font-mono text-muted">{m.filename}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
