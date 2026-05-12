'use client';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import { BLOCK_TYPES, type Block } from '@roua/db';
import { BlockList } from '@/components/BlockList';

type Template = {
  id: string;
  key: string;
  name: string;
  description: string;
  preview: string;
  blocks: Block[];
  isStarter: boolean;
};

const BLANK: Template = {
  id: '',
  key: 'blank',
  name: 'Blank',
  description: 'Start with nothing. Add blocks one by one below.',
  preview: '\n         (empty)\n',
  blocks: [],
  isStarter: true,
};

export default function NewPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[] | null>(null);
  const [picked, setPicked] = useState<Template>(BLANK);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [titleEn, setTitleEn] = useState('');
  const [titleAr, setTitleAr] = useState('');
  const [slugEn, setSlugEn] = useState('');
  const [slugAr, setSlugAr] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load templates from the DB so admin edits are reflected here.
  useEffect(() => {
    fetch('/api/templates')
      .then((r) => r.json())
      .then((j: { items?: { id: string; key: string; name: string; description: string; preview: string; blocks: unknown; isStarter: boolean }[] }) => {
        const items: Template[] = (j.items ?? []).map((t) => ({
          id: t.id,
          key: t.key,
          name: t.name,
          description: t.description ?? '',
          preview: t.preview ?? '',
          blocks: Array.isArray(t.blocks) ? (t.blocks as Block[]) : [],
          isStarter: t.isStarter,
        }));
        setTemplates(items);
      })
      .catch(() => setTemplates([]));
  }, []);

  // When picking a template, replace the working blocks. Each template build
  // already includes fresh IDs, but we clone to keep separate instances per
  // re-pick.
  function pick(t: Template) {
    setPicked(t);
    setBlocks(JSON.parse(JSON.stringify(t.blocks)) as Block[]);
  }

  const allTemplates = useMemo(() => [BLANK, ...(templates ?? [])], [templates]);

  // Auto-fill slug from English title if user hasn't typed one yet.
  function maybeFillSlug(value: string) {
    const slug = value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60);
    if (!slugEn) setSlugEn(slug);
    if (!slugAr) setSlugAr(slug);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch('/api/pages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        titleEn,
        titleAr,
        slugEn,
        slugAr,
        // Send the (possibly customized) blocks rather than the templateId so
        // the user's pre-create edits are preserved.
        blocks,
      }),
    });
    setBusy(false);
    if (res.ok) {
      const json = await res.json();
      router.push(`/pages/${json.id}`);
    } else {
      const b = await res.json().catch(() => ({}));
      setError(b.error ?? 'Could not create page.');
    }
  }

  return (
    <div className="p-4 md:p-8 lg:p-12 max-w-5xl">
      <Link href="/pages" className="text-xs text-muted hover:text-accent transition-colors inline-flex items-center gap-1 mb-3">
        ← All pages
      </Link>
      <p className="text-xs uppercase tracking-widest text-accent mb-2">New</p>
      <h1 className="font-display text-3xl md:text-5xl mb-2">Create a page</h1>
      <p className="text-muted mb-8 md:mb-10 max-w-2xl">
        Pick a template, customize the blocks below it, then fill in the title and slug. Everything is editable later.
      </p>

      <form onSubmit={onSubmit} className="space-y-8">
        <div>
          <p className="label">1. Choose a template</p>
          {templates === null ? (
            <p className="text-xs text-muted">Loading templates…</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {allTemplates.map((t) => {
                const active = picked.key === t.key;
                return (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => pick(t)}
                    className={clsx(
                      'text-left border p-3 transition-colors flex flex-col gap-2',
                      active
                        ? 'border-accent ring-1 ring-accent bg-surface-100'
                        : 'border-ink/10 hover:border-ink/30 bg-surface',
                    )}
                  >
                    <pre
                      className={clsx(
                        'font-mono text-[8px] leading-[1.1] whitespace-pre overflow-hidden max-h-32',
                        active ? 'text-accent' : 'text-muted',
                      )}
                    >
                      {t.preview || '\n   (no preview)\n'}
                    </pre>
                    <div>
                      <p className="font-medium text-sm flex items-center gap-2">
                        {t.name}
                        {t.blocks.length > 0 && (
                          <span className="text-[10px] text-muted font-mono">· {t.blocks.length} blocks</span>
                        )}
                      </p>
                      <p className="text-[11px] text-muted leading-snug mt-0.5 line-clamp-2">{t.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <p className="label">2. Customize the page</p>
          <div className="border border-ink/10 bg-surface-50 p-3 md:p-4">
            <BlockList
              blocks={blocks}
              onChange={setBlocks}
              blockTypes={BLOCK_TYPES}
            />
          </div>
          <p className="text-[10px] text-muted mt-2">
            Add or remove blocks now, or after creating the page. Empty content is fine — you can fill it in later.
          </p>
        </div>

        <div>
          <p className="label">3. Title & URL</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <label className="block">
              <span className="label">Title · English</span>
              <input
                value={titleEn}
                onChange={(e) => {
                  setTitleEn(e.target.value);
                  maybeFillSlug(e.target.value);
                }}
                required
                className="input"
                placeholder="About"
              />
            </label>
            <label className="block">
              <span className="label">Title · العربية</span>
              <input
                value={titleAr}
                onChange={(e) => setTitleAr(e.target.value)}
                required
                className="input"
                placeholder="من نحن"
                dir="rtl"
              />
            </label>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block">
              <span className="label">Slug · English</span>
              <input
                value={slugEn}
                onChange={(e) => setSlugEn(e.target.value.toLowerCase())}
                required
                pattern="[a-z0-9\-]+"
                className="input font-mono"
                placeholder="about"
              />
              <span className="text-[10px] text-muted mt-1 block">
                URL: <code>/en/{slugEn || 'your-slug'}</code>
              </span>
            </label>
            <label className="block">
              <span className="label">Slug · Arabic page</span>
              <input
                value={slugAr}
                onChange={(e) => setSlugAr(e.target.value.toLowerCase())}
                required
                pattern="[a-z0-9\-]+"
                className="input font-mono"
                placeholder="about"
              />
              <span className="text-[10px] text-muted mt-1 block">
                URLs must be ASCII — use a latin slug even for Arabic.
              </span>
            </label>
          </div>
        </div>

        {error && <p className="text-sm text-red-700">{error}</p>}

        <div className="flex flex-wrap gap-3 pt-2 border-t border-ink/10">
          <button type="submit" disabled={busy} className="btn-accent">
            {busy ? 'Creating…' : 'Create page →'}
          </button>
          <button type="button" onClick={() => router.back()} className="btn-ghost">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
