import { notFound } from 'next/navigation';
import { prisma } from '@roua/db';
import { PageEditor } from '@/components/PageEditor';

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const page = await prisma.page.findUnique({ where: { id } });
  if (!page) notFound();

  return (
    <PageEditor
      page={{
        id: page.id,
        slugEn: page.slugEn,
        slugAr: page.slugAr,
        i18n: page.i18n as Record<string, { title: string; description?: string; keywords?: string }>,
        blocks: (page.blocks as unknown as { type: string }[]) ?? [],
        status: page.status,
        isHome: page.isHome,
        showInNav: page.showInNav,
        navOrder: page.navOrder,
        ogImage: page.ogImage,
        updatedAt: page.updatedAt.toISOString(),
      }}
      previewToken={process.env.ADMIN_SESSION_SECRET ?? ''}
      publicSiteUrl={process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}
    />
  );
}
