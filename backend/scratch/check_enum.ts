import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  try {
    const result = await prisma.$queryRaw`SELECT enumlabel FROM pg_enum JOIN pg_type ON pg_enum.enumtypid = pg_type.oid WHERE typname = 'ListingStatus'`;
    console.log('ListingStatus Enum Labels:', result);
  } catch (err) {
    console.error('Error fetching enum:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
