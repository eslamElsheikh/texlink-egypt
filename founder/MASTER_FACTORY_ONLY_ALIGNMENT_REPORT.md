# CYSLE Egypt (سايسل مصر) — Master Factory-Only Alignment Report

*Date: `2026-11-25` | Branch: `deploy/altare-production-prep` | Status: Dev-Branch Code, Schema, Tests & Docs Aligned (Zero Production Changes)*

> **Governance & Safety Boundary:** All code, schema, and migration changes described in this report were executed **strictly on the development branch (`deploy/altare-production-prep`) and local SQLite development database (`prisma/dev.db`)**. **Zero production database changes, zero production migrations, zero live deployments, zero `main` merges, zero external contractor hires, zero money spent, and zero unsolicited business outreach** were performed.

---

## 1. Unified Business Entity Decision (`FACTORY` Only)

1. **ONE Production Entity Inside CYSLE:** Every independent textile production unit—starting from **1 person operating 1 machine** up to **>80 workers**—is a **`FACTORY`** inside CYSLE.
2. **Complete Removal of `Workshop` Classification:** There is no `Workshop` account type, registration option, marketplace seller category, customer persona, verification tier, pricing table, or onboarding workflow anywhere in active code, database schemas, UI, or active strategy docs.
3. **Five Analytical Size Segments (`Analytics & Pricing Experiments Only — Zero Exclusion`):**
   Defined in [`src/lib/factory/classification.ts`](../src/lib/factory/classification.ts) (`FACTORY_SIZE_SEGMENTS` / `classifyFactorySizeSegment`):
   - `INDIVIDUAL` — Individual Factory (`1` worker)
   - `MICRO` — Micro Factory (`2–5` workers)
   - `SMALL` — Small Factory (`6–20` workers)
   - `MEDIUM` — Medium Factory (`21–80` workers)
   - `LARGE` — Large Factory (`>80` workers)
4. **Decoupled Physical vs. Legal Verification:**
   - `verificationStatus` (`PENDING | VERIFIED | REJECTED`): Platform physical/operational existence verification (applies equally from `1` machine onward).
   - `commercialRegStatus` & `taxRegStatus` (`UNREGISTERED | PENDING | VERIFIED | REJECTED`): Separate optional legal registration attributes, never eligibility blockers for `Factory` registration or physical verification.

---

## 2. Independent Launch Geographies (Dakahlia)

Per final founder direction, **Salamoun El-Qomash** and **Tanamel** are tracked and validated as **two strictly independent markets**:

- **Market A — Salamoun El-Qomash (`سلامون القماش – مركز المنصورة – الدقهلية`):** Canonical area slug `mansoura-salamon` (`Mansoura District`).
- **Market B — Tanamel (`طنامل – مركز أجا – الدقهلية`):** Canonical area slug `mansoura-tanamil` (`Aga District`), corrected across `src/config/locations.ts` (`legacyCityMap` also normalizes `"أجا"` & `"مركز أجا"` to `"الدقهلية"`) and `src/components/layout/Footer.tsx`.
- **Target Field Validation Scope (`dakahlia-field-validation-plan.md` — Unexecuted / Awaiting Founder Execution Approval):** `30–35` physical Factory assessments + `4–6` RFQs in Salamoun, and `40–45` physical Factory assessments + `4–6` RFQs in Tanamel, compared only after Day-30 real field logs are collected.

---

## 3. Historical vs. Active Founder Documentation Audit

- **Preserved Historical Snapshots (Annotated with `[HISTORICAL — SUPERSEDED]` Notices, Original Evidence Intact):**
  - `founder/board.md`, `founder/board/brief.md`, `founder/board/offers.md`, `founder/board/monopoly.md`, `founder/board/product.md`
  - `founder/competitors.md`
  - `founder/panel/results.md`, `founder/panel-retest/results.md`
  - `founder/pitch-v1.md`, `founder/pricing-curve.md`
- **Aligned Active Strategy, Research, Finance & Execution Docs:**
  - `founder/FACTORY_ONLY_CLASSIFICATION_DECISION.md`, `founder/FINAL_APPROVAL_PACKAGE.md`, `founder/EXECUTIVE_SUMMARY.md`, `founder/DECISION_REVIEW.md`
  - `founder/dakahlia-market-research.md`, `founder/dakahlia-field-validation-plan.md`
  - `founder/pricing.md`, `founder/offer.md`, `founder/numbers.json`, `founder/cfo-sources.md`, `founder/cfo.md`
  - `founder/marketing.md`, `founder/brand.md`, `founder/ops.md`, `founder/launch.md`
  - `founder/idea.md`, `founder/pitch.md`, `founder/customer.json`, `founder/summary.md`, `founder/one-pager.md`, `founder/business-plan.md`
  - Active scan confirmed zero active `Workshop` CYSLE classification/personas remain in active docs.

### Key Revised Business & Financial Parameters (`[UNVALIDATED ASSUMPTIONS]` Until Field-Proven)

- **Pricing Philosophy (`0%` GMV fee; Buyers `0 EGP/mo`):** Free basic Factory account & physically verified Factory listing; unforced monetization differentiated only by Factory size, features, usage, and marketplace opportunities (Pay-Per-Qualified-Opportunity `100–200 EGP/RFQ` or Order-#1 fee `500–1,000 EGP`, optional Pay-Per-Service `250–500 EGP`, optional Micro/Small `250–350 EGP/mo`, Advanced Factory OS `490 / 790 / 1,490 EGP/mo`).
- **Founder-Led `0 EGP` Contractor Budget:** `12,000 EGP` contractor sprint, `6,000 EGP/mo` assistant payroll, `2,000 EGP/mo` launch ads, and `5,000 EGP` retainer removed.
- **Modeled Live Cloud Floor (`cfo.md` / `numbers.json`):** `1,948 EGP/month` based on published vendor list rates (`Altare Plus 434 + Supabase Pro 1,357 + Upstash PAYG 109 + Resend Free 0 + .com 48`; `0 EGP/mo` while pre-revenue sandboxed; **`45 EGP` out-of-pocket variable cash cost / paid Factory-month**).
- **Cash vs. Economic Break-Even:** At `350 EGP/mo` blended (`305 EGP` contribution), **Cash Break-Even = `7` Factories/mo** (`3,709 EGP` peak deficit); adding statutory minimum founder wage (`7,000 EGP`) + CPA (`1,500 EGP`) = `10,448 EGP/mo` -> **Economic Break-Even = `35` Factories/mo**. Segment cash break-evens: Individual (`150 EGP`) `19`/mo · Micro (`250 EGP`) `10`/mo · Small (`290 EGP`) `8`/mo · Medium (`490`/`790 EGP`) `5`/`3`/mo · Large (`1,490 EGP`) `2`/mo.

---

## 4. Application Codebase & Security Alignment

### Backend, Helpers, Locations & Auth
- [`src/lib/factory/classification.ts`](../src/lib/factory/classification.ts): Canonical 5 analytical segments (`INDIVIDUAL` through `LARGE`), `classifyFactorySizeSegment()`, `LegalRegistrationStatus`, `formatLegalStatusAr()`, `formatPhysicalVerificationAr()`.
- [`src/config/locations.ts`](../src/config/locations.ts): `mansoura-salamon` (`"سلامون القماش – مركز المنصورة – الدقهلية"`) and `mansoura-tanamil` (`"طنامل – مركز أجا – الدقهلية"`), plus `"أجا"` & `"مركز أجا"` normalization.
- [`src/lib/auth/factory-context.ts`](../src/lib/auth/factory-context.ts): Removed non-production `ADMIN` `findFirst()` cross-tenant fallback; requires explicit `inspectFactoryId` across all environments (`400` if omitted, `404` if nonexistent).
- [`src/app/api/factories/register/route.ts`](../src/app/api/factories/register/route.ts): Allows `workerCount >= 1`, `machineCount >= 1`, `monthlyCapacity >= 1`, `minOrderQuantity >= 1`, `bioAr >= 5` chars; optional CR/Tax uploads recorded separately via `commercialRegStatus`/`taxRegStatus`; atomic `prisma.$transaction` with `409` duplicate-registration guard and `User.factoryId` sync.
- [`src/app/api/auth/register/route.ts`](../src/app/api/auth/register/route.ts): Atomic `$transaction` initializing `FactoryProfile` (`workerCount = 1`, `machineCount = 1`, `minOrderQuantity = 1`, `monthlyCapacity = 1`, `UNREGISTERED` legal status), `FactorySettings`, default `Warehouse`, and `User.factoryId`, with neutral `"الدقهلية"` default.
- [`src/app/api/admin/factories/[id]/verify/route.ts`](../src/app/api/admin/factories/[id]/verify/route.ts): Decouples physical verification (`status`) from `commercialRegStatus` & `taxRegStatus`; updates `FactoryDocument` records only when the matching legal status changes.
- [`src/app/api/factories/route.ts`](../src/app/api/factories/route.ts), [`src/app/api/factories/[slug]/route.ts`](../src/app/api/factories/[slug]/route.ts), [`src/app/api/factory/profile/route.ts`](../src/app/api/factory/profile/route.ts), [`src/app/api/auth/me/route.ts`](../src/app/api/auth/me/route.ts): Expose `workerCount`, `machineCount`, analytical `sizeSegment`, `commercialRegStatus`, `taxRegStatus`, and `settings`; removed unnecessary `documents` select from `[slug]/route.ts`.
- **Marketplace & RFQ Security Gates:**
  - [`src/app/api/rfqs/route.ts`](../src/app/api/rfqs/route.ts): Removed guest `BUYER` `findFirst()` fallback (`401` unauthenticated, `403` non-buyer).
  - [`src/app/api/rfqs/[id]/quotes/route.ts`](../src/app/api/rfqs/[id]/quotes/route.ts): Uses `resolveFactoryContext()`, enforces `settings?.marketplaceEnabled` & `factory.verificationStatus === "VERIFIED"`, and removes duplicate `factoryProfile` query.
  - [`src/app/api/products/route.ts`](../src/app/api/products/route.ts) & [`src/app/api/factory/products/route.ts`](../src/app/api/factory/products/route.ts): Enforce `{ isDemo: false, accountStatus: "ACTIVE", verificationStatus: "VERIFIED", settings: { marketplaceEnabled: true } }` and `resolveFactoryContext()`.

### Frontend UI, Registration & Docs Cleanup
- [`src/app/factories/register/page.tsx`](../src/app/factories/register/page.tsx): Added `workerCount >= 1` & `machineCount >= 1` inputs with live analytical segment display, relaxed capacity (`>= 1`, `step={1}`) & MOQ (`>= 1`, `step={1}`), added knitwear/subcontracting specialties (`تريكو مسطح (فلات)`, `لضم وتشطيب`, `بيجامات وملابس منزلية`, `تشغيل للغير (عقد تصنيع)`), made legal document uploads explicitly optional, and removed `"والورش"` copy.
- Removed all remaining active `"ورش"` / `"ورشة"` strings across [`src/app/faq/page.tsx`](../src/app/faq/page.tsx), [`src/components/home/HowItWorksDualSection.tsx`](../src/components/home/HowItWorksDualSection.tsx), [`src/app/factories/[slug]/page.tsx`](../src/app/factories/[slug]/page.tsx), [`src/app/orders/[id]/page.tsx`](../src/app/orders/[id]/page.tsx), and [`README.md`](../README.md).
- Updated [`src/components/layout/Footer.tsx`](../src/components/layout/Footer.tsx), [`src/app/about/page.tsx`](../src/app/about/page.tsx), [`src/app/rfqs/new/page.tsx`](../src/app/rfqs/new/page.tsx), [`src/app/buyer/dashboard/page.tsx`](../src/app/buyer/dashboard/page.tsx), and [`src/app/products/page.tsx`](../src/app/products/page.tsx) to include Dakahlia (`سلامون القماش – مركز المنصورة – الدقهلية` and `طنامل – مركز أجا – الدقهلية`) cleanly without hardcoded Mahalla-only defaults.

---

## 5. Database Schema & Dev Migration Safety (`dev.db` Only)

- **Safety Plan Documented First:** [`docs/DB_MIGRATION_FACTORY_ONLY_PLAN.md`](../docs/DB_MIGRATION_FACTORY_ONLY_PLAN.md).
- **Synced Schemas:** Added `commercialRegStatus`, `taxRegStatus`, `workerCount`, and `machineCount`, and relaxed defaults `minOrderQuantity @default(1)` and `monthlyCapacity @default(1)` identically in [`prisma/schema.prisma`](../prisma/schema.prisma) and [`prisma/schema.postgresql.prisma`](../prisma/schema.postgresql.prisma).
- **Separate Provider Migration Histories Added:**
  - PostgreSQL (`prisma/schema.postgresql.prisma` -> `prisma/migrations/`): `20261125000000_factory_only_attributes` and `20261125010000_optional_factory_attributes` (with redundant duplicate `prisma/migrations_postgresql/` removed after scratch backup in Phase 14).
  - SQLite (`prisma/sqlite.config.mjs` -> `prisma/migrations_sqlite/`): `20260301000000_init_sqlite`, `20261125000000_factory_only_attributes`, and `20261125010000_optional_factory_attributes`.
- **Local Dev Execution (`prisma/dev.db`):** Backed up pre-migration DB to conversation scratch (`dev.db.pre_factory_only.bak`), applied the 4 additive `ALTER TABLE` columns safely, backfilled legal document state across all `401` `FactoryProfile` rows (`0` rows deleted/lost), and verified both Prisma clients generate cleanly (`v6.19.3`). Production database untouched.

---

## 6. Verification & QA Results

*(Recorded from automated verification runs against `deploy/altare-production-prep`.)*

- **Updated Unit Tests:**
  - [`tests/unit/document-authorization.test.ts`](../tests/unit/document-authorization.test.ts): Updated Prisma mock with `factoryProfile.findUnique` and `$transaction`.
  - [`tests/unit/cysle-rebrand-and-locations.test.ts`](../tests/unit/cysle-rebrand-and-locations.test.ts): Updated Dakahlia canonical area assertions (`سلامون القماش – مركز المنصورة – الدقهلية` and `طنامل – مركز أجا – الدقهلية`).
- **New Comprehensive Test Suite:**
  - [`tests/unit/factory-only-alignment.test.ts`](../tests/unit/factory-only-alignment.test.ts): Covers 5-segment classification, Dakahlia area independence, `ADMIN` `findFirst()` ban in `resolveFactoryContext()`, 1-person/1-machine registration without documents, duplicate registration `409`, `/api/auth/register` initialization, decoupled physical vs. legal verification, RFQ/quote/product security gates, and active source `"workshop"` string regression checks.
- **Checks Executed After Final Edits:** Re-verified via `npm test`, `npm run lint`, `npm run build`, and repository-wide consistency scan before final delivery (exact counts reported in session final response).

---

## 7. Remaining Pre-Validation / Operational Gaps (Not Yet Field-Proven)

1. **Real Field Evidence:** All market size numbers, pricing acceptance hypotheses, and cash/economic break-even counts in `founder/` remain `[UNVALIDATED ASSUMPTIONS]` until Day-14 / Day-30 Salamoun and Tanamel field execution produces paid EGP receipts.
2. **Deferred Non-Blocking Product Backlog:** Static legacy CRM/admin UI pages (pre-existing) and Daftra/Wafeq CSV export remain tracked in `FINAL_APPROVAL_PACKAGE.md` for post-validation sprint prioritization.
3. **Production Migration Timing:** PostgreSQL migration `20261125000000_factory_only_attributes` stays unapplied to production until explicit staging rehearsal (`STAGING_DEPLOYMENT_CHECKLIST.md`) and founder deployment authorization.
