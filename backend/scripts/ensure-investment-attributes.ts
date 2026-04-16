import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Iniciando Padronização da Categoria Investimentos ---');

  // 1. Localizar Tenant (assumindo o primeiro ou o principal)
  const tenant = await prisma.tenant.findFirst();
  if (!tenant) throw new Error('Nenhum Tenant encontrado.');

  // 2. Localizar ou Criar Categoria "Investimentos"
  let category = await prisma.category.findFirst({
    where: { 
      tenantId: tenant.id,
      OR: [
        { slug: 'investimentos' },
        { name: 'Investimentos' }
      ]
    }
  });

  if (!category) {
    category = await prisma.category.create({
      data: {
        tenantId: tenant.id,
        name: 'Investimentos',
        slug: 'investimentos',
        description: 'Oportunidades de aporte estratégico, Venture Capital, Private Equity e Co-investimentos.',
        iconClass: 'TrendingUp'
      }
    });
    console.log(`Categoria criada: ${category.name}`);
  } else {
    console.log(`Categoria existente: ${category.name}`);
  }

  // 3. Definir Atributos Obrigatórios
  const requiredAttributes = [
    { name: 'tipoDeInvestimento', label: 'Tipo de Investimento', type: 'STRING' },
    { name: 'valorNecessario', label: 'Valor Necessário', type: 'DECIMAL' },
    { name: 'finalidadeCapital', label: 'Finalidade do Capital', type: 'STRING' },
    { name: 'projecaoRetorno', label: 'Projeção de Retorno', type: 'STRING' },
    { name: 'prazoRetorno', label: 'Prazo Estimado de Retorno', type: 'STRING' },
    { name: 'setor', label: 'Setor', type: 'STRING' },
    { name: 'ticketMinimo', label: 'Ticket Mínimo', type: 'DECIMAL' },
    { name: 'modeloMonetizacao', label: 'Modelo de Monetização', type: 'STRING' },
    { name: 'historicoProjeto', label: 'Histórico do Projeto', type: 'STRING' },
    { name: 'garantias', label: 'Garantias', type: 'STRING' },
    { name: 'perfilInvestidor', label: 'Perfil Ideal do Investidor', type: 'STRING' },
    { name: 'estruturaJuridica', label: 'Estrutura Jurídica', type: 'STRING' }
  ];

  for (const attr of requiredAttributes) {
    const existing = await prisma.categoryAttribute.findFirst({
      where: {
        categoryId: category.id,
        name: attr.name
      }
    });

    if (!existing) {
      await prisma.categoryAttribute.create({
        data: {
          tenantId: tenant.id,
          categoryId: category.id,
          name: attr.name,
          label: attr.label,
          type: attr.type,
          isRequired: true
        }
      });
      console.log(`Atributo criado: ${attr.label}`);
    } else {
      // Garantir que seja obrigatório
      if (!existing.isRequired) {
        await prisma.categoryAttribute.update({
          where: { id: existing.id },
          data: { isRequired: true, label: attr.label }
        });
        console.log(`Atributo atualizado para obrigatório: ${attr.label}`);
      }
    }
  }

  console.log('--- Padronização Concluída com Sucesso ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
