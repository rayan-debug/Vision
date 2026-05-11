import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@roua/db';
import { createSession } from '@/lib/session';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (typeof email !== 'string' || typeof password !== 'string') {
      return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
    }
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (!user) {
      // Constant-time-ish to avoid leaking which emails exist.
      await bcrypt.compare(password, '$2a$10$invalidhashplaceholder...........');
      return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
    }
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });

    await createSession({ userId: user.id, email: user.email });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
