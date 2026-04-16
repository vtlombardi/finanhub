import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const tenantId = 'ad92ebe6-b06c-40b2-a9d0-5d338812930b'; // Tenant Principal
  const categorySlug = 'servicos-e-consultoria';
  const categoryName = 'Serviços e Consultoria';

  console.log(`[Sync] Iniciando sincronização para: ${categoryName}`);

  // 1. Garantir categoria principal
  const category = await prisma.category.upsert({
    where: { tenantId_slug: { tenantId, slug: categorySlug } },
    update: { name: categoryName, iconClass: 'Briefcase' },
    create: {
      id: 'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a', // ID Fixo para estabilidade
      tenantId,
      slug: categorySlug,
      name: categoryName,
      iconClass: 'Briefcase',
      description: 'Consultoria estratégica, serviços especializados e soluções corporativas.'
    }
  });

  console.log(`[Sync] Categoria ID: ${category.id}`);

  // 2. Garantir Subcategorias (Criadas como categorias independentes dada a flat-structure atual)
  const subcategories = [
    { id: 'e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b', slug: 'consultoria-estrategica', name: 'Consultoria Estratégica' },
    { id: 'f6a7b8c9-d0e1-4f2a-3b4c-5d6e7f8a9b0c', slug: 'consultoria-financeira', name: 'Consultoria Financeira' },
    { id: 'a7b8c9d0-e1f2-4a3b-4c5d-6e7f8a9b0c1d', slug: 'servicos-operacionais', name: 'Serviços Operacionais' },
    { id: 'b8c9d0e1-f2a3-4b4c-5d6e-7f8a9b0c1d2e', slug: 'outsourcing-bpo', name: 'Outsourcing e BPO' }
  ];

  for (const sub of subcategories) {
    await prisma.category.upsert({
      where: { tenantId_slug: { tenantId, slug: sub.slug } },
      update: { name: sub.name },
      create: {
        id: sub.id,
        tenantId,
        slug: sub.slug,
        name: sub.name,
        description: `Subcategoria de ${categoryName}.`
      }
    });
  }

  // 3. Atributos Técnicos (14 total)
  const attributes = [
    // Mandatory (8)
    { id: 's1a2b3c4-d5e6-4f7g-8h9i-0j1k2l3m4n5o', name: 'serviceType', label: 'Tipo de Serviço', type: 'STRING', isRequired: true },
    { id: 's2a2b3c4-d5e6-4f7g-8h9i-0j1k2l3m4n5o', name: 'expertiseArea', label: 'Área de Atuação / Especialidade', type: 'STRING', isRequired: true },
    { id: 's3a2b3c4-d5e6-4f7g-8h9i-0j1k2l3m4n5o', name: 'targetAudience', label: 'Público-Alvo', type: 'STRING', isRequired: true },
    { id: 's4a2b3c4-d5e6-4f7g-8h9i-0j1k2l3m4n5o', name: 'hiringModel', label: 'Modelo de Contratação', type: 'STRING', isRequired: true },
    { id: 's5a2b3c4-d5e6-4f7g-8h9i-0j1k2l3m4n5o', name: 'methodology', label: 'Metodologia de Trabalho', type: 'STRING', isRequired: true },
    { id: 's6a2b3c4-d5e6-4f7g-8h9i-0j1k2l3m4n5o', name: 'experienceTime', label: 'Tempo de Experiência', type: 'STRING', isRequired: true },
    { id: 's7a2b3c4-d5e6-4f7g-8h9i-0j1k2l3m4n5o', name: 'deliveryFormat', label: 'Formato de Entrega', type: 'STRING', isRequired: true },
    { id: 's8a2b3c4-d5e6-4f7g-8h9i-0j1k2l3m4n5o', name: 'pricingModel', label: 'Modelo de Precificação', type: 'STRING', isRequired: true },

    // Optional (6)
    { id: 's9a2b3c4-d5e6-4f7g-8h9i-0j1k2l3m4n5o', name: 'casesSuccess', label: 'Cases de Sucesso / Portfólio', type: 'STRING', isRequired: false },
    { id: 's10a2b3c4-d5e6-4f7g-8h9i-0j1k2l3m4n5o', name: 'certifications', label: 'Certificações / Selos', type: 'STRING', isRequired: false },
    { id: 's11a2b3c4-d5e6-4f7g-8h9i-0j1k2l3m4n5o', name: 'expectedResults', label: 'Resultados Esperados', type: 'STRING', isRequired: false },
    { id: 's12a2b3c4-d5e6-4f7g-8h9i-0j1k2l3m4n5o', name: 'differential', label: 'Diferenciais Competitivos', type: 'STRING', isRequired: false },
    { id: 's13a2b3c4-d5e6-4f7g-8h9i-0j1k2l3m4n5o', name: 'serviceScope', label: 'Escopo Detalhado', type: 'STRING', isRequired: false },
    { id: 's14a2b3c4-d5e6-4f7g-8h9i-0j1k2l3m4n5o', name: 'clientPortfolio', label: 'Principais Clientes', type: 'STRING', isRequired: false }
  ];

  for (const attr of attributes) {
    await prisma.categoryAttribute.upsert({
      where: { categoryId_name: { categoryId: category.id, name: attr.name } },
      update: { label: attr.label, type: attr.type, isRequired: attr.isRequired },
      create: {
        id: attr.id,
        tenantId,
        categoryId: category.id,
        name: attr.name,
        label: attr.label,
        type: attr.type,
        isRequired: attr.isRequired
      }
    });
  }

  console.log(`[Sync] Sincronização de 14 atributos concluída.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
