import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  try {
    const user = await (prisma.user as any).findFirst();
    console.log('User model fields:', Object.keys(user || {}));
    
    // Check for one of the new fields
    const newFields = ['phonePrimary', 'jobTitle', 'companyName', 'avatarUrl'];
    const fieldsInModel = Object.keys(user || {});
    const missing = newFields.filter(f => !fieldsInModel.includes(f));
    
    if (missing.length === 0) {
      console.log('✅ All new fields are present in the model.');
    } else {
      console.log('❌ Missing fields:', missing);
    }
  } catch (e) {
    console.error('Error checking schema:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
