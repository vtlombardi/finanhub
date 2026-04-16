import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  try {
    // Adiciona o valor DELETED ao enum ListingStatus
    // Nota: ALTER TYPE ADD VALUE não pode ser executado dentro de uma transação.
    // Prisma queryRaw executa fora de transação por padrão se não for encadeado.
    await prisma.$executeRawUnsafe(`ALTER TYPE "ListingStatus" ADD VALUE IF NOT EXISTS 'DELETED'`);
    console.log('Successfully added DELETED to ListingStatus enum');
  } catch (err) {
    console.error('Error updating enum:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
