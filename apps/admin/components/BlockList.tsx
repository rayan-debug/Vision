'use client';
import { useEffect, useState } from 'react';
import { randomId } from '@/lib/id';
import { LOCALES, type Block, type BlockType, type Locale } from '@roua/db';
import { MediaPicker } from './MediaPicker';

type Props = {
  blocks: Block[];
  onChange: (blocks: Block[]) => void;
  blockTypes: { type: BlockType; label: string; description: string }[];
};

type EmptyTemplate = { id: string; name: string; description: string; blocks: Block[] };

export function BlockList({ blocks, onChange, blockTypes }: Props) {
  const [adding, setAdding] = useState(false);
  const [emptyTemplates, setEmptyTemplates] = useState<EmptyTemplate[] | null>(null);

  // Fetch DB templates only when the page is empty — gives the editor a
  // one-click way to start from a layout without leaving the page editor.
  useEffect(() => {
    if (blocks.length !== 0 || emptyTemplates !== null) return;
    fetch('/api/templates')
      .then((r) => r.json())
      .then((j: { items?: { id: string; name: string; description: string; blocks: unknown }[] }) => {
        setEmptyTemplates(
          (j.items ?? [])
            .filter((t) => Array.isArray(t.blocks) && (t.blocks as unknown[]).length > 0)
            .map((t) => ({
              id: t.id,
              name: t.name,
              description: t.description ?? '',
              blocks: t.blocks as Block[],
            })),
        );
      })
      .catch(() => setEmptyTemplates([]));
  }, [blocks.length, emptyTemplates]);

  function update(i: number, next: Block) {
    const copy = blocks.slice();
    copy[i] = next;
    onChange(copy);
  }
  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= blocks.length) return;
    const copy = blocks.slice();
    [copy[i], copy[j]] = [copy[j], copy[i]];
    onChange(copy);
  }
  function remove(i: number) {
    onChange(blocks.filter((_, idx) => idx !== i));
  }
  function duplicate(i: number) {
    const copy = blocks.slice();
    const src = blocks[i];
    const clone = JSON.parse(JSON.stringify(src)) as Block;
    clone.id = randomId();
    copy.splice(i + 1, 0, clone);
    onChange(copy);
  }
  function add(type: BlockType) {
    onChange([...blocks, defaultBlock(type)]);
    setAdding(false);
  }

  return (
    <div className="space-y-3">
      {blocks.map((b, i) => (
        <BlockCard
          key={b.id}
          block={b}
          index={i}
          last={i === blocks.length - 1}
          onChange={(nb) => update(i, nb)}
          onMove={(d) => move(i, d)}
          onRemove={() => remove(i)}
          onDuplicate={() => duplicate(i)}
        />
      ))}

      {blocks.length === 0 && !adding && emptyTemplates && emptyTemplates.length > 0 && (
        <div className="border border-dashed border-ink/15 bg-surface p-5">
          <p className="text-xs uppercase tracking-widest text-muted mb-3">Start from a template</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {emptyTemplates.slice(0, 6).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => onChange(JSON.parse(JSON.stringify(t.blocks)))}
                className="text-left border border-ink/10 hover:border-accent hover:bg-surface-100 transition-colors p-3"
              >
                <p className="font-medium text-sm">{t.name}</p>
                <p className="text-[11px] text-muted leading-snug mt-0.5 line-clamp-2">{t.description}</p>
              </button>
            ))}
          </div>
          <p className="text-[10px] text-muted mt-3">…or build it block by block:</p>
        </div>
      )}
      {!adding && (
        <button
          onClick={() => setAdding(true)}
          className="w-full border-2 border-dashed border-ink/15 hover:border-accent hover:text-accent py-4 text-sm uppercase tracking-widest text-muted transition-colors"
        >
          + Add block
        </button>
      )}
      {adding && (
        <div className="border border-ink/15 bg-surface p-4">
          <p className="text-xs uppercase tracking-widest text-muted mb-3">Choose a block</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {blockTypes.map((t) => (
              <button
                key={t.type}
                onClick={() => add(t.type)}
                className="text-left px-3 py-2 border border-ink/10 hover:border-accent hover:bg-surface-100 transition-colors group"
              >
                <p className="text-sm font-medium group-hover:text-accent">{t.label}</p>
                <p className="text-[11px] text-muted leading-snug mt-0.5">{t.description}</p>
              </button>
            ))}
          </div>
          <button
            onClick={() => setAdding(false)}
            className="mt-3 text-xs text-muted hover:text-ink"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

// Short hint per block type — used in the card header to remind the editor
// what part of the public page each block produces.
const BLOCK_HINTS: Record<BlockType, string> = {
  hero: 'Top of the page · big headline + image',
  text: 'Paragraph section · headline + body',
  image: 'Single image · narrow/wide/full-bleed',
  gallery: 'Image grid · 2 / 3 / 4 columns',
  video: 'Responsive 16:9 video player',
  projects: 'Projects grid · pulls from /projects',
  services: 'Service list · pulls from Services',
  testimonials: 'Quotes · pulls from Testimonials',
  stats: 'Big numbers · 4 across',
  faq: 'Q & A list · also outputs FAQPage schema',
  contact: 'Inline contact form · writes to Inquiries',
  cta: 'Closing banner · headline + button',
  marquee: 'Auto-scrolling text strip',
  embed: 'Custom HTML · advanced',
  spacer: 'Empty vertical space',
};

function BlockCard({
  block,
  index,
  last,
  onChange,
  onMove,
  onRemove,
  onDuplicate,
}: {
  block: Block;
  index: number;
  last: boolean;
  onChange: (b: Block) => void;
  onMove: (d: -1 | 1) => void;
  onRemove: () => void;
  onDuplicate: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [styleOpen, setStyleOpen] = useState(false);

  return (
    <div className="border border-ink/15 bg-surface">
      <div className="flex items-center justify-between px-3 py-2 bg-surface-100 border-b border-ink/10 gap-2">
        <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-2 text-sm font-medium min-w-0 flex-1 text-left">
          <span className="text-muted text-xs shrink-0">{String(index + 1).padStart(2, '0')}</span>
          <span className={`shrink-0 ${open ? 'text-accent' : ''}`}>{open ? '▾' : '▸'}</span>
          <span className="uppercase tracking-wider text-xs shrink-0">{block.type}</span>
          <span className="text-[10px] text-muted truncate hidden sm:inline">— {BLOCK_HINTS[block.type]}</span>
        </button>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={onDuplicate} className="btn-ghost text-xs px-1.5 py-1" title="Duplicate">⎘</button>
          <button onClick={() => onMove(-1)} disabled={index === 0} className="btn-ghost text-xs px-1.5 py-1 disabled:opacity-30">↑</button>
          <button onClick={() => onMove(1)} disabled={last} className="btn-ghost text-xs px-1.5 py-1 disabled:opacity-30">↓</button>
          <button onClick={onRemove} className="btn-ghost text-xs px-1.5 py-1 hover:text-red-700">×</button>
        </div>
      </div>
      {open && (
        <div className="p-3 space-y-3">
          <p className="sm:hidden text-[10px] text-muted">{BLOCK_HINTS[block.type]}</p>
          <BlockEditor block={block} onChange={onChange} />
          <details
            open={styleOpen}
            onToggle={(e) => setStyleOpen((e.target as HTMLDetailsElement).open)}
            className="border-t border-ink/10 pt-3"
          >
            <summary className="cursor-pointer text-xs uppercase tracking-widest text-muted hover:text-ink select-none">
              Style overrides {block.style && Object.keys(block.style).length > 0 && <span className="text-accent">·</span>}
            </summary>
            <div className="mt-3">
              <StyleOverrideEditor
                value={block.style}
                onChange={(style) => onChange({ ...(block as Block), style } as Block)}
              />
            </div>
          </details>
        </div>
      )}
    </div>
  );
}

function StyleOverrideEditor({
  value,
  onChange,
}: {
  value: import('@roua/db').BlockStyle | undefined;
  onChange: (s: import('@roua/db').BlockStyle | undefined) => void;
}) {
  const s = value ?? {};
  function set<K extends keyof import('@roua/db').BlockStyle>(k: K, v: import('@roua/db').BlockStyle[K] | undefined) {
    const next = { ...s, [k]: v };
    // Strip undefined/empty so dirty checks and DB stay clean.
    for (const key of Object.keys(next) as (keyof import('@roua/db').BlockStyle)[]) {
      const val = next[key];
      if (val === undefined || val === '' || val === null) delete next[key];
    }
    onChange(Object.keys(next).length === 0 ? undefined : next);
  }
  return (
    <div className="grid grid-cols-2 gap-3">
      <label className="block col-span-2 md:col-span-1">
        <span className="label">Background color</span>
        <div className="flex gap-2 items-center">
          <input
            type="color"
            className="input h-9 w-14 p-1"
            value={s.background ?? '#000000'}
            onChange={(e) => set('background', e.target.value)}
          />
          <input
            className="input font-mono text-xs"
            placeholder="auto"
            value={s.background ?? ''}
            onChange={(e) => set('background', e.target.value || undefined)}
          />
        </div>
      </label>
      <label className="block col-span-2 md:col-span-1">
        <span className="label">Text color</span>
        <div className="flex gap-2 items-center">
          <input
            type="color"
            className="input h-9 w-14 p-1"
            value={s.textColor ?? '#ffffff'}
            onChange={(e) => set('textColor', e.target.value)}
          />
          <input
            className="input font-mono text-xs"
            placeholder="auto"
            value={s.textColor ?? ''}
            onChange={(e) => set('textColor', e.target.value || undefined)}
          />
        </div>
      </label>

      <label className="block">
        <span className="label">Heading scale ({(s.headingScale ?? 1).toFixed(2)}×)</span>
        <input
          type="range"
          min="0.5"
          max="2"
          step="0.05"
          value={s.headingScale ?? 1}
          onChange={(e) => set('headingScale', Number(e.target.value))}
          className="w-full"
        />
      </label>
      <label className="block">
        <span className="label">Body size (rem)</span>
        <input
          type="number"
          step="0.1"
          min="0.5"
          max="3"
          className="input"
          placeholder="auto"
          value={s.textScale ?? ''}
          onChange={(e) => set('textScale', e.target.value ? Number(e.target.value) : undefined)}
        />
      </label>
      <label className="block">
        <span className="label">Vertical padding ({(s.paddingY ?? 1).toFixed(2)}×)</span>
        <input
          type="range"
          min="0"
          max="2.5"
          step="0.05"
          value={s.paddingY ?? 1}
          onChange={(e) => set('paddingY', Number(e.target.value))}
          className="w-full"
        />
      </label>
      <label className="block">
        <span className="label">Horizontal padding</span>
        <select
          className="select"
          value={s.paddingX ?? ''}
          onChange={(e) => set('paddingX', (e.target.value || undefined) as import('@roua/db').BlockStyle['paddingX'])}
        >
          <option value="">Default</option>
          <option value="tight">Tight</option>
          <option value="normal">Normal</option>
          <option value="wide">Wide</option>
          <option value="edge">Edge-to-edge</option>
        </select>
      </label>
      <label className="block">
        <span className="label">Alignment</span>
        <select
          className="select"
          value={s.align ?? ''}
          onChange={(e) => set('align', (e.target.value || undefined) as import('@roua/db').BlockStyle['align'])}
        >
          <option value="">Default</option>
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </label>
      <label className="block">
        <span className="label">Max width</span>
        <select
          className="select"
          value={s.maxWidth ?? ''}
          onChange={(e) => set('maxWidth', (e.target.value || undefined) as import('@roua/db').BlockStyle['maxWidth'])}
        >
          <option value="">Default</option>
          <option value="narrow">Narrow</option>
          <option value="normal">Normal</option>
          <option value="wide">Wide</option>
          <option value="full">Full</option>
        </select>
      </label>
      <label className="block">
        <span className="label">Hide on</span>
        <select
          className="select"
          value={s.hideOn ?? ''}
          onChange={(e) => set('hideOn', (e.target.value || undefined) as import('@roua/db').BlockStyle['hideOn'])}
        >
          <option value="">Show everywhere</option>
          <option value="mobile">Hide on mobile</option>
          <option value="desktop">Hide on desktop</option>
        </select>
      </label>
      {Object.keys(s).length > 0 && (
        <button
          type="button"
          onClick={() => onChange(undefined)}
          className="col-span-2 text-xs text-muted hover:text-red-700 text-left mt-1"
        >
          Clear all overrides
        </button>
      )}
    </div>
  );
}

function BlockEditor({ block, onChange }: { block: Block; onChange: (b: Block) => void }) {
  switch (block.type) {
    case 'hero':
      return (
        <>
          <LocalizedField
            label="Eyebrow"
            value={block.eyebrow ?? { en: '', ar: '' }}
            onChange={(v) => onChange({ ...block, eyebrow: v })}
          />
          <LocalizedField
            label="Heading"
            value={block.heading}
            onChange={(v) => onChange({ ...block, heading: v })}
          />
          <LocalizedField
            label="Subheading"
            value={block.subheading ?? { en: '', ar: '' }}
            multiline
            onChange={(v) => onChange({ ...block, subheading: v })}
          />
          <div className="block">
            <span className="label">Background image</span>
            <MediaPicker
              value={block.image ?? ''}
              onChange={(url) => onChange({ ...block, image: url })}
              aspect="video"
            />
          </div>
          <label className="block">
            <span className="label">Variant</span>
            <select
              className="select"
              value={block.variant ?? 'fullscreen'}
              onChange={(e) => onChange({ ...block, variant: e.target.value as 'fullscreen' | 'split' | 'minimal' })}
            >
              <option value="fullscreen">Fullscreen</option>
              <option value="split">Split</option>
              <option value="minimal">Minimal</option>
            </select>
          </label>
          <CtaEditor
            cta={block.cta}
            onChange={(cta) => onChange({ ...block, cta })}
          />
        </>
      );

    case 'text':
      return (
        <>
          <LocalizedField
            label="Heading"
            value={block.heading ?? { en: '', ar: '' }}
            onChange={(v) => onChange({ ...block, heading: v })}
          />
          <LocalizedField
            label="Content"
            value={block.content}
            multiline
            rows={6}
            onChange={(v) => onChange({ ...block, content: v })}
          />
          <label className="block">
            <span className="label">Align</span>
            <select
              className="select"
              value={block.align ?? 'left'}
              onChange={(e) => onChange({ ...block, align: e.target.value as 'left' | 'center' })}
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
            </select>
          </label>
        </>
      );

    case 'image':
      return (
        <>
          <div className="block">
            <span className="label">Image</span>
            <MediaPicker
              value={block.src}
              onChange={(url) => onChange({ ...block, src: url })}
              aspect="video"
            />
          </div>
          <LocalizedField label="Alt text" value={block.alt} onChange={(v) => onChange({ ...block, alt: v })} />
          <LocalizedField
            label="Caption"
            value={block.caption ?? { en: '', ar: '' }}
            onChange={(v) => onChange({ ...block, caption: v })}
          />
          <label className="block">
            <span className="label">Width</span>
            <select
              className="select"
              value={block.width ?? 'wide'}
              onChange={(e) => onChange({ ...block, width: e.target.value as 'narrow' | 'wide' | 'full' })}
            >
              <option value="narrow">Narrow</option>
              <option value="wide">Wide</option>
              <option value="full">Full bleed</option>
            </select>
          </label>
        </>
      );

    case 'projects':
      return (
        <>
          <LocalizedField
            label="Heading"
            value={block.heading ?? { en: '', ar: '' }}
            onChange={(v) => onChange({ ...block, heading: v })}
          />
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="label">Limit</span>
              <input
                type="number"
                className="input"
                value={block.limit ?? 6}
                onChange={(e) => onChange({ ...block, limit: Number(e.target.value) || undefined })}
              />
            </label>
            <label className="block">
              <span className="label">Category filter</span>
              <input
                className="input"
                value={block.category ?? ''}
                onChange={(e) => onChange({ ...block, category: e.target.value || undefined })}
              />
            </label>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={block.featuredOnly ?? false}
              onChange={(e) => onChange({ ...block, featuredOnly: e.target.checked })}
            />
            <span className="text-sm">Featured projects only</span>
          </label>
        </>
      );

    case 'services':
      return (
        <LocalizedField
          label="Heading"
          value={block.heading ?? { en: '', ar: '' }}
          onChange={(v) => onChange({ ...block, heading: v })}
        />
      );

    case 'faq':
      return (
        <>
          <LocalizedField
            label="Heading"
            value={block.heading ?? { en: '', ar: '' }}
            onChange={(v) => onChange({ ...block, heading: v })}
          />
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="label mb-0">Q&A items</span>
              <button
                onClick={() => onChange({ ...block, items: [...block.items, { q: { en: '', ar: '' }, a: { en: '', ar: '' } }] })}
                className="btn-ghost text-xs"
              >
                + Add
              </button>
            </div>
            {block.items.map((it, i) => (
              <div key={i} className="border border-ink/10 p-3 mb-2 space-y-2">
                <div className="flex justify-end">
                  <button
                    onClick={() => onChange({ ...block, items: block.items.filter((_, x) => x !== i) })}
                    className="text-xs text-muted hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
                <LocalizedField
                  label={`Question ${i + 1}`}
                  value={it.q}
                  onChange={(v) =>
                    onChange({ ...block, items: block.items.map((x, j) => (j === i ? { ...x, q: v } : x)) })
                  }
                />
                <LocalizedField
                  label="Answer"
                  value={it.a}
                  multiline
                  rows={3}
                  onChange={(v) =>
                    onChange({ ...block, items: block.items.map((x, j) => (j === i ? { ...x, a: v } : x)) })
                  }
                />
              </div>
            ))}
          </div>
        </>
      );

    case 'cta':
      return (
        <>
          <LocalizedField label="Heading" value={block.heading} onChange={(v) => onChange({ ...block, heading: v })} />
          <LocalizedField
            label="Subheading"
            value={block.subheading ?? { en: '', ar: '' }}
            multiline
            onChange={(v) => onChange({ ...block, subheading: v })}
          />
          <CtaEditor cta={block.button} onChange={(b) => b && onChange({ ...block, button: b })} required />
        </>
      );

    case 'marquee':
      return (
        <LocalizedField
          label="Words (separated by ·)"
          value={block.words}
          onChange={(v) => onChange({ ...block, words: v })}
        />
      );

    case 'spacer':
      return (
        <label className="block">
          <span className="label">Size</span>
          <select
            className="select"
            value={block.size}
            onChange={(e) => onChange({ ...block, size: e.target.value as 'sm' | 'md' | 'lg' | 'xl' })}
          >
            <option value="sm">Small</option>
            <option value="md">Medium</option>
            <option value="lg">Large</option>
            <option value="xl">XL</option>
          </select>
        </label>
      );

    case 'gallery':
      return (
        <>
          <LocalizedField
            label="Heading"
            value={block.heading ?? { en: '', ar: '' }}
            onChange={(v) => onChange({ ...block, heading: v })}
          />
          <label className="block">
            <span className="label">Columns</span>
            <select
              className="select"
              value={block.columns ?? 3}
              onChange={(e) => onChange({ ...block, columns: Number(e.target.value) as 2 | 3 | 4 })}
            >
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={4}>4</option>
            </select>
          </label>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="label mb-0">Images</span>
              <button
                onClick={() => onChange({ ...block, images: [...block.images, { src: '', alt: { en: '', ar: '' } }] })}
                className="btn-ghost text-xs"
              >
                + Add
              </button>
            </div>
            {block.images.map((img, i) => (
              <div key={i} className="border border-ink/10 p-3 mb-2 space-y-2">
                <div className="flex justify-end">
                  <button
                    onClick={() => onChange({ ...block, images: block.images.filter((_, x) => x !== i) })}
                    className="text-xs text-muted hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
                <div className="block">
                  <span className="label">Image</span>
                  <MediaPicker
                    value={img.src}
                    onChange={(url) =>
                      onChange({
                        ...block,
                        images: block.images.map((x, j) => (j === i ? { ...x, src: url } : x)),
                      })
                    }
                  />
                </div>
                <LocalizedField
                  label="Alt"
                  value={img.alt}
                  onChange={(v) =>
                    onChange({
                      ...block,
                      images: block.images.map((x, j) => (j === i ? { ...x, alt: v } : x)),
                    })
                  }
                />
              </div>
            ))}
          </div>
        </>
      );

    case 'contact':
      return (
        <LocalizedField
          label="Heading"
          value={block.heading ?? { en: '', ar: '' }}
          onChange={(v) => onChange({ ...block, heading: v })}
        />
      );

    case 'testimonials':
      return (
        <>
          <LocalizedField
            label="Heading"
            value={block.heading ?? { en: '', ar: '' }}
            onChange={(v) => onChange({ ...block, heading: v })}
          />
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="label">Variant</span>
              <select
                className="select"
                value={block.variant ?? 'cards'}
                onChange={(e) => onChange({ ...block, variant: e.target.value as 'cards' | 'quote-stack' })}
              >
                <option value="cards">Cards grid</option>
                <option value="quote-stack">Quote stack</option>
              </select>
            </label>
            <label className="block">
              <span className="label">Limit</span>
              <input
                type="number"
                className="input"
                value={block.limit ?? 6}
                onChange={(e) => onChange({ ...block, limit: Number(e.target.value) || undefined })}
              />
            </label>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={block.featuredOnly ?? false}
              onChange={(e) => onChange({ ...block, featuredOnly: e.target.checked })}
            />
            <span className="text-sm">Featured testimonials only</span>
          </label>
          <p className="text-[10px] text-muted">Manage entries in the Testimonials page.</p>
        </>
      );

    case 'stats':
      return (
        <>
          <LocalizedField
            label="Heading"
            value={block.heading ?? { en: '', ar: '' }}
            onChange={(v) => onChange({ ...block, heading: v })}
          />
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="label mb-0">Items</span>
              <button
                onClick={() => onChange({ ...block, items: [...block.items, { value: '', label: { en: '', ar: '' } }] })}
                className="btn-ghost text-xs"
              >
                + Add
              </button>
            </div>
            {block.items.map((it, i) => (
              <div key={i} className="border border-ink/10 p-3 mb-2 space-y-2">
                <div className="flex items-start gap-2">
                  <label className="block w-32 shrink-0">
                    <span className="label">Value</span>
                    <input
                      className="input font-display text-lg"
                      placeholder="120+"
                      value={it.value}
                      onChange={(e) =>
                        onChange({ ...block, items: block.items.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)) })
                      }
                    />
                  </label>
                  <div className="flex-1">
                    <LocalizedField
                      label="Label"
                      value={it.label}
                      onChange={(v) =>
                        onChange({ ...block, items: block.items.map((x, j) => (j === i ? { ...x, label: v } : x)) })
                      }
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => onChange({ ...block, items: block.items.filter((_, x) => x !== i) })}
                    className="text-xs text-muted hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      );

    case 'video':
      return (
        <>
          <label className="block">
            <span className="label">Video URL (YouTube / Vimeo / .mp4)</span>
            <input
              className="input font-mono text-xs"
              value={block.url}
              onChange={(e) => onChange({ ...block, url: e.target.value })}
            />
          </label>
          <label className="block">
            <span className="label">Poster image URL (for .mp4)</span>
            <input
              className="input font-mono text-xs"
              value={block.poster ?? ''}
              onChange={(e) => onChange({ ...block, poster: e.target.value })}
            />
          </label>
          <LocalizedField
            label="Caption"
            value={block.caption ?? { en: '', ar: '' }}
            onChange={(v) => onChange({ ...block, caption: v })}
          />
        </>
      );

    case 'embed':
      return (
        <>
          <label className="block">
            <span className="label">Raw HTML</span>
            <textarea
              rows={8}
              className="textarea"
              placeholder='<iframe src="…" />'
              value={block.html}
              onChange={(e) => onChange({ ...block, html: e.target.value })}
            />
            <p className="text-[10px] text-muted mt-1">Renders verbatim. Don&apos;t paste untrusted markup.</p>
          </label>
          <LocalizedField
            label="Caption"
            value={block.caption ?? { en: '', ar: '' }}
            onChange={(v) => onChange({ ...block, caption: v })}
          />
        </>
      );

    default:
      return <p className="text-sm text-muted">No editor for this block type.</p>;
  }
}

function LocalizedField({
  label,
  value,
  onChange,
  multiline,
  rows = 2,
}: {
  label: string;
  value: Record<string, string>;
  onChange: (v: Record<Locale, string>) => void;
  multiline?: boolean;
  rows?: number;
}) {
  return (
    <div>
      <span className="label">{label}</span>
      <div className="space-y-1.5">
        {LOCALES.map((loc) => (
          <div key={loc} className="flex gap-2 items-start">
            <span className="text-[10px] uppercase tracking-widest text-muted pt-2 w-6 shrink-0">
              {loc}
            </span>
            {multiline ? (
              <textarea
                rows={rows}
                className="textarea flex-1"
                value={value[loc] ?? ''}
                onChange={(e) => onChange({ ...(value as Record<Locale, string>), [loc]: e.target.value })}
              />
            ) : (
              <input
                className="input flex-1"
                value={value[loc] ?? ''}
                onChange={(e) => onChange({ ...(value as Record<Locale, string>), [loc]: e.target.value })}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function CtaEditor({
  cta,
  onChange,
  required,
}: {
  cta: { label: Record<string, string>; href: string } | undefined;
  onChange: (v: { label: Record<Locale, string>; href: string } | undefined) => void;
  required?: boolean;
}) {
  if (!cta && !required) {
    return (
      <button
        type="button"
        onClick={() => onChange({ label: { en: '', ar: '' }, href: '' })}
        className="btn-ghost text-xs"
      >
        + Add call to action
      </button>
    );
  }
  const c = cta ?? { label: { en: '', ar: '' }, href: '' };
  return (
    <div className="border-l-2 border-accent pl-3 space-y-3">
      <LocalizedField
        label="Button label"
        value={c.label}
        onChange={(v) => onChange({ ...c, label: v })}
      />
      <label className="block">
        <span className="label">Link (e.g. /contact)</span>
        <input
          className="input font-mono"
          value={c.href}
          onChange={(e) => onChange({ ...c, href: e.target.value })}
        />
      </label>
      {!required && (
        <button onClick={() => onChange(undefined)} className="text-xs text-muted hover:text-red-700">
          Remove CTA
        </button>
      )}
    </div>
  );
}

function defaultBlock(type: BlockType): Block {
  const id = randomId();
  const emptyLoc = { en: '', ar: '' };
  switch (type) {
    case 'hero':
      return { id, type, heading: emptyLoc, variant: 'fullscreen' };
    case 'text':
      return { id, type, content: emptyLoc };
    case 'image':
      return { id, type, src: '', alt: emptyLoc };
    case 'gallery':
      return { id, type, images: [], columns: 3 };
    case 'projects':
      return { id, type, limit: 6 };
    case 'services':
      return { id, type };
    case 'faq':
      return { id, type, items: [] };
    case 'contact':
      return { id, type };
    case 'cta':
      return { id, type, heading: emptyLoc, button: { label: emptyLoc, href: '/contact' } };
    case 'marquee':
      return { id, type, words: emptyLoc };
    case 'spacer':
      return { id, type, size: 'md' };
    case 'testimonials':
      return { id, type, variant: 'cards', limit: 6 };
    case 'stats':
      return { id, type, items: [] };
    case 'video':
      return { id, type, url: '' };
    case 'embed':
      return { id, type, html: '' };
  }
}
