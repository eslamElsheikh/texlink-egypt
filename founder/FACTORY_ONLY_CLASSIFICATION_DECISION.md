# CYSLE Egypt (سايسل مصر) — Factory-Only Classification Decision & Technical Alignment

*Date: `2026-11-25`. Final Product, Strategy, Market, Pricing, Financial & Codebase Governance Document.*

> **Final Principle:** **One platform entity. One business identity. Different factory sizes and capabilities.** In CYSLE, a person with one machine is a **Factory** just like a large manufacturing facility. The difference is their size, capabilities, and operational needs — never their business entity type.

---

## 1. Unified Factory Definition

CYSLE has **ONE production-business entity type**: **`FACTORY`**.

Every independent textile production unit inside CYSLE is classified and onboarded as a **Factory**, regardless of workforce size, machine count, output capacity, or legal registration status:
- **1 person operating 1 knitting/linking/sewing machine** = **Factory**
- **1 person operating multiple machines** = **Factory**
- **2–5 workers in a home/lane production unit** = **Factory**
- **20 workers in a multi-machine production unit** = **Factory**
- **80–150+ workers in a multi-line industrial facility** = **Factory**

*Important legal clarification:* **Factory** inside CYSLE is a **platform and operational entity definition**, not a legal representation that every account holds an Industrial Register or Commercial Register under Egyptian law.

---

## 2. Confirmation That "Workshop" Is Not a CYSLE Entity or Category

**Workshop is permanently removed as any CYSLE business classification.** Specifically, CYSLE does **not** contain or use:
- Workshop as an account type (`User.role` / `FactoryProfile`) or registration option
- Workshop as a Marketplace seller category
- Workshop as a separate customer persona or customer segment label
- Workshop-specific pricing tiers *(e.g., retired `"Workshop Lite"`)*
- Workshop verification tiers or `"Tier-A / Tier-B Factory vs. Workshop"` distinctions
- Workshop-specific onboarding flows or eligibility restrictions (`min workers`, `min capacity`, or forced CR blockers)

*Terminology Exception Rule:* When citing external public press sources, encyclopedias, historical Arabic translations (`ورشة` / *al-werash*), or prior simulated research snapshots (`v1` board/panel outputs), the word *"workshop"* may appear strictly as an **external quote or historical terminology reference**—explicitly labeled as non-CYSLE terminology.

---

## 3. Five Analytical Factory Size Segments (Research & Planning Only)

To understand differences in capacity, production complexity, operational needs, digital readiness, and willingness to pay, CYSLE tracks **five analytical Factory size segments**—with **zero** impact on entity type, registration eligibility, account structure, or platform permissions:

| Analytical Factory Segment | Workforce Range | Analytical Role Inside CYSLE |
|---|---|---|
| **Individual Factory** | **`1` person** | Solo 1+ machine operator; often seeks piece-work/subcontracting (`تشغيل للغير`), direct orders, yarn access, or maintenance links without monthly ERP overhead. |
| **Micro Factory** | **`2–5` people** | Family or tiny team unit; narrow production steps or seasonal stock; tests free listing, pay-per-opportunity/service, or lightweight tools. |
| **Small Factory** | **`6–20` people** | Multi-machine producer selling ready stock or custom lots; tests direct buyer matching, ready-stock catalog, and early costing/inventory needs. |
| **Medium Factory** | **`21–80` people** | Integrated multi-stage operation; bleeds margin on yarn/cutting waste and uncollected quotes; strongest candidate for paid Factory OS + vetted RFQs. |
| **Large Factory** | **`> 80` people** | Multi-shift facility with formal accounting (`Daftra`/`Wafeq`/`Odoo`); requires strict RBAC & accounting bridges; tests enterprise OS and **overflow RFQ subcontracting** to smaller Factories. |

**Holistic Capability Assessment (Never Workforce Alone):** Every Factory is assessed using **12 operational dimensions**: workforce (`min 1`), machine count & machine types, production capacity, textile activity, products manufactured, available working capacity, minimum order quantity (`MOQ`), subcontracting capability (`take` vs. `outsource`), raw-material requirements, maintenance & spare-parts needs, digital readiness, and willingness to pay.

---

## 4. Unified Registration Requirements (`1` Person Upward)

Every Factory uses **one unified registration path (`/factories/register` & `/api/factories/register`)** designed so an **Individual Factory (`1` person, `1` machine)** can register cleanly without arbitrary exclusions while preserving meaningful data validation:

| Field / Requirement | Unified Factory Standard *(Future Implementation Target)* | Validation Rationale |
|---|---|---|
| **Business Entity Type** | Single `FACTORY` profile (`isFactory = true`) | Zero Factory vs. Workshop branch. |
| **Factory / Business Name & Owner Name** | Required (`>= 2–3` chars; owner's or brand/trade name accepted) | Supports solo operators using their own trade name. |
| **Location** | Governorate + District/Area + City + Address *(masked publicly until quote acceptance)* | Ensures accurate Dakahlia matching (**Salamoun El-Qomash — Mansoura** vs. **Tanamel — Aga**). |
| **Textile Activities & Products/Services** | Required multi-select (`>= 1`, adding flat knit, circular knit, linking/`لضم`, finishing, ready-stock, subcontracting) | Core input for matching RFQs & subcontracting. |
| **Number of Workers** | Integer, **minimum `1`** *(new attribute needed alongside `sizeSegment` derived/analytical only)* | Explicitly admits 1-person operators. |
| **Machine Count & Machine Types** | `machineCount >= 1` + `machines >= 1` (`Stoll`, `Shima`, `Cixing`, manual flat, circular, overlock, linking, singer) | Captures real capability regardless of worker headcount. |
| **Production Capacity (Monthly)** | Positive integer, **recommended minimum `1` (or `>= 5` pcs/mo), NOT `100`** | Supports high-value/heavy knitwear or solo operators starting small. |
| **Minimum Order Quantity (`MOQ`)** | Positive integer, **recommended minimum `1` piece, NOT `10` or `50`** | Allows solo/micro Factories to accept single-sample, small-batch, or linking runs. |

---

## 5. Legal Registration as a Separate Attribute (Privacy Protected)

- **Entity Independence:** Lack of a Commercial Register (`السجل التجاري`), Tax Card (`البطاقة الضريبية`), or Industrial Register (`السجل الصناعي`) does **NOT** stop a production unit from registering and operating as a **Factory** inside CYSLE.
- **Two Orthogonal Attributes:**
  1. **Platform Operational Verification (`verificationStatus` / Physical Verification):** Whether CYSLE confirmed that the Factory physically exists, owns working machines, and can fulfill orders (e.g., on-site or live video machine verification).
  2. **Legal Registration Status (`legalRegistrationStatus` — separate attribute):** Records whether Commercial Register, Tax Card, and/or Industrial Register documents were uploaded and verified—so buyers have transparent risk information (`Verified Legal Docs ✓` vs. `Unregistered / Informal Producer — Field-Verified Machines`) without creating a "Workshop" entity!
- **Document Privacy:** Private uploads (`factory-private-documents`, `/api/documents/[id]`) must remain strictly scoped to the uploading owner and authorized admins (`document-authorization.test.ts`), never exposed publicly on marketplace profiles.

---

## 6. Unified Marketplace Identity

Inside CYSLE's Marketplace (`/factories`, `/products`, `/rfqs`), **every producer is presented under one unified `FACTORY` seller identity**. Buyers filter Factories by:
- Location (`governorate`, `industrialArea`)
- Textile activity, specialties, fabrics & machine types
- Production capacity, `MOQ`, and available working capacity
- Operational Verification status & Legal Registration badge (when disclosed)

Buyers never navigate separate "Factory Directory" vs. "Workshop Directory" tabs, nor are subcontracting Factories segregated from direct-production Factories.

---

## 7. Revised Pricing Principles (`Factory-Only`, Unforced)

All pricing scenarios are **Factory-based** and may differentiate strictly by **Factory size segment, required features, usage volume, production-management needs, and marketplace services** — **never** by Factory vs. Workshop:

1. **Free Basic Factory Account & Free Verified Factory Listing (`0 EGP`):** Accessible to all 5 segments (`1` person to `>80`), including profile visibility, catalog listing, and honest `0 EGP` supply-chain waitlist access.
2. **Modular Entry for Individual & Micro/Small Factories (`1–20` people):** Never force monthly ERP subscriptions (`490–790 EGP/mo`) where fixed revenue isn't steady. Test **Pay-Per-Qualified Opportunity (`100–200 EGP/unlocked RFQ` or `500–1,000 EGP` Order-#1 placement fee)**, **Pay-Per-Service (`250–500 EGP` optional manual setup)**, and **Optional Low-Cost Micro/Small Factory Plan (`250–350 EGP/mo`)**.
3. **Advanced Factory OS Tiers (`490–790–1,490 EGP/mo`):** Priced for **Medium (`21–80`)** and **Large (`>80`)** Factories needing daily `ProductionOrder` BOM costing, `WasteRecord` variance control, inventory/employees, CRM, Daftra/Wafeq CSV exports, and high-volume RFQ quoting (`0%` GMV fee; buyers `0 EGP/mo`).
4. **Founder-Led Financials (`0 EGP` External Dev / `12,000 EGP` Budget Removed):** All product work and validation are founder-executed against a published-rate cloud baseline estimate (`~1,948 EGP/mo` once live customer ledgers run, unbilled pre-launch), strictly separating **cash break-even** (`3–19` paid Factory units depending on segment price) from **economic profitability** (which includes imputed founder labor, taxes, and full scaling overhead).

---

## 8. Implications for Independent Salamoun & Tanamel Research

- **Market A: Salamoun El-Qomash (`سلامون القماش` — Mansoura District)** and **Market B: Tanamel (`طنامل` — Aga District)** remain **two completely independent markets** with separate directories, field validation plans, demand seeding, quote SLAs, and conversion logs (`dakahlia-market-research.md`, `dakahlia-field-validation-plan.md`).
- **Unified Classification Across Both Markets:** Both markets apply the exact same `FACTORY` definition and 5 analytical segments (`Individual 1`, `Micro 2–5`, `Small 6–20`, `Medium 21–80`, `Large >80`)—replacing all prior `"workshop"`, `"Tier 1–3"`, and `"Tier-B Village Workshop"` phrasing.
- **No Pre-Judgment:** Side-by-side comparison occurs **only after** independent field evidence is collected in both Salamoun and Tanamel.

---

## 9. Read-Only Codebase Inspection: Exact Mismatches With Unified Factory Model

*Audited read-only across `src/` and `prisma/` (`0` source files or database schemas modified):*

| Area | Exact File Path & Observed Implementation | Why It Contradicts Unified Factory Model or Launch Readiness |
|---|---|---|
| **1. Minimum Monthly Capacity (`>= 100`)** | [`src/app/api/factories/register/route.ts#L27`](../src/app/api/factories/register/route.ts#L27) (`monthlyCapacity: z.number().int().min(100)`) & [`src/app/factories/register/page.tsx#L46,L663`](../src/app/factories/register/page.tsx#L46) (`default 20000`, `step={1000}`) | Excludes an **Individual Factory (`1` person)** or bespoke flat-knit producer making `< 100` heavy/custom pieces/month. |
| **2. Minimum Order Quantity (`>= 10`)** | [`src/app/api/factories/register/route.ts#L28`](../src/app/api/factories/register/route.ts#L28) (`minOrderQuantity: z.number().int().min(10)`) & [`page.tsx#L47,L681`](../src/app/factories/register/page.tsx#L47) (`default 50`, `step={10}`) | Excludes Individual/Micro Factories accepting `1–9` piece samples, repairs, or micro runs. |
| **3. Missing Workforce / Size / Legal Status Attributes** | [`prisma/schema.prisma#L38-L68`](../prisma/schema.prisma#L38-L68) (`FactoryProfile`) | `FactoryProfile` has **no** `workerCount`, analytical `sizeSegment`, `machineCount`, or separate `legalRegistrationStatus` field (`verificationStatus` alone conflates physical verification with CR/Tax docs). |
| **4. Residual `"Workshop"` UI Wording (`ورشة` / `الورش`)** | [`src/app/factories/register/page.tsx#L724`](../src/app/factories/register/page.tsx#L724), [`src/app/faq/page.tsx#L20`](../src/app/faq/page.tsx#L20), [`src/components/home/HowItWorksDualSection.tsx#L194`](../src/components/home/HowItWorksDualSection.tsx#L194) | Copy says `"للمصانع والورش"` / `"ورشته"` instead of unified **Factory** terminology, and `page.tsx#L256,L724` tells registrants access requires formal Commercial Register verification even though `route.ts#L36-L41` marks doc URLs `.optional()`. |
| **5. `Workshop` Enum / Model / Seller Category Check** | [`prisma/schema.prisma#L11-L137`](../prisma/schema.prisma#L11-L137) | **Aligned:** Zero `Workshop` enum, model, role, or seller category exists anywhere in `prisma/` or API routes (`User.role` = `BUYER` \| `FACTORY` \| `ADMIN`, and all production models use `factoryId`). |
| **6. Basic Signup Registration Bug (`FactorySettings` & Location)** | [`src/app/api/auth/register/route.ts#L48-L83`](../src/app/api/auth/register/route.ts#L48-L83) | Creates `FactoryProfile` without `FactorySettings` (causing [`src/app/api/factories/route.ts#L29`](../src/app/api/factories/route.ts#L29) to hide them!) and without a default `Warehouse`; hardcodes `"المحلة الكبرى"` / `"المحلة"` defaults. |
| **7. Tanamel District Label (`locations.ts`)** | [`src/config/locations.ts#L45-L52`](../src/config/locations.ts#L45-L52) | `mansoura-tanamil` displays `"المنصورة – طنامل"` even though Tanamel is in **Aga District (`مركز أجا`)**. |
| **8. Security & Marketplace Gate Seams** | [`src/app/api/rfqs/route.ts#L99-L106`](../src/app/api/rfqs/route.ts#L99-L106), [`src/app/api/rfqs/[id]/quotes/route.ts`](../src/app/api/rfqs/[id]/quotes/route.ts), [`src/app/api/products/route.ts`](../src/app/api/products/route.ts), [`src/app/api/auth/me/route.ts`](../src/app/api/auth/me/route.ts), [`src/app/api/factory/products/route.ts#L36-L38`](../src/app/api/factory/products/route.ts#L36-L38) | Unauthenticated `POST /api/rfqs` attributes RFQs to first DB `BUYER`; quotes/products do not enforce `marketplaceEnabled`; `/api/auth/me` omits `FactorySettings`; `factory/products` allows `ADMIN` fallback via `findFirst()` instead of explicit `inspectFactoryId`. *(Private document ACL in [`src/app/api/documents/[id]/route.ts`](../src/app/api/documents/[id]/route.ts) and [`src/lib/auth/factory-context.ts`](../src/lib/auth/factory-context.ts) properly isolate `factoryId`.)* |

---

## 10. Future Implementation Recommendations *(For Founder Execution Only After Approval)*

1. **Relax `factories/register` Thresholds & Neutralize Copy:** Lower API validation minimums (`monthlyCapacity.min(1)`, `minOrderQuantity.min(1)`), replace `"step={1000}"` / `"default 20000"` UI defaults with neutral placeholders, add `workerCount` (`min(1)`), `machineCount` (`min(1)`), and knitwear/subcontracting specialties (`تريكو مسطح`, `لضم وتشطيب`), and remove `"للمصانع والورش"` wording across `page.tsx`, `faq/page.tsx`, and `HowItWorksDualSection.tsx`.
2. **Separate `verificationStatus` From `legalRegistrationStatus`:** Add an optional/separate legal registration status indicator (`UNREGISTERED` / `PENDING` / `CR_TAX_VERIFIED`) on `FactoryProfile` so `1`-person and micro Factories verified physically on-site can receive `verificationStatus = "VERIFIED"` (or a distinct platform-verified flag) cleanly without fake legal claims or document exposure.
3. **Patch P0 Security & Registration Seams:** Require authenticated `BUYER` session on `POST /api/rfqs`; create `FactorySettings` + default `Warehouse` in `POST /api/auth/register` and remove `"المحلة الكبرى"` fallback; enforce `FactorySettings.marketplaceEnabled` on quoting/products; expose `FactorySettings` in `/api/auth/me`; require explicit `inspectFactoryId` for `ADMIN` in `/api/factory/products`.
4. **Correct `locations.ts` Display Label:** Update `mansoura-tanamil` label from `"المنصورة – طنامل"` to reflect **Aga District (`أجا – طنامل`)** cleanly without breaking slug/query behavior.
