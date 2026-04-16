const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const CATEGORY_ID = 'e788eb9e-42fc-498d-9cd8-c3dcb4037bf9'; // Startups e Tecnologia

const STARTUP_ATTRIBUTES = [
  { name: 'startupStage', label: 'Estágio do Negócio', type: 'select', options: ['MVP', 'MVP em Validação', 'Tração Inicial', 'Tração Consolidada', 'Escala/Scale-up'] },
  { name: 'targetSector', label: 'Setor de Atuação', type: 'string' },
  { name: 'fundingRound', label: 'Tipo de Captação / Rodada', type: 'select', options: ['Angel', 'Pre-Seed', 'Seed', 'Series A', 'Series B+', 'Bridge'] },
  { name: 'fundingAmountRequested', label: 'Investimento Buscado', type: 'number' },
  { name: 'equityOffered', label: 'Equity Oferecido (%)', type: 'string' },
  { name: 'businessModelType', label: 'Modelo de Receita', type: 'string' },
  { name: 'mrrCurrent', label: 'MRR / Faturamento Mensal', type: 'number' },
  { name: 'tamMarketSize', label: 'Mercado Total (TAM)', type: 'string' },
  { name: 'foundingTeamBrief', label: 'Time Fundador', type: 'text' },
  { name: 'techStackBrief', label: 'Tecnologia / Stack', type: 'text' },
  { name: 'validationPOCBrief', label: 'Validação / POC', type: 'text' },
  { name: 'startupProblem', label: 'Problema Resolvido', type: 'text' },
  { name: 'startupSolution', label: 'Solução Proposta', type: 'text' },
  { name: 'competitiveEdge', label: 'Diferencial Competitivo', type: 'text' },
  { name: 'useOfCapital', label: 'Uso dos Recursos', type: 'text' },
  { name: 'growthPotentialBrief', label: 'Potencial de Escala', type: 'text' }
];

async function main() {
  console.log('--- Garantindo Atributos para Startups e Tecnologia ---');
  
  // Pegar o tenant padrão (assumindo o primeiro para este ambiente de teste/dev)
  const tenant = await prisma.tenant.findFirst();
  if (!tenant) throw new Error('Tenant não encontrado');

  for (const attr of STARTUP_ATTRIBUTES) {
    const existing = await prisma.categoryAttribute.findFirst({
      where: {
        categoryId: CATEGORY_ID,
        name: attr.name
      }
    });

    if (existing) {
      console.log(`Attribute ${attr.name} already exists. Skipping.`);
      continue;
    }

    await prisma.categoryAttribute.create({
      data: {
        tenantId: tenant.id,
        categoryId: CATEGORY_ID,
        name: attr.name,
        label: attr.label,
        type: attr.type,
        isRequired: true
      }
    });
    console.log(`Created attribute: ${attr.label} (${attr.name})`);
  }

  console.log('--- Concluído ---');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
