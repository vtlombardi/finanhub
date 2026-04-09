-- Migration: add_missing_fields
-- Adds fields present in the Prisma schema but absent from the initial migration

-- User: email verification fields
ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "verificationCode" TEXT,
  ADD COLUMN IF NOT EXISTS "verificationCodeExpires" TIMESTAMP(3);

-- Listing: owner relation
ALTER TABLE "Listing"
  ADD COLUMN IF NOT EXISTS "ownerId" TEXT;

ALTER TABLE "Listing"
  ADD CONSTRAINT "Listing_ownerId_fkey"
  FOREIGN KEY ("ownerId") REFERENCES "User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE
  DEFERRABLE INITIALLY DEFERRED;

-- ListingFeature: createdAt timestamp
ALTER TABLE "ListingFeature"
  ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- BusinessHour: createdAt timestamp
ALTER TABLE "BusinessHour"
  ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
