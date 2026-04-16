import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const category = await prisma.category.findFirst({
    where: {
      name: {
        contains: 'Ativos',
        mode: 'insensitive',
      },
    },
    include: {
      attributes: true,
    },
  });

  if (!category) {
    console.log('Category "Ativos e Estruturas" not found.');
    return;
  }

  console.log('Category Found:');
  console.log(JSON.stringify(category, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
