import { PrismaClient, Role, ListingStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Iniciando Seeding de Dados de Teste (V3 - Resiliente)...');

  const passwordHash = await bcrypt.hash('Finanhub2024!', 10);
  const masterHash = await bcrypt.hash('Vitor2906$', 10);

  // 1. Criar Categoria Global de M&A (Upsert)
  const globalTenant = await prisma.tenant.upsert({
    where: { slug: 'finanhub-corporate' },
    update: {},
    create: {
      name: 'FINANHUB CORPORATE',
      slug: 'finanhub-corporate',
      document: '00.000.000/0001-00',
    },
  });

  const category = await prisma.category.upsert({
    where: { tenantId_slug: { tenantId: globalTenant.id, slug: 'compra-venda-empresas' } },
    update: {},
    create: {
      name: 'Compra e Venda de Empresas',
      slug: 'compra-venda-empresas',
      tenantId: globalTenant.id,
      description: 'Listagens focadas em M&A, transferência de ativos e participações societárias.',
    },
  });

  // 2. Criar Master Admin: Vitor Lombardi (Upsert)
  await prisma.user.upsert({
    where: { tenantId_email: { tenantId: globalTenant.id, email: 'vtlombardi@hotmail.com' } },
    update: {
       passwordHash: masterHash,
       role: Role.ADMIN,
    },
    create: {
      email: 'vtlombardi@hotmail.com',
      fullName: 'Vitor Lombardi',
      passwordHash: masterHash,
      role: Role.ADMIN,
      tenantId: globalTenant.id,
      isEmailVerified: true,
    },
  });

  console.log('✅ Master Admin e Categoria Base processados.');

  // 3. Cenários de Teste
  const scenarios = [
    {
      email: 'tech@test.com',
      name: 'Marcos Silva',
      company: 'CloudBridge Solutions',
      slug: 'cloudbridge-solutions',
      listing: {
        title: 'Platorma ERP SaaS - Logística E-commerce',
        description: 'Empresa consolidada com 5 anos de mercado, foco em integração de marketplaces.',
        price: 12000000,
        ebitda: '2.400.000',
        revenue: '8.000.000',
        city: 'São Paulo',
        state: 'SP',
      },
    },
    {
      email: 'industry@test.com',
      name: 'Ricardo Souza',
      company: 'MetaStahl Indústria',
      slug: 'metastahl-industria',
      listing: {
        title: 'Indústria Metalúrgica de Precisão',
        description: 'Especialista em usinagem de componentes para o setor automotivo.',
        price: 45000000,
        ebitda: '6.800.000',
        revenue: '32.000.000',
        city: 'Curitiba',
        state: 'PR',
      },
    },
    {
      email: 'retail@test.com',
      name: 'Juliana Castro',
      company: 'Rede Farmaviva',
      slug: 'rede-farmaviva',
      listing: {
        title: 'Rede de Farmácias c/ 12 Unidades',
        description: 'Operação B2C em pontos estratégicos no Rio de Janeiro.',
        price: 8500000,
        ebitda: '1.100.000',
        revenue: '15.000.000',
        city: 'Rio de Janeiro',
        state: 'RJ',
      },
    },
    {
      email: 'agro@test.com',
      name: 'Otávio Pires',
      company: 'Fazenda Horizonte Verde',
      slug: 'fazenda-horizonte-verde',
      listing: {
        title: 'Produção Sustentável de Soja - 5.000 ha',
        description: 'Infraestrutura completa de irrigação e silos modernos.',
        price: 120000000,
        ebitda: '15.000.000',
        revenue: '85.000.000',
        city: 'Sorriso',
        state: 'MT',
      },
    },
    {
      email: 'health@test.com',
      name: 'Dra. Aline Mendes',
      company: 'BioScan Saúde',
      slug: 'bioscan-saude',
      listing: {
        title: 'Centro de Diagnóstico por Imagem Integrado',
        description: 'Equipamentos de ressonância e Tomografia de ponta.',
        price: 18000000,
        ebitda: '3.200.000',
        revenue: '20.000.000',
        city: 'Belo Horizonte',
        state: 'MG',
      },
    },
  ];

  for (const s of scenarios) {
    // A. Criar/Obter Tenant
    const tenant = await prisma.tenant.upsert({
      where: { slug: s.slug },
      update: {},
      create: {
        name: s.company,
        slug: s.slug,
      },
    });

    // B. Criar/Obter Company
    const company = await prisma.company.upsert({
      where: { tenantId_slug: { tenantId: tenant.id, slug: s.slug } },
      update: {},
      create: {
        tenantId: tenant.id,
        name: s.company,
        slug: s.slug,
        isVerified: true,
      },
    });

    // C. Criar/Obter Usuário
    const user = await prisma.user.upsert({
      where: { tenantId_email: { tenantId: tenant.id, email: s.email } },
      update: { passwordHash: passwordHash },
      create: {
        email: s.email,
        fullName: s.name,
        passwordHash: passwordHash,
        tenantId: tenant.id,
        isEmailVerified: true,
      },
    });

    // D. Vincular Usuário à Empresa
    await prisma.companyMember.upsert({
      where: { id: `${company.id}_${user.id}` }, // Mock ID for upsert logic if field not unique
      create: {
        companyId: company.id,
        userId: user.id,
        role: 'OWNER',
      },
      update: {}
    }).catch(() => { /* Ignore duplicate member errors */ });

    // E. Criar Anúncio (Listing) - Reset e recria para testes limpos
    const listingSlug = s.slug + '-listing';
    
    await prisma.listing.deleteMany({ where: { tenantId: tenant.id, slug: listingSlug } });

    await prisma.listing.create({
      data: {
        tenantId: tenant.id,
        companyId: company.id,
        categoryId: category.id,
        ownerId: user.id,
        title: s.listing.title,
        slug: listingSlug,
        description: s.listing.description,
        price: s.listing.price,
        status: ListingStatus.ACTIVE,
        ebitda: s.listing.ebitda,
        revenue: s.listing.revenue,
        city: s.listing.city,
        state: s.listing.state,
        media: {
           create: [
             {
               url: `https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800`,
               mediaType: 'IMAGE',
               isCover: true,
             }
           ]
        }
      },
    });

    console.log(`✅ [${s.company}] processado com sucesso.`);
  }

  console.log('✨ Seeding Finalizado!');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
