console.log('JS TEST START');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  console.log('PRISMA CONNECTING...');
  const count = await prisma.listing.count();
  console.log('COUNT:', count);
}
run().then(() => {
  console.log('JS TEST END');
  process.exit(0);
}).catch(err => {
  console.error('ERROR:', err);
  process.exit(1);
});
