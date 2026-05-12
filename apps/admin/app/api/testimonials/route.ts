import { NextResponse } from 'next/server';
import { prisma } from '@roua/db';
import { requireSession } from '@/lib/session';

export async function POST() {
  await requireSession();
  const count = await prisma.testimonial.count();
  const t = await prisma.testimonial.create({
    data: {
      i18n: { en: { quote: '', name: '', role: '' }, ar: { quote: '', name: '', role: '' } },
      order: count,
    },
  });
  return NextResponse.json({ id: t.id });
}
