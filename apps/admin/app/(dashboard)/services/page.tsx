import { prisma } from '@roua/db';
import { ServicesEditor } from '@/components/ServicesEditor';

export default async function ServicesPage() {
  const services = await prisma.service.findMany({ orderBy: { order: 'asc' } });
  return (
    <div className="p-8 md:p-12 max-w-4xl">
      <p className="text-xs uppercase tracking-widest text-accent mb-2">Content</p>
      <h1 className="font-display text-5xl mb-2">Services</h1>
      <p className="text-muted mb-10">
        The four disciplines shown on the services block. Add, edit, reorder, delete.
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
