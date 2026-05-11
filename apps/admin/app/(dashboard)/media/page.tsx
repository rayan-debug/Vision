import { prisma } from '@roua/db';
import { MediaLibrary } from '@/components/MediaLibrary';

export default async function MediaPage() {
  const media = await prisma.media.findMany({
    where: { url: { not: 'contact-message' } },
    orderBy: { createdAt: 'desc' },
  });
  return (
    <div className="p-8 md:p-12 max-w-6xl">
      <p className="text-xs uppercase tracking-widest text-accent mb-2">Library</p>
      <h1 className="font-display text-5xl mb-2">Media</h1>
      <p className="text-muted mb-10">
        Upload images here, then copy their URLs into block fields or project images.
      </p>
      <MediaLibrary
        initial={media.map((m) => ({
          id: m.id,
          url: m.url,
          filename: m.filename,
          mimeType: m.mimeType,
          size: m.size,
          alt: m.alt,
          createdAt: m.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
