# CYSLE Egypt — Phase 14 Migration Architecture & Git Hygiene Report

*Date: `2026-11-25` | Branch: `deploy/altare-production-prep` | HEAD SHA: `67400bba16020a367cb3b65132cc0cde15c0a966`*

> **Strict Boundary Confirmation:** Zero commits, zero pushes, zero merges, zero deployments, zero production/remote database migrations, and zero modifications to active PostgreSQL migration history (`prisma/migrations/`) occurred. Work stops here pending explicit founder approval.

---

## 1. Final Migration Architecture (Two Clean, Separate Provider Workflows)

| Provider | Schema | Prisma Config / Flag | Authoritative Migration Directory | Lock Provider | Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **SQLite (Local Dev & CI Ephemeral)** | `prisma/schema.prisma` | `--config prisma/sqlite.config.mjs` (explicit) or `--schema=prisma/schema.prisma` (`db push`) | `prisma/migrations_sqlite/` | `sqlite` | Fresh SQLite DB initialization & existing SQLite DB migrations without colliding with PostgreSQL `prisma/migrations/` |
| **PostgreSQL (Staging & Production)** | `prisma/schema.postgresql.prisma` | `--schema=prisma/schema.postgresql.prisma` | `prisma/migrations/` | `postgresql` | Authoritative production/staging relational migrations via `DIRECT_URL` |

### Why `--config prisma/sqlite.config.mjs` Works Without Breaking PostgreSQL
- `prisma/sqlite.config.mjs` is NOT named `prisma.config.ts`/`prisma.config.js` at the repository root, so PostgreSQL CLI commands (`npm run db:migrate:deploy`, `npm run db:migrate:status`, `Dockerfile`, `scripts/build.js`) ignore it completely and continue pointing `prisma/schema.postgresql.prisma` at `prisma/migrations/` (`provider = "postgresql"`).
- When running SQLite Prisma Migrate commands (`npm run db:migrate:deploy:sqlite` / `npm run db:migrate:status:sqlite`), `--config prisma/sqlite.config.mjs` explicitly instructs Prisma 6.19.3 to load `prisma/schema.prisma` and `prisma/migrations_sqlite/` (`provider = "sqlite"`), loading `.env` cleanly when `DATABASE_URL` is not already set in the shell.
- `prisma/migrations_sqlite/` now includes a complete 3-step history:
  1. `20260301000000_init_sqlite/migration.sql` (`38,360 B`, generated via `prisma migrate diff --from-empty --to-schema-datamodel` from `HEAD:prisma/schema.prisma`).
  2. `20261125000000_factory_only_attributes/migration.sql` (`1,351 B`, additive SQLite `ALTER TABLE` + correlated subqueries).
  3. `20261125010000_optional_factory_attributes/migration.sql` (`3,216 B`, SQLite 12-step non-destructive table rebuild making `monthlyCapacity` & `establishedYear` nullable and enforcing `minOrderQuantity DEFAULT 1`).

---

## 2. Exact Commands for Each Provider

### A. SQLite Development Commands
- **Fresh empty SQLite database initialization (via Prisma Migrate):**
  ```bash
  npm run db:migrate:deploy:sqlite   # runs: prisma migrate deploy --config prisma/sqlite.config.mjs
  npm run db:migrate:status:sqlite   # runs: prisma migrate status --config prisma/sqlite.config.mjs
  npm run db:generate                # runs: prisma generate --schema=prisma/schema.prisma
  ```
  *(Alternative schema-sync for disposable CI seed databases remains `npm run db:push` -> `prisma db push --schema=prisma/schema.prisma`.)*
- **Existing SQLite upgrade (from pre-Phase-12 DB without `_prisma_migrations`, e.g. `dev.db.pre_factory_only.bak`):**
  ```bash
  npx prisma migrate resolve --applied 20260301000000_init_sqlite --config prisma/sqlite.config.mjs
  npm run db:migrate:deploy:sqlite
  ```
- **Existing SQLite upgrade (from `prisma/dev.db` where `20261125000000` columns are already present):**
  ```bash
  # Take backup first; then mark already-applied migrations before deploying 20261125010000:
  npx prisma migrate resolve --applied 20260301000000_init_sqlite --config prisma/sqlite.config.mjs
  npx prisma migrate resolve --applied 20261125000000_factory_only_attributes --config prisma/sqlite.config.mjs
  npm run db:migrate:deploy:sqlite
  ```

### B. PostgreSQL Staging & Production Commands
```bash
# 1. Pre-deploy encrypted backup over DIRECT_URL (port 5432)
pg_dump -Fc --no-owner --no-privileges "$DIRECT_URL" -f "cysle_pre_deploy_$(date +%Y%m%d_%H%M%S).dump"
pg_restore --list "cysle_pre_deploy_*.dump" >/dev/null

# 2. Check & deploy migrations strictly from prisma/migrations/
npm run db:migrate:status   # runs: prisma migrate status --schema=prisma/schema.postgresql.prisma
npm run db:migrate:deploy   # runs: prisma migrate deploy --schema=prisma/schema.postgresql.prisma
npm run db:generate:postgres
```

---

## 3. SHA256 Comparison Results (`migrations/` vs `migrations_postgresql/` vs `migrations_sqlite/`)

| Relative Path | `prisma/migrations/` (Active PG) | `prisma/migrations_postgresql/` (Archived Duplicate) | `prisma/migrations_sqlite/` (Active SQLite) |
| :--- | :--- | :--- | :--- |
| `migration_lock.toml` | `64B` · `162FF5818ED32B5113B4FB76482715281A9F8809C6EBD1B72DD604DE469F1746` | `64B` · `162FF5818ED32B5113B4FB76482715281A9F8809C6EBD1B72DD604DE469F1746` *(Identical)* | `60B` · `41C9D1D4C9606190779C38933D2B8F3B4E179AE5125F961925BDAF6CB4158D83` (`provider = "sqlite"`) |
| `20260301000000_init_*` | `46,188B` · `69319C30D8964C4CEE3A15C1A986273CF5B2B0D877026AF1ADBC726112457869` | `46,188B` · `69319C30D8964C4CEE3A15C1A986273CF5B2B0D877026AF1ADBC726112457869` *(Identical)* | `38,360B` (`20260301000000_init_sqlite`, generated via `prisma migrate diff`) |
| `20261125000000_factory_only_attributes` | `1,030B` · `00685DC46A7819E95B891138F164087AA6D84CDA0EDE394AD5A511776C652257` | `1,101B` · `ADF8721066E8673077E49A8B9A47B1D899FC8C36F4AF508E70B1EE71DED2CF3E` *(Comment-only delta)* | `1,351B` · `36FED7DD2BB827AAD336FB705CC7C45CD22CDE7A9C0245A658210CCCFB304A36` |
| `20261125010000_optional_factory_attributes` | `1,265B` · `EE829C4EA5335191ED6B5F8B51B429A2A33DAD473980B4889FD9057FE0A2D4FF` | `1,466B` · `36B694F751314C0E16717BA948F0F3C9074FA23559C56C9911C6151A9C7045F0` *(Comment-only delta)* | `3,216B` · `90D8DBB1478301330A135E9BD5BE00967464F6B6AEF4B38DB766FF1EA33B387F` |

---

## 4. Duplicate Migration Directory Decision (`prisma/migrations_postgresql/`)

- **Confirmed Redundant:** Repo-wide searches across `package.json`, `Dockerfile`, `.github/workflows/`, `scripts/`, `netlify.toml`, and `docs/` proved zero scripts or deployment targets execute against `prisma/migrations_postgresql/`. All PostgreSQL tooling executes against **`prisma/migrations/`**.
- **Action Taken:** Preserved a full recoverable backup at `C:\Users\eslam\.gemini\antigravity\brain\82b08487-4fb0-4a34-8813-f2298d1c3501\scratch\phase14_recovery\migrations_postgresql_backup\` (`4` files), removed `prisma/migrations_postgresql/` from the working tree (producing `2` tracked deletions `D` for `migration_lock.toml` and `20260301000000_init_postgresql/migration.sql`), updated `docs/DB_MIGRATION_FACTORY_ONLY_PLAN.md` and `founder/MASTER_FACTORY_ONLY_ALIGNMENT_REPORT.md`, and left `prisma/migrations/` 100% untouched.

---

## 5. Complete Git File Classification & `.gitignore` Review

**`.gitignore` Improvements Applied:** Added `__pycache__/`, `*.pyc`, `*.pyo`, `*.log`, `.env.*` (`!.env.example`), `prisma/*.db-*`, `*.sqlite`, `*.sqlite3`, `*.bak`, `backups/`, and `cloudflare-worker/.wrangler/`. This automatically hid the 3 untracked Python bytecode files under `.agents/skills/**/__pycache__/` without deleting them.

### A. Tracked Changes (`44` Total: `42` Modified `M`, `2` Deleted `D` — Commit-Ready Upon Approval)
- **Application Source (`36` `M`):**
  - `src/app/(auth)/register/page.tsx`, `src/app/about/page.tsx`, `src/app/buyer/dashboard/page.tsx`, `src/app/factories/[slug]/page.tsx`, `src/app/factories/page.tsx`, `src/app/factories/register/page.tsx`, `src/app/factory/products/page.tsx`, `src/app/factory/profile/page.tsx`, `src/app/faq/page.tsx`, `src/app/marketplace/dashboard/page.tsx`, `src/app/orders/[id]/page.tsx`, `src/app/products/[id]/page.tsx`, `src/app/products/page.tsx`, `src/app/rfqs/new/page.tsx` (`14` pages)
  - `src/components/home/HowItWorksDualSection.tsx`, `src/components/layout/Footer.tsx` (`2` components)
  - `src/config/locations.ts`, `src/lib/auth/factory-context.ts`, `src/lib/matching/engine.ts` (`3` config/lib)
  - `src/app/api/admin/factories/[id]/verify/route.ts`, `src/app/api/admin/factories/route.ts`, `src/app/api/auth/me/route.ts`, `src/app/api/auth/register/route.ts`, `src/app/api/buyer/dashboard/route.ts`, `src/app/api/factories/[slug]/route.ts`, `src/app/api/factories/register/route.ts`, `src/app/api/factories/route.ts`, `src/app/api/factory/products/route.ts`, `src/app/api/factory/profile/route.ts`, `src/app/api/marketplace/dashboard/route.ts`, `src/app/api/products/[id]/order/route.ts`, `src/app/api/products/[id]/route.ts`, `src/app/api/products/route.ts`, `src/app/api/rfqs/[id]/quotes/route.ts`, `src/app/api/rfqs/route.ts` (`16` API routes)
  - `README.md` (moved under docs if grouped; `1` root README)
- **Config, Schemas & Tooling (`6` `M` + `2` `D`):**
  - `.gitignore`, `package.json`, `prisma/schema.prisma`, `prisma/schema.postgresql.prisma` (`4` `M`)
  - `D prisma/migrations_postgresql/20260301000000_init_postgresql/migration.sql`, `D prisma/migrations_postgresql/migration_lock.toml` (intentional duplicate removal)
- **Tests (`2` `M`):**
  - `tests/unit/cysle-rebrand-and-locations.test.ts`, `tests/unit/document-authorization.test.ts`

### B. Untracked Files (`174` Total Including This Report — Zero Secrets, Zero `.pyc`, Zero Temp/DB Leaks)
- **Application Source (`1` — Commit):** `src/lib/factory/classification.ts`
- **Tests (`2` — Commit):** `tests/unit/factory-only-alignment.test.ts`, `tests/unit/phase13-remediation-security.test.ts`
- **Database Migrations & Config (`8` — Commit):**
  - `prisma/sqlite.config.mjs`
  - `prisma/migrations/20261125000000_factory_only_attributes/migration.sql`, `prisma/migrations/20261125010000_optional_factory_attributes/migration.sql`
  - `prisma/migrations_sqlite/migration_lock.toml`, `prisma/migrations_sqlite/20260301000000_init_sqlite/migration.sql`, `prisma/migrations_sqlite/20261125000000_factory_only_attributes/migration.sql`, `prisma/migrations_sqlite/20261125010000_optional_factory_attributes/migration.sql`
  - `docs/DB_MIGRATION_FACTORY_ONLY_PLAN.md` (1 docs file)
- **Founder Documentation & Project-Local Skills (`163` — Commit if Founder Wants Strategy & Skills Versioned; Keep `.agents/`/`founder/` Separated in Review):**
  - `.agents/skills/` (`20` markdown/JSON/Python skill files, zero `__pycache__`)
  - `founder/` (`143` files including active strategy, market research, pricing, financial models, historical `board/`/`panel/`/`panel-retest/` snapshots, and Phase 13/14 governance reports)

### C. Local / Ignored Files Kept Strictly Outside Git (Must NEVER Be Committed)
- **Local Databases & Backups:** `dev.db`, `prisma/dev.db`, `backups/pre-merge-20261114-030200/dev.db`, plus scratch backups (`dev.db.pre_factory_only.bak`, `phase13_recovery/`, `phase14_recovery/`).
- **Secrets & Sensitive Local State:** `.env`, `.demo-credentials.local.json`, `artifacts/qa-accounts.local.md`, `storage/private/documents/*.dat`.
- **Generated / Cache Files:** `.next/`, `.netlify/`, `tsconfig.tsbuildinfo`, `cloudflare-worker/dist/`, `.agents/skills/**/__pycache__/*.pyc`.

---

## 6. Regression Verification & Observed Test Results (After Final Edits)

- **Prisma Schema Validation (`npx prisma validate`):**
  - `prisma/schema.prisma`: **Valid**
  - `prisma/schema.postgresql.prisma`: **Valid**
- **SQLite Migration Workflows (`prisma migrate deploy/status --config prisma/sqlite.config.mjs` on disposable copies):**
  1. **Fresh SQLite DB:** Applied all 3 migrations (`20260301000000_init_sqlite`, `20261125000000_factory_only_attributes`, `20261125010000_optional_factory_attributes`) -> `Database schema is up to date!`, `PRAGMA integrity_check = ok`, `FK_ERRORS = 0`, `monthlyCapacity` nullable (`None` default), `establishedYear` nullable (`None` default), `minOrderQuantity DEFAULT 1`, `workerCount/machineCount DEFAULT 1`, `commercialRegStatus/taxRegStatus DEFAULT 'UNREGISTERED'`.
  2. **Existing SQLite Upgrade (`dev.db.pre_factory_only.bak` copy):** Resolved `20260301000000_init_sqlite` -> `migrate deploy` applied `20261125000000` & `20261125010000` -> `PRAGMA integrity_check = ok`, `FK_ERRORS = 0`, **`401` `FactoryProfile` rows preserved**, **`2,116` `User` rows preserved**, nullable/MOQ verified.
  3. **Existing SQLite Upgrade (`dev.db.pre_phase13.bak` copy):** Resolved `20260301000000_init_sqlite` & `20261125000000_factory_only_attributes` -> `migrate deploy` applied `20261125010000` -> `PRAGMA integrity_check = ok`, `FK_ERRORS = 0`, **`401` `FactoryProfile` rows preserved**, **`2,116` `User` rows preserved**, nullable/MOQ verified.
- **TypeScript (`npx tsc --noEmit`):** Passed (`0` errors).
- **Vitest (`npm test` / `vitest run`):** **`30` test files passed (`30`), `260` tests passed (`260`), `0` failures** (`31.13s`).
- **ESLint (`npm run lint`):** Passed (`0` errors; pre-existing `no-img-element` & `react-hooks/exhaustive-deps` warnings only).
- **Production Build (`npm run build`):** Passed (exit code `0`, `117/117` static pages generated).

---

## 7. Remaining Limitations & Unexecuted Tests

1. **PostgreSQL Live Migration Execution — NOT EXECUTED / UNVERIFIED LIVE:** No local `psql` or running Docker PostgreSQL instance exists here; PostgreSQL schema & migration SQL were validated via `npx prisma validate` and SQL inspection only. Live PostgreSQL migration execution must run on staging first (`npm run db:migrate:deploy` over `DIRECT_URL`).
2. **Live Redis Multi-Client Test — SKIPPED:** `tests/integration/redis-rate-limit.test.ts` passed `4/4` tests while logging `Skipping real Redis live test: REDIS_URL not active in current environment`.
3. **Playwright E2E (`tests/e2e/rfq-flow.spec.ts`):** Not executed in this Vitest run.
4. **Local `prisma/dev.db` Kept Untouched:** Real `prisma/dev.db` was not modified in Phase 14; nullable `monthlyCapacity`/`establishedYear` on local `prisma/dev.db` will take effect only when the founder runs the Section 2 `resolve` + `npm run db:migrate:deploy:sqlite` upgrade step after backup.

---

## 8 & 9. Branch, HEAD SHA & Working Tree Summary

- **Current Branch:** `deploy/altare-production-prep`
- **Exact HEAD SHA:** `67400bba16020a367cb3b65132cc0cde15c0a966`
- **Working Tree Summary:** `42` modified (`M`), `2` deleted (`D` from `prisma/migrations_postgresql/`), `174` untracked (`??`, including this report), zero staged (`0` staged commits), zero pushes/merges/deployments/production DB actions.

**STOPPED — Waiting for Founder Review & Explicit Approval.**
