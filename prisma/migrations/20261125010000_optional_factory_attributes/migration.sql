-- Mirrors prisma/migrations_postgresql/20261125010000_optional_factory_attributes
ALTER TABLE "FactoryProfile"
  ALTER COLUMN "establishedYear" DROP NOT NULL,
  ALTER COLUMN "establishedYear" DROP DEFAULT,
  ALTER COLUMN "monthlyCapacity" DROP NOT NULL,
  ALTER COLUMN "monthlyCapacity" DROP DEFAULT;

UPDATE "FactoryProfile" fp
SET "commercialRegStatus" = sub.mapped_status
FROM (
  SELECT DISTINCT ON ("factoryId")
    "factoryId",
    CASE "status" WHEN 'APPROVED' THEN 'VERIFIED' ELSE "status" END AS mapped_status
  FROM "FactoryDocument"
  WHERE "type" = 'COMMERCIAL_REGISTER'
  ORDER BY
    "factoryId",
    CASE "status" WHEN 'APPROVED' THEN 1 WHEN 'PENDING' THEN 2 ELSE 3 END,
    "uploadedAt" DESC
) sub
WHERE sub."factoryId" = fp."id"
  AND fp."commercialRegStatus" = 'UNREGISTERED';

UPDATE "FactoryProfile" fp
SET "taxRegStatus" = sub.mapped_status
FROM (
  SELECT DISTINCT ON ("factoryId")
    "factoryId",
    CASE "status" WHEN 'APPROVED' THEN 'VERIFIED' ELSE "status" END AS mapped_status
  FROM "FactoryDocument"
  WHERE "type" = 'TAX_CARD'
  ORDER BY
    "factoryId",
    CASE "status" WHEN 'APPROVED' THEN 1 WHEN 'PENDING' THEN 2 ELSE 3 END,
    "uploadedAt" DESC
) sub
WHERE sub."factoryId" = fp."id"
  AND fp."taxRegStatus" = 'UNREGISTERED';
