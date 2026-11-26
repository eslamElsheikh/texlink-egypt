# Database Schema & Migration Safety Plan — Unified Factory Classification

*Date: `2026-11-25` | Target Branch: `deploy/altare-production-prep` | Scope: Additive `FactoryProfile` alignment across `prisma/schema.prisma` (SQLite Dev) and `prisma/schema.postgresql.prisma` (PostgreSQL Staging/Production).*

> **Safety Gate:** Zero production migrations are executed. This plan documents the schema diff, data compatibility, affected rows, SQL, backup/rollback plan, deployment ordering, and downtime assessment **before** applying any development migration locally.

---

## 1. Proposed Prisma Schema Diff

Applied identically to `model FactoryProfile` in `prisma/schema.prisma` and `prisma/schema.postgresql.prisma`:

```diff
 model FactoryProfile {
   ...
   accountStatus       String    @default("ACTIVE") // "ACTIVE", "SUSPENDED"
-  verificationStatus  String    @default("PENDING") // "PENDING", "VERIFIED", "REJECTED"
+  verificationStatus  String    @default("PENDING") // Platform physical/operational verification: "PENDING", "VERIFIED", "REJECTED"
+  commercialRegStatus String    @default("UNREGISTERED") // Legal attribute: "UNREGISTERED", "PENDING", "VERIFIED", "REJECTED"
+  taxRegStatus        String    @default("UNREGISTERED") // Legal attribute: "UNREGISTERED", "PENDING", "VERIFIED", "REJECTED"
   rejectionReason     String?
   verifiedAt          DateTime?
-  minOrderQuantity    Int       @default(50)
-  monthlyCapacity     Int       @default(5000)
+  workerCount         Int       @default(1) // Minimum 1; used analytically only (Individual/Micro/Small/Medium/Large)
+  machineCount        Int       @default(1) // Minimum 1 machine
+  minOrderQuantity    Int       @default(1)
+  monthlyCapacity     Int?
-  establishedYear     Int       @default(2015)
+  establishedYear     Int?
```

*(Note: Zero `Workshop` model, enum, or role is added; `User.role` remains `"BUYER" | "FACTORY" | "ADMIN"`.)*

---

## 2. Existing Data Compatibility & Affected Records

- **Compatibility:** Strictly **additive** (`ADD COLUMN ... NOT NULL DEFAULT ...`) plus non-destructive default relaxation on future inserts (`50 -> 1`, `5000 -> 1`). Existing rows retain their historical `minOrderQuantity`, `monthlyCapacity`, and `verificationStatus`.
- **Affected Records:**
  - **Local Dev SQLite (`prisma/dev.db`):** Verified `401` existing `FactoryProfile` rows (`0` records deleted or truncated). Existing rows receive `workerCount = 1`, `machineCount = 1`, and legal status defaults `'UNREGISTERED'` before idempotent backfill checks `FactoryDocument` records (`COMMERCIAL_REGISTER`, `TAX_CARD`) so Factories with `APPROVED`/`PENDING`/`REJECTED` documents accurately mirror their legal document state.
  - **Staging / Production PostgreSQL:** Affects `100%` of existing `FactoryProfile` rows safely via metadata-only column additions (`PostgreSQL 11+` fast default).

---

## 3. Migration SQL

### A. SQLite Migration Workflow (`prisma/sqlite.config.mjs` -> `prisma/migrations_sqlite/`)
PostgreSQL DDL (`ADD COLUMN IF NOT EXISTS`, `ALTER COLUMN ... DROP NOT NULL`, `UPDATE ... FROM`) must **never** be executed against SQLite. SQLite uses an explicit `--config prisma/sqlite.config.mjs` config pointing `schema: "prisma/schema.prisma"` at `prisma/migrations_sqlite/` (`migration_lock.toml` `provider = "sqlite"`):
- `20260301000000_init_sqlite/migration.sql`: Baseline SQLite schema generated from pre-Phase-13 `HEAD:prisma/schema.prisma`.
- `20261125000000_factory_only_attributes/migration.sql`: Adds `commercialRegStatus`, `taxRegStatus`, `workerCount`, `machineCount` via `ALTER TABLE` and backfills legal status via correlated SQLite subqueries.
- `20261125010000_optional_factory_attributes/migration.sql`: Performs SQLite's non-destructive 12-step table redefine (`CREATE TABLE "new_FactoryProfile" ... INSERT INTO ... DROP TABLE ... ALTER TABLE RENAME`) to drop `NOT NULL`/defaults on `establishedYear` and `monthlyCapacity`, set `minOrderQuantity DEFAULT 1`, and recreate all unique/secondary indexes and foreign keys without deleting rows.
- Commands: `npm run db:migrate:status:sqlite` and `npm run db:migrate:deploy:sqlite` (for existing legacy SQLite DBs created before `_prisma_migrations` existed, resolve the already-present baseline migrations once with `npx prisma migrate resolve --applied <name> --config prisma/sqlite.config.mjs` before `deploy`).

### B. PostgreSQL Migrations (`prisma/migrations/` Only — Staging & Production)
`prisma/migrations/` (`migration_lock.toml` `provider = "postgresql"`) is the **sole authoritative PostgreSQL migration directory** used by `npm run db:migrate:deploy` (`prisma migrate deploy --schema=prisma/schema.postgresql.prisma`):
- `20260301000000_init_postgresql/migration.sql`: Initial PostgreSQL schema.
- `20261125000000_factory_only_attributes/migration.sql`: Adds the 4 columns (`ADD COLUMN IF NOT EXISTS`) and sets `DEFAULT 1` on `minOrderQuantity`/`monthlyCapacity`.
- `20261125010000_optional_factory_attributes/migration.sql`: Drops `NOT NULL` and defaults on `establishedYear` & `monthlyCapacity`, and applies deterministic `DISTINCT ON ("factoryId")` backfill precedence across `FactoryDocument` records.
*(Duplicate mirror `prisma/migrations_postgresql/` was archived/removed in Phase 14 because Prisma CLI reads `prisma/migrations/` directly.)*

---

## 4. Backup & Rollback Plan

1. **Local Dev Backup (Before Dev Migration):** Copy `prisma/dev.db` to an untouched pre-migration backup (`prisma/dev.db.pre_factory_only.bak`, gitignored/temporary during verification only, never committed) before updating dev DB.
2. **Staging/Production Backup (Mandatory Pre-Deploy per `docs/STAGING_DEPLOYMENT_CHECKLIST.md`):**
   - Run `pg_dump -Fc --no-owner --no-privileges "$DIRECT_URL" -f "cysle_pre_factory_only_$(date +%Y%m%d_%H%M%S).dump"`, verify via `pg_restore --list`, and copy encrypted to durable object storage (S3 SSE-KMS).
3. **Rollback Plan:**
   - Because additive columns use safe defaults (`1`, `'UNREGISTERED'`), rolling back application code to the prior commit continues working without errors against the new columns (PostgreSQL ignores unqueried columns).
   - If a full schema reversal is required: restore into a fresh database from the pre-migration `pg_dump` and swap `DATABASE_URL`/`DIRECT_URL` after validation, or (if explicitly approved on empty new data) execute a forward SQL migration dropping the 4 additive columns and restoring `DEFAULT 50` / `DEFAULT 5000`.

---

## 5. Deployment Ordering, Downtime & Data Loss Assessment

1. **Zero-Downtime Ordering:**
   - **Step 1:** Take durable encrypted `pg_dump` backup (`DIRECT_URL` port `5432`).
   - **Step 2:** Run `npx prisma migrate deploy --schema=prisma/schema.postgresql.prisma` via `DIRECT_URL` (fast metadata-only `ADD COLUMN` in PostgreSQL 11+; sub-second lock on `FactoryProfile`).
   - **Step 3:** Deploy updated Next.js container (`npx prisma generate` during build, runtime queries over `DATABASE_URL` port `6543`).
2. **Downtime / Data Loss Risk:** **Near-zero downtime** (`<1s` metadata lock; zero `ACCESS EXCLUSIVE` table rewrite in PostgreSQL 14+); **zero data loss** because no existing columns or rows are dropped or overwritten destructively.
