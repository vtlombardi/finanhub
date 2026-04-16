import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Iniciando Padronização da Categoria Ativos e Estruturas ---');

  // 1. Localizar Tenant
  // 1. Localizar Tenant
  let tenant = await prisma.tenant.findFirst({
    where: { slug: 'finanhub-corporate' }
  });
  if (!tenant) {
    tenant = await prisma.tenant.findFirst();
  }
  if (!tenant) throw new Error('Nenhum Tenant encontrado no banco de dados.');

  // 2. Localizar ou Criar Categoria Principal
  const ASSET_CAT_ID = '7c9b3a2e-5f1d-48c2-a9e0-81f9b3c4d5e6';
  
  let mainCategory = await prisma.category.findUnique({
    where: { id: ASSET_CAT_ID }
  });

  if (!mainCategory) {
    mainCategory = await prisma.category.create({
      data: {
        id: ASSET_CAT_ID,
        tenantId: tenant.id,
        name: 'Ativos e Estruturas',
        slug: 'ativos-e-estruturas',
        description: 'Maquinários, equipamentos industriais, frotas, estruturas metálicas e outros ativos produtivos.',
        iconClass: 'Truck'
      }
    });
    console.log(`Categoria principal criada: ${mainCategory.name}`);
  }

  // 3. Criar Subcategorias se não existirem
  const subcategories = [
    { name: 'Comprar Ativos', slug: 'comprar-ativos' },
    { name: 'Vender Ativos', slug: 'vender-ativos' },
    { name: 'Maquinários e Equipamentos', slug: 'maquinarios-e-equipamentos' },
    { name: 'Equipamentos Industriais', slug: 'equipamentos-industriais' },
    { name: 'Frotas e Veículos', slug: 'frotas-e-veiculos' }
  ];

  for (const sub of subcategories) {
    const existing = await prisma.category.findFirst({
      where: { 
        tenantId: tenant.id,
        slug: sub.slug
      }
    });

    if (!existing) {
      await prisma.category.create({
        data: {
          tenantId: tenant.id,
          name: sub.name,
          slug: sub.slug,
          description: `Oportunidades em ${sub.name.toLowerCase()}.`
        }
      });
      console.log(`Subcategoria criada: ${sub.name}`);
    }
  }

  // 4. Definir Atributos Obrigatórios para a categoria principal
  const requiredAttributes = [
    { id: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', name: 'assetType', label: 'Tipo de Ativo', type: 'STRING' },
    { id: 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', name: 'conservationState', label: 'Estado de Conservação', type: 'STRING' },
    { id: 'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f', name: 'availability', label: 'Disponibilidade', type: 'STRING' },
    { id: 'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a', name: 'fabricationYear', label: 'Ano de Fabricação', type: 'STRING' },
    { id: 'e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b', name: 'productiveCapacity', label: 'Capacidade Produtiva', type: 'STRING' },
    { id: 'f6a7b8c9-d0e1-4f2a-3b4c-5d6e7f8a9b0c', name: 'usageHistory', label: 'Histórico de Uso', type: 'STRING' },
    { id: 'a7b8c9d0-e1f2-4a3b-4c5d-6e7f8a9b0c1d', name: 'financingPossibility', label: 'Possibilidade de Financiamento', type: 'STRING' },
    { id: 'b8c9d0e1-f2a3-4b4c-5d6e-7f8a9b0c1d2e', name: 'documentationStatus', label: 'Documentação Regular', type: 'STRING' },
    { id: 'c9d0e1f2-a3b4-4c5d-6e7f-8a9b0c1d2e3f', name: 'includedItems', label: 'Itens Inclusos', type: 'STRING' },
    { id: 'd0e1f2a3-b4c5-5d6e-7f8a-9b0c1d2e3f4a', name: 'assetLocation', label: 'Localização do Ativo (Cidade/UF)', type: 'STRING' },
    { id: 'e1f2a3b4-c5d6-6e7f-8a9b-0c1d2e3f4a5b', name: 'technicalInspection', label: 'Laudo Técnico Disponível', type: 'STRING' }
  ];

  for (const attr of requiredAttributes) {
    const existing = await prisma.categoryAttribute.findFirst({
      where: {
        categoryId: mainCategory.id,
        name: attr.name
      }
    });

    if (!existing) {
      await prisma.categoryAttribute.create({
        data: {
          id: attr.id,
          tenantId: tenant.id,
          categoryId: mainCategory.id,
          name: attr.name,
          label: attr.label,
          type: attr.type,
          isRequired: true
        }
      });
      console.log(`Atributo criado: ${attr.label}`);
    } else {
      if (!existing.isRequired) {
        await prisma.categoryAttribute.update({
          where: { id: existing.id },
          data: { isRequired: true }
        });
        console.log(`Atributo atualizado para obrigatório: ${attr.label}`);
      }
    }
  }

  console.log('--- Padronização de Ativos e Estruturas Concluída ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
