# Executive Summary — Cysle Egypt (سايسل مصر) *(Factory-Only Strategic Package)*

*Prepared `2026-11-25` (Revised per Unified Factory Classification & Final Founder Decisions).*

> **Governance Notice:** CYSLE uses **ONE production entity type (`FACTORY`)** starting from `1` person / `1` machine. Zero money is spent, zero contractors hired, and zero external businesses contacted without explicit founder authorization. All financial figures are `[UNVALIDATED ASSUMPTIONS]` until confirmed by real billing receipts and paying Factories.

---

## PART I — EXECUTIVE BRIEF (Founder-Led Strategy & Execution)

### 1. Core Strategic Mandates Embedded
1. **ONE Business Entity Type (`FACTORY` Only):** Every independent textile production unit—from **1 person operating 1 machine** up to a **100+ worker plant**—is a **Factory** inside CYSLE (`FACTORY_ONLY_CLASSIFICATION_DECISION.md`). "Workshop" is permanently retired as a CYSLE entity, account type, pricing tier, verification badge, or persona.
2. **Five Analytical Factory Size Segments (`Research & Analytics Only — Zero Exclusion`):** **Individual Factory (`1` person)** · **Micro Factory (`2–5`)** · **Small Factory (`6–20`)** · **Medium Factory (`21–80`)** · **Large Factory (`>80`)**, assessed across 12 capability, capacity, MOQ (`>= 1` pc), supply-chain, digital readiness, and WTP dimensions. **Legal registration (`CR/Tax`) is stored as a separate attribute, never a blocker.**
3. **Two Independent Markets:** **Market A: Salamoun El-Qomash (`سلامون القماش` — Mansoura)** and **Market B: Tanamel (`طنامل` — Aga)** are researched, tracked, and validated independently with zero pre-judgment before field evidence.
4. **Unforced, Factory-Based Pricing:** Differentiates strictly by Factory size, features, usage, production-management needs, and marketplace services: **Free Basic Account & Free Verified Factory Listing (`0 EGP`)**, **Pay-Per-Qualified Opportunity**, **Pay-Per-Service**, **Optional Low-Cost Micro/Small Factory Plan**, and **Advanced Factory OS (`490–790–1,490 EGP/mo`)**, with `0%` GMV fee and `0 EGP/mo` buyers.
5. **Founder-Led Execution (`0 EGP` External Dev/Contractor Budget):** The `12,000 EGP` dev sprint, `6,000 EGP/mo` assistant payroll, `2,000 EGP/mo` launch ads, and `5,000 EGP` speculative retainer are permanently removed (`0 EGP`).

---

### 2. Broadened Value Proposition
**CYSLE helps textile businesses of every size find opportunities, manage operations, and connect with the textile supply chain:**
- **Individual & Micro Factories (`1–5`):** Free basic account, Free Verified Factory Listing, subcontracting (`تشغيل للغير`) & ready-piece visibility, without forced monthly SaaS.
- **Small Factories (`6–20`):** Direct buyers/wholesalers (cutting broker squeezes), ready-stock wholesale catalog, vetted RFQs, and optional low-cost costing tools.
- **Medium & Large Factories (`21–80` / `>80`):** 7-day piece costing & yarn-waste control, Daftra/Wafeq CSV bridge, sealed vetted RFQs (`0%` GMV fee), and overflow subcontracting to smaller Factories.
- **Buyers & Wholesalers (`0 EGP`):** Sealed quotes from verified Factories across all sizes + 6-stage tracking.
- **Suppliers (`0 EGP` Waitlist):** Honest demand logging for yarn, machinery/parts, *fanni* mechanics, and freight.

---

### 3. Founder-Led Financial Summary (`cfo.md` & `numbers.json`, `[UNVALIDATED ASSUMPTIONS]`)
- **Modeled Live Cloud Floor (`1,948 EGP/month` `[PUBLISHED VENDOR LIST RATES — NOT BILLING-VERIFIED]`):** `Altare Plus 434 + Supabase Pro 1,357 + Upstash PAYG 109 + Resend Free 0 + .com 48` (`0 EGP/mo` during pre-revenue free sandbox testing). Out-of-pocket variable cash cost: **`45 EGP`** / paid Factory-month.
- **Cash Break-Even vs. Economic Profitability:**
  - At **`350 EGP/mo`** blended assumption (`305 EGP` cash contribution): **Cash Infra Break-Even = `7` monetized Factories/month** (`3,709 EGP` peak deficit).
  - Imputing even statutory minimum founder wage (`7,000 EGP/mo`) + CPA compliance (`1,500 EGP/mo`) = **`10,448 EGP/mo` economic overhead** -> **True Economic Break-Even = `35` monetized Factories/month**.
  - **5 Analytical Segment Cash Break-Evens (`1,948 EGP` floor):** Individual (`150 EGP`) = **`19`** (cannot cover full economic wage alone at `150` within `60` solo cap); Micro (`250 EGP`) = **`10`**; Small (`290 EGP`) = **`8`**; Medium (`490`/`790 EGP`) = **`5` / `3`**; Large (`1,490 EGP`) = **`2`**.

---

### 4. Dev-Branch Alignment Status & Independent Validation Path
- **Dev-Branch Code & Schema Alignment Complete ([`MASTER_FACTORY_ONLY_ALIGNMENT_REPORT.md`](MASTER_FACTORY_ONLY_ALIGNMENT_REPORT.md)):** Relaxed `monthlyCapacity >= 1` & `minOrderQuantity >= 1` with `workerCount >= 1` / `machineCount >= 1`; separated physical verification from optional `commercialRegStatus` / `taxRegStatus`; scrubbed `"ورش"`/`"ورشة"` copy (`register/page.tsx`, `faq/page.tsx`, `HowItWorksDualSection.tsx`, `factories/[slug]/page.tsx`, `README.md`); patched `POST /api/rfqs` guest fallback, `POST /api/auth/register` `FactorySettings`/`Warehouse`, `marketplaceEnabled` checks, `ADMIN` `resolveFactoryContext()` `findFirst()` bypass, and `locations.ts` Dakahlia labels. *(Production DB & deployment strictly untouched.)*
- **Two Independent Validation Tracks (`dakahlia-field-validation-plan.md`):** **Market A (`SALAMOUN`: `30–35` visits + `4–6` RFQs)** and **Market B (`TANAMEL`: `40–45` visits + `4–6` RFQs)** executed separately only after explicit founder approval.

---

## PART II — FOUNDER APPROVAL SIGN-OFF

Complete sign-off items live in [`FACTORY_ONLY_CLASSIFICATION_DECISION.md`](FACTORY_ONLY_CLASSIFICATION_DECISION.md) and [`FINAL_APPROVAL_PACKAGE.md`](FINAL_APPROVAL_PACKAGE.md).
