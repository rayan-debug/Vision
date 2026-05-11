// One-shot fix: lowercase every user's email so the login lookup (which
// lowercases the input) can find them.
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  for (const u of users) {
    const lower = u.email.toLowerCase().trim();
    if (lower !== u.email) {
      await prisma.user.update({ where: { id: u.id }, data: { email: lower } });
      console.log(`✓ ${u.email}  →  ${lower}`);
    } else {
      console.log(`· ${u.email} already lowercase`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
