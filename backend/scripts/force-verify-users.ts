
import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  
  const usersToVerify = [
    'investidor@finanhub.com.br',
    'vendedor@finanhub.com.br',
    'vitor@finanhub.com.br',
    'vtlombardi@mac.com',
    'homolog_investor@finanhub.com.br',
    'test_bypass@finanhub.com.br',
    'investidor.homolog@gmail.com'
  ];

  console.log('--- EXECUTANDO ATUALIZAÇÃO DE SEGURANÇA (HOME OFFICE) ---');

  for (const email of usersToVerify) {
    try {
      const user = await prisma.user.findFirst({ where: { email } });
      if (user) {
        await prisma.user.update({
          where: { id: user.id },
          data: { isEmailVerified: true, verificationCode: null, verificationCodeExpires: null }
        });
        console.log(`[OK] Usuário verificado: ${email}`);
      } else {
        console.log(`[!] Usuário não encontrado: ${email}`);
      }
    } catch (e) {
      console.error(`[ERRO] Falha ao atualizar ${email}:`, e);
    }
  }

  await prisma.$disconnect();
}

main();
