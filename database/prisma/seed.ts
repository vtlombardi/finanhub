import { PrismaClient, Role, PlanTier } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seeder Finanhub Monetization Engine...');

  // 1. Criar Master Tenant
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'finanhub' },
    update: {},
    create: {
      name: 'FINANHUB Corporation',
      slug: 'finanhub',
      document: '00.000.000/0001-00'
    }
  });

  console.log(`✅ Tenant criado: ${tenant.slug}`);

  // 2. Limpar planos existentes (opcional, já que fizemos reset, mas para segurança)
  await prisma.plan.deleteMany({ where: { tenantId: tenant.id } });

  // 3. Criar Planos (Levels of Power)
  const plansData = [
    {
      name: 'Base',
      tier: PlanTier.BASE,
      price: 150.00,
      description: 'Exposição no Mercado e rastro digital.',
      maxListings: 1,
      maxLeadsPerMonth: 5,
      hasAnalytics: true,
      hasChat: true,
      isPublic: true,
    },
    {
      name: 'Professional',
      tier: PlanTier.PROFESSIONAL,
      price: 490.00,
      description: 'Aceleração de Negócios com VDR Simplificado.',
      maxListings: 1,
      maxLeadsPerMonth: 50,
      hasAnalytics: true,
      hasChat: true,
      hasAiQualification: true,
      maxFeaturedListings: 1,
      isPublic: true,
    },
    {
      name: 'Elite',
      tier: PlanTier.ELITE,
      price: 1950.00,
      priceYearly: 19500.00,
      description: 'Liquidez Máxima com Agente HAYIA 24/7.',
      maxListings: 10,
      maxLeadsPerMonth: 999,
      hasAnalytics: true,
      hasChat: true,
      hasAiQualification: true,
      hasPrioritySupport: true,
      hasApiAccess: true,
      maxFeaturedListings: 3,
      isPublic: true,
    }
  ];

  for (const planData of plansData) {
    const plan = await prisma.plan.create({
      data: {
        ...planData,
        tenantId: tenant.id,
      }
    });
    console.log(`✅ Plano criado: ${plan.name} (${plan.tier})`);
  }

  // 4. User Master (Vitor Lombardi)
  const user = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: 'vitor@finanhub.com.br' } },
    update: {},
    create: {
      tenantId: tenant.id,
      email: 'vitor@finanhub.com.br',
      passwordHash: '$2b$10$Ep76J5K95L9P5L9P5L9P5OqP5L9P5L9P5L9P5L9P5L9P5L9P5L9P5', // dummy password
      fullName: 'Vitor Lombardi',
      role: Role.ADMIN
    }
  });

  console.log(`✅ Admin master criado: ${user.email}`);

  // 5. Vincular uma assinatura teste (ELITE) ao Tenant
  const elitePlan = await prisma.plan.findFirst({ where: { tier: PlanTier.ELITE } });
  if (elitePlan) {
    await prisma.subscription.create({
      data: {
        tenantId: tenant.id,
        planId: elitePlan.id,
        isActive: true,
        billingCycle: 'MONTHLY',
        startDate: new Date(),
      }
    });
    console.log(`✅ Assinatura ELITE ativada para o tenant master`);
  }

  // 6. Criar Categorias de Listings
  const categories = [
    { slug: 'tech', name: 'Tecnologia' },
    { slug: 'industry', name: 'Indústria' },
    { slug: 'retail', name: 'Varejo' },
    { slug: 'services', name: 'Serviços' },
    { slug: 'finance', name: 'Finanças' },
  ];

  for (const cat of categories) {
    await prisma.listingCategory.upsert({
      where: { slug: cat.slug },
      update: {},
      create: { 
        name: cat.name, 
        slug: cat.slug,
        description: `Oportunidades no setor de ${cat.name}`
      }
    });
  }
  console.log('✅ Categorias de listings criadas');

  // 7. Criar uma Empresa (Company) para os anúncios
  const company = await prisma.company.create({
    data: {
      tenantId: tenant.id,
      name: 'NexCapital Tech Holdings',
      slug: 'nexcapital-tech',
      description: 'Holding de participações em tecnologia e serviços.',
      isPublic: true,
      status: 'ACTIVE'
    }
  });

  // 8. Criar Listings de Exemplo
  const listings = [
    {
      title: 'SaaS de Logística para E-commerce',
      slug: 'saas-logistica-ecommerce',
      description: 'Plataforma líder em otimização de rotas e gestão de last-mile com 200+ clientes ativos e crescimento de 40% YoY.',
      price: 15000000,
      status: 'ACTIVE',
      isFeatured: true,
      state: 'SP',
      city: 'São Paulo',
      categoryId: (await prisma.listingCategory.findUnique({ where: { slug: 'tech' } }))!.id,
    },
    {
      title: 'Indústria de Cosméticos Veganos',
      slug: 'industria-cosmeticos-veganos',
      description: 'Planta industrial moderna com certificação internacional e rede de distribuição nacional em expansão.',
      price: 8500000,
      status: 'ACTIVE',
      isFeatured: false,
      state: 'MG',
      city: 'Belo Horizonte',
      categoryId: (await prisma.listingCategory.findUnique({ where: { slug: 'industry' } }))!.id,
    },
    {
      title: 'Rede de Franquias de Cafés Especiais',
      slug: 'franquia-cafes-especiais',
      description: '15 unidades próprias e 30 franqueadas. Marca consolidada com foco em experiência premium e grãos selecionados.',
      price: 4200000,
      status: 'ACTIVE',
      isFeatured: true,
      state: 'RJ',
      city: 'Rio de Janeiro',
      categoryId: (await prisma.listingCategory.findUnique({ where: { slug: 'retail' } }))!.id,
    }
  ];

  for (const list of listings) {
    await prisma.listing.create({
      data: {
        ...list,
        tenantId: tenant.id,
        companyId: company.id,
        featuredPriority: list.isFeatured ? 10 : 0
      }
    });
  }

  console.log('🚀 Seed da Máquina de Monetização e Oportunidades Completo.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

