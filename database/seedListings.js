const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();
const SEED_TAG = "finanhub_seed_v1";

const CATEGORIES = [
  { name: "Compra e Venda de Empresas", slug: "venda-empresas", icon: "briefcase" },
  { name: "Maquinários e Equipamentos", slug: "maquinarios", icon: "settings" },
  { name: "Imóveis Comerciais", slug: "imoveis-comerciais", icon: "building" },
  { name: "Agronegócio", slug: "agronegocio", icon: "tractor" },
  { name: "Startups e Tecnologia", slug: "startups", icon: "cpu" }
];

const STATES = ["SP", "RJ", "MG", "PR", "SC", "RS", "GO", "MT", "BA", "CE"];
const MODELS = ["Asset Deal", "Share Deal", "Fusão", "Investimento"];
const CATEGORY_IMAGES = {
  "Compra e Venda de Empresas": "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=800&auto=format&fit=crop&q=80",
  "Maquinários e Equipamentos": "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop&q=80",
  "Imóveis Comerciais": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80",
  "Agronegócio": "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop&q=80",
  "Startups e Tecnologia": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80"
};

async function main() {
  console.log("🚀 Iniciando Seeding Controlado (JS)...");

  console.log("🔍 Verificando seeds existentes...");
  const existingSeed = await prisma.listing.findFirst({
    where: { seedTag: SEED_TAG }
  });

  if (existingSeed) {
    console.log("⚠️ Seed já existe no banco. Use npm run clear-seed para limpar antes de rodar novamente.");
    return;
  }

  console.log("🏢 Garantindo Tenant: Finanhub Test Environment...");
  const tenant = await prisma.tenant.upsert({
    where: { slug: "test-environment" },
    update: {},
    create: {
      slug: "test-environment",
      name: "Finanhub Test Environment"
    }
  });

  console.log("🏢 Garantindo Empresa: Finanhub Labs...");
  const company = await prisma.company.upsert({
    where: { tenantId_slug: { tenantId: tenant.id, slug: "finanhub-labs" } },
    update: {},
    create: {
      tenantId: tenant.id,
      slug: "finanhub-labs",
      name: "Finanhub Labs",
      isVerified: true
    }
  });

  console.log("📂 Garantindo Categorias...");
  const createdCategories = [];
  for (const cat of CATEGORIES) {
    const c = await prisma.category.upsert({
      where: { tenantId_slug: { tenantId: tenant.id, slug: cat.slug } },
      update: {},
      create: {
        tenantId: tenant.id,
        slug: cat.slug,
        name: cat.name,
        iconClass: cat.icon
      }
    });
    createdCategories.push(c);
  }

  console.log("📊 Gerando 30 anúncios de teste...");
  const createdIds = [];

  for (let i = 1; i <= 30; i++) {
    const category = createdCategories[i % createdCategories.length];
    const state = STATES[i % STATES.length];
    const model = MODELS[i % MODELS.length];
    const price = Math.floor(Math.random() * 9000000) + 100000;
    
    // Slug único para o database push test
    const timestamp = Date.now();
    const slug = `oportunidade-teste-${i}-${timestamp}`;

    const listing = await prisma.listing.create({
      data: {
        tenantId: tenant.id,
        companyId: company.id,
        categoryId: category.id,
        slug: slug,
        title: `${category.name} em ${state} - Oportunidade #${i}`,
        description: `Esta é uma oportunidade de teste institucional premium. Localizada em ${state}, operando sob o modelo ${model}. Excelente ROI e estrutura consolidada.`,
        price: price,
        state: state,
        logoUrl: CATEGORY_IMAGES[category.name] || "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800",
        status: 'ACTIVE',
        isFeatured: i % 5 === 0,
        isTest: true,
        seedTag: SEED_TAG,
        viewCount: Math.floor(Math.random() * 500)
      }
    });
    createdIds.push(listing.id);
    
    if (i % 5 === 0) console.log(`... ${i}/30 anúncios criados`);

    // IA Insight
    await prisma.aiInsight.create({
      data: {
        listingId: listing.id,
        scamProbability: 0.01,
        flags: ["VERIFICADO", "ALTA_LIQUIDEZ"]
      }
    });
  }

  const controlPath = path.join(__dirname, 'seedControl.json');
  const controlData = {
    seed: SEED_TAG,
    createdAt: new Date().toISOString(),
    ids: createdIds
  };
  fs.writeFileSync(controlPath, JSON.stringify(controlData, null, 2));

  console.log(`✅ Seed concluído com sucesso! ${createdIds.length} anúncios criados.`);
}

main()
  .catch((e) => {
    console.error("❌ Erro no Seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
