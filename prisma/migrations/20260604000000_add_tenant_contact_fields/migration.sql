-- AlterTable: add contact fields to Tenant
ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "phone"   TEXT;
ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "address" TEXT;
ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "taxId"   TEXT;
