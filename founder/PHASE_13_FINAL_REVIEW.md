# CYSLE Egypt — Phase 13 Final Independent Review (Strict Read-Only)

*Review Date: `2026-11-25` | Branch: `deploy/altare-production-prep` | HEAD SHA: `67400bba16020a367cb3b65132cc0cde15c0a966`*

> **Read-Only Guarantee:** Zero source, schema, migration, test, or database files were edited during this review. Zero commits, pushes, merges, deployments, or database migrations were executed.

---

## Executive Recommendation

- **Code, Registration, MOQ, Marketplace Security & Type/Build Verification:** **PASS** *(conditional on clear distinction that the 10 new HTTP handler tests use mocked Prisma/session rather than a live database)*.
- **Migration Architecture Review:** **PASS WITH CRITICAL ARCHITECTURAL CLARIFICATION** *(PostgreSQL `prisma migrate deploy` works safely via `prisma/migrations/`, **but** `prisma/migrations_sqlite/` is NOT auto-selected by Prisma CLI, `prisma/migrations_postgresql/` is a duplicate unused copy unless targeted manually, and `prisma/dev.db` still retains pre-Phase-13 `NOT NULL` SQLite column constraints on `establishedYear`/`monthlyCapacity` until its optional migration SQL is explicitly authorized/applied)*.
- **Final Recommendation:** Present findings for **Founder Review & Approval** on:
  1. Whether to clean up / clarify the duplicate `prisma/migrations_postgresql/` directory before committing, and confirm the explicit manual SQLite vs. Prisma PostgreSQL runbook commands below.
  2. Authorizing commit and push to `deploy/altare-production-prep` (and staging PostgreSQL migration rehearsal) while leaving production untouched.

---

## 1. Migration Architecture — Critical Empirical Inspection

Inspected `prisma/schema.prisma`, `prisma/schema.postgresql.prisma`, `package.json`, `Dockerfile`, `scripts/build.js`, `docs/DB_MIGRATION_FACTORY_ONLY_PLAN.md`, `prisma/migrations/`, `prisma/migrations_postgresql/`, and `prisma/migrations_sqlite/` (`Get-FileHash` + `npx prisma migrate status --schema=prisma/schema.prisma`).

### Empirical Answers

1. **Which migration directory is actually used by `prisma/schema.prisma`?**
   - **`prisma/migrations/`** (Prisma CLI's default convention relative to the schema folder when no `prisma.config.*` overrides `migrations.path`).
   - **Empirical Proof:** Running `npx prisma migrate status --schema=prisma/schema.prisma` immediately fails with:
     `Error: P3019 — The datasource provider sqlite specified in your schema does not match the one specified in the migration_lock.toml, postgresql.`
2. **Which migration directory is actually used by `prisma/schema.postgresql.prisma`?**
   - **`prisma/migrations/`** (the exact same default directory!). Neither `package.json` (`db:migrate:deploy`: `prisma migrate deploy --schema=prisma/schema.postgresql.prisma`), `Dockerfile`, nor `scripts/build.js` specifies `prisma/migrations_postgresql/`.
3. **Is `prisma/migrations_sqlite/` actually selected by documented SQLite migration commands?**
   - **NO.** Neither `npm run db:push` (`prisma db push --schema=prisma/schema.prisma`) nor any `prisma migrate` command reads `prisma/migrations_sqlite/`. Those files are standalone SQLite SQL scripts requiring explicit `sqlite3` / Python execution.
4. **Is any PostgreSQL migration duplicated across directories?**
   - **YES.** All 3 PostgreSQL migrations exist in **both `prisma/migrations/` and `prisma/migrations_postgresql/`**:
     - `20260301000000_init_postgresql/migration.sql`: byte-identical (`46,188 B`, SHA-256 prefix `69319C30D896`).
     - `20261125000000_factory_only_attributes/migration.sql`: `1,030 B` (`00685DC46A78`) in `prisma/migrations/` vs `1,101 B` (`ADF8721066E8`) in `prisma/migrations_postgresql/` (same DDL/UPDATEs, minor header/comment difference).
     - `20261125010000_optional_factory_attributes/migration.sql`: `1,265 B` (`EE829C4EA533`) in `prisma/migrations/` vs `1,466 B` (`36B694F75131`) in `prisma/migrations_postgresql/` (same `ALTER` + `DISTINCT ON` backfill, minor comment difference).
     - Both `migration_lock.toml` files are identical (`64 B`, `162FF5818ED3`, `provider = "postgresql"`).
5. **Are migration history and migration names consistent?**
   - PostgreSQL history across `prisma/migrations/` and `prisma/migrations_postgresql/` has consistent sequential folder names (`20260301000000_init_postgresql`, `20261125000000_factory_only_attributes`, `20261125010000_optional_factory_attributes`).
   - `prisma/migrations_sqlite/` reuses `20261125000000_factory_only_attributes` and `20261125010000_optional_factory_attributes`, **but has no `init_sqlite` base migration**.
6. **Can both a fresh SQLite DB and an existing SQLite DB follow the documented procedure?**
   - **NO — two distinct SQLite paths exist:**
     - **Fresh empty SQLite database:** Cannot execute `prisma/migrations_sqlite/20261125000000` (`ALTER TABLE "FactoryProfile"...`) because tables do not exist yet. Must initialize directly from schema using `npx prisma db push --schema=prisma/schema.prisma`.
     - **Existing SQLite `prisma/dev.db`:** Already had `20261125000000`'s 4 columns (`commercialRegStatus`, `taxRegStatus`, `workerCount`, `machineCount`) added earlier, so re-running `20261125000000` would fail on duplicate column names. Only `prisma/migrations_sqlite/20261125010000_optional_factory_attributes/migration.sql` is still pending on local `prisma/dev.db` (if/when authorized), while `prisma db push` previously failed on `dev.db` due to pre-existing NULL rows on unrelated `Order`/`Product`/`Review` tables.
7. **Does PostgreSQL production deployment have a clear, separate, safe migration procedure?**
   - **YES** (using `prisma/migrations/` via `prisma/schema.postgresql.prisma` over `DIRECT_URL`), provided operators recognize `prisma/migrations/` is the live directory read by Prisma CLI.

### Exact Operator Commands by Provider

- **Fresh Local SQLite Database (Dev / QA Setup):**
  ```bash
  npx prisma db push --schema=prisma/schema.prisma
  npx prisma generate --schema=prisma/schema.prisma
  ```
- **Existing Local SQLite `prisma/dev.db` (Upgrade Without Data Loss — Do NOT Run Unless Explicitly Approved):**
  ```bash
  # 1. Back up prisma/dev.db first
  # 2. Apply ONLY the pending Phase 13 SQLite table-redefine SQL (NOT 20261125000000, already present on dev.db):
  sqlite3 prisma/dev.db < prisma/migrations_sqlite/20261125010000_optional_factory_attributes/migration.sql
  npx prisma generate --schema=prisma/schema.prisma
  ```
- **Staging / Production PostgreSQL (Reads `prisma/migrations/` Automatically):**
  ```bash
  # 1. Pre-deploy backup over DIRECT_URL (port 5432)
  pg_dump -Fc --no-owner --no-privileges "$DIRECT_URL" -f "cysle_pre_deploy_$(date +%Y%m%d_%H%M%S).dump"
  pg_restore --list "cysle_pre_deploy_*.dump" >/dev/null
  # 2. Apply PostgreSQL migrations from prisma/migrations/
  npm run db:migrate:deploy   # runs: prisma migrate deploy --schema=prisma/schema.postgresql.prisma
  npm run db:generate:postgres
  ```

---

## 2. Registration & Factory Data Verification

| Check | Status | Code Evidence |
| :--- | :--- | :--- |
| **No fabricated `establishedYear`, `monthlyCapacity`, `governorate`, `specialties`, `machines`, `fabrics` saved silently** | **PASS** | - `src/app/api/auth/register/route.ts:38-39, 73-90`: saves `governorate: resolvedGov \|\| ""`, `bioAr: ""`, `establishedYear: null`, `monthlyCapacity: null`, `specialties: "[]"`, `machines: "[]"`, `fabrics: "[]"`.<br>- `src/app/(auth)/register/page.tsx:20, 191-208`: starts `governorate` at `""` (`-- اختر المحافظة (اختياري) --`).<br>- `src/app/api/factories/register/route.ts:27-37, 152-167`: makes `bioAr`, `establishedYear`, `monthlyCapacity`, `specialties`, `machines`, `fabrics` optional (`""` / `null` / `"[]"`).<br>- `src/app/factories/register/page.tsx:38-57`: initializes all fields empty (`""` / `[]`), requiring explicit user input for `governorate`, `city`, `address`, `workerCount`, `machineCount`, `minOrderQuantity`. |
| **1-person / 1-machine `FACTORY` registration works** | **PASS** | `src/app/api/factories/register/route.ts:28-31` & `page.tsx:662-750` allow `workerCount: 1`, `machineCount: 1`, `minOrderQuantity: 1`, no CR/Tax required (`UNREGISTERED` if absent). |
| **`BUYER` registration remains separate** | **PASS** | `src/app/api/auth/register/route.ts:35-116`: `accountType === "BUYER"` sets `isFactory: false, isBuyer: true`, creates only `BuyerProfile`, with `factoryProfile: undefined`. |
| **`BUYER`-to-`FACTORY` upgrade refreshes session immediately** | **PASS** | `src/app/api/factories/register/route.ts:260-285` unconditionally builds `tokenPayload` (`role: "FACTORY", isFactory: true, factoryId: factory.id, factorySlug: factory.slug`), calls `createSessionToken()` + `setSessionCookie()`, and returns `user: tokenPayload`. *(Note: authenticated upgrade via `POST /api/factories/register` keeps `isBuyer: session.isBuyer`, preserving existing buyer privileges.)* |
| **No `FactoryProfile` created for `ADMIN` or `BUYER` accounts** | **PASS** | `src/app/api/factories/register/route.ts:62-67` rejects `ADMIN`/`PLATFORM_ADMIN` with `403`. `src/app/api/auth/register/route.ts:68-110` nests `factoryProfile` strictly under `isFactory`. |

---

## 3. Marketplace Security Verification (Actual HTTP Handler Inspection)

- **Pending & marketplace-disabled factories cannot publish or sell (`PASS`):**
  - `POST /api/rfqs/[id]/quotes` (`src/app/api/rfqs/[id]/quotes/route.ts:29-41`): checks `settings?.marketplaceEnabled` (`403`) & `factory.verificationStatus === "VERIFIED"` (`403`).
  - `POST /api/factory/products` (`src/app/api/factory/products/route.ts:65-77`): checks `settings?.marketplaceEnabled` (`403`) & `factory.verificationStatus === "VERIFIED"` (`403`).
  - `GET /api/marketplace/dashboard` (`src/app/api/marketplace/dashboard/route.ts:13-25`): checks `settings?.marketplaceEnabled` (`403`) & `factory.verificationStatus === "VERIFIED"` (`403`).
- **Inactive and demo products cannot be browsed or ordered (`PASS`):**
  - `GET /api/products` (`src/app/api/products/route.ts:13-20`) & `GET /api/products/[id]` (`src/app/api/products/[id]/route.ts:35-44`): both require `isActive === true`, `isDemo === false`, `accountStatus === "ACTIVE"`, `verificationStatus === "VERIFIED"`, `settings?.marketplaceEnabled === true` (`GET [id]` returns `404` otherwise).
  - `POST /api/products/[id]/order` (`src/app/api/products/[id]/order/route.ts:44-57`): rejects inactive/demo/unverified/disabled products with `403`, rejects non-buyers with `403`, rejects unauthenticated callers with `401`, and validates `quantity >= Math.max(1, product.moq || 1)`.
- **Factory OS accessible to unverified factories (`PASS`):**
  - `resolveFactoryContext()` (`src/lib/auth/factory-context.ts:40-74`) and `GET /api/factory/dashboard` (`src/app/api/factory/dashboard/route.ts`) require valid factory membership only, not `verificationStatus === "VERIFIED"`.
- **Buyer order ownership enforced (`PASS`):**
  - `GET /api/orders/[id]` (`src/app/api/orders/[id]/route.ts:70-76`): allows only `session.id === order.buyerId`, `session.id === order.factory.userId`, or `session.role === "ADMIN"` (`403` otherwise).
  - `POST /api/rfqs/[id]/quotes/[quoteId]/accept` (`accept/route.ts:26-28`): requires `session.id === rfq.buyerId || session.role === "ADMIN"` (`403` otherwise).
- **ADMIN buyer inspection explicitly authorized (`PASS`):**
  - `GET /api/buyer/dashboard` (`src/app/api/buyer/dashboard/route.ts:15-40`): zero `findFirst()` calls; `ADMIN`/`PLATFORM_ADMIN` must provide explicit `?inspectBuyerId=` / `?buyerId=` (`400` if omitted and admin isn't a buyer, `404` if nonexistent); non-buyers receive `403`.
- **Direct product ID & factory slug parity with directory search (`PASS`):**
  - `GET /api/factories` (`src/app/api/factories/route.ts:29-37`): enforces `{ isDemo: false, accountStatus: "ACTIVE", verificationStatus: "VERIFIED", settings: { marketplaceEnabled: true } }` in `AND` (immune to filter/pagination bypass).
  - `GET /api/factories/[slug]` (`src/app/api/factories/[slug]/route.ts:41-55`): returns `404` publicly unless eligible, or caller is `ADMIN`/`PLATFORM_ADMIN`/owning factory member (where explicit `verificationStatus` is returned).
  - `GET /api/admin/factories` (`src/app/api/admin/factories/route.ts:9-12`): requires `ADMIN`/`PLATFORM_ADMIN` (`403` otherwise) and returns all factories with explicit status fields.

---

## 4. Test Evidence (`tests/unit/phase13-remediation-security.test.ts`)

All 10 tests invoke the **actual exported Next.js App Router HTTP route handlers** (`POST`/`GET`) with **Vitest-mocked Prisma (`@/lib/db/prisma`) and mocked session/notification/password modules (`@/lib/auth/session`, etc.)**. **They are mocked HTTP handler unit tests, NOT live database integration tests.**

| # | Test Name (Line Range) | Endpoint(s) Invoked | Actual HTTP Handler? | Session / Auth Setup (`getCurrentUser` mock) | Expected / Actual HTTP Status | DB Access Type |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | `registers a 1-person / 1-machine FACTORY with omitted optional fields...` (`L122-175`) | `POST /api/factories/register` | Yes (`FACTORY_REGISTER_POST`) | `null` (guest) | `200` / `200` | Mocked Prisma (`$transaction`) |
| **2** | `keeps BUYER registration strictly BUYER... and blocks ADMIN factory creation` (`L177-247`) | `POST /api/auth/register`, `POST /api/factories/register` | Yes (`AUTH_REGISTER_POST`, `FACTORY_REGISTER_POST`) | Guest for `/auth/register`; `ADMIN` for `/factories/register` | `200` (BUYER), `403` (ADMIN) | Mocked Prisma |
| **3** | `refreshes JWT session cookie immediately on authenticated BUYER-to-FACTORY upgrade and rejects retries with 409` (`L249-319`) | `POST /api/factories/register` (x2) | Yes (`FACTORY_REGISTER_POST`) | Authenticated `BUYER` (`isFactory: false`) | `200` (upgrade + cookie refresh), `409` (retry) | Mocked Prisma |
| **4** | `accepts quantity 1 when product.moq is 1 and rejects quantity 0` (`L350-382`) | `POST /api/products/[id]/order` (x2) | Yes (`PRODUCT_ORDER_POST`) | Authenticated `BUYER` | `200` (qty `1`), `400` (qty `0`) | Mocked Prisma |
| **5** | `accepts quantity 10 when product.moq is 10 and rejects quantity 5 below configured MOQ` (`L384-416`) | `POST /api/products/[id]/order` (x2) | Yes (`PRODUCT_ORDER_POST`) | Authenticated `BUYER` | `400` (qty `5`), `200` (qty `10`) | Mocked Prisma |
| **6** | `allows PENDING unverified factory to access Factory OS /api/factory/dashboard while blocking /api/marketplace/dashboard` (`L420-461`) | `GET /api/factory/dashboard`, `GET /api/marketplace/dashboard` (x2) | Yes (`FACTORY_DASHBOARD_GET`, `MARKETPLACE_DASHBOARD_GET`) | `FACTORY` (`PENDING` + `FULL`, then `VERIFIED` + `MGMT_ONLY`) | `200` (Factory OS), `403` (`PENDING` Marketplace), `403` (`MGMT_ONLY` Marketplace) | Mocked Prisma |
| **7** | `blocks direct product viewing (GET) and ordering (POST) for inactive, PENDING, or marketplace-disabled products` (`L463-551`) | `GET /api/products/[id]` (x2), `POST /api/products/[id]/order` (x3) | Yes (`PRODUCT_DETAIL_GET`, `PRODUCT_ORDER_POST`) | `BUYER` (`isBuyer: true`), then `FACTORY` (`isBuyer: false`) | `404` (`GET` inactive/disabled), `403` (`POST` inactive/disabled/non-buyer) | Mocked Prisma |
| **8** | `removes ADMIN findFirst() fallback from GET /api/buyer/dashboard and restricts non-buyers` (`L553-594`) | `GET /api/buyer/dashboard` (x2) | Yes (`BUYER_DASHBOARD_GET`) | `ADMIN` (`isBuyer: false`), then `FACTORY` (`isBuyer: false`) | `400` (`ADMIN` without `inspectBuyerId`), `403` (non-buyer `FACTORY`) | Mocked Prisma |
| **9** | `enforces VERIFIED-only public directory policy... while keeping /api/admin/factories authorized` (`L598-689`) | `GET /api/factories`, `GET /api/factories/[slug]` (x2), `GET /api/admin/factories` (x2) | Yes (`FACTORIES_LIST_GET`, `FACTORY_SLUG_GET`, `ADMIN_FACTORIES_GET`) | `null` (list & slug), owning `FACTORY` (slug & admin list), `ADMIN` (admin list) | `200` (list `AND` filter), `404` (guest slug `PENDING`), `200` (owner slug `PENDING`), `403`/`200` (admin list) | Mocked Prisma |
| **10** | `enforces cross-buyer order BOLA, cross-factory order isolation, quote accept ownership, and RFQ/quote role checks` (`L691-788`) | `GET /api/orders/[id]` (x2), `POST /api/rfqs/[id]/quotes/[quoteId]/accept`, `POST /api/rfqs`, `POST /api/rfqs/[id]/quotes` | Yes (`ORDER_DETAIL_GET`, `QUOTE_ACCEPT_POST`, `RFQ_POST`, `QUOTE_POST`) | Buyer B, Factory Beta, Non-buyer Factory, `PENDING` Factory | `403` across all 5 cross-tenant / unauthorized calls | Mocked Prisma |

### Proof That the 260-Test Vitest Result Ran After Final Code Edits
- **Latest Code/Test File Edit Mtime:** `tests/unit/factory-only-alignment.test.ts` at **`2026-11-25 21:32:46`** (all `src/` edits preceded `21:28`).
- **Verification Run (`task-4458.log`) Completion Time:** **`2026-11-25 21:35:47`** (`tsc --noEmit` -> `vitest run` (`30` files, `260` tests passed, `0` failed) -> `next lint` -> `next build` (`117/117` pages)).
- **Other Suites Run in Same Invocation:** `real-tenant-isolation.test.ts` (`11`), `complete-workflows-e2e.test.ts` (`8`), `role-based-qa-audit.test.ts` (`16`), `new-factory-isolation.test.ts` (`8`), `cross-role-security.test.ts` (`7`) ran against local SQLite `prisma/dev.db`; `redis-rate-limit.test.ts` (`4`) passed while skipping live Redis (`REDIS_URL` unset); Playwright E2E (`tests/e2e/rfq-flow.spec.ts`) was not executed.

---

## 5. Git Integrity Summary

- **Current Branch:** `deploy/altare-production-prep`
- **Exact HEAD SHA:** `67400bba16020a367cb3b65132cc0cde15c0a966` (`origin/deploy/altare-production-prep` unchanged)
- **Modified Tracked Files Count:** **`40`** (`973` insertions, `501` deletions via `git diff --stat`)
- **Untracked Files Count:** **`176`** after creating this file (`founder/`: `142`, `.agents/`: `23`, `prisma/`: `7`, `tests/`: `2`, `docs/`: `1`, `src/`: `1`)
- **`git status --short` Tracked & Top-Level Entries:**
  - `40` modified (`M`) files spanning `README.md`, `prisma/schema*.prisma`, registration/MOQ/marketplace/directory API routes & pages, `src/config/locations.ts`, `src/lib/auth/factory-context.ts`, `src/lib/matching/engine.ts`, and unit tests.
  - Untracked (`??`): `.agents/`, `docs/DB_MIGRATION_FACTORY_ONLY_PLAN.md`, `founder/`, `prisma/migrations/20261125*`, `prisma/migrations_postgresql/20261125*`, `prisma/migrations_sqlite/`, `src/lib/factory/`, `tests/unit/factory-only-alignment.test.ts`, `tests/unit/phase13-remediation-security.test.ts`.
- **Pre-Existing Uncommitted Work Intact:** Yes — all `35` pre-Phase-13 `git status --short` entries (`28` modified files + `7` untracked trees) remain preserved, with recovery point in scratch `phase13_recovery/`.

---

## 6. Remaining Limitations & Final Recommendation

1. **Duplicate PostgreSQL Directory (`prisma/migrations_postgresql/`):** Should either be documented explicitly as an inactive mirror or removed before final production release so operators rely solely on `prisma/migrations/` (active Prisma CLI path).
2. **Local `prisma/dev.db` Optional Nullability:** Left untouched intentionally per Phase 13 boundaries (`establishedYear` / `monthlyCapacity` remain `NOT NULL` at SQLite DDL level until `migrations_sqlite/20261125010000` is applied).
3. **Unexecuted Environments:** Live PostgreSQL execution (`psql`/Docker offline), live Redis concurrency, and Playwright E2E (`tests/e2e/rfq-flow.spec.ts`) have not yet been executed against live cloud/staging services.

**STOP — Waiting for Founder Approval.** No commit, push, merge, deployment, migration, or database modification will occur until explicitly authorized.
