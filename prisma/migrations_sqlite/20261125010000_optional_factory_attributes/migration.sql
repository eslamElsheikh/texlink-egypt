-- SQLite-only table redefinition to allow nullable `monthlyCapacity` and `establishedYear`
-- and enforce `minOrderQuantity` default `1` without deleting any rows or breaking foreign keys.
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_FactoryProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "governorate" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "industrialArea" TEXT,
    "address" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "whatsapp" TEXT NOT NULL,
    "bioAr" TEXT NOT NULL,
    "logoUrl" TEXT,
    "coverUrl" TEXT,
    "accountStatus" TEXT NOT NULL DEFAULT 'ACTIVE',
    "verificationStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "commercialRegStatus" TEXT NOT NULL DEFAULT 'UNREGISTERED',
    "taxRegStatus" TEXT NOT NULL DEFAULT 'UNREGISTERED',
    "rejectionReason" TEXT,
    "verifiedAt" DATETIME,
    "workerCount" INTEGER NOT NULL DEFAULT 1,
    "machineCount" INTEGER NOT NULL DEFAULT 1,
    "minOrderQuantity" INTEGER NOT NULL DEFAULT 1,
    "monthlyCapacity" INTEGER,
    "establishedYear" INTEGER,
    "rating" REAL NOT NULL DEFAULT 4.5,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "specialties" TEXT NOT NULL,
    "machines" TEXT NOT NULL,
    "fabrics" TEXT NOT NULL,
    "gallery" TEXT NOT NULL DEFAULT '[]',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FactoryProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO "new_FactoryProfile" (
    "id", "userId", "nameAr", "slug", "governorate", "city", "industrialArea", "address",
    "phone", "whatsapp", "bioAr", "logoUrl", "coverUrl", "accountStatus", "verificationStatus",
    "commercialRegStatus", "taxRegStatus", "rejectionReason", "verifiedAt", "workerCount",
    "machineCount", "minOrderQuantity", "monthlyCapacity", "establishedYear", "rating",
    "reviewCount", "specialties", "machines", "fabrics", "gallery", "featured", "isDemo",
    "createdAt", "updatedAt"
)
SELECT
    "id", "userId", "nameAr", "slug", "governorate", "city", "industrialArea", "address",
    "phone", "whatsapp", "bioAr", "logoUrl", "coverUrl", "accountStatus", "verificationStatus",
    "commercialRegStatus", "taxRegStatus", "rejectionReason", "verifiedAt", "workerCount",
    "machineCount", "minOrderQuantity", "monthlyCapacity", "establishedYear", "rating",
    "reviewCount", "specialties", "machines", "fabrics", "gallery", "featured", "isDemo",
    "createdAt", "updatedAt"
FROM "FactoryProfile";

DROP TABLE "FactoryProfile";
ALTER TABLE "new_FactoryProfile" RENAME TO "FactoryProfile";

CREATE UNIQUE INDEX "FactoryProfile_userId_key" ON "FactoryProfile"("userId");
CREATE UNIQUE INDEX "FactoryProfile_slug_key" ON "FactoryProfile"("slug");
CREATE INDEX "FactoryProfile_isDemo_idx" ON "FactoryProfile"("isDemo");
CREATE INDEX "FactoryProfile_governorate_idx" ON "FactoryProfile"("governorate");
CREATE INDEX "FactoryProfile_industrialArea_idx" ON "FactoryProfile"("industrialArea");

PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
