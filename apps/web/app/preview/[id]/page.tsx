import { notFound } from 'next/navigation';
import { prisma, isLocale, type Block, type Locale } from '@roua/db';
import { BlockRenderer } from '@/components/blocks/BlockRenderer';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

// Preview route — renders ANY page (draft or published) when given a valid
// preview token. The admin panel embeds this in an iframe so the designer
// sees the exact public layout while editing. The token is shared via
// ADMIN_SESSION_SECRET so a stranger can't enumerate drafts.
export const dynamic = 'force-dynamic';

export default async function PreviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string; locale?: string }>;
}) {
  const { id } = await params;
  const { token, locale: l = 'en' } = await searchParams;

  if (!token || token !== process.env.ADMIN_SESSION_SECRET) notFound();
  const locale: Locale = isLocale(l) ? l : 'en';

  const page = await prisma.page.findUnique({ where: { id } });
  if (!page) notFound();

  const blocks = (page.blocks as unknown as Block[]) ?? [];

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-[200] bg-accent text-ink text-center py-1.5 text-xs uppercase tracking-widest">
        Preview · {page.status} · last saved {new Date(page.updatedAt).toLocaleString()}
      </div>
      <Header locale={locale} />
      <main>
        <BlockRenderer blocks={blocks} locale={locale} />
      </main>
      <Footer locale={locale} />
    </>
  );
}
