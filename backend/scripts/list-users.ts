
import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  const users = await prisma.user.findMany({
    select: { email: true, role: true, isEmailVerified: true }
  });
  console.log('--- USUÁRIOS NO SISTEMA ---');
  console.log(JSON.stringify(users, null, 2));
  await prisma.$disconnect();
}

main();
