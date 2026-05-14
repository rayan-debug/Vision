'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Media = {
  id: string;
  url: string;
  filename: string;
  mimeType: string;
  size: number;
  alt: string | null;
  createdAt: string;
};

export function MediaLibrary({ initial }: { initial: Media[] }) {
  const router = useRouter();
  const [items, setItems] = useState<Media[]>(initial);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  async function onUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);
    const fd = new FormData();
    for (const f of Array.from(files)) fd.append('files', f);
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    setUploading(false);
    if (!res.ok) {
      const b = await res.json().catch(() => ({}));
      setError(b.error ?? 'Upload failed');
      return;
    }
    const { uploaded } = await res.json();
    setItems((p) => [...uploaded, ...p]);
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm('Delete this file?')) return;
    await fetch(`/api/media/${id}`, { method: 'DELETE' });
    setItems((p) => p.filter((m) => m.id !== id));
  }

  function copy(url: string) {
    navigator.clipboard.writeText(url);
    setCopied(url);
    setTimeout(() => setCopied(null), 1500);
  }

  return (
    <div>
      <label className="block border-2 border-dashed border-ink/15 hover:border-accent p-10 text-center cursor-pointer transition-colors mb-6">
        <input
          type="file"
          multiple
          accept="image/*,video/mp4,video/webm,video/ogg,video/quicktime"
          className="hidden"
          onChange={(e) => onUpload(e.target.files)}
        />
        <p className="text-2xl font-display mb-2">{uploading ? 'Uploading…' : 'Drop or click to upload'}</p>
        <p className="text-xs text-muted">Images (10MB max) and videos — mp4, webm, mov (100MB max) · stored in /public/uploads or Cloudinary</p>
      </label>

      {error && <p className="text-sm text-red-700 mb-4">{error}</p>}

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {items.map((m) => (
          <div key={m.id} className="group relative border border-ink/10 bg-surface overflow-hidden">
            <div className="aspect-square overflow-hidden bg-surface-100 relative">
              {m.mimeType.startsWith('video/') ? (
                <>
                  <video
                    src={m.url}
                    muted
                    playsInline
                    preload="metadata"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-1 left-1 text-[9px] uppercase tracking-widest bg-ink/80 text-bone px-1.5 py-0.5">
                    Video
                  </span>
                </>
              ) : (
                <img src={m.url} alt={m.alt ?? ''} className="w-full h-full object-cover" />
              )}
            </div>
            <div className="p-2">
              <p className="text-xs truncate font-mono text-muted">{m.filename}</p>
              <p className="text-[10px] text-muted">{(m.size / 1024).toFixed(0)} KB</p>
            </div>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-ink/80 flex flex-col items-center justify-center gap-2 transition-opacity">
              <button onClick={() => copy(m.url)} className="text-bone text-xs uppercase tracking-widest hover:text-accent">
                {copied === m.url ? '✓ Copied' : 'Copy URL'}
              </button>
              <a href={m.url} target="_blank" rel="noreferrer" className="text-bone text-xs uppercase tracking-widest hover:text-accent">
                Open ↗
              </a>
              <button onClick={() => remove(m.id)} className="text-red-300 text-xs uppercase tracking-widest hover:text-red-100">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && <p className="text-muted text-sm">No media yet.</p>}
    </div>
  );
}
