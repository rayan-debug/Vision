import Link from 'next/link';
import { prisma } from '@roua/db';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  const [
    pageCount,
    projectCount,
    draftCount,
    testimonialCount,
    newInquiries,
    recentPages,
    recentProjects,
    recentInquiries,
  ] = await Promise.all([
    prisma.page.count(),
    prisma.project.count(),
    prisma.page.count({ where: { status: 'DRAFT' } }),
    prisma.testimonial.count().catch(() => 0),
    prisma.inquiry.count({ where: { status: 'NEW' } }).catch(() => 0),
    prisma.page.findMany({ orderBy: { updatedAt: 'desc' }, take: 5 }),
    prisma.project.findMany({ orderBy: { updatedAt: 'desc' }, take: 5 }),
    prisma.inquiry.findMany({ orderBy: { createdAt: 'desc' }, take: 4 }).catch(() => []),
  ]);

  const stats = [
    { label: 'Pages', value: pageCount, href: '/pages' },
    { label: 'Projects', value: projectCount, href: '/projects' },
    { label: 'Testimonials', value: testimonialCount, href: '/testimonials' },
    { label: 'Drafts', value: draftCount, href: '/pages' },
    { label: 'New inquiries', value: newInquiries, href: '/inquiries', highlight: newInquiries > 0 },
  ];

  return (
    <div className="p-8 md:p-12 max-w-6xl">
      <div className="mb-12">
        <p className="text-xs uppercase tracking-widest text-accent mb-3">Studio</p>
        <h1 className="font-display text-5xl">Welcome back.</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-12">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className={`card hover:border-accent transition-colors ${s.highlight ? 'border-accent' : ''}`}
          >
            <p className="text-xs uppercase tracking-widest text-muted">{s.label}</p>
            <p className={`font-display text-4xl mt-2 ${s.highlight ? 'text-accent' : ''}`}>{s.value}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-2xl">Recent pages</h2>
            <Link href="/pages/new" className="btn-outline text-xs">+ New</Link>
          </div>
          <div className="border border-ink/10 divide-y divide-ink/10">
            {recentPages.map((p) => {
              const meta = (p.i18n as Record<string, { title: string }>).en;
              return (
                <Link
                  key={p.id}
                  href={`/pages/${p.id}`}
                  className="flex items-center justify-between px-4 py-3 hover:bg-surface-100 transition-colors"
                >
                  <div>
                    <p className="font-medium">{meta?.title ?? p.slugEn}</p>
                    <p className="text-xs text-muted">/{p.slugEn}</p>
                  </div>
                  <span className={p.status === 'PUBLISHED' ? 'tag border-accent text-accent' : 'tag'}>
                    {p.status}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-2xl">Recent projects</h2>
            <Link href="/projects/new" className="btn-outline text-xs">+ New</Link>
          </div>
          <div className="border border-ink/10 divide-y divide-ink/10">
            {recentProjects.map((p) => {
              const meta = (p.i18n as Record<string, { title: string }>).en;
              return (
                <Link
                  key={p.id}
                  href={`/projects/${p.id}`}
                  className="flex items-center justify-between px-4 py-3 hover:bg-surface-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {p.coverImage && <img src={p.coverImage} alt="" className="w-10 h-10 object-cover" />}
                    <div>
                      <p className="font-medium">{meta?.title ?? p.slugEn}</p>
                      <p className="text-xs text-muted">{p.category} · {p.year}</p>
                    </div>
                  </div>
                  <span className={p.status === 'PUBLISHED' ? 'tag border-accent text-accent' : 'tag'}>
                    {p.status}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      </div>

      {recentInquiries.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-2xl">Recent inquiries</h2>
            <Link href="/inquiries" className="btn-outline text-xs">View all</Link>
          </div>
          <div className="border border-ink/10 divide-y divide-ink/10">
            {recentInquiries.map((i) => (
              <Link
                key={i.id}
                href="/inquiries"
                className="grid grid-cols-12 gap-3 px-4 py-3 hover:bg-surface-100 transition-colors items-center"
              >
                <div className="col-span-3 flex items-center gap-2">
                  {i.status === 'NEW' && <span className="w-2 h-2 rounded-full bg-accent shrink-0" />}
                  <span className="font-medium truncate">{i.name}</span>
                </div>
                <div className="col-span-7 text-sm text-muted truncate">{i.message}</div>
                <div className="col-span-2 text-right text-xs text-muted">
                  {new Date(i.createdAt).toLocaleDateString()}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
