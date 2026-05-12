import Link from 'next/link';
import { prisma } from '@roua/db';
import { ActivityFeed } from '@/components/ActivityFeed';

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
    <div className="p-4 md:p-8 lg:p-12 max-w-6xl">
      <div className="mb-8 md:mb-12">
        <p className="text-xs uppercase tracking-widest text-accent mb-2 md:mb-3">Studio</p>
        <h1 className="font-display text-3xl md:text-5xl">Welcome back.</h1>
      </div>

      <details className="card mb-8 md:mb-12">
        <summary className="cursor-pointer text-sm font-medium hover:text-accent select-none">
          What edits where? — a 30-second tour
        </summary>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm leading-relaxed text-muted">
          <p><strong className="text-ink">Pages</strong> — every public URL like <code className="text-xs">/about</code> or <code className="text-xs">/services</code>. Built from drag-orderable blocks. Pick a layout template when creating one.</p>
          <p><strong className="text-ink">Projects</strong> — portfolio items shown in the Projects grid block and on <code className="text-xs">/projects</code>. Mark as featured to surface on the home page.</p>
          <p><strong className="text-ink">Services</strong> — what you do. Shows in the Services block on any page.</p>
          <p><strong className="text-ink">Testimonials</strong> — client quotes. Shows via the Testimonials block on any page.</p>
          <p><strong className="text-ink">Media</strong> — uploaded images. Reuse via the picker on any image field.</p>
          <p><strong className="text-ink">Inquiries</strong> — messages from the public contact form. Read, reply (mailto), archive.</p>
          <p className="md:col-span-2"><strong className="text-ink">Site settings</strong> — site-wide brand, theme colors, fonts, navigation labels, SEO defaults, analytics, custom CSS. Every page picks up changes immediately on save.</p>
        </div>
      </details>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8 md:mb-12">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className={`card hover:border-accent transition-colors ${s.highlight ? 'border-accent' : ''}`}
          >
            <p className="text-xs uppercase tracking-widest text-muted">{s.label}</p>
            <p className={`font-display text-3xl md:text-4xl mt-2 ${s.highlight ? 'text-accent' : ''}`}>{s.value}</p>
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

      <section className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-2xl">Recent activity</h2>
        </div>
        <ActivityFeed limit={10} />
      </section>

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
                className="flex flex-col gap-1 md:grid md:grid-cols-12 md:gap-3 px-4 py-3 hover:bg-surface-100 transition-colors md:items-center"
              >
                <div className="md:col-span-3 flex items-center gap-2 min-w-0">
                  {i.status === 'NEW' && <span className="w-2 h-2 rounded-full bg-accent shrink-0" />}
                  <span className="font-medium truncate">{i.name}</span>
                  <span className="md:hidden ml-auto text-[10px] text-muted">
                    {new Date(i.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="md:col-span-7 text-sm text-muted truncate">{i.message}</div>
                <div className="hidden md:block md:col-span-2 text-right text-xs text-muted">
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
