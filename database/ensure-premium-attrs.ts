import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Iniciando sincronização de atributos: Oportunidades Premium...');

  // 1. Garantir Tenant
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'test-environment' },
    update: {},
    create: {
      slug: 'test-environment',
      name: 'Finanhub Test Environment'
    }
  });

  const categoryId = 'p7e8f9a0-b1c2-4d3e-8f9a-0b1c2d3e4f5a'; // ID principal - PREMIUM
  
  // 2. Garantir Categoria Principal
  console.log(`📂 Garantindo Categoria [${categoryId}]...`);
  await prisma.category.upsert({
    where: { id: categoryId },
    update: {
      name: 'Oportunidades Premium',
      slug: 'oportunidades-premium',
      iconClass: 'star'
    },
    create: {
      id: categoryId,
      tenantId: tenant.id,
      name: 'Oportunidades Premium',
      slug: 'oportunidades-premium',
      iconClass: 'star'
    }
  });

  // 3. Atributos Premium (16 Financeiros e Operacionais)
  const attributes = [
    { id: 'pr01-b0c1-d2e3-4f4a-b5c6-d7e8f9a0b1c2', name: 'premiumType', label: 'Tipologia Premium' },
    { id: 'pr02-b0c1-d2e3-4f4a-b5c6-d7e8f9a0b1c2', name: 'executiveSummary', label: 'Sumário Executivo' },
    { id: 'pr03-b0c1-d2e3-4f4a-b5c6-d7e8f9a0b1c2', name: 'revenueLtm', label: 'Faturamento LTM (Últimos 12 meses)' },
    { id: 'pr04-b0c1-d2e3-4f4a-b5c6-d7e8f9a0b1c2', name: 'roi', label: 'ROI Estimado (%)' },
    { id: 'pr05-b0c1-d2e3-4f4a-b5c6-d7e8f9a0b1c2', name: 'valuationEstimated', label: 'Valuation Estimado (R$)' },
    { id: 'pr06-b0c1-d2e3-4f4a-b5c6-d7e8f9a0b1c2', name: 'marginLiquida', label: 'Margem Líquida (%)' },
    { id: 'pr07-b0c1-d2e3-4f4a-b5c6-d7e8f9a0b1c2', name: 'paybackEstimated', label: 'Payback Estimado (meses)' },
    { id: 'pr08-b0c1-d2e3-4f4a-b5c6-d7e8f9a0b1c2', name: 'growthHistory', label: 'Crescimento Histórico (% a.a.)' },
    { id: 'pr09-b0c1-d2e3-4f4a-b5c6-d7e8f9a0b1c2', name: 'ebitdaPremium', label: 'EBITDA (R$)' },
    { id: 'pr10-b0c1-d2e3-4f4a-b5c6-d7e8f9a0b1c2', name: 'ticketMinimo', label: 'Ticket de Investimento Mínimo (R$)' },
    { id: 'pr11-b0c1-d2e3-4f4a-b5c6-d7e8f9a0b1c2', name: 'dataRoomStatus', label: 'Status do Data Room (VDR)' },
    { id: 'pr12-b0c1-d2e3-4f4a-b5c6-d7e8f9a0b1c2', name: 'confidentialityLevel', label: 'Nível de Confidencialidade' },
    { id: 'pr13-b0c1-d2e3-4f4a-b5c6-d7e8f9a0b1c2', name: 'operationStructure', label: 'Estrutura da Operação' },
    { id: 'pr14-b0c1-d2e3-4f4a-b5c6-d7e8f9a0b1c2', name: 'financialHistory', label: 'Breve Histérico Financeiro' },
    { id: 'pr15-b0c1-d2e3-4f4a-b5c6-d7e8f9a0b1c2', name: 'growthStrategy', label: 'Estratégia de Crescimento' },
    { id: 'pr16-b0c1-d2e3-4f4a-b5c6-d7e8f9a0b1c2', name: 'idealInvestorProfile', label: 'Perfil Ideal de Investidor' },
  ];

  console.log('🧪 Sincronizando Atributos...');
  for (const attr of attributes) {
    const isNumeric = [
      'revenueLtm', 'roi', 'valuationEstimated', 'marginLiquida', 
      'paybackEstimated', 'growthHistory', 'ebitdaPremium', 'ticketMinimo'
    ].includes(attr.name);

    await prisma.categoryAttribute.upsert({
      where: { id: attr.id },
      update: {
        name: attr.name,
        label: attr.label,
        categoryId: categoryId,
        type: isNumeric ? 'NUMBER' : 'STRING'
      },
      create: {
        id: attr.id,
        tenantId: tenant.id,
        categoryId: categoryId,
        name: attr.name,
        label: attr.label,
        type: isNumeric ? 'NUMBER' : 'STRING',
        isRequired: false
      }
    });
  }

  console.log('✅ Sincronização concluída com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante a sincronização:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
