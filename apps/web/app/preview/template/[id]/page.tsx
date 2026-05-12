import { notFound } from 'next/navigation';
import { prisma, isLocale, type Block, type Locale } from '@roua/db';
import { BlockRenderer } from '@/components/blocks/BlockRenderer';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

// Preview a PageTemplate's block layout exactly as it would render on a real
// page. Same auth model as /preview/[id] — needs the shared admin secret as
// a token. Used by the admin's template editor for the live preview pane.
export const dynamic = 'force-dynamic';

export default async function PreviewTemplate({
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

  const template = await prisma.pageTemplate.findUnique({ where: { id } });
  if (!template) notFound();

  const blocks = (template.blocks as unknown as Block[]) ?? [];

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-[200] bg-accent text-ink text-center py-1.5 text-xs uppercase tracking-widest">
        Template preview · {template.name} · {blocks.length} blocks
      </div>
      <Header locale={locale} />
      <main>
        {blocks.length === 0 ? (
          <div className="min-h-screen flex items-center justify-center text-bone/60 text-sm">
            (template has no blocks yet)
          </div>
        ) : (
          <BlockRenderer blocks={blocks} locale={locale} />
        )}
      </main>
      <Footer locale={locale} />
    </>
  );
}
