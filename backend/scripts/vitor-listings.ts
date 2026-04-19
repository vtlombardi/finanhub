
import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  const user = await prisma.user.findUnique({
    where: { email: 'vitor@finanhub.com.br' },
    include: { tenant: { include: { listings: true } } }
  });
  
  if (!user) {
    console.log('User not found');
  } else {
    console.log(`--- ANÚNCIOS DE ${user.email} ---`);
    user.tenant.listings.forEach(l => {
      console.log(`- [${l.id}] ${l.title} (Status: ${l.status})`);
    });
  }
  
  await prisma.$disconnect();
}

main();
