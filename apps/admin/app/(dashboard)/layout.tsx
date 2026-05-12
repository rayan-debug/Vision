import { redirect } from 'next/navigation';
import { prisma } from '@roua/db';
import { getSession } from '@/lib/session';
import { AdminShell } from '@/components/AdminShell';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect('/login');

  const unreadInquiries = await prisma.inquiry.count({ where: { status: 'NEW' } }).catch(() => 0);

  return (
    <AdminShell email={session.email} unreadInquiries={unreadInquiries}>
      {children}
    </AdminShell>
  );
}
