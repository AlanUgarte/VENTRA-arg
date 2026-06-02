-- CreateEnum
CREATE TYPE "ReturnStatus" AS ENUM ('PENDING', 'CREDITED', 'REPLACED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ReturnReason" AS ENUM ('BROKEN', 'EXPIRED', 'DEFECTIVE', 'WRONG_ITEM', 'OTHER');

-- CreateTable
CREATE TABLE "SupplierReturn" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "productId" TEXT,
    "productName" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "reason" "ReturnReason" NOT NULL,
    "reasonDetail" TEXT,
    "status" "ReturnStatus" NOT NULL DEFAULT 'PENDING',
    "creditAmount" DECIMAL(12,2),
    "returnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupplierReturn_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SupplierReturn_tenantId_idx" ON "SupplierReturn"("tenantId");

-- CreateIndex
CREATE INDEX "SupplierReturn_tenantId_supplierId_idx" ON "SupplierReturn"("tenantId", "supplierId");

-- CreateIndex
CREATE INDEX "SupplierReturn_tenantId_status_idx" ON "SupplierReturn"("tenantId", "status");

-- AddForeignKey
ALTER TABLE "SupplierReturn" ADD CONSTRAINT "SupplierReturn_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierReturn" ADD CONSTRAINT "SupplierReturn_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierReturn" ADD CONSTRAINT "SupplierReturn_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
