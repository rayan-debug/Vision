import type { Block } from '@roua/db';

// Miniature visual representation of a block list — used on the templates
// list and anywhere we want a glanceable preview of a layout. Each block
// type renders as a small stylised silhouette so admins can recognise the
// shape at a thumbnail size (~200px wide) without reading.
export function BlockThumbnail({
  blocks,
  maxBlocks = 8,
  compact = false,
}: {
  blocks: Block[];
  maxBlocks?: number;
  compact?: boolean;
}) {
  const visible = blocks.slice(0, maxBlocks);
  const more = blocks.length - visible.length;
  return (
    <div
      className={`bg-ink text-bone overflow-hidden flex flex-col ${compact ? 'gap-0.5 p-1.5' : 'gap-1 p-2'}`}
      style={{ minHeight: compact ? 84 : 120 }}
    >
      {visible.map((b, i) => (
        <BlockSilhouette key={i} block={b} compact={compact} />
      ))}
      {more > 0 && (
        <div className={`text-bone/40 ${compact ? 'text-[6px]' : 'text-[8px]'} text-center uppercase tracking-widest mt-0.5`}>
          +{more} more
        </div>
      )}
    </div>
  );
}

function BlockSilhouette({ block, compact }: { block: Block; compact: boolean }) {
  const accent = 'bg-accent';
  const bone = 'bg-bone/15';
  const boneStrong = 'bg-bone/40';
  const r = compact ? 'rounded-[1px]' : 'rounded-sm';
  // Height units that read well at thumbnail scale.
  const hSmall = compact ? 'h-1' : 'h-1.5';
  const hMed = compact ? 'h-2' : 'h-3';
  const hLarge = compact ? 'h-3' : 'h-5';
  const hXl = compact ? 'h-5' : 'h-8';

  switch (block.type) {
    case 'hero':
      return (
        <div className={`${hXl} ${bone} ${r} flex flex-col items-center justify-center gap-0.5`}>
          <div className={`${hSmall} w-2/3 ${boneStrong} ${r}`} />
          <div className={`${hSmall} w-1/3 ${boneStrong} ${r}`} />
          {block.cta && <div className={`${hSmall} w-1/4 ${accent} ${r} mt-0.5`} />}
        </div>
      );
    case 'text':
      return (
        <div className={`${hLarge} flex flex-col gap-0.5 ${compact ? 'px-1' : 'px-2'}`}>
          {block.heading?.en && <div className={`${hSmall} w-1/3 ${boneStrong} ${r}`} />}
          <div className={`${hSmall} w-full ${bone} ${r}`} />
          <div className={`${hSmall} w-5/6 ${bone} ${r}`} />
          <div className={`${hSmall} w-2/3 ${bone} ${r}`} />
        </div>
      );
    case 'image':
      return <div className={`${hLarge} ${bone} ${r} flex items-center justify-center text-bone/30 text-[10px]`}>▭</div>;
    case 'gallery':
      return (
        <div className={`${hMed} grid gap-0.5 ${r}`} style={{ gridTemplateColumns: `repeat(${block.columns ?? 3}, 1fr)` }}>
          {Array.from({ length: block.columns ?? 3 }).map((_, i) => (
            <div key={i} className={`${bone} ${r}`} />
          ))}
        </div>
      );
    case 'video':
      return (
        <div className={`${hLarge} ${bone} ${r} flex items-center justify-center text-bone/30`}>
          <span className={compact ? 'text-[6px]' : 'text-[10px]'}>▶</span>
        </div>
      );
    case 'projects':
      return (
        <div className={`${hMed} grid grid-cols-2 gap-0.5`}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={`${bone} ${r}`} />
          ))}
        </div>
      );
    case 'services':
      return (
        <div className={`${hMed} grid grid-cols-4 gap-0.5`}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={`${bone} ${r} flex items-center justify-center text-bone/30`}>
              <span className={compact ? 'text-[6px]' : 'text-[8px]'}>◐</span>
            </div>
          ))}
        </div>
      );
    case 'testimonials':
      if (block.variant === 'quote-stack') {
        return (
          <div className={`${hMed} flex items-center justify-center text-bone/30`}>
            <span className={compact ? 'text-[6px]' : 'text-[10px]'}>&ldquo;quotes&rdquo;</span>
          </div>
        );
      }
      return (
        <div className={`${hMed} grid grid-cols-3 gap-0.5`}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={`${bone} ${r}`} />
          ))}
        </div>
      );
    case 'stats':
      return (
        <div className={`${hMed} grid gap-0.5`} style={{ gridTemplateColumns: `repeat(${Math.min(block.items.length || 3, 4)}, 1fr)` }}>
          {Array.from({ length: Math.min(block.items.length || 3, 4) }).map((_, i) => (
            <div key={i} className={`${bone} ${r} flex items-center justify-center`}>
              <span className={`${boneStrong} ${r} ${hSmall} w-2/3`} />
            </div>
          ))}
        </div>
      );
    case 'faq':
      return (
        <div className={`flex flex-col gap-0.5 ${compact ? 'px-1' : 'px-2'}`}>
          {Array.from({ length: Math.min(block.items?.length || 3, 4) }).map((_, i) => (
            <div key={i} className={`${hSmall} w-full ${bone} ${r}`} />
          ))}
        </div>
      );
    case 'contact':
      return (
        <div className={`${hLarge} flex flex-col gap-0.5 ${compact ? 'px-1' : 'px-2'}`}>
          <div className={`${hSmall} w-full ${bone} ${r}`} />
          <div className={`${hSmall} w-full ${bone} ${r}`} />
          <div className={`${hSmall} w-1/3 ${accent} ${r}`} />
        </div>
      );
    case 'cta':
      return (
        <div className={`${hLarge} border ${compact ? 'border' : 'border-2'} border-bone/20 ${r} flex items-center justify-center gap-1`}>
          <div className={`${hSmall} w-1/3 ${boneStrong} ${r}`} />
          <div className={`${hSmall} w-1/6 ${accent} ${r}`} />
        </div>
      );
    case 'marquee':
      return <div className={`${hSmall} ${accent} opacity-60 ${r}`} />;
    case 'embed':
      return <div className={`${hLarge} ${bone} ${r} flex items-center justify-center text-bone/30 text-[8px]`}>{compact ? '◇' : '&lt;embed&gt;'}</div>;
    case 'spacer':
      return <div className={compact ? 'h-1' : 'h-2'} />;
    default:
      return <div className={`${hSmall} ${bone} ${r}`} />;
  }
}
