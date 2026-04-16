import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Iniciando Padronização da Categoria Franquias e Licenciamento ---');

  // 1. Localizar Tenant
  const tenant = await prisma.tenant.findFirst();
  if (!tenant) throw new Error('Nenhum Tenant encontrado.');

  // 2. Localizar ou Criar Categoria Principal
  let mainCategory = await prisma.category.findFirst({
    where: { 
      tenantId: tenant.id,
      slug: 'franquias-e-licenciamento'
    }
  });

  if (!mainCategory) {
    mainCategory = await prisma.category.create({
      data: {
        tenantId: tenant.id,
        name: 'Franquias e Licenciamento',
        slug: 'franquias-e-licenciamento',
        description: 'Oportunidades em franquias formatadas, modelos de licenciamento e expansão de marcas.',
        iconClass: 'Store'
      }
    });
    console.log(`Categoria principal criada: ${mainCategory.name}`);
  }

  // 3. Criar Subcategorias se não existirem
  const subcategories = [
    { name: 'Comprar Franquias', slug: 'comprar-franquias' },
    { name: 'Vender Franquias', slug: 'vender-franquias' },
    { name: 'Licenciamento de Produtos', slug: 'licenciamento-de-produtos' },
    { name: 'Licenciamento de Marcas', slug: 'licenciamento-de-marcas' }
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
          // Em um sistema com parentId, ligaríamos aqui. 
          // Se não houver, tratamos como categoria vinculada via lógica de slug.
        }
      });
      console.log(`Subcategoria criada: ${sub.name}`);
    }
  }

  // 4. Definir Atributos Obrigatórios para a categoria principal
  const requiredAttributes = [
    { name: 'franchiseName', label: 'Nome da Franquia / Marca', type: 'STRING' },
    { name: 'initialInvestmentTotal', label: 'Investimento Inicial Total', type: 'DECIMAL' },
    { name: 'franchiseFee', label: 'Taxa de Franquia', type: 'DECIMAL' },
    { name: 'averageEstimatedRevenue', label: 'Faturamento Médio Estimado', type: 'DECIMAL' },
    { name: 'estimatedPayback', label: 'Prazo de Retorno Estimado', type: 'STRING' },
    { name: 'operationModel', label: 'Modelo de Operação', type: 'STRING' },
    { name: 'royaltiesFee', label: 'Taxa de Royalties', type: 'STRING' },
    { name: 'marketingFee', label: 'Taxa de Marketing', type: 'STRING' },
    { name: 'supportOffered', label: 'Suporte Oferecido', type: 'STRING' },
    { name: 'trainingIncluded', label: 'Treinamento Incluso', type: 'STRING' },
    { name: 'openedUnitsCount', label: 'Nº de Unidades Abertas', type: 'INTEGER' },
    { name: 'idealFranchiseeProfile', label: 'Perfil Ideal do Franqueado', type: 'STRING' },
    { name: 'territorialExclusivity', label: 'Exclusividade Territorial', type: 'STRING' },
    { name: 'expansionRegion', label: 'Região de Expansão', type: 'STRING' }
  ];

  for (const attr of requiredAttributes) {
    // Aplicar à categoria principal
    const existing = await prisma.categoryAttribute.findFirst({
      where: {
        categoryId: mainCategory.id,
        name: attr.name
      }
    });

    if (!existing) {
      await prisma.categoryAttribute.create({
        data: {
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

  console.log('--- Padronização de Franquias Concluída ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
