import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { prisma } from '@roua/db';
import { requireSession } from '@/lib/session';
import { logActivity } from '@/lib/activity';

// Local upload (fallback when Cloudinary isn't configured). Files are written
// to the public web app's /public/uploads so they're served from the same
// origin as the live site. Images are auto-resized (max 2400px wide) and
// re-encoded for size unless they're SVG/GIF.
const MAX_SIZE = 10 * 1024 * 1024;
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'image/avif'];
const COMPRESSIBLE = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);
const MAX_WIDTH = 2400;
const COMPRESS_ABOVE = 200 * 1024; // skip optimization for small files

async function maybeOptimize(
  buf: Buffer,
  mime: string,
  originalName: string,
): Promise<{ buf: Buffer; mime: string; ext: string; bytesSaved: number; width?: number; height?: number }> {
  const originalExt = path.extname(originalName) || extFromMime(mime);
  if (!COMPRESSIBLE.has(mime) || buf.length < COMPRESS_ABOVE) {
    return { buf, mime, ext: originalExt, bytesSaved: 0 };
  }
  try {
    const image = sharp(buf, { failOn: 'none' });
    const meta = await image.metadata();
    let pipeline = image;
    if (meta.width && meta.width > MAX_WIDTH) {
      pipeline = pipeline.resize({ width: MAX_WIDTH, withoutEnlargement: true });
    }
    // Re-encode to the same format with sane defaults.
    if (mime === 'image/jpeg') pipeline = pipeline.jpeg({ quality: 82, progressive: true, mozjpeg: true });
    else if (mime === 'image/png') pipeline = pipeline.png({ compressionLevel: 9, palette: true });
    else if (mime === 'image/webp') pipeline = pipeline.webp({ quality: 82 });
    else if (mime === 'image/avif') pipeline = pipeline.avif({ quality: 60 });
    const out = await pipeline.toBuffer({ resolveWithObject: true });
    // Only keep the optimized result when it actually saves bytes.
    if (out.data.length < buf.length) {
      return {
        buf: out.data,
        mime,
        ext: originalExt,
        bytesSaved: buf.length - out.data.length,
        width: out.info.width,
        height: out.info.height,
      };
    }
  } catch {
    // Fall through to original.
  }
  return { buf, mime, ext: originalExt, bytesSaved: 0 };
}

async function localUpload(buf: Buffer, ext: string): Promise<{ url: string; filename: string }> {
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
  const target = path.resolve(process.cwd(), '..', 'web', 'public', 'uploads');
  await mkdir(target, { recursive: true });
  await writeFile(path.join(target, filename), buf);
  return { url: `/uploads/${filename}`, filename };
}

async function cloudinaryUpload(buf: Buffer, mime: string, ext: string): Promise<{ url: string; filename: string }> {
  const cloud = process.env.CLOUDINARY_CLOUD_NAME!;
  const key = process.env.CLOUDINARY_API_KEY!;
  const secret = process.env.CLOUDINARY_API_SECRET!;
  const timestamp = Math.floor(Date.now() / 1000);
  const toSign = `timestamp=${timestamp}${secret}`;
  const { createHash } = await import('node:crypto');
  const signature = createHash('sha1').update(toSign).digest('hex');
  const blob = new Blob([new Uint8Array(buf)], { type: mime });
  const file = new File([blob], `upload${ext}`, { type: mime });
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
  const session = await requireSession();
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

    const rawBuf = Buffer.from(await file.arrayBuffer());
    const { buf, mime, ext, bytesSaved, width, height } = await maybeOptimize(rawBuf, file.type, file.name);

    const useCloudinary = !!process.env.CLOUDINARY_CLOUD_NAME && !!process.env.CLOUDINARY_API_KEY;
    const { url, filename } = useCloudinary
      ? await cloudinaryUpload(buf, mime, ext)
      : await localUpload(buf, ext);

    const created = await prisma.media.create({
      data: {
        url,
        filename,
        mimeType: mime,
        size: buf.length,
        alt: file.name.replace(/\.[^.]+$/, ''),
        width,
        height,
      },
    });
    uploaded.push({ ...created, createdAt: created.createdAt.toISOString(), bytesSaved });
    await logActivity({
      userEmail: session.email,
      entityType: 'media',
      entityId: created.id,
      entityName: created.filename,
      action: 'created',
      meta: bytesSaved > 0 ? { bytesSaved, originalSize: rawBuf.length } : undefined,
    });
  }
  return NextResponse.json({ uploaded });
}

function extFromMime(mime: string): string {
  return ({ 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/gif': '.gif', 'image/svg+xml': '.svg', 'image/avif': '.avif' } as Record<string, string>)[mime] ?? '';
}
