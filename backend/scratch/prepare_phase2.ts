
import { PrismaClient, ListingStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('--- STARTING PHASE 2 PREPARATION ---');
  
  // 1. Setup Phase 2 Users
  const adminEmail = 'test_profile@finanhub.com.br';
  const sellerEmail = 'test@finanhub.com.br';
  const password = 'password123';
  const hash = await bcrypt.hash(password, 10);

  console.log('Updating Admin credentials (ADMIN)...');
  await prisma.user.updateMany({
    where: { email: adminEmail },
    data: {
      passwordHash: hash,
      isEmailVerified: true,
      role: 'ADMIN'
    }
  });

  console.log('Updating Seller credentials (USER)...');
  await prisma.user.updateMany({
    where: { email: sellerEmail },
    data: {
      passwordHash: hash,
      isEmailVerified: true,
      role: 'USER'
    }
  });

  // 2. Prepare Listing 1 (The target for Approval)
  const listingId1 = 'b808be19-034c-47d1-a58d-0f4865477b9e';
  console.log('Moving Listing 1 to PENDING_AI_REVIEW...');
  await prisma.listing.update({
    where: { id: listingId1 },
    data: { status: ListingStatus.PENDING_AI_REVIEW }
  });

  // 3. Create Listing 2 (The target for Rejection)
  // We need a valid tenant and company for this listing as well.
  // We will use the same tenant/company as the first user for simplicity in this stage.
  const listing1 = await prisma.listing.findUnique({ where: { id: listingId1 } });
  if (!listing1) {
    throw new Error('Listing 1 not found. Cannot clone context.');
  }

  console.log('Creating Listing 2 for Rejection test...');
  const listing2 = await prisma.listing.create({
    data: {
      title: 'HOMOLOG_FOR_REJECTION_TEST',
      slug: 'homolog-for-rejection-test-' + Date.now(),
      description: 'Este anúncio será usado para validar o fluxo de REJEIÇÃO na moderação.',
      categoryId: listing1.categoryId,
      investmentValue: 50000,
      status: ListingStatus.PENDING_AI_REVIEW,
      tenantId: listing1.tenantId,
      companyId: listing1.companyId,
      ownerId: listing1.ownerId
    }
  });

  console.log('PHASE 2 PREPARATION COMPLETE');
  console.log('Admin: ' + adminEmail + ' / ' + password);
  console.log('Listing 1 (Approve): ' + listingId1);
  console.log('Listing 2 (Reject): ' + listing2.id);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
