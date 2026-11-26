-- SQLite-only additive migration for Factory-Only attributes
-- Note: SQLite does not support `ADD COLUMN IF NOT EXISTS` or PostgreSQL `UPDATE ... FROM` across older builds.
ALTER TABLE "FactoryProfile" ADD COLUMN "commercialRegStatus" TEXT NOT NULL DEFAULT 'UNREGISTERED';
ALTER TABLE "FactoryProfile" ADD COLUMN "taxRegStatus" TEXT NOT NULL DEFAULT 'UNREGISTERED';
ALTER TABLE "FactoryProfile" ADD COLUMN "workerCount" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "FactoryProfile" ADD COLUMN "machineCount" INTEGER NOT NULL DEFAULT 1;

UPDATE "FactoryProfile"
SET "commercialRegStatus" = COALESCE(
  (SELECT CASE "status" WHEN 'APPROVED' THEN 'VERIFIED' ELSE "status" END
   FROM "FactoryDocument"
   WHERE "FactoryDocument"."factoryId" = "FactoryProfile"."id"
     AND "FactoryDocument"."type" = 'COMMERCIAL_REGISTER'
   ORDER BY CASE "status" WHEN 'APPROVED' THEN 1 WHEN 'PENDING' THEN 2 ELSE 3 END, "uploadedAt" DESC
   LIMIT 1),
  'UNREGISTERED'
);

UPDATE "FactoryProfile"
SET "taxRegStatus" = COALESCE(
  (SELECT CASE "status" WHEN 'APPROVED' THEN 'VERIFIED' ELSE "status" END
   FROM "FactoryDocument"
   WHERE "FactoryDocument"."factoryId" = "FactoryProfile"."id"
     AND "FactoryDocument"."type" = 'TAX_CARD'
   ORDER BY CASE "status" WHEN 'APPROVED' THEN 1 WHEN 'PENDING' THEN 2 ELSE 3 END, "uploadedAt" DESC
   LIMIT 1),
  'UNREGISTERED'
);
