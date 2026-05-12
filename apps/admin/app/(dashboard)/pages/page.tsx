import Link from 'next/link';
import { prisma } from '@roua/db';
import { PagesList } from '@/components/PagesList';

export const dynamic = 'force-dynamic';

export default async function PagesIndex() {
  const pages = await prisma.page.findMany({ orderBy: [{ isHome: 'desc' }, { navOrder: 'asc' }] });

  return (
    <div className="p-8 md:p-12 max-w-6xl">
      <div className="flex items-center justify-between mb-10">
        <div>
          <p className="text-xs uppercase tracking-widest text-accent mb-2">Content</p>
          <h1 className="font-display text-5xl">Pages</h1>
        </div>
        <Link href="/pages/new" className="btn-accent">+ New page</Link>
      </div>

      <PagesList
        initial={pages.map((p) => ({
          id: p.id,
          slugEn: p.slugEn,
          slugAr: p.slugAr,
          title: (p.i18n as Record<string, { title: string }>).en?.title ?? '',
          status: p.status,
          isHome: p.isHome,
          updatedAt: p.updatedAt.toISOString(),
        }))}
      />
    </div>
  );
}
