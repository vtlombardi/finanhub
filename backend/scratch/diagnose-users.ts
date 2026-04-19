import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  try {
    const users = await prisma.user.findMany({
      select: {
          email: true,
          fullName: true,
          isEmailVerified: true,
          role: true,
          tenant: { select: { slug: true } }
      }
    });

    console.log('--- USERS IN DATABASE ---');
    if (users.length === 0) {
      console.log('No users found in database.');
    } else {
      console.log(JSON.stringify(users, null, 2));
    }
    console.log('-------------------------');

  } catch (err) {
    console.error('DATABASE ERROR:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
