import Link from 'next/link';
import { prisma } from '@roua/db';
import { PagesList } from '@/components/PagesList';

export const dynamic = 'force-dynamic';

export default async function PagesIndex() {
  const pages = await prisma.page.findMany({ orderBy: [{ isHome: 'desc' }, { navOrder: 'asc' }] });

  return (
    <div className="p-4 md:p-8 lg:p-12 max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-accent mb-2">Content</p>
          <h1 className="font-display text-3xl md:text-5xl">Pages</h1>
        </div>
        <Link href="/pages/new" className="btn-accent">+ New page</Link>
      </div>
      <p className="text-sm text-muted mb-8 md:mb-10 max-w-2xl">
        Pages are the URLs on your public site (<code className="text-xs">/about</code>, <code className="text-xs">/services</code>, etc). Each is built from blocks. ★ marks the home page. Hidden pages don&apos;t appear in the header nav.
      </p>

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
