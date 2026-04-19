
import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  const listing = await prisma.listing.findUnique({
    where: { id: 'b808be19-034c-47d1-a58d-0f4865477b9e' },
    include: { tenant: { include: { users: true } } }
  });
  
  if (!listing) {
    console.log('Listing not found');
  } else {
    console.log('--- DONO DO ANÚNCIO ---');
    console.log(`Tiítulo: ${listing.title}`);
    console.log(`Tenant: ${listing.tenant.name}`);
    console.log('Usuários associados:');
    listing.tenant.users.forEach(u => {
      console.log(`- ${u.email} (Role: ${u.role}, Verified: ${u.isEmailVerified})`);
    });
  }
  
  await prisma.$disconnect();
}

main();
