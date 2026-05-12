import type { VideoBlock, Locale } from '@roua/db';
import { t } from '@roua/db';

function toEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtube.com')) {
      const id = u.searchParams.get('v');
      if (id) return `https://www.youtube-nocookie.com/embed/${id}`;
    }
    if (u.hostname === 'youtu.be') {
      const id = u.pathname.slice(1);
      if (id) return `https://www.youtube-nocookie.com/embed/${id}`;
    }
    if (u.hostname.includes('vimeo.com')) {
      const id = u.pathname.split('/').filter(Boolean).pop();
      if (id) return `https://player.vimeo.com/video/${id}`;
    }
  } catch {
    /* fall through */
  }
  return null;
}

export function Video({ block, locale }: { block: VideoBlock; locale: Locale }) {
  if (!block.url) return null;
  const embed = toEmbedUrl(block.url);
  const caption = block.caption ? t(block.caption, locale) : '';
  const isFile = /\.(mp4|webm|ogg)$/i.test(block.url);

  return (
    <section className="px-6 md:px-10 py-12 md:py-20" data-reveal>
      <div className="aspect-video w-full bg-ink-50 border border-bone/10 overflow-hidden">
        {embed ? (
          <iframe
            src={embed}
            title={caption || 'Video'}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : isFile ? (
          <video
            src={block.url}
            poster={block.poster}
            controls
            className="w-full h-full object-cover"
          />
        ) : (
          <iframe src={block.url} className="w-full h-full" title={caption || 'Video'} />
        )}
      </div>
      {caption && (
        <p className="mt-3 text-xs uppercase tracking-widest text-bone/50">{caption}</p>
      )}
    </section>
  );
}
