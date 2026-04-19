const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const prisma = new PrismaClient();

async function main() {
  console.log('--- PREPARANDO FASE 3: LEAD / INTERESSE (JS VERSION V2) ---');

  const hashedPassword = await bcrypt.hash('password123', 10);

  // 1. Localizar Anúncio Principal para extrair o Tenant
  const listingId = 'b808be19-034c-47d1-a58d-0f4865477b9e';
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: { tenant: true }
  });

  if (!listing) {
    console.error('ERRO: Anúncio HOMOLOG_STABILIZED_V3_FINAL não encontrado!');
    return;
  }

  const tenantId = listing.tenantId;
  console.log('Tenant ID detectado:', tenantId, '(', listing.tenant.name, ')');

  // 2. Garantir Investidor de Homologação no mesmo Tenant
  const investorEmail = 'homolog_investor@finanhub.com.br';
  const investor = await prisma.user.upsert({
    where: { 
      tenantId_email: {
        tenantId: tenantId,
        email: investorEmail
      }
    },
    update: {
      role: 'USER',
      fullName: 'HOMOLOG INVESTIDOR',
      passwordHash: hashedPassword // Resetar senha para garantir
    },
    create: {
      tenantId: tenantId,
      email: investorEmail,
      passwordHash: hashedPassword,
      fullName: 'HOMOLOG INVESTIDOR',
      role: 'USER',
    },
  });
  console.log('Investidor pronto:', investor.email);

  // 3. Garantir que o anúncio está ativo
  await prisma.listing.update({
    where: { id: listingId },
    data: { status: 'ACTIVE' }
  });
  console.log('Anúncio ativo para homologação:', listing.title);

  // 4. Limpar leads anteriores entre este investidor e este anúncio
  const deletedLeads = await prisma.lead.deleteMany({
    where: {
      listingId: listingId,
      investorId: investor.id
    }
  });
  console.log('Leads antigos removidos:', deletedLeads.count);

  console.log('\n--- CENÁRIO PRONTO ---');
  console.log('Investidor:', investorEmail);
  console.log('Tenant:', listing.tenant.name);
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
