// Diagnostic: prints every user row and tests the .env password against each.
// Run with: npm --workspace packages/db exec -- dotenv -e ../../.env -- tsx prisma/debug-login.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const envEmail = process.env.ADMIN_EMAIL ?? '(not set)';
  const envPassword = process.env.ADMIN_PASSWORD ?? '(not set)';

  console.log('\n=== ENV VALUES ===');
  console.log('ADMIN_EMAIL    :', JSON.stringify(envEmail));
  console.log('ADMIN_EMAIL lc :', JSON.stringify(envEmail.toLowerCase().trim()));
  console.log('ADMIN_PASSWORD :', JSON.stringify(envPassword));

  const users = await prisma.user.findMany();
  console.log(`\n=== USER ROWS IN DB (${users.length}) ===`);
  if (users.length === 0) {
    console.log('NO USERS. Run `npm run db:seed` first.');
    return;
  }
  for (const u of users) {
    console.log(`\n  email   : ${JSON.stringify(u.email)}`);
    console.log(`  name    : ${u.name}`);
    console.log(`  hashLen : ${u.password.length}  (a valid bcrypt hash is 60 chars)`);
    const match = await bcrypt.compare(envPassword, u.password);
    console.log(`  ${match ? '✓ password from .env MATCHES' : '✗ password from .env does NOT match'}`);
  }
  console.log('');
}

main()
  .catch((e) => {
    console.error('ERROR:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
