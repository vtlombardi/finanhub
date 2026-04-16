import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CATEGORY_ID = '7c9b3a2e-5f1d-48c2-a9e0-81f9b3c4d5e6';
const TENANT_ID = 'ad92ebe6-b06c-40b2-a9d0-5d338812930b';

const ATIVOS_ATTRIBUTES = [
  // OBRIGATÓRIOS
  { id: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', name: 'assetType', label: 'Tipo de Ativo', type: 'STRING', isRequired: true },
  { id: 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', name: 'conservationState', label: 'Estado de Conservação', type: 'STRING', isRequired: true },
  { id: 'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f', name: 'availability', label: 'Disponibilidade para Retirada', type: 'STRING', isRequired: true },
  { id: 'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a', name: 'fabricationYear', label: 'Ano de Fabricação', type: 'STRING', isRequired: true },
  { id: 'e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b', name: 'productiveCapacity', label: 'Capacidade Produtiva / Técnica', type: 'STRING', isRequired: true },
  { id: 'd0e1f2a3-b4c5-5d6e-7f8a-9b0c1d2e3f4a', name: 'assetLocation', label: 'Localização do Ativo (Cidade/UF)', type: 'STRING', isRequired: true },
  { id: 'e1f2a3b4-c5d6-6e7f-8a9b-0c1d2e3f4a5b', name: 'technicalInspection', label: 'Laudo Técnico Disponível', type: 'STRING', isRequired: true },
  { id: 'b8c9d0e1-f2a3-4b4c-5d6e-7f8a9b0c1d2e', name: 'documentationStatus', label: 'Status da Documentação / NF', type: 'STRING', isRequired: true },

  // OPCIONAIS
  { id: 'f6a7b8c9-d0e1-4f2a-3b4c-5d6e7f8a9b0c', name: 'usageHistory', label: 'Histórico de Uso (Horas/KM)', type: 'STRING', isRequired: false },
  { id: 'a7b8c9d0-e1f2-4a3b-4c5d-6e7f8a9b0c1d', name: 'financingPossibility', label: 'Possibilidade de Financiamento / Parcelamento', type: 'STRING', isRequired: false },
  { id: 'c9d0e1f2-a3b4-4c5d-6e7f-8a9b0c1d2e3f', name: 'includedItems', label: 'Itens Inclusos', type: 'STRING', isRequired: false },
  { id: 'a2b3c4d5-e6f7-4a8b-9c0d-1e2f3a4b5c6e', name: 'warranty', label: 'Garantia', type: 'STRING', isRequired: false },
  { id: 'b3c4d5e6-f7a8-4c9d-0e1f-2a3b4c5d6e7f', name: 'logisticsNote', label: 'Nota Logística / Retirada', type: 'STRING', isRequired: false },
  { id: 'c4d5e6f7-a8b9-4d0e-1f2a-3b4c5d6e7f8a', name: 'lastMaintenance', label: 'Última Manutenção / Revisão', type: 'STRING', isRequired: false },
];

async function main() {
  console.log('--- Iniciando Garantia de Atributos: Ativos e Estruturas (Refinado) ---');

  for (const attr of ATIVOS_ATTRIBUTES) {
    await prisma.categoryAttribute.upsert({
      where: { id: attr.id },
      update: {
        name: attr.name,
        label: attr.label,
        type: attr.type,
        isRequired: attr.isRequired,
      },
      create: {
        id: attr.id,
        tenantId: TENANT_ID,
        categoryId: CATEGORY_ID,
        name: attr.name,
        label: attr.label,
        type: attr.type,
        isRequired: attr.isRequired,
      },
    });
    console.log(`Attribute "${attr.name}" garantido (Obrigatório: ${attr.isRequired}).`);
  }

  // Remove assetModel se existir para seguir assetType exclusivamente
  try {
    await prisma.categoryAttribute.delete({ where: { id: 'f1a2b3c4-d5e6-4a7b-8c9d-0e1f2a3b4c5d' } });
    console.log('Attribute "assetModel" removido para unificação.');
  } catch (e) {}

  console.log('--- Finalizado com Sucesso ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
