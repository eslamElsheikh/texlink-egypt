# CYSLE Egypt — Phase 13 Targeted Remediation Report

*Date: `2026-11-25` | Branch: `deploy/altare-production-prep` | HEAD SHA: `67400bba16020a367cb3b65132cc0cde15c0a966`*

> **Strict Safety Confirmation:** Zero pushes, zero merges, zero deployments, zero production/remote migrations, zero production configuration or database modifications, zero external contractor hires, and zero spending occurred during Phase 13. Pre-existing backup `dev.db.pre_factory_only.bak` was left untouched; an additional Phase 13 recovery snapshot was saved in the conversation scratch directory (`phase13_recovery/`).

---

## 1. Exact Files Changed & Added in Phase 13

### Modified Source, Schema, Docs & Tests (Phase 13 Diff Scope)
- **Schemas & Docs:**
  - `prisma/schema.prisma` (`establishedYear Int?`, `monthlyCapacity Int?`)
  - `prisma/schema.postgresql.prisma` (`establishedYear Int?`, `monthlyCapacity Int?`)
  - `docs/DB_MIGRATION_FACTORY_ONLY_PLAN.md`
- **Registration & Profile Handling:**
  - `src/app/api/auth/register/route.ts`
  - `src/app/(auth)/register/page.tsx`
  - `src/app/api/factories/register/route.ts`
  - `src/app/factories/register/page.tsx`
  - `src/app/factories/[slug]/page.tsx`
  - `src/app/factories/page.tsx`
  - `src/app/factory/profile/page.tsx`
  - `src/lib/matching/engine.ts`
- **MOQ Consistency:**
  - `src/app/api/products/[id]/order/route.ts`
  - `src/app/products/[id]/page.tsx`
  - `src/app/api/factory/products/route.ts`
  - `src/app/factory/products/page.tsx`
- **Marketplace, Buyer Dashboard & Directory Visibility:**
  - `src/app/api/marketplace/dashboard/route.ts`
  - `src/app/marketplace/dashboard/page.tsx`
  - `src/app/api/products/[id]/route.ts`
  - `src/app/api/buyer/dashboard/route.ts`
  - `src/app/api/factories/route.ts`
  - `src/app/api/factories/[slug]/route.ts`
  - `src/app/api/admin/factories/route.ts`
- **Tests:**
  - `tests/unit/document-authorization.test.ts` (added explicit `workerCount: 1, machineCount: 1` to test #10 payload)
  - `tests/unit/factory-only-alignment.test.ts` (updated quick-register assertion for zero fabricated profile attributes + added `phone` to mocked `SessionUser`s)
  - `tests/unit/phase13-remediation-security.test.ts` *(new — 10 HTTP-level security, MOQ, registration & visibility tests)*

### New Migration Files Added
- `prisma/migrations/20261125010000_optional_factory_attributes/migration.sql` *(PostgreSQL)*
- `prisma/migrations_postgresql/20261125010000_optional_factory_attributes/migration.sql` *(PostgreSQL)*
- `prisma/migrations_sqlite/migration_lock.toml` *(SQLite `provider = "sqlite"`)*
- `prisma/migrations_sqlite/20261125000000_factory_only_attributes/migration.sql` *(SQLite-compatible)*
- `prisma/migrations_sqlite/20261125010000_optional_factory_attributes/migration.sql` *(SQLite-compatible 12-step table rebuild)*

---

## 2 & 3. Confirmed Failures Fixed & Before / After Behavior

| # | Original `FAIL` / Gap | Before | After |
| :--- | :--- | :--- | :--- |
| **1** | **Fabricated / Misleading Registration Defaults** (`src/app/factories/register/page.tsx`, `src/app/api/auth/register/route.ts`, `prisma/schema*.prisma`) | `/factories/register` pre-filled `governorate: "الدقهلية"`, `mansoura-salamon`, `establishedYear: 2018`, `monthlyCapacity: 500`, and default `specialties`/`machines`/`fabrics`. `/api/auth/register` silently stored `"مصنع متخصص..."`, `"قطن 100%"`, `"الدقهلية"`, and `establishedYear: 2015`. | `/factories/register` starts empty (`""` / `[]`), requires explicit user entry only for identity/location/`workerCount >= 1`/`machineCount >= 1`/`minOrderQuantity >= 1`, and leaves `establishedYear`, `monthlyCapacity`, `bioAr`, `specialties`, `machines`, `fabrics` genuinely optional (`null` / `""` / `"[]"`). `/api/auth/register` stores `""` / `null` / `"[]"` with zero invented claims; `(auth)/register/page.tsx` defaults `governorate` to `""`. |
| **2** | **Authenticated BUYER Upgrade Stale Cookie & ADMIN Registration Risk** (`src/app/api/factories/register/route.ts`) | Logged-in `BUYER` upgrading via `/api/factories/register` updated DB `User`, skipped `setSessionCookie()` (`if (!session)`), leaving stale `role: "BUYER", isFactory: false`. Also an `ADMIN` could overwrite its own `role` to `"FACTORY"`. | Always issues/refreshes JWT cookie (`createSessionToken` + `setSessionCookie`) with `role: "FACTORY", isFactory: true, factoryId` on upgrade, returns `user` in JSON, and blocks `ADMIN`/`PLATFORM_ADMIN` with HTTP `403`. `BUYER` registration remains `BUYER` with zero `FactoryProfile`. |
| **3** | **MOQ Inconsistency (`min(10)` Blocking `MOQ = 1`)** (`src/app/api/products/[id]/order/route.ts`, `src/app/products/[id]/page.tsx`, `src/app/api/factory/products/route.ts`, `src/app/factory/products/page.tsx`) | `POST /api/products/[id]/order` rejected any quantity `< 10` even when `product.moq === 1`; product page defaulted quantity/step to `50`/`10`; product creation defaulted `moq` to `50`. | Server schema accepts `quantity >= 1` and enforces `quantity >= Math.max(1, product.moq || 1)`. Client defaults `step={1}`, `min={Math.max(1, product.moq || 1)}`, validates `>= product.moq` before submit, and defaults new product MOQ to `1`. |
| **4** | **`GET /api/marketplace/dashboard` Omitted `marketplaceEnabled` / `VERIFIED`** (`src/app/api/marketplace/dashboard/route.ts`, `src/app/marketplace/dashboard/page.tsx`) | Returned `200` with open RFQs to `MANAGEMENT_ONLY` and `PENDING` factories. | Enforces `settings?.marketplaceEnabled === true` (`403`) and `factory.verificationStatus === "VERIFIED"` (`403`), while unverified factories retain full Factory OS access (`/api/factory/dashboard`). UI renders 403 explanation cleanly. |
| **5** | **`GET /api/products/[id]` & `POST /api/products/[id]/order` Unverified / Inactive Bypass** | Returned and allowed ordering products even if `isActive === false`, `isDemo === true`, `accountStatus !== "ACTIVE"`, `verificationStatus !== "VERIFIED"`, `marketplaceEnabled === false`, or caller was a non-buyer factory (`isBuyer: false`). | `GET /api/products/[id]` mirrors `GET /api/products` policy (`404` if inactive/demo/unverified/disabled). `POST /api/products/[id]/order` requires `session` (`401`), `isBuyer || BUYER || ADMIN` (`403`), and active + verified + active-account + non-demo + `marketplaceEnabled` factory (`403` otherwise). |
| **6** | **`GET /api/buyer/dashboard` Arbitrary `ADMIN` `findFirst()` Fallback** | When `ADMIN` without `isBuyer` called `/api/buyer/dashboard`, it queried `prisma.user.findFirst({ where: { isBuyer: true } })`, exposing another buyer's data. | Removed `findFirst()`. Non-buyers receive `403`; `ADMIN` requires explicit `?inspectBuyerId=` / `?buyerId=` (`400` if omitted and admin isn't buyer; `404` if missing). |
| **7** | **`GET /api/factories` & Direct `/api/factories/[slug]` Pending Leak** | `GET /api/factories` exposed `PENDING`/`REJECTED` factories unless `?verified=true`, and `area` + `q` `OR` filters clobbered each other; direct `GET /api/factories/[slug]` exposed unverified/disabled factories publicly. | Public `GET /api/factories` enforces `{ isDemo: false, accountStatus: "ACTIVE", verificationStatus: "VERIFIED", settings: { marketplaceEnabled: true } }` inside `AND` (unbypassable by query params, filters, or pagination). Direct `GET /api/factories/[slug]` returns `404` to public/other users unless `ADMIN` or owning factory member (which see explicit `verificationStatus`). `GET /api/admin/factories` remains the authorized Admin queue (`403` otherwise). |
| **8** | **SQLite vs PostgreSQL Migration DDL Collision** | `prisma/migrations/20261125000000_factory_only_attributes/migration.sql` shared PostgreSQL DDL while no SQLite-compatible migration files existed. | Kept `prisma/migrations/` & `prisma/migrations_postgresql/` strictly PostgreSQL (added `20261125010000_optional_factory_attributes` with `DROP NOT NULL/DEFAULT` + deterministic `DISTINCT ON` precedence), and created `prisma/migrations_sqlite/` with pure SQLite DDL + 12-step non-destructive table rebuild. |

---

## 4. Tests Added & Observed Verification Results (Run After Final Edits)

- **Prisma Schema Validation (`npx prisma validate`):**
  - `prisma/schema.prisma`: **Valid**
  - `prisma/schema.postgresql.prisma`: **Valid**
- **TypeScript (`npx tsc --noEmit`):** **Passed (`0` errors)** across entire codebase & test suite.
- **Vitest (`npm test` / `vitest run`):** **`30` test files passed (`30`), `260` tests passed (`260`), `0` failures** (`27.90s`), including:
  - `tests/unit/phase13-remediation-security.test.ts` (**`10/10` passed**): HTTP-level tests for minimal 1-person/1-machine registration without fabricated defaults, `BUYER` isolation & `ADMIN` 403 block, `BUYER`-to-`FACTORY` immediate JWT refresh + `409` retry, MOQ `1`/`10`/below-MOQ enforcement, `MANAGEMENT_ONLY`/`PENDING` restrictions on `/api/marketplace/dashboard` vs Factory OS `/api/factory/dashboard` `200`, inactive/disabled/unverified product blocking (`GET` `404` / `POST` `403`), `/api/buyer/dashboard` `400`/`403` without `findFirst()`, `GET /api/factories` & `/api/factories/[slug]` policy enforcement, cross-buyer order BOLA (`403`), cross-factory order isolation (`403`), quote-accept ownership (`403`), and unauthorized RFQ/quote guards.
  - `tests/unit/factory-only-alignment.test.ts` (**`8/8` passed**), `tests/unit/document-authorization.test.ts` (**`10/10` passed**), `tests/unit/cysle-rebrand-and-locations.test.ts` (**`11/11` passed**), `tests/integration/real-tenant-isolation.test.ts` (**`11/11` passed**), `tests/integration/role-based-qa-audit.test.ts` (**`16/16` passed**), `tests/integration/cross-role-security.test.ts` (**`7/7` passed**), `tests/integration/complete-workflows-e2e.test.ts` (**`8/8` passed**), `tests/integration/new-factory-isolation.test.ts` (**`8/8` passed**), plus all remaining unit suites.
- **ESLint (`npm run lint` / `next lint`):** **Passed (`0` errors)** *(pre-existing `@next/next/no-img-element` & `react-hooks/exhaustive-deps` warnings only)*.
- **Production Build (`npm run build` / `next build`):** **Passed (exit code `0`, `117/117` static pages generated)**.

---

## 5. Database Provider Migration Compatibility Evidence

- **SQLite Disposable Copy Execution (`prisma/migrations_sqlite/`):**
  - Applied both `20261125000000_factory_only_attributes/migration.sql` and `20261125010000_optional_factory_attributes/migration.sql` cleanly to a temporary disposable copy of `dev.db.pre_factory_only.bak`.
  - **Observed Checks:** `PRAGMA integrity_check = ok`, `PRAGMA foreign_key_check = 0 violations`, **`401` `FactoryProfile` rows preserved**, **`2,116` `User` rows preserved**, `monthlyCapacity` = `('INTEGER', 0, None)`, `establishedYear` = `('INTEGER', 0, None)`, `minOrderQuantity` = `('INTEGER', 1, '1')`, all 6 indexes preserved, and direct SQLite `INSERT` omitting `monthlyCapacity` & `establishedYear` succeeded with `(1, 1, 1, None, None, 'UNREGISTERED')`.
  - **How SQLite applies migrations:** Local dev SQLite updates are applied strictly using SQLite-compatible DDL in `prisma/migrations_sqlite/` (never `prisma/migrations/`), because `prisma/migrations/` holds PostgreSQL history (`provider = "postgresql"`). *Note: live `prisma/dev.db` was left untouched by this disposable test; before inserting `NULL` `establishedYear`/`monthlyCapacity` directly into local `prisma/dev.db`, run `prisma/migrations_sqlite/20261125010000_optional_factory_attributes/migration.sql` against `prisma/dev.db` once a backup is confirmed.*
- **PostgreSQL Migration Path (`prisma/migrations/` & `prisma/migrations_postgresql/`):**
  - Both directories remain strictly PostgreSQL 14+ (`provider = "postgresql"`). Applied to staging/production via `npm run db:migrate:deploy` (`prisma migrate deploy --schema=prisma/schema.postgresql.prisma`) using `DIRECT_URL` after encrypted `pg_dump -Fc` backup.

---

## 6. Remaining Risks & Skipped / Unexecuted Tests

1. **Skipped Live PostgreSQL Migration Execution:** `psql` is not installed and Docker Desktop Linux Engine (`dockerDesktopLinuxEngine`) was not running locally, so `20261125000000` and `20261125010000` PostgreSQL SQL files are validated via `npx prisma validate` and SQL inspection, **not executed against a live PostgreSQL instance yet** (must run on staging PostgreSQL before production).
2. **Skipped Live Redis Check:** `tests/integration/redis-rate-limit.test.ts` passed all `4/4` tests, logging `Skipping real Redis live test: REDIS_URL not active in current environment`.
3. **Playwright E2E Suite (`tests/e2e/rfq-flow.spec.ts`):** Not executed during this Vitest run.
4. **Local `prisma/dev.db` Optional Column Nullability:** Because `prisma/dev.db` itself was not altered during Phase 13 (`dev.db` kept safe/untouched), `prisma/dev.db` still has pre-Phase-13 `NOT NULL` SQLite column metadata on `establishedYear` and `monthlyCapacity` until `20261125010000_optional_factory_attributes` is applied locally.

---

## 7 & 8. Repository State, Branch, HEAD & Diff Summary

- **Current Branch:** `deploy/altare-production-prep`
- **Exact HEAD SHA:** `67400bba16020a367cb3b65132cc0cde15c0a966` (`origin/deploy/altare-production-prep` unchanged)
- **Diff Summary (`git diff --stat`):** `40 files changed, 973 insertions(+), 501 deletions(-)` across tracked files, plus untracked directories/files (`.agents/`, `docs/DB_MIGRATION_FACTORY_ONLY_PLAN.md`, `founder/`, `prisma/migrations/20261125*`, `prisma/migrations_postgresql/20261125*`, `prisma/migrations_sqlite/`, `src/lib/factory/`, `tests/unit/factory-only-alignment.test.ts`, `tests/unit/phase13-remediation-security.test.ts`).

---

## 9. Production Boundary Confirmation

Explicit confirmation: **No `git push`, no `git merge`, no deployment (Altare/Netlify/Vercel), no remote or production database migrations, no production configuration changes, no spending, and no external outreach occurred.** Work stops here pending founder review and explicit approval.
