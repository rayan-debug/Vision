import { prisma } from '@roua/db';
import { TestimonialsEditor } from '@/components/TestimonialsEditor';

export const dynamic = 'force-dynamic';

export default async function TestimonialsIndex() {
  const items = await prisma.testimonial.findMany({ orderBy: [{ order: 'asc' }, { createdAt: 'desc' }] });

  return (
    <div className="p-8 md:p-12 max-w-5xl">
      <div className="mb-10">
        <p className="text-xs uppercase tracking-widest text-accent mb-2">Content</p>
        <h1 className="font-display text-5xl">Testimonials</h1>
        <p className="text-muted mt-2">Quotes from clients. Use the Testimonials block on any page to display them.</p>
      </div>
      <TestimonialsEditor
        initial={items.map((t) => ({
          id: t.id,
          i18n: t.i18n as Record<string, { quote: string; name: string; role: string }>,
          avatarUrl: t.avatarUrl,
          rating: t.rating,
          order: t.order,
          featured: t.featured,
        }))}
      />
    </div>
  );
}
