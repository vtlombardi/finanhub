import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Iniciando sincronização de atributos: Imóveis para Negócios...');

  // 1. Garantir Tenant
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'test-environment' },
    update: {},
    create: {
      slug: 'test-environment',
      name: 'Finanhub Test Environment'
    }
  });

  const categoryId = 'e8a9b0c1-d2e3-4f4a-b5c6-d7e8f9a0b1c2';
  
  // 2. Garantir Categoria
  console.log(`📂 Garantindo Categoria [${categoryId}]...`);
  await prisma.category.upsert({
    where: { id: categoryId },
    update: {
      name: 'Imóveis para Negócios',
      slug: 'imoveis-negocios',
      iconClass: 'building'
    },
    create: {
      id: categoryId,
      tenantId: tenant.id,
      name: 'Imóveis para Negócios',
      slug: 'imoveis-negocios',
      iconClass: 'building'
    }
  });

  // 3. Atributos
  const attributes = [
    { id: 're01-b0c1-d2e3-4f4a-b5c6-d7e8f9a0b1c2', name: 'propertyType', label: 'Tipo de Imóvel' },
    { id: 're02-b0c1-d2e3-4f4a-b5c6-d7e8f9a0b1c2', name: 'zoning', label: 'Zoneamento' },
    { id: 're03-b0c1-d2e3-4f4a-b5c6-d7e8f9a0b1c2', name: 'totalArea', label: 'Área Total (m²)' },
    { id: 're04-b0c1-d2e3-4f4a-b5c6-d7e8f9a0b1c2', name: 'builtArea', label: 'Área Construída (m²)' },
    { id: 're05-b0c1-d2e3-4f4a-b5c6-d7e8f9a0b1c2', name: 'parkingSpaces', label: 'Vagas de Estacionamento' },
    { id: 're06-b0c1-d2e3-4f4a-b5c6-d7e8f9a0b1c2', name: 'infrastructureLevel', label: 'Nível de Infraestrutura' },
    { id: 're07-b0c1-d2e3-4f4a-b5c6-d7e8f9a0b1c2', name: 'strategicValue', label: 'Valor Estratégico / Localização' },
    { id: 're08-b0c1-d2e3-4f4a-b5c6-d7e8f9a0b1c2', name: 'physicalStructure', label: 'Estrutura Física' },
    { id: 're09-b0c1-d2e3-4f4a-b5c6-d7e8f9a0b1c2', name: 'logisticsNote', label: 'Nota Logística' },
    { id: 're10-b0c1-d2e3-4f4a-b5c6-d7e8f9a0b1c2', name: 'adaptationPossible', label: 'Possibilidade de Adaptação' },
    { id: 're11-b0c1-d2e3-4f4a-b5c6-d7e8f9a0b1c2', name: 'negotiationTerms', label: 'Termos de Negociação' },
    { id: 're12-b0c1-d2e3-4f4a-b5c6-d7e8f9a0b1c2', name: 'availability', label: 'Disponibilidade' },
    { id: 're13-b0c1-d2e3-4f4a-b5c6-d7e8f9a0b1c2', name: 'idealPurpose', label: 'Finalidade Ideal' },
  ];

  console.log('🧪 Sincronizando Atributos...');
  for (const attr of attributes) {
    await prisma.categoryAttribute.upsert({
      where: { id: attr.id },
      update: {
        name: attr.name,
        label: attr.label,
        categoryId: categoryId
      },
      create: {
        id: attr.id,
        tenantId: tenant.id,
        categoryId: categoryId,
        name: attr.name,
        label: attr.label,
        type: 'STRING',
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
