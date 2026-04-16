const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- Cleaning up Validation Data ---');

  const tenantIds = [
    'ad92ebe6-b06c-40b2-a9d0-5d338812930b', // Test Tenant 1
    'db489c87-baa6-45cd-8f64-c8767a6bd64f'  // Test Tenant 2
  ];

  for (const tenantId of tenantIds) {
    // 1. Delete listings and their dependencies (cascading usually handled by DB, but being safe)
    const listings = await prisma.listing.findMany({
      where: { tenantId, title: { contains: 'TESTE_VALIDACAO' } }
    });
    
    console.log(`Deleting ${listings.length} listings for tenant ${tenantId}...`);
    
    for (const listing of listings) {
      await prisma.listing.delete({ where: { id: listing.id } });
    }

    // 2. Delete companies
    const companies = await prisma.company.findMany({
      where: { tenantId, name: { contains: 'TESTE_VALIDACAO' } }
    });
    
    console.log(`Deleting ${companies.length} companies for tenant ${tenantId}...`);
    
    for (const company of companies) {
      await prisma.company.delete({ where: { id: company.id } });
    }
  }

  console.log('--- Cleanup Complete ---');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
