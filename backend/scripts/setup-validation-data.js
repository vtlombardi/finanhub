const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const tenantId = 'ad92ebe6-b06c-40b2-a9d0-5d338812930b'; // test_profile
  const otherTenantId = 'db489c87-baa6-45cd-8f64-c8767a6bd64f'; // test_profile2
  const categoryId = '6b3ba971-dbd1-44d3-990c-3740454b839c';

  console.log('--- Setting up Validation Data ---');

  // 1. Create Company for test tenant
  const company = await prisma.company.upsert({
    where: { 
      tenantId_slug: { 
        tenantId, 
        slug: 'empresa-validacao-teste' 
      } 
    },
    update: {},
    create: {
      tenantId,
      name: 'Empresa de Validação TESTE',
      slug: 'empresa-validacao-teste',
    }
  });
  console.log(`Company created/found: ${company.id}`);

  // 2. Create Company for other tenant (for isolation test)
  const otherCompany = await prisma.company.upsert({
    where: { 
      tenantId_slug: { 
        tenantId: otherTenantId, 
        slug: 'empresa-isolamento-teste' 
      } 
    },
    update: {},
    create: {
      tenantId: otherTenantId,
      name: 'Empresa de ISOLAMENTO',
      slug: 'empresa-isolamento-teste',
    }
  });

  // 3. Create Listings for TEST tenant
  const listings = [
    {
      title: 'TESTE_VALIDACAO_ATIVO',
      slug: 'teste-validacao-ativo',
      status: 'ACTIVE',
      description: 'Anúncio ativo para validação.',
      value: 1000000,
    },
    {
      title: 'TESTE_VALIDACAO_RASCUNHO',
      slug: 'teste-validacao-rascunho',
      status: 'DRAFT',
      description: 'Anúncio em rascunho para validação.',
      value: 500000,
    },
    {
      title: 'TESTE_VALIDACAO_SUSPENSO',
      slug: 'teste-validacao-suspenso',
      status: 'SUSPENDED',
      description: 'Anúncio suspenso para validação de moderação.',
      value: 2000000,
    }
  ];

  for (const l of listings) {
    const listing = await prisma.listing.upsert({
      where: { 
        tenantId_slug: { 
          tenantId, 
          slug: l.slug 
        } 
      },
      update: { status: l.status },
      create: {
        tenantId,
        companyId: company.id,
        categoryId,
        title: l.title,
        slug: l.slug,
        description: l.description,
        status: l.status,
        investmentValue: l.value,
      }
    });
    console.log(`Listing created: ${listing.title} (${listing.id})`);
  }

  // 4. Create Isolation Listing
  const isolationListing = await prisma.listing.upsert({
    where: { 
      tenantId_slug: { 
        tenantId: otherTenantId, 
        slug: 'teste-isolamento-externo' 
      } 
    },
    update: {},
    create: {
      tenantId: otherTenantId,
      companyId: otherCompany.id,
      categoryId,
      title: 'TESTE_ISOLAMENTO_EXTERNO',
      slug: 'teste-isolamento-externo',
      description: 'Este anúncio NÃO deve ser visível ou editável pelo test_profile.',
      status: 'ACTIVE',
      investmentValue: 9999999,
    }
  });
  console.log(`Isolation Listing created: ${isolationListing.id}`);

  console.log('--- Data Setup Complete ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
