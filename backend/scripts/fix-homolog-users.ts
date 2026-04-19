import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('👷 Iniciando reparo de usuários de homologação...');

  const masterEmail = 'vtlombardi@hotmail.com';
  const masterPass = 'Vitor2906$';
  
  const testEmail = 'vitor@finanhub.com.br';
  const testPass = 'Finanhub2024!';

  const masterHash = await bcrypt.hash(masterPass, 10);
  const testHash = await bcrypt.hash(testPass, 10);

  // 1. Garantir Tenant Corporativo
  console.log('🏢 Sincronizando Tenant: finanhub-corporate');
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'finanhub-corporate' },
    update: {},
    create: {
      name: 'FINANHUB CORPORATE',
      slug: 'finanhub-corporate',
      document: '00.000.000/0001-00',
    },
  });

  // 2. Sincronizar Master Admin
  console.log(`👤 Sincronizando Master Admin: ${masterEmail}`);
  await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: masterEmail } },
    update: {
      passwordHash: masterHash,
      role: Role.ADMIN,
      isEmailVerified: true,
    },
    create: {
      email: masterEmail,
      fullName: 'Vitor Lombardi (Master)',
      passwordHash: masterHash,
      role: Role.ADMIN,
      tenantId: tenant.id,
      isEmailVerified: true,
    },
  });

  // 3. Sincronizar Usuário de Teste
  console.log(`👤 Sincronizando Usuário de Teste: ${testEmail}`);
  await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: testEmail } },
    update: {
      passwordHash: testHash,
      role: Role.OWNER,
      isEmailVerified: true,
    },
    create: {
      email: testEmail,
      fullName: 'Vitor Finanhub (Test)',
      passwordHash: testHash,
      role: Role.OWNER,
      tenantId: tenant.id,
      isEmailVerified: true,
    },
  });

  console.log('✅ Reparo concluído com sucesso!');
  console.log(`\nCREDENCIAIS DISPONÍVEIS:`);
  console.log(`- ${masterEmail} / ${masterPass}`);
  console.log(`- ${testEmail} / ${testPass}`);
}

main()
  .catch((e) => {
    console.error('❌ Erro no reparo:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
