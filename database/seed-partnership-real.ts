import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const tenantId = '7f9e8a7b-6c5d-4e3f-b2a1-0d9c8b7a6f5e'; // Tenant padrão
  const categoryId = 'b1c2d3e4-f5a6-4b7c-8d9e-0f1a2b3c4d5e'; // Divulgação e Parcerias
  const companyId = 'c1b2a3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d'; // Finanhub Corp

  console.log('--- Criando anúncio de Parceria com colunas nativas ---');

  const listing = await prisma.listing.upsert({
    where: {
      tenantId_slug: {
        tenantId,
        slug: 'parceria-estrategica-fintech-2026',
      },
    },
    update: {
      status: 'ACTIVE',
      partnershipType: 'Co-Branding & Canal de Vendas',
      partnershipObjective: 'Expansão de Market Share B2B',
      offeringDescription: 'Base de 150k leads qualificados e consultoria tech',
      seekingDescription: 'Provedores de infraestrutura cloud e IA',
      partnershipSegment: 'Fintech / SaaS',
      audienceReach: '500k views trimestrais em canais Tech',
      channelsAvailable: 'Newsletter, LinkedIn Ads, Eventos',
      partnershipFormat: 'Revenue Share + Co-Marketing',
      expectedResults: 'Aumento de 20% no MRR em 12 meses',
      companyDifferentials: 'Líder em retenção no setor de investimentos',
    },
    create: {
      id: 'demo-parceria-real',
      tenantId,
      categoryId,
      companyId,
      title: 'Aliança Estratégica: Hub de Inovação Fintech',
      slug: 'parceria-estrategica-fintech-2026',
      description: 'Uma oportunidade exclusiva para players do setor de tecnologia se associarem ao ecossistema FINANHUB, visando escala global e integração de soluções de ponta.',
      status: 'ACTIVE',
      partnershipType: 'Co-Branding & Canal de Vendas',
      partnershipObjective: 'Expansão de Market Share B2B',
      offeringDescription: 'Base de 150k leads qualificados e consultoria tech',
      seekingDescription: 'Provedores de infraestrutura cloud e IA',
      partnershipSegment: 'Fintech / SaaS',
      audienceReach: '500k views trimestrais em canais Tech',
      channelsAvailable: 'Newsletter, LinkedIn Ads, Eventos',
      partnershipFormat: 'Revenue Share + Co-Marketing',
      expectedResults: 'Aumento de 20% no MRR em 12 meses',
      companyDifferentials: 'Líder em retenção no setor de investimentos',
      logoUrl: 'https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&q=80&w=1600'
    },
  });

  console.log('Anúncio criado/atualizado:', listing.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
