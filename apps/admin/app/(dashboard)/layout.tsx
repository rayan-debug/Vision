import { redirect } from 'next/navigation';
import { prisma } from '@roua/db';
import { getSession } from '@/lib/session';
import { Sidebar } from '@/components/Sidebar';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect('/login');

  const unreadInquiries = await prisma.inquiry.count({ where: { status: 'NEW' } }).catch(() => 0);

  return (
    <div className="flex min-h-screen">
      <Sidebar email={session.email} unreadInquiries={unreadInquiries} />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
