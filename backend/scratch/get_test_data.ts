import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- USERS ---');
  const users = await prisma.user.findMany({
    take: 10,
    select: { id: true, email: true, role: true, tenantId: true }
  });
  console.log(JSON.stringify(users, null, 2));

  console.log('--- TENANTS ---');
  const tenants = await prisma.tenant.findMany({
    take: 5
  });
  console.log(JSON.stringify(tenants, null, 2));

  console.log('--- LISTINGS ---');
  const listings = await prisma.listing.findMany({
    take: 5,
    select: { id: true, title: true, status: true, tenantId: true }
  });
  console.log(JSON.stringify(listings, null, 2));
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
