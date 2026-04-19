const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const user = await prisma.user.findFirst({
    where: { email: 'test@finanhub.com.br' }
  });

  if (!user) {
    console.log('USER_NOT_FOUND');
    return;
  }

  console.log('TENANT_ID:', user.tenantId);

  const companies = await prisma.company.findMany({
    where: { tenantId: user.tenantId }
  });

  console.log('COMPANY_COUNT:', companies.length);
  if (companies.length > 0) {
    console.log('COMPANY_ID:', companies[0].id);
  } else {
    // Tenta criar uma empresa padrão para o tenant se não houver
    const company = await prisma.company.create({
      data: {
        name: 'Finanhub Test Company',
        slug: 'finanhub-test-company',
        tenantId: user.tenantId,
        isVerified: true
      }
    });
    console.log('CREATED_COMPANY_ID:', company.id);
  }
}

check()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
