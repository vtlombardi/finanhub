const { PrismaClient } = require('@prisma/client');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const prisma = new PrismaClient();

async function main() {
  console.log('--- DEBUG: TESTE DE CRIAÇÃO DE LEAD ---');

  const listingId = 'b808be19-034c-47d1-a58d-0f4865477b9e';
  const investorEmail = 'homolog_investor@finanhub.com.br';

  const investor = await prisma.user.findFirst({
    where: { email: investorEmail }
  });

  const listing = await prisma.listing.findUnique({
    where: { id: listingId }
  });

  if (!investor || !listing) {
    console.log('Faltam dados: Investor?', !!investor, 'Listing?', !!listing);
    return;
  }

  console.log('Executando Prisma.lead.create...');
  try {
    const lead = await prisma.lead.create({
      data: {
        tenantId: listing.tenantId,
        listingId: listingId,
        investorId: investor.id,
        message: 'TESTE DE DEBUG',
        score: 0,
        status: 'NEW',
      }
    });
    console.log('SUCESSO! Lead ID:', lead.id);
  } catch (error) {
    console.error('ERRO NA CRIAÇÃO DO LEAD:', error);
  }
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
