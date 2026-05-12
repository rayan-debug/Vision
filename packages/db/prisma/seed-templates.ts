// Upserts the starter templates from src/templates.ts into the
// PageTemplate table. Safe to re-run; existing rows keyed by `key` are
// updated, but admin-customized blocks aren't overwritten unless --force
// is passed.
//
// Run with:
//   npm run seed:templates --workspace packages/db
//   npm run seed:templates --workspace packages/db -- --force

import { PrismaClient } from '@prisma/client';
import { STARTER_TEMPLATES } from '../src/templates';

const prisma = new PrismaClient();
const force = process.argv.includes('--force');

async function main() {
  for (const t of STARTER_TEMPLATES) {
    const existing = await prisma.pageTemplate.findUnique({ where: { key: t.key } });
    if (existing && !force) {
      // Only refresh name/description/preview/order so admin edits to `blocks`
      // are preserved. Pass --force to overwrite blocks too.
      await prisma.pageTemplate.update({
        where: { key: t.key },
        data: {
          name: t.name,
          description: t.description,
          preview: t.preview,
          order: t.order,
          isStarter: true,
        },
      });
      console.log(`↻  refreshed (kept blocks): ${t.key}`);
    } else {
      await prisma.pageTemplate.upsert({
        where: { key: t.key },
        update: {
          name: t.name,
          description: t.description,
          preview: t.preview,
          order: t.order,
          isStarter: true,
          blocks: t.build() as object,
        },
        create: {
          key: t.key,
          name: t.name,
          description: t.description,
          preview: t.preview,
          order: t.order,
          isStarter: true,
          blocks: t.build() as object,
        },
      });
      console.log(`✓  ${existing ? 'forced' : 'seeded'}: ${t.key}`);
    }
  }
  const total = await prisma.pageTemplate.count();
  console.log(`\nTotal templates in DB: ${total}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
