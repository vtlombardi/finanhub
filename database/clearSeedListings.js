const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  console.log("🧹 Iniciando limpeza do ambiente de teste (JS)...");

  const controlPath = path.join(__dirname, 'seedControl.json');
  let controlData = { ids: [] };

  if (fs.existsSync(controlPath)) {
    controlData = JSON.parse(fs.readFileSync(controlPath, 'utf8'));
  }

  const SEED_TAG = "finanhub_seed_v1";

  console.log("🗑️ Deletando anúncios rastreados...");
  const deleted = await prisma.listing.deleteMany({
    where: {
      OR: [
        { id: { in: controlData.ids } },
        { seedTag: SEED_TAG },
        { isTest: true }
      ]
    }
  });

  console.log(`✅ Foram removidos ${deleted.count} anúncios de teste.`);

  const resetData = {
    seed: SEED_TAG,
    lastCleared: new Date().toISOString(),
    ids: []
  };
  fs.writeFileSync(controlPath, JSON.stringify(resetData, null, 2));

  console.log("✨ Ambiente limpo!");
}

main()
  .catch((e) => {
    console.error("❌ Erro na Limpeza:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
