'use client';
import { useState } from 'react';
import { randomId } from '@/lib/id';
import { LOCALES, type Block, type BlockType, type Locale } from '@roua/db';

type Props = {
  blocks: Block[];
  onChange: (blocks: Block[]) => void;
  blockTypes: { type: BlockType; label: string }[];
};

export function BlockList({ blocks, onChange, blockTypes }: Props) {
  const [adding, setAdding] = useState(false);

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
        />
      ))}

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
          <div className="grid grid-cols-2 gap-2">
            {blockTypes.map((t) => (
              <button
                key={t.type}
                onClick={() => add(t.type)}
                className="text-left px-3 py-2 text-sm border border-ink/10 hover:border-accent hover:bg-surface-100 transition-colors"
              >
                {t.label}
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

function BlockCard({
  block,
  index,
  last,
  onChange,
  onMove,
  onRemove,
}: {
  block: Block;
  index: number;
  last: boolean;
  onChange: (b: Block) => void;
  onMove: (d: -1 | 1) => void;
  onRemove: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-ink/15 bg-surface">
      <div className="flex items-center justify-between px-3 py-2 bg-surface-100 border-b border-ink/10">
        <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-2 text-sm font-medium">
          <span className="text-muted text-xs">{String(index + 1).padStart(2, '0')}</span>
          <span className={open ? 'text-accent' : ''}>{open ? '▾' : '▸'}</span>
          <span className="uppercase tracking-wider text-xs">{block.type}</span>
        </button>
        <div className="flex items-center gap-1">
          <button onClick={() => onMove(-1)} disabled={index === 0} className="btn-ghost text-xs px-1.5 py-1 disabled:opacity-30">↑</button>
          <button onClick={() => onMove(1)} disabled={last} className="btn-ghost text-xs px-1.5 py-1 disabled:opacity-30">↓</button>
          <button onClick={onRemove} className="btn-ghost text-xs px-1.5 py-1 hover:text-red-700">×</button>
        </div>
      </div>
      {open && (
        <div className="p-3 space-y-3">
          <BlockEditor block={block} onChange={onChange} />
        </div>
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
            value={block.eyebrow ?? { en: '', fr: '' }}
            onChange={(v) => onChange({ ...block, eyebrow: v })}
          />
          <LocalizedField
            label="Heading"
            value={block.heading}
            onChange={(v) => onChange({ ...block, heading: v })}
          />
          <LocalizedField
            label="Subheading"
            value={block.subheading ?? { en: '', fr: '' }}
            multiline
            onChange={(v) => onChange({ ...block, subheading: v })}
          />
          <label className="block">
            <span className="label">Background image URL</span>
            <input
              className="input"
              value={block.image ?? ''}
              onChange={(e) => onChange({ ...block, image: e.target.value })}
            />
          </label>
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
            value={block.heading ?? { en: '', fr: '' }}
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
          <label className="block">
            <span className="label">Image URL</span>
            <input className="input" value={block.src} onChange={(e) => onChange({ ...block, src: e.target.value })} />
          </label>
          <LocalizedField label="Alt text" value={block.alt} onChange={(v) => onChange({ ...block, alt: v })} />
          <LocalizedField
            label="Caption"
            value={block.caption ?? { en: '', fr: '' }}
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
            value={block.heading ?? { en: '', fr: '' }}
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
          value={block.heading ?? { en: '', fr: '' }}
          onChange={(v) => onChange({ ...block, heading: v })}
        />
      );

    case 'faq':
      return (
        <>
          <LocalizedField
            label="Heading"
            value={block.heading ?? { en: '', fr: '' }}
            onChange={(v) => onChange({ ...block, heading: v })}
          />
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="label mb-0">Q&A items</span>
              <button
                onClick={() => onChange({ ...block, items: [...block.items, { q: { en: '', fr: '' }, a: { en: '', fr: '' } }] })}
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
            value={block.subheading ?? { en: '', fr: '' }}
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
            value={block.heading ?? { en: '', fr: '' }}
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
                onClick={() => onChange({ ...block, images: [...block.images, { src: '', alt: { en: '', fr: '' } }] })}
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
                <label className="block">
                  <span className="label">Image URL</span>
                  <input
                    className="input"
                    value={img.src}
                    onChange={(e) =>
                      onChange({
                        ...block,
                        images: block.images.map((x, j) => (j === i ? { ...x, src: e.target.value } : x)),
                      })
                    }
                  />
                </label>
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
          value={block.heading ?? { en: '', fr: '' }}
          onChange={(v) => onChange({ ...block, heading: v })}
        />
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
        onClick={() => onChange({ label: { en: '', fr: '' }, href: '' })}
        className="btn-ghost text-xs"
      >
        + Add call to action
      </button>
    );
  }
  const c = cta ?? { label: { en: '', fr: '' }, href: '' };
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
  const emptyLoc = { en: '', fr: '' };
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
  }
}
