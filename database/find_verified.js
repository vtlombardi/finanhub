const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const user = await prisma.user.findFirst({ where: { isEmailVerified: true } });
  console.log(JSON.stringify(user));
  process.exit(0);
}
main();
