# CYSLE Egypt — Post-Implementation Independent Verification Report

*Verification Date: `2026-11-25` | Mode: Strict Read-Only Code, Schema, Backup, Git & Test Audit | Target Branch: `deploy/altare-production-prep`*

> **Audit Independence & Boundary Statement:** This verification was performed strictly **read-only** against the repository, local SQLite development database (`prisma/dev.db`), and backup snapshot. Zero source, schema, migration, test, or database files were edited during verification. Zero pushes, merges, deployments, or production database actions were performed, and zero money was spent.

---

## Executive Verdict

| Area | Classification | Key Finding |
| :--- | :--- | :--- |
| **1. Registration Correctness** | **FAIL (Partial)** | 1-person/1-machine registration works (`min(1)`), `BUYER` vs `FACTORY` separation works, and duplicate checks pass; **however**, both `factories/register/page.tsx` and `/api/auth/register` write hardcoded defaults as factory facts, authenticated buyer-to-factory upgrades leave a stale JWT cookie, and `/api/products/[id]/order` contradicts `MOQ >= 1` with `min(10)`. |
| **2. Marketplace & Factory OS Permissions** | **FAIL (Partial)** | Core Factory OS, `POST /api/rfqs`, `POST /api/rfqs/[id]/quotes`, `POST /api/factory/products`, `GET /api/products`, and `resolveFactoryContext()` pass; **however**, `GET /api/marketplace/dashboard` omits `marketplaceEnabled`, `GET /api/products/[id]` & `POST /api/products/[id]/order` omit `VERIFIED`/`marketplaceEnabled`/`isActive` checks, and `GET /api/buyer/dashboard` still has an `ADMIN` `findFirst()` arbitrary-buyer fallback. |
| **3. Database Migration Safety & Backup** | **PASS (Dev/PG) / FAIL (SQLite Migrate Sync)** | `prisma/dev.db` backup exists (`11,051,008` bytes), restores cleanly (`integrity_check = ok`), and all `401` `FactoryProfile` rows remain intact (`0` FK errors). PostgreSQL migration SQL is safe and additive; **however**, `prisma/migrations/20261125000000_factory_only_attributes/migration.sql` contains PostgreSQL-only syntax (`ADD COLUMN IF NOT EXISTS`, `ALTER COLUMN`, `UPDATE ... FROM`) under a `postgresql` lock rather than valid SQLite DDL. |
| **4. Independent Security Tests** | **PASS (Unit/Integration) / NOT VERIFIED (Playwright & Several Direct HTTP Routes)** | Existing Vitest suite passes (`29` files, `250` tests, `0` failures); **however**, `cross-role-security.test.ts` and `role-based-qa-audit.test.ts` test DB/JWT primitives rather than invoking all HTTP routes end-to-end, live Redis was skipped (`REDIS_URL` unset), and Playwright E2E (`tests/e2e/rfq-flow.spec.ts`) was not run. |
| **5. Repository & Deployment Integrity** | **PASS** | HEAD stays cleanly at `67400bba16020a367cb3b65132cc0cde15c0a966` matching `origin/deploy/altare-production-prep`; zero pushes, merges, deployments, or production modifications occurred (`28` modified + `7` untracked paths local only). |
| **6. Staging Push / Migration / Launch Gate** | **REQUIRES FOUNDER APPROVAL** | **Do not push or deploy yet.** Founder sign-off is needed on whether to remediate the `FAIL` items below before pushing `deploy/altare-production-prep` and scheduling staging migration. |

---

## 1. Registration Correctness

| Check | Status | Evidence & File Paths |
| :--- | :--- | :--- |
| **1-person, 1-machine Factory can register** | **PASS** | `src/app/api/factories/register/route.ts:28-31` validates `workerCount >= 1`, `machineCount >= 1`, `monthlyCapacity >= 1`, `minOrderQuantity >= 1`; `src/app/factories/register/page.tsx:662-710` renders numeric inputs with `min={1}` and live segment preview (`INDIVIDUAL`); CR/Tax upload fields are optional (`route.ts:39-44`, `97-98`). Verified by `tests/unit/factory-only-alignment.test.ts:138-212`. *(Note: unauthenticated visitors on `/factories/register` Step 3 cannot call `/api/upload` before account creation because `src/app/api/upload/route.ts:39-45` requires `session`, returning `401`.)* |
| **Default values are NOT falsely presented as user-provided facts** | **FAIL** | 1. `src/app/factories/register/page.tsx:39-53` pre-populates concrete business attributes in React state (`governorate: "الدقهلية"`, `industrialArea: "mansoura-salamon"`, `city: "المنصورة"`, `establishedYear: 2018`, `monthlyCapacity: 500`, `specialties: ["تيشيرتات وبولو"]`, `machines: ["ماكينات خياطة سنجر وأوفرلوك"]`, `fabrics: ["قطن مصري 100%"]`) and submits them verbatim if untouched.<br>2. `src/app/api/auth/register/route.ts:78-88` silently writes uncollected placeholder capabilities into `FactoryProfile` (`bioAr: "مصنع متخصص في التصنيع النسيجي والملابس الجاهزة."`, `specialties: ["تريكو وملابس جاهزة"]`, `machines: ["ماكينة تصنيع نسيجي"]`, `fabrics: ["قطن 100%"]`, fallback `governorate: "الدقهلية"`, plus schema default `establishedYear: 2015`, `workerCount: 1`, `machineCount: 1`, `minOrderQuantity: 1`, `monthlyCapacity: 1`). |
| **Factory registration and ordinary BUYER registration remain separate** | **PASS (with Cookie Caveat)** | - `POST /api/auth/register` (`src/app/api/auth/register/route.ts:35-116`): `BUYER` creates `BuyerProfile` (`isFactory: false`, `isBuyer: true`, zero `FactoryProfile`/`FactorySettings`/`Warehouse`). `FACTORY` creates `FactoryProfile` (`isFactory: true`, `isBuyer: false`). `BOTH` creates both explicitly.<br>- `POST /api/factories/register` (`src/app/api/factories/register/route.ts:136-138`): guest registration sets `role: "FACTORY", isFactory: true, isBuyer: true` (so Factories can also post subcontracting RFQs without creating a `BuyerProfile`).<br>- **Caveat (`FAIL` on authenticated upgrade):** If an already logged-in `BUYER` submits `POST /api/factories/register`, DB `User` is updated (`lines 112-118`, `171-174`), **but `if (!session)` (`lines 256-269`) skips re-issuing the JWT session cookie**, leaving `session.isFactory === false` until re-login (`resolveFactoryContext` line 28 checks `session.isFactory \|\| role === "FACTORY"`). |
| **FactorySettings and Warehouse created only for appropriate account type** | **PASS** | Verified in `src/app/api/auth/register/route.ts:59-110` (`FactorySettings` + `Warehouse` nested strictly under `factoryProfile: isFactory ? ... : undefined`) and `src/app/api/factories/register/route.ts:176-197` (created inside `$transaction` for `FactoryProfile`). Ordinary `BUYER` receives neither. |
| **Duplicate registration & retry scenarios do not create duplicate records** | **PASS** | - `src/app/api/factories/register/route.ts:100-127, 247-252`: Inside `$transaction`, existing authenticated user with `FactoryProfile` returns `409`; duplicate guest email returns `400`; `FactoryProfile.userId` has `@unique`. Tested in `tests/unit/factory-only-alignment.test.ts:214-246`.<br>- `src/app/api/auth/register/route.ts:41-48, 128-132`: Duplicate email returns `400` inside `$transaction`; `User.email` is `@unique`. |
| **Zero or one MOQ behavior is intentional and documented** | **FAIL (Partial)** | Intentional `min(1)` (not `0`) is documented in `DB_MIGRATION_FACTORY_ONLY_PLAN.md` and `MASTER_FACTORY_ONLY_ALIGNMENT_REPORT.md` and enforced in schemas (`minOrderQuantity @default(1)`), `src/app/api/factories/register/route.ts:31`, `src/app/api/factory/profile/route.ts:56`, and `src/app/factories/register/page.tsx:705`. **Contradiction:** `src/app/api/products/[id]/order/route.ts:8` still enforces `quantity: z.number().int().min(10, "الحد الأدنى للطلب 10 قطع")`, blocking `1–9` piece orders even when `product.moq = 1`. |

---

## 2. Marketplace and Factory OS Permissions

### Summary Checks

| Requirement | Status | Evidence |
| :--- | :--- | :--- |
| **Unverified Factory can access permitted Factory OS functionality** | **PASS** | `resolveFactoryContext()` (`src/lib/auth/factory-context.ts:40-74`) and operational routes (`/api/factory/dashboard`, `/api/factory/production`, `/api/factory/orders`, `/api/factory/profile`, `/api/factory/settings`) do not require `verificationStatus === "VERIFIED"`. |
| **Marketplace restrictions applied only to operations requiring verification** | **FAIL** | `POST /api/rfqs/[id]/quotes` (`line 36`), `POST /api/factory/products` (`line 72`), and `GET /api/products` (`line 18`) enforce `VERIFIED`. **Gaps:** `GET /api/products/[id]` (`src/app/api/products/[id]/route.ts:11-33`) and `POST /api/products/[id]/order` (`src/app/api/products/[id]/order/route.ts:32-42`) do NOT verify `verificationStatus === "VERIFIED"`, `isDemo === false`, or `isActive === true`. `GET /api/factories` (`src/app/api/factories/route.ts:29-35`) returns `PENDING` factories unless `?verified=true` (`REQUIRES FOUNDER APPROVAL` on intended directory policy). |
| **`marketplaceEnabled` checked consistently** | **FAIL** | Checked on `GET /api/factories` (`line 30`), `GET /api/products` (`line 19`), `POST /api/factory/products` (`line 65`), `POST /api/rfqs/[id]/quotes` (`line 29`), and `matchFactoriesForRfq` (`src/lib/matching/engine.ts:21`). **Missing on:** `GET /api/marketplace/dashboard` (`src/app/api/marketplace/dashboard/route.ts`), `GET /api/products/[id]` (`src/app/api/products/[id]/route.ts`), `POST /api/products/[id]/order` (`src/app/api/products/[id]/order/route.ts`), and `GET /api/factories/[slug]` (`src/app/api/factories/[slug]/route.ts:14-37`). |
| **Unauthorized users cannot create RFQs or submit quotes** | **PASS** | `POST /api/rfqs` (`src/app/api/rfqs/route.ts:94-107`): `401` if guest, `403` unless `isBuyer \|\| role === "BUYER" \|\| role === "ADMIN"`. `POST /api/rfqs/[id]/quotes` (`src/app/api/rfqs/[id]/quotes/route.ts:22-41`): requires Factory context (`401`/`403`), `marketplaceEnabled` (`403`), and `VERIFIED` (`403`). |
| **Factory cannot access another Factory's data** | **PASS** | Factory OS & CRM queries scope strictly by `ctx.factoryId` (`resolveFactoryContext`), `GET /api/documents/[id]` scopes by `doc.factory.userId === session.id \|\| session.factoryId === doc.factoryId`, `GET /api/orders/[id]` scopes by buyer/factory owner/admin (`line 70-76`), and `GET /api/rfqs/[id]` filters visible quotes to caller's own `session.factoryId` (`lines 71-74`). |
| **ADMIN access requires explicit authorization and context; no arbitrary `findFirst()` exposes another tenant** | **FAIL (in `buyer/dashboard`)** | - `resolveFactoryContext` (`src/lib/auth/factory-context.ts:77-115`): **PASS** — `ADMIN`/`PLATFORM_ADMIN` must provide explicit `inspectFactoryId`/`factoryId` (`400` if omitted, `404` if nonexistent); zero `findFirst()` fallback.<br>- `GET /api/admin/*` & `POST /api/admin/factories/[id]/verify`: **PASS** (`403` for non-`ADMIN`).<br>- `GET /api/buyer/dashboard` (`src/app/api/buyer/dashboard/route.ts:20-26`): **FAIL** — retains `prisma.user.findFirst({ where: { isBuyer: true } })` when `ADMIN` without `isBuyer` visits, exposing an arbitrary buyer tenant's RFQs/orders without explicit target ID. |

### Role & Permission Matrix (Expected HTTP vs. Verified Evidence)

| Endpoint / Action | Guest | Buyer | Factory (`PENDING`, `FULL`) | Factory (`VERIFIED`, `MGMT_ONLY`) | Factory (`VERIFIED`, `FULL`) | Other Factory (Cross-Tenant) | Admin (`ADMIN`) | Verification Evidence |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `POST /api/factories/register` | `200` (if valid new user) | `200` (upgrades user, stale cookie caveat) | `409` | `409` | `409` | `409` | N/A | **PASS (with caveat)** — `tests/unit/factory-only-alignment.test.ts` + code review |
| `GET /api/factory/dashboard`, `/production`, `/orders`, `/settings` | `401` | `403` | `200` (own OS) | `200` (own OS) | `200` (own OS) | `403` / own scope only | `400` (no ID) / `404` (bad ID) / `200` (`inspectFactoryId`) | **PASS** — `resolveFactoryContext()` tested in `factory-only-alignment.test.ts` & `role-based-qa-audit.test.ts` |
| `PATCH /api/factory/settings` | `401` | `403` | `200` (owner) / `403` (staff) | `200` (owner) | `200` (owner) | `403` (scoped to own `factoryId`) | `200` (`inspectFactoryId`) | **PASS (Code Inspection)** — `src/app/api/factory/settings/route.ts:48-54` |
| `POST /api/rfqs` | `401` | `200` | `200` if `isBuyer=true`, else `403` | `403` if `isBuyer=false` | `200` if `isBuyer=true`, else `403` | N/A (creates own RFQ) | `200` | **PASS** — `tests/unit/factory-only-alignment.test.ts:346-356` |
| `POST /api/rfqs/[id]/quotes` | `401` | `403` | **`403`** (unverified) | **`403`** (`MGMT_ONLY`) | `200` | N/A (submits for own `factoryId`) | `400`/`403` | **PASS** — `tests/unit/factory-only-alignment.test.ts:358-383` |
| `POST /api/rfqs/[id]/quotes/[quoteId]/accept` | `401` | `200` (owner) / **`403`** (non-owner) | `403` | `403` | `403` | **`403`** | `200` | **PASS (Code Inspection)** — `accept/route.ts:13-28`; not directly called by HTTP test |
| `GET /api/products` | `200` (VERIFIED + FULL only) | `200` | `200` (hidden if own) | `200` (hidden if own) | `200` | `200` | `200` | **PASS** — `tests/unit/factory-only-alignment.test.ts:386-396` |
| `POST /api/factory/products` | `401` | `403` | **`403`** | **`403`** | `200` | Own scope only | `400` / `200` (`inspectFactoryId`) | **PASS** — `tests/unit/factory-only-alignment.test.ts:375-384` |
| `GET /api/marketplace/dashboard` | `401` | `403` | **Expected `403`, Actual `200`** | **Expected `403`, Actual `200`** | `200` | Own scope only | `400` / `200` | **FAIL** — `src/app/api/marketplace/dashboard/route.ts` omits `marketplaceEnabled` |
| `POST /api/products/[id]/order` | `401` | `200` (if `qty>=10`; **fails `400` if `1..9`**) | **Allows ordering unverified / `MGMT_ONLY` product (`200`)** | **Allows ordering `MGMT_ONLY` (`200`)** | `200` | `200` | `200` | **FAIL** — `src/app/api/products/[id]/order/route.ts:8, 21-42` |
| `GET /api/buyer/dashboard` | `401` | `200` (own) | `200` (empty unless `isBuyer`) | `200` (empty) | `200` (own/empty) | Own `session.id` | **Arbitrary `findFirst()` buyer (`200`)** | **FAIL** — `src/app/api/buyer/dashboard/route.ts:20-26` |
| `GET /api/documents/[id]` | `401` | `403` | `200` (own) | `200` (own) | `200` (own) | **`403`** (IDOR blocked) | `200` | **PASS** — `tests/unit/document-authorization.test.ts` (10/10 tests) |
| `POST /api/admin/factories/[id]/verify` | `403` | `403` | `403` | `403` | `403` | `403` | `200` | **PASS** — `tests/unit/factory-only-alignment.test.ts:302-343` |

---

## 3. Database Migration Safety & Backup Verification

| Item | Status | Evidence & Technical Findings |
| :--- | :--- | :--- |
| **SQLite Schema Changes (`prisma/schema.prisma:52-62, 109-111`)** | **PASS** | `FactoryProfile` adds `commercialRegStatus String @default("UNREGISTERED")`, `taxRegStatus String @default("UNREGISTERED")`, `workerCount Int @default(1)`, `machineCount Int @default(1)`, and updates `minOrderQuantity Int @default(1)`, `monthlyCapacity Int @default(1)`. |
| **PostgreSQL Schema Changes (`prisma/schema.postgresql.prisma:56-66, 113-115`)** | **PASS** | Identical 4 new fields and `1` defaults; preserves `@db.Text`, `@relation(..., onDelete: Cascade)`, `@unique` on `userId`/`slug`, and `@@index([isDemo])`, `@@index([governorate])`, `@@index([industrialArea])`. |
| **PostgreSQL Migration SQL (`prisma/migrations_postgresql/20261125000000_factory_only_attributes/migration.sql`)** | **PASS (Minor Caveat)** | Valid PostgreSQL 14+ DDL (`ADD COLUMN IF NOT EXISTS ... NOT NULL DEFAULT ...`, `ALTER COLUMN ... SET DEFAULT 1`) plus conditional `UPDATE` backfill from `FactoryDocument` (`APPROVED` -> `VERIFIED`). **Caveat:** If multiple `COMMERCIAL_REGISTER` or `TAX_CARD` rows ever existed for one factory, `UPDATE ... FROM` lacks deterministic precedence (`DISTINCT ON`/`ORDER BY`), and no indexes were added on `commercialRegStatus`, `taxRegStatus`, or `workerCount`. |
| **Local `prisma/migrations/` SQL (`prisma/migrations/20261125000000_factory_only_attributes/migration.sql`)** | **FAIL (Provider Mismatch)** | `prisma/migrations/migration_lock.toml` declares `provider = "postgresql"`, so `migration.sql` contains PostgreSQL DDL (`ADD COLUMN IF NOT EXISTS`, `ALTER COLUMN ... SET DEFAULT`, `UPDATE ... FROM`) rather than SQLite DDL. It cannot run via SQLite `prisma migrate`, and in `prisma/dev.db` raw SQLite `DEFAULT` constraints on `minOrderQuantity`/`monthlyCapacity` remain `50`/`5000` (Prisma ORM overrides to `1` on insert). |
| **Rollback Plan & Existing-Data Compatibility (`docs/DB_MIGRATION_FACTORY_ONLY_PLAN.md`)** | **PASS** | Additive schema is backward-compatible with prior commits; `pg_dump -Fc` pre-deploy backup + forward/restore rollback documented (`REQUIRES FOUNDER APPROVAL` before staging/prod). |
| **Actual Dev DB Backup Verification (`dev.db.pre_factory_only.bak`)** | **PASS** | - **Exact Path:** `C:\Users\eslam\.gemini\antigravity\brain\82b08487-4fb0-4a34-8813-f2298d1c3501\scratch\dev.db.pre_factory_only.bak`<br>- **Exists / Size:** `True` / **`11,051,008` bytes** (current `prisma/dev.db`: **`11,067,392` bytes**)<br>- **Temporary Restore Test:** Restored to temporary file -> `PRAGMA integrity_check;` = `ok`, `FactoryProfile` = **`401`**, `User` = **`2,116`**, pre-migration columns verified absent.<br>- **Current `prisma/dev.db` (`mode=ro`):** `PRAGMA integrity_check;` = `ok`, `FactoryProfile` = **`401`**, `User` = **`2,116`**, `PRAGMA foreign_key_check('FactoryProfile')` = **`0` violations**, `CR` = `PENDING: 17, UNREGISTERED: 356, VERIFIED: 28` (`401`), `Tax` = `PENDING: 17, UNREGISTERED: 383, VERIFIED: 1` (`401`), all `FactoryProfile` unique & secondary indexes intact. |
| **Production Database Untouched** | **PASS** | `.env` uses strictly `DATABASE_URL="file:./dev.db"` and `DIRECT_URL="file:./dev.db"`. Zero production databases were accessed or altered. |

---

## 4. Independent Security Tests

Ran existing suite (`npm test` / `vitest run`) without editing or adding any files:
- **Exact Result:** **`29` test files passed (`29`), `250` tests passed (`250`), `0` failures** (`29.75s`).
  - *Condition noted:* `tests/integration/redis-rate-limit.test.ts` logged `Skipping real Redis live test: REDIS_URL not active in current environment`, while all `4` tests in that file still executed and passed.
  - *Not executed:* `tests/e2e/rfq-flow.spec.ts` (Playwright browser suite).

| Security Domain | Status | Evidence Type & Honest Scope |
| :--- | :--- | :--- |
| **Cross-Tenant IDOR / BOLA (DB & Docs)** | **PASS (DB & Docs) / NOT VERIFIED (Some HTTP Routes)** | `tests/unit/document-authorization.test.ts` (`10/10` pass, mocked Prisma/storage for `GET /api/documents/[id]` & `POST /api/factories/register`), `tests/integration/real-tenant-isolation.test.ts` (`11/11` pass on SQLite), `tests/integration/new-factory-isolation.test.ts` (`8/8` pass), `tests/integration/cross-role-security.test.ts` (`7/7` pass — **direct Prisma queries**, not HTTP route calls). |
| **Unauthorized RFQ Creation** | **PASS (Mocked Unit)** | `tests/unit/factory-only-alignment.test.ts:346-356` verifies `POST /api/rfqs` returns `401` for guest (`getCurrentUser` -> `null`). `isBuyer === false` `403` branch verified by code inspection (`src/app/api/rfqs/route.ts:102`). |
| **Buyer Ownership (RFQs, Quotes Accept, Orders)** | **PASS (Code + DB E2E) / NOT VERIFIED (HTTP Route Tests)** | Verified by code inspection in `src/app/api/rfqs/[id]/quotes/[quoteId]/accept/route.ts:26`, `src/app/api/orders/[id]/route.ts:70-76`, `src/app/api/orders/[id]/milestones/route.ts:38-48`, and DB simulation in `tests/integration/complete-workflows-e2e.test.ts` (`8/8` pass). No dedicated Vitest HTTP handler test calls `accept` or `orders/[id]`. |
| **Quote Submission & Marketplace-Disabled Restrictions** | **PASS (`quotes`/`products`) / FAIL (`marketplace/dashboard`, `products/[id]/order`)** | `tests/unit/factory-only-alignment.test.ts:358-396` verifies `POST /api/rfqs/[id]/quotes` (`403` for `MGMT_ONLY` / unverified), `POST /api/factory/products` (`403`), and `GET /api/products` (`where` filters); see `FAIL` items in Section 2 for `/api/marketplace/dashboard`, `/api/products/[id]`, and `/api/products/[id]/order`. |
| **ADMIN Context Authorization** | **PASS (`resolveFactoryContext`) / FAIL (`buyer/dashboard`)** | `tests/unit/factory-only-alignment.test.ts:112-136` verifies `resolveFactoryContext()` returns `400`/`404` without calling `findFirst()` even when `NODE_ENV="development"`. `tests/unit/admin-profile.test.ts` (`2/2`) passes. `GET /api/buyer/dashboard:20-26` remains `FAIL` for `ADMIN` `findFirst()`. |
| **Registration Role Boundaries** | **PASS (`FACTORY` vs `BUYER`)** | Verified in `src/app/api/auth/register/route.ts` + `tests/unit/factory-only-alignment.test.ts` + `tests/integration/cross-role-security.test.ts:58-66` (`BUYER` cannot have `factoryId`). Stale JWT on authenticated buyer upgrade noted in Section 1. |

---

## 5. Repository & Deployment Integrity

- **Current Branch:** `deploy/altare-production-prep` (tracks `origin/deploy/altare-production-prep`, up-to-date at HEAD)
- **Exact HEAD SHA:** `67400bba16020a367cb3b65132cc0cde15c0a966`
- **Uncommitted / Untracked Changes Present:** **Yes** (no commits made after `67400bb`):
  - **28 Modified Tracked Files (`git diff --name-only`):** `README.md`, `prisma/schema.postgresql.prisma`, `prisma/schema.prisma`, `src/app/about/page.tsx`, `src/app/api/admin/factories/[id]/verify/route.ts`, `src/app/api/auth/me/route.ts`, `src/app/api/auth/register/route.ts`, `src/app/api/factories/[slug]/route.ts`, `src/app/api/factories/register/route.ts`, `src/app/api/factories/route.ts`, `src/app/api/factory/products/route.ts`, `src/app/api/factory/profile/route.ts`, `src/app/api/products/route.ts`, `src/app/api/rfqs/[id]/quotes/route.ts`, `src/app/api/rfqs/route.ts`, `src/app/buyer/dashboard/page.tsx`, `src/app/factories/[slug]/page.tsx`, `src/app/factories/register/page.tsx`, `src/app/faq/page.tsx`, `src/app/orders/[id]/page.tsx`, `src/app/products/page.tsx`, `src/app/rfqs/new/page.tsx`, `src/components/home/HowItWorksDualSection.tsx`, `src/components/layout/Footer.tsx`, `src/config/locations.ts`, `src/lib/auth/factory-context.ts`, `tests/unit/cysle-rebrand-and-locations.test.ts`, `tests/unit/document-authorization.test.ts`.
  - **Untracked Items (`git status --short` `??`):** `.agents/`, `docs/DB_MIGRATION_FACTORY_ONLY_PLAN.md`, `founder/` (including this report), `prisma/migrations/20261125000000_factory_only_attributes/`, `prisma/migrations_postgresql/20261125000000_factory_only_attributes/`, `src/lib/factory/`, `tests/unit/factory-only-alignment.test.ts`.
- **Push / Merge / Deployment Occurred:** **No** (`HEAD === origin/deploy/altare-production-prep`; zero pushes, zero merges, zero Altare/Vercel/Netlify deployments).
- **Production Configuration or Data Touched:** **No.**

---

## 6. Open Items Requiring Founder Decision Before Push / Staging

1. **Permission & Security Fixes (`FAIL` items to authorize patching before push):**
   - Add `marketplaceEnabled` + `VERIFIED` checks to `GET /api/marketplace/dashboard`, `GET /api/products/[id]`, and `POST /api/products/[id]/order` (plus `isActive` / buyer authorization).
   - Remove the `ADMIN` `prisma.user.findFirst({ where: { isBuyer: true } })` fallback in `GET /api/buyer/dashboard` (`src/app/api/buyer/dashboard/route.ts:20-26`).
   - Relax `quantity >= 10` to `quantity >= 1` (respecting `product.moq`) in `POST /api/products/[id]/order`.
   - Refresh the JWT session cookie when an already authenticated user registers a `FactoryProfile` via `POST /api/factories/register`.
2. **Registration Defaults Policy (`FAIL`):** Decide whether quick `/register` (`POST /api/auth/register`) and `/factories/register` should require empty/explicit capability entry (no pre-filled `2018` / `500` / default fabric claims) or flag auto-created quick profiles as incomplete drafts until filled.
3. **Directory Visibility (`REQUIRES FOUNDER APPROVAL`):** Confirm whether `GET /api/factories` should hide `PENDING` factories by default (showing only `VERIFIED`) or keep showing unverified listings unless `?verified=true` is passed.
4. **Migration Directory & PostgreSQL Backfill Precedence:** Confirm separating SQLite vs. PostgreSQL `migrations` directories or documenting `prisma/migrations/` strictly as PostgreSQL history matching `migration_lock.toml`, and optionally adding deterministic `DISTINCT ON` / indexes to `20261125000000_factory_only_attributes/migration.sql`.
5. **Release Authorization Gate:** Explicit founder approval is required before committing/pushing `deploy/altare-production-prep`, running staging PostgreSQL migrations, or beginning field outreach.
