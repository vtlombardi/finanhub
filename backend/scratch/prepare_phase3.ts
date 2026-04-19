import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('--- PREPARANDO FASE 3: LEAD / INTERESSE ---');

  const hashedPassword = await bcrypt.hash('password123', 10);

  // 1. Garantir Investidor de Homologação
  const investorEmail = 'homolog_investor@finanhub.com.br';
  const investor = await prisma.user.upsert({
    where: { email: investorEmail },
    update: {
      role: 'USER',
      fullName: 'HOMOLOG INVESTIDOR',
    },
    create: {
      email: investorEmail,
      password: hashedPassword,
      fullName: 'HOMOLOG INVESTIDOR',
      role: 'USER',
    },
  });
  console.log('Investidor pronto:', investor.email);

  // 2. Localizar Anúncio Principal
  const listingId = 'b808be19-034c-47d1-a58d-0f4865477b9e';
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: { tenant: true }
  });

  if (!listing) {
    console.error('ERRO: Anúncio HOMOLOG_STABILIZED_V3_FINAL não encontrado!');
    return;
  }

  // Garantir que está ativo
  await prisma.listing.update({
    where: { id: listingId },
    data: { status: 'ACTIVE' }
  });
  console.log('Anúncio ativo para homologação:', listing.title);

  // 3. Limpar leads anteriores entre este investidor e este anúncio (para evitar duplicidade no teste)
  const deletedLeads = await prisma.lead.deleteMany({
    where: {
      listingId: listingId,
      investorId: investor.id
    }
  });
  console.log('Leads antigos removidos:', deletedLeads.count);

  console.log('\n--- CENÁRIO PRONTO ---');
  console.log('Investidor:', investorEmail);
  console.log('Vendedor:', listing.tenant.name);
  console.log('---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
