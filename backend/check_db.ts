import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  try {
    const plansCount = await prisma.plan.count();
    console.log('PLAN_COUNT:', plansCount);
    const plans = await prisma.plan.findMany();
    console.log('PLANS:', JSON.stringify(plans));
  } catch (err) {
    console.error('ERROR:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
