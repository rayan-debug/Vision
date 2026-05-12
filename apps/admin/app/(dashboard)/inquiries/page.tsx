import { prisma } from '@roua/db';
import { InquiriesList } from '@/components/InquiriesList';

export const dynamic = 'force-dynamic';

export default async function InquiriesIndex() {
  const inquiries = await prisma.inquiry.findMany({ orderBy: { createdAt: 'desc' } });

  return (
    <div className="p-4 md:p-8 lg:p-12 max-w-5xl">
      <div className="mb-10">
        <p className="text-xs uppercase tracking-widest text-accent mb-2">Studio</p>
        <h1 className="font-display text-3xl md:text-5xl">Inquiries</h1>
        <p className="text-muted mt-2 max-w-2xl">
          Messages submitted through the public contact form. They don&apos;t show on the website — only here. Click <strong>Reply</strong> to open your email client, or archive once handled.
        </p>
      </div>
      <InquiriesList
        initial={inquiries.map((i) => ({
          id: i.id,
          name: i.name,
          email: i.email,
          message: i.message,
          source: i.source,
          locale: i.locale,
          status: i.status,
          createdAt: i.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
