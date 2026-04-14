import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const count = await prisma.listing.count({ where: { seedTag: "finanhub_seed_v1" } });
  const allCount = await prisma.listing.count();
  console.log('Seed Count:', count);
  console.log('Total Count:', allCount);
}
main().catch(console.error).finally(() => prisma.$disconnect());
