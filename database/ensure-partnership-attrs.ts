import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔗 Iniciando sincronização da categoria: Divulgação e Parcerias...');

  // 1. Buscar o Tenant Principal (slug 'finanhub')
  const tenant = await prisma.tenant.findUnique({
    where: { slug: 'finanhub' }
  });

  if (!tenant) {
    console.error('❌ Tenant "finanhub" não encontrado. Abortando.');
    return;
  }

  // 2. Criar ou Atualizar a Categoria
  const categoryId = 'b1c2d3e4-f5a6-4b7c-8d9e-0f1a2b3c4d5e';
  const category = await prisma.category.upsert({
    where: { id: categoryId },
    update: {
      name: 'Divulgação e Parcerias',
      slug: 'divulgacao-parcerias',
      description: 'Oportunidades de parcerias estratégicas, co-branding e canais de divulgação.'
    },
    create: {
      id: categoryId,
      tenantId: tenant.id,
      name: 'Divulgação e Parcerias',
      slug: 'divulgacao-parcerias',
      description: 'Oportunidades de parcerias estratégicas, co-branding e canais de divulgação.'
    }
  });

  console.log(`✅ Categoria Sincronizada: ${category.name} (${category.id})`);

  // 3. Atributos Específicos para Parcerias
  const attributes = [
    { id: 'pa01-b0c1-d2e3-4f4a-b5c6-d7e8f9a0b1c2', name: 'partnershipType', label: 'Tipo de Parceria', type: 'string' },
    { id: 'pa02-b0c1-d2e3-4f4a-b5c6-d7e8f9a0b1c2', name: 'partnershipObjective', label: 'Objetivo da Parceria', type: 'string' },
    { id: 'pa03-b0c1-d2e3-4f4a-b5c6-d7e8f9a0b1c2', name: 'offeredResources', label: 'Recursos Oferecidos', type: 'string' },
    { id: 'pa04-b0c1-d2e3-4f4a-b5c6-d7e8f9a0b1c2', name: 'soughtResources', label: 'Recursos Buscados', type: 'string' },
    { id: 'pa05-b0c1-d2e3-4f4a-b5c6-d7e8f9a0b1c2', name: 'partnershipSegment', label: 'Segmento de Atuação', type: 'string' },
    { id: 'pa06-b0c1-d2e3-4f4a-b5c6-d7e8f9a0b1c2', name: 'reachedAudience', label: 'Público Alcançado', type: 'string' },
    { id: 'pa07-b0c1-d2e3-4f4a-b5c6-d7e8f9a0b1c2', name: 'availableChannels', label: 'Canais Disponíveis', type: 'string' },
    { id: 'pa08-b0c1-d2e3-4f4a-b5c6-d7e8f9a0b1c2', name: 'partnershipFormat', label: 'Formato da Parceria', type: 'string' },
    { id: 'pa09-b0c1-d2e3-4f4a-b5c6-d7e8f9a0b1c2', name: 'expectedResults', label: 'Resultados Esperados', type: 'string' },
    { id: 'pa10-b0c1-d2e3-4f4a-b5c6-d7e8f9a0b1c2', name: 'companyDifferential', label: 'Diferenciais Competitivos', type: 'string' },
    { id: 'pa11-b0c1-d2e3-4f4a-b5c6-d7e8f9a0b1c2', name: 'reachEstimated', label: 'Estimativa de Alcance', type: 'string' },
  ];

  for (const attr of attributes) {
    await prisma.categoryAttribute.upsert({
      where: { categoryId_name: { categoryId: category.id, name: attr.name } },
      update: {
        label: attr.label,
        type: attr.type
      },
      create: {
        id: attr.id,
        tenantId: tenant.id,
        categoryId: category.id,
        name: attr.name,
        label: attr.label,
        type: attr.type
      }
    });
    console.log(`   - Atributo Sincronizado: ${attr.label}`);
  }

  console.log('🚀 Sincronização Finalizada com Sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
