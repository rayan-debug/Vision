import { prisma } from '@roua/db';
import { ServicesEditor } from '@/components/ServicesEditor';

export default async function ServicesPage() {
  const services = await prisma.service.findMany({ orderBy: { order: 'asc' } });
  return (
    <div className="p-4 md:p-8 lg:p-12 max-w-4xl">
      <p className="text-xs uppercase tracking-widest text-accent mb-2">Content</p>
      <h1 className="font-display text-3xl md:text-5xl mb-2">Services</h1>
      <p className="text-muted mb-8 md:mb-10 max-w-2xl">
        What you offer. Appears in any page that uses the <strong>Services</strong> block (the home page by default, plus the Services page). The first locale is the fallback when a translation is empty.
      </p>
      <ServicesEditor
        services={services.map((s) => ({
          id: s.id,
          icon: s.icon,
          order: s.order,
          i18n: s.i18n as Record<string, { title: string; description: string }>,
        }))}
      />
    </div>
  );
}
