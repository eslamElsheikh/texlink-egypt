-- Mirrors prisma/migrations_postgresql/20261125000000_factory_only_attributes
ALTER TABLE "FactoryProfile"
  ADD COLUMN IF NOT EXISTS "commercialRegStatus" TEXT NOT NULL DEFAULT 'UNREGISTERED',
  ADD COLUMN IF NOT EXISTS "taxRegStatus" TEXT NOT NULL DEFAULT 'UNREGISTERED',
  ADD COLUMN IF NOT EXISTS "workerCount" INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS "machineCount" INTEGER NOT NULL DEFAULT 1,
  ALTER COLUMN "minOrderQuantity" SET DEFAULT 1,
  ALTER COLUMN "monthlyCapacity" SET DEFAULT 1;

UPDATE "FactoryProfile" fp
SET "commercialRegStatus" = CASE fd."status" WHEN 'APPROVED' THEN 'VERIFIED' ELSE fd."status" END
FROM "FactoryDocument" fd
WHERE fd."factoryId" = fp."id"
  AND fd."type" = 'COMMERCIAL_REGISTER'
  AND fp."commercialRegStatus" = 'UNREGISTERED';

UPDATE "FactoryProfile" fp
SET "taxRegStatus" = CASE fd."status" WHEN 'APPROVED' THEN 'VERIFIED' ELSE fd."status" END
FROM "FactoryDocument" fd
WHERE fd."factoryId" = fp."id"
  AND fd."type" = 'TAX_CARD'
  AND fp."taxRegStatus" = 'UNREGISTERED';
