-- DropIndex
DROP INDEX "BusinessHour_listingId_idx";

-- DropIndex
DROP INDEX "ListingFeature_listingId_idx";

-- AlterTable
ALTER TABLE "Listing" ALTER COLUMN "country" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "ChatThread_leadId_idx" ON "ChatThread"("leadId");

-- CreateIndex
CREATE INDEX "Listing_categoryId_status_idx" ON "Listing"("categoryId", "status");

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
