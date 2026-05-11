import { NextResponse } from 'next/server';
import { prisma } from '@roua/db';

// Contact form endpoint. Stores the message as a Media row tagged "contact"
// for now (so the admin can see briefs without setting up email). Swap to
// Resend/Postmark by replacing the prisma.media.create call.
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = String(body.name ?? '').slice(0, 200).trim();
    const email = String(body.email ?? '').slice(0, 200).trim();
    const message = String(body.message ?? '').slice(0, 5000).trim();

    if (!name || !email || !message) {
      return NextResponse.json({ ok: false, error: 'missing fields' }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ ok: false, error: 'invalid email' }, { status: 400 });
    }

    await prisma.media.create({
      data: {
        url: 'contact-message',
        filename: `${Date.now()}-${name}`,
        mimeType: 'text/plain',
        size: message.length,
        alt: `From ${name} <${email}>: ${message}`,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
