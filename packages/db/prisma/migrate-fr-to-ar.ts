// One-shot migration: rename the `slugFr` columns to `slugAr` on Page/Project/
// BlogPost, and rewrite the i18n JSON keys from `fr` to `ar`. Run this once
// against your existing Neon DB before `prisma db push` — otherwise db push
// would drop the slugFr columns and you'd lose those slugs.
//
// Run with:
//   npm --workspace packages/db exec -- dotenv -e ../../.env -- tsx prisma/migrate-fr-to-ar.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Renaming slugFr → slugAr on Page, Project, BlogPost…');

  // Use raw SQL because Prisma client won't know about both column names at once.
  await prisma.$executeRawUnsafe(`ALTER TABLE "Page" RENAME COLUMN "slugFr" TO "slugAr";`).catch(() => {});
  await prisma.$executeRawUnsafe(`ALTER TABLE "Project" RENAME COLUMN "slugFr" TO "slugAr";`).catch(() => {});
  await prisma.$executeRawUnsafe(`ALTER TABLE "BlogPost" RENAME COLUMN "slugFr" TO "slugAr";`).catch(() => {});

  console.log('Rewriting i18n keys fr → ar in Page rows…');
  const pages = await prisma.$queryRawUnsafe<{ id: string; i18n: any }[]>(`SELECT id, i18n FROM "Page";`);
  for (const p of pages) {
    if (p.i18n && typeof p.i18n === 'object' && 'fr' in p.i18n) {
      const next = { ...p.i18n, ar: p.i18n.fr };
      delete next.fr;
      await prisma.$executeRawUnsafe(
        `UPDATE "Page" SET "i18n" = $1::jsonb WHERE id = $2`,
        JSON.stringify(next),
        p.id
      );
    }
  }

  console.log('Rewriting i18n keys fr → ar in Project rows…');
  const projects = await prisma.$queryRawUnsafe<{ id: string; i18n: any }[]>(`SELECT id, i18n FROM "Project";`);
  for (const p of projects) {
    if (p.i18n && typeof p.i18n === 'object' && 'fr' in p.i18n) {
      const next = { ...p.i18n, ar: p.i18n.fr };
      delete next.fr;
      await prisma.$executeRawUnsafe(
        `UPDATE "Project" SET "i18n" = $1::jsonb WHERE id = $2`,
        JSON.stringify(next),
        p.id
      );
    }
  }

  console.log('Rewriting i18n keys fr → ar in Service rows…');
  const services = await prisma.$queryRawUnsafe<{ id: string; i18n: any }[]>(`SELECT id, i18n FROM "Service";`);
  for (const s of services) {
    if (s.i18n && typeof s.i18n === 'object' && 'fr' in s.i18n) {
      const next = { ...s.i18n, ar: s.i18n.fr };
      delete next.fr;
      await prisma.$executeRawUnsafe(
        `UPDATE "Service" SET "i18n" = $1::jsonb WHERE id = $2`,
        JSON.stringify(next),
        s.id
      );
    }
  }

  console.log('Rewriting i18n keys fr → ar in SiteSettings…');
  const settings = await prisma.$queryRawUnsafe<{ id: string; i18n: any; faqs: any }[]>(`SELECT id, i18n, faqs FROM "SiteSettings";`);
  for (const s of settings) {
    let i18n = s.i18n;
    if (i18n && typeof i18n === 'object' && 'fr' in i18n) {
      i18n = { ...i18n, ar: i18n.fr };
      delete i18n.fr;
    }
    let faqs = s.faqs;
    if (Array.isArray(faqs)) {
      faqs = faqs.map((f: any) => {
        const q = { ...f.q };
        const a = { ...f.a };
        if ('fr' in q) { q.ar = q.fr; delete q.fr; }
        if ('fr' in a) { a.ar = a.fr; delete a.fr; }
        return { q, a };
      });
    }
    await prisma.$executeRawUnsafe(
      `UPDATE "SiteSettings" SET "i18n" = $1::jsonb, "faqs" = $2::jsonb WHERE id = $3`,
      JSON.stringify(i18n),
      JSON.stringify(faqs),
      s.id
    );
  }

  console.log('\n✓ Migration complete. Now run: npm run db:push && npm run db:seed (optional)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
