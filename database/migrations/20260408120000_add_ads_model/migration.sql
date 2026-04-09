-- CreateEnum
CREATE TYPE "AdPosition" AS ENUM ('LEADERBOARD', 'MOBILE_BANNER', 'SIDEBAR');

-- CreateTable
CREATE TABLE "Ad" (
    "id"        TEXT NOT NULL,
    "tenantId"  TEXT,
    "title"     TEXT NOT NULL,
    "imageUrl"  TEXT,
    "linkUrl"   TEXT NOT NULL,
    "position"  "AdPosition" NOT NULL,
    "isActive"  BOOLEAN NOT NULL DEFAULT true,
    "startsAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endsAt"    TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ad_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Ad_position_isActive_startsAt_idx" ON "Ad"("position", "isActive", "startsAt");

-- AddForeignKey
ALTER TABLE "Ad" ADD CONSTRAINT "Ad_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
