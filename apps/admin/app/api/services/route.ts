import { NextResponse } from 'next/server';
import { prisma } from '@roua/db';
import { requireSession } from '@/lib/session';

export async function POST() {
  await requireSession();
  const count = await prisma.service.count();
  const s = await prisma.service.create({
    data: {
      icon: '◇',
      order: count,
      i18n: { en: { title: '', description: '' }, ar: { title: '', description: '' } },
    },
  });
  return NextResponse.json({ id: s.id });
}
