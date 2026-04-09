-- CreateEnum
CREATE TYPE "DataRoomStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable: confidential documents attached to a listing's data room
CREATE TABLE "DataRoomDocument" (
  "id"        TEXT         NOT NULL,
  "tenantId"  TEXT         NOT NULL,
  "listingId" TEXT         NOT NULL,
  "name"      TEXT         NOT NULL,
  "url"       TEXT         NOT NULL,
  "mediaType" TEXT         NOT NULL DEFAULT 'document',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "DataRoomDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable: investor access requests to a listing's data room
CREATE TABLE "DataRoomRequest" (
  "id"         TEXT              NOT NULL,
  "tenantId"   TEXT              NOT NULL,
  "listingId"  TEXT              NOT NULL,
  "investorId" TEXT              NOT NULL,
  "status"     "DataRoomStatus"  NOT NULL DEFAULT 'PENDING',
  "message"    TEXT,
  "createdAt"  TIMESTAMP(3)      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"  TIMESTAMP(3)      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "DataRoomRequest_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE UNIQUE INDEX "DataRoomRequest_listingId_investorId_key"
  ON "DataRoomRequest"("listingId", "investorId");

CREATE INDEX "DataRoomRequest_tenantId_status_idx"
  ON "DataRoomRequest"("tenantId", "status");

CREATE INDEX "DataRoomDocument_listingId_idx"
  ON "DataRoomDocument"("listingId");

-- Foreign keys: DataRoomDocument
ALTER TABLE "DataRoomDocument"
  ADD CONSTRAINT "DataRoomDocument_listingId_fkey"
  FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "DataRoomDocument"
  ADD CONSTRAINT "DataRoomDocument_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Foreign keys: DataRoomRequest
ALTER TABLE "DataRoomRequest"
  ADD CONSTRAINT "DataRoomRequest_listingId_fkey"
  FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "DataRoomRequest"
  ADD CONSTRAINT "DataRoomRequest_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "DataRoomRequest"
  ADD CONSTRAINT "DataRoomRequest_investorId_fkey"
  FOREIGN KEY ("investorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
