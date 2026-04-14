import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = 'vitor@finanhub.com.br';
  const user = await prisma.user.updateMany({
    where: { email },
    data: { isEmailVerified: true }
  });
  console.log(`Updated ${user.count} users.`);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
