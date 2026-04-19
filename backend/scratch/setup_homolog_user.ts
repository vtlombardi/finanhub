
import { PrismaClient, ListingStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('--- STARTING HOMOLOG USER SETUP ---');
  
  const email = 'test@finanhub.com.br';
  const password = 'password123';
  const hash = await bcrypt.hash(password, 10);

  const user = await prisma.user.findFirst({
    where: { email },
    include: { tenant: true }
  });

  if (!user) {
    console.error('User not found: ' + email);
    return;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash: hash,
      isEmailVerified: true
    }
  });

  console.log('SUCCESS: User verified and password reset to: ' + password);
  console.log('TenantID: ' + user.tenantId);
  
  // Verify if it has a company
  const company = await prisma.company.findFirst({
    where: { tenantId: user.tenantId }
  });
  
  if (!company) {
    console.log('No company found for this tenant. Creating a default one...');
    await prisma.company.create({
      data: {
        id: '244199c4-f2a8-444f-8015-8857fd216447',
        tenantId: user.tenantId,
        name: 'HOMOLOG_COMPANY_SELLER',
        slug: 'homolog-company-seller-' + Date.now(),
      }
    });
    console.log('Company created.');
  } else {
    console.log('Company found: ' + company.id);
  }

  const finalCompanyId = company ? company.id : '244199c4-f2a8-444f-8015-8857fd216447';

  // Final Step: Create a listing to prove lifecycle
  console.log('Creating proof-of-life listing...');
  const listing = await prisma.listing.create({
    data: {
      title: 'HOMOLOG_STABILIZED_V3_FINAL',
      slug: 'homolog-stabilized-v3-final-' + Date.now(),
      description: 'Anúncio de homologação final. Este registro prova que o banco de dados e o modelo de dados estão 100% íntegros.',
      categoryId: '803c2459-36d3-48d6-9ab0-ee82612a444d', // Franquias
      investmentValue: 250000,
      status: ListingStatus.DRAFT,
      tenantId: user.tenantId,
      companyId: finalCompanyId,
      ownerId: user.id
    }
  });

  console.log('LISTING CREATED: ' + listing.id);
  console.log('--- HOMOLOG SETUP COMPLETE ---');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
