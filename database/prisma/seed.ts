import { PrismaClient, Role, PlanTier } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seeder Prisma...');

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

  // 2. Planos Padrão
  const plan1 = await prisma.plan.create({
    data: {
      tenantId: tenant.id,
      name: 'Freemium',
      tier: PlanTier.FREE,
      price: 0.00,
      maxListings: 1
    }
  });

  console.log(`✅ Plano criado: ${plan1.name}`);

  // 3. User Diretor
  const user = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: 'admin@finanhub.com' } },
    update: {},
    create: {
      tenantId: tenant.id,
      email: 'admin@finanhub.com',
      passwordHash: 'dummy-hash-123',
      fullName: 'Administrador Master',
      role: Role.ADMIN
    }
  });

  console.log(`✅ Admin master criado: ${user.email}`);

  // 4. Default Company Node
  const company = await prisma.company.upsert({
    where: { tenantId_slug: { tenantId: tenant.id, slug: 'finanhub-headquarters' } },
    update: {},
    create: {
      tenantId: tenant.id,
      slug: 'finanhub-headquarters',
      name: 'FINANHUB Headquarters',
      isVerified: true
    }
  });

  await prisma.companyMember.create({
    data: { companyId: company.id, userId: user.id, role: 'OWNER' }
  });

  console.log(`✅ Headquarters da operação e Membros populados`);

  console.log('🚀 Seed Completo.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
