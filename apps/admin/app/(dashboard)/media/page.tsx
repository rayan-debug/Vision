import { prisma } from '@roua/db';
import { MediaLibrary } from '@/components/MediaLibrary';

export default async function MediaPage() {
  const media = await prisma.media.findMany({
    where: { url: { not: 'contact-message' } },
    orderBy: { createdAt: 'desc' },
  });
  return (
    <div className="p-4 md:p-8 lg:p-12 max-w-6xl">
      <p className="text-xs uppercase tracking-widest text-accent mb-2">Library</p>
      <h1 className="font-display text-3xl md:text-5xl mb-2">Media</h1>
      <p className="text-muted mb-8 md:mb-10 max-w-2xl">
        Your image library. Every image picker on the site (logo, favicon, OG image, hero, image blocks, gallery, project covers, testimonial avatars) reads from here. Upload once, reuse anywhere.
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
