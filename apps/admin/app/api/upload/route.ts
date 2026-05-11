import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { prisma } from '@roua/db';
import { requireSession } from '@/lib/session';

// Local upload (fallback when Cloudinary isn't configured). Files are written
// to the public web app's /public/uploads so they're served from the same
// origin as the live site.
const MAX_SIZE = 10 * 1024 * 1024;
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'image/avif'];

async function localUpload(file: File): Promise<{ url: string; filename: string }> {
  const buf = Buffer.from(await file.arrayBuffer());
  const ext = path.extname(file.name) || extFromMime(file.type);
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
  // Resolve into the public web app's /public/uploads directory.
  const target = path.resolve(process.cwd(), '..', 'web', 'public', 'uploads');
  await mkdir(target, { recursive: true });
  await writeFile(path.join(target, filename), buf);
  return { url: `/uploads/${filename}`, filename };
}

async function cloudinaryUpload(file: File): Promise<{ url: string; filename: string }> {
  // Lazy require so the build doesn't fail when env isn't set.
  const cloud = process.env.CLOUDINARY_CLOUD_NAME!;
  const key = process.env.CLOUDINARY_API_KEY!;
  const secret = process.env.CLOUDINARY_API_SECRET!;
  const timestamp = Math.floor(Date.now() / 1000);
  // Build a signed unsigned-upload-style request.
  const toSign = `timestamp=${timestamp}${secret}`;
  const { createHash } = await import('node:crypto');
  const signature = createHash('sha1').update(toSign).digest('hex');
  const fd = new FormData();
  fd.append('file', file);
  fd.append('api_key', key);
  fd.append('timestamp', String(timestamp));
  fd.append('signature', signature);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/auto/upload`, {
    method: 'POST',
    body: fd,
  });
  if (!res.ok) throw new Error('Cloudinary upload failed');
  const json = (await res.json()) as { secure_url: string; public_id: string };
  return { url: json.secure_url, filename: json.public_id };
}

export async function POST(req: Request) {
  await requireSession();
  const fd = await req.formData();
  const files = fd.getAll('files').filter((x): x is File => x instanceof File);
  const uploaded = [];
  for (const file of files) {
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: `${file.name} exceeds 10MB.` }, { status: 400 });
    }
    if (!ALLOWED.includes(file.type)) {
      return NextResponse.json({ error: `${file.name} type not allowed.` }, { status: 400 });
    }

    const useCloudinary = !!process.env.CLOUDINARY_CLOUD_NAME && !!process.env.CLOUDINARY_API_KEY;
    const { url, filename } = useCloudinary ? await cloudinaryUpload(file) : await localUpload(file);

    const created = await prisma.media.create({
      data: {
        url,
        filename,
        mimeType: file.type,
        size: file.size,
        alt: file.name.replace(/\.[^.]+$/, ''),
      },
    });
    uploaded.push({ ...created, createdAt: created.createdAt.toISOString() });
  }
  return NextResponse.json({ uploaded });
}

function extFromMime(mime: string): string {
  return ({ 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/gif': '.gif', 'image/svg+xml': '.svg', 'image/avif': '.avif' } as Record<string, string>)[mime] ?? '';
}
