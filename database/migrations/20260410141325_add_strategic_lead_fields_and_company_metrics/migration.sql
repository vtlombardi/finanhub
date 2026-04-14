-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'UNDER_REVIEW', 'QUALIFIED', 'CONTACTED', 'PROPOSAL_SENT', 'WON', 'LOST');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PlanTier" ADD VALUE 'BASE';
ALTER TYPE "PlanTier" ADD VALUE 'PROFESSIONAL';
ALTER TYPE "PlanTier" ADD VALUE 'ELITE';

-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "dealsCount" INTEGER DEFAULT 0,
ADD COLUMN     "responseRate" INTEGER DEFAULT 0,
ADD COLUMN     "responseTime" TEXT,
ADD COLUMN     "trustScore" DECIMAL(3,1),
ADD COLUMN     "yearsActive" INTEGER;

-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "investmentRange" TEXT,
ADD COLUMN     "mediationAccepted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "objective" TEXT,
ADD COLUMN     "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
ADD COLUMN     "userCompany" TEXT,
ADD COLUMN     "userEmail" TEXT,
ADD COLUMN     "userName" TEXT,
ADD COLUMN     "userPhone" TEXT;

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "creditBalance" DECIMAL(15,2) NOT NULL DEFAULT 0;
