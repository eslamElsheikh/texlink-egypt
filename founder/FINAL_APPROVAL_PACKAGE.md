# CYSLE Egypt (سايسل مصر) — Founder Final Approval Package *(Unified Factory Model)*

*Date: `2026-11-25`. Compiled strictly from the Factory-only classification decision, independent market profiles, reworked pricing, founder-led financials, operational SOPs, field validation plans, and read-only codebase inspection.*

> **Governance Rule:** This package presents all facts, assumptions, risks, codebase alignment status, and independent field plans for the founder's approval. **Zero money is spent, zero contractors hired, zero businesses contacted, and zero production database/deployment actions are made without explicit founder authorization.** *(Dev-branch codebase & SQLite `dev.db` alignment is compiled in [`MASTER_FACTORY_ONLY_ALIGNMENT_REPORT.md`](MASTER_FACTORY_ONLY_ALIGNMENT_REPORT.md).)*

---

## 1. Final Founder Decisions

1. **ONE Production Entity (`FACTORY` Only):** Every independent textile production unit inside CYSLE—from **1 person operating 1 machine** up to **>80 workers**—is a **Factory** (`FACTORY_ONLY_CLASSIFICATION_DECISION.md`). "Workshop" is permanently removed as any CYSLE account type, registration option, marketplace category, pricing tier, verification badge, or customer persona.
2. **Five Analytical Factory Size Segments (No Exclusion / No Separate Flows):** **Individual Factory (`1`)**, **Micro Factory (`2–5`)**, **Small Factory (`6–20`)**, **Medium Factory (`21–80`)**, and **Large Factory (`>80`)** — tracked for analytics and pricing experiments only, assessed across 12 capability, MOQ (`>= 1` pc), supply-chain, digital readiness, and WTP dimensions. Legal registration (`CR/Tax`) is a separate attribute, never an eligibility blocker.
3. **Salamoun and Tanamel Are Two Independent Markets:** Researched, seeded, validated, and scored separately with zero assumption that one outperforms the other before field evidence.
4. **Factory-Based Modular Pricing:** Differentiate only by Factory size, features, usage, production-management needs, and marketplace services (`0%` GMV fee; buyers `0 EGP/mo`), never forcing monthly SaaS onto Individual/Micro Factories.
5. **`0 EGP` External Dev / Contractor Budget (`12,000 EGP` Sprint Removed):** Founder personally handles engineering fixes, fieldwork, onboarding, and manual vetting on existing infrastructure.
6. **Broadened Value Proposition:** **CYSLE helps textile businesses of every size find opportunities, manage operations, and connect with the textile supply chain.**

---

## 2. Independent Profile — Market A: Salamoun El-Qomash (`سلامون القماش`)

- **District:** Mansoura District (`مركز المنصورة`), Dakahlia (~3–5 km from Mansoura; `mansoura-salamon` in `src/config/locations.ts`).
- **Public Footprint Estimate:** Press reports cite **`>200` production units** (`[EXTERNAL PRESS TERM: "small and medium workshops and factories"]` — un-audited; exact count across all 5 Factory segments unknown).
- **Activities & Products:** Flat knitting (`تريكو مسطح`), circular knitting, linking (`لضم`), overlock; winter wool/acrylic pullovers, kids winter sets, knit jackets, socks, scarves.
- **Directory & Ecosystem Status:** Nearby **DETEX** (`Sandoub`, QIZ anchor) and **Mansoura wholesale streets (`El-Sikka El-Gedida` / `El-Abbasi`)** (~10–15 min away); press-cited family producers (`Samak`, `El-Shabrawy`, `Mokhtar Abdel-Al`, `Mohamed El-Basel`) + open-street exhibition sellers (`معرض مفتوح`); `1` unverified static directory lead (`مصنع تريكو أبو خالد`, `atlasdatabase`).
- **Supply/Demand Hypotheses:** Off-season idle machine capacity (`Feb–Jul`), wool/acrylic yarn lot liquidity, aging machine parts/*fanni* needs, intra-village piece-work (`تشغيل للغير`), and direct RFQ/ready-stock matching with Mansoura wholesalers, visiting traders, and Cairo winter brands.

---

## 3. Independent Profile — Market B: Tanamel (`طنامل`)

- **District & Location Hygiene:** Aga District (`مركز أجا`), Dakahlia (East Tanamel, West Tanamel, Ezbet El-Itariya). *(Codebase aligned: `src/config/locations.ts` updated to `"طنامل – مركز أجا – الدقهلية"`.)*
- **Public Footprint Estimate:** Press/encyclopedia articles cite **`2,000+` production units** (`[EXTERNAL PRESS TERM: "home workshops, subcontractors, and registered factories"]` — un-audited; exact count and legal CR split unknown).
- **Activities & Products:** Computerized flat & circular tricot, yarn prep, linking, sewing/overlock, attached wholesale showrooms (`معارض`); children's wear, pajamas (`بيجامات`), sweaters, summer & winter tricot.
- **Directory & Ecosystem Status:** `9` unverified static directory leads (`Atlas`, `Adel El-Santawy`, `El-Ghannam`, `Kinzy`, `El-Batal`, `El-Iman`, `Markova`, `Naseej Textiles`, `Tricot Knitwear Factory` — all require physical/phone verification) + unlisted home/lane producers (`[HYPOTHESIS]`).
- **Supply/Demand Hypotheses:** Middleman compression (`الوسطاء`), periodic off-peak slowdowns (`كساد جزئي`), semi-formal producers seeking formalization (`تقنين الأوضاع`), active parcel dispatch via **Bosta / Aramex**, internal subcontracting (`knitting -> linking -> sewing`), and direct RFQ opportunities from Mansoura wholesalers, national e-commerce brands, and Large Factory overflow (`تشغيل للغير`).

---

## 4. Five Analytical Factory Size Segments & 12 Assessment Dimensions

1. **Individual Factory (`1` person)** · **2. Micro Factory (`2–5`)** · **3. Small Factory (`6–20`)** · **4. Medium Factory (`21–80`)** · **5. Large Factory (`>80`)**.
- **Holistic 12-Dimension Assessment (Never Workforce Alone):** Workforce (`>= 1`), machine count & types, production capacity, textile activity, products manufactured, available operating capacity, minimum order quantity (`MOQ >= 1`), subcontracting capability, raw-material needs, maintenance & spare-parts needs, digital readiness, and willingness to pay.

---

## 5. Revised Factory-Based Customer Personas

1. **Individual Factory Owner (`1` person, `1+` machines):** Takes piece-work (`تشغيل للغير`) or sells small lots; high downtime pain for yarn/parts/*fanni*; WhatsApp-only; requires `0 EGP` free entry.
2. **Micro / Small Factory Owner (`2–20` people):** Produces seasonal tricot/pullovers/pajamas; relies on street displays, showrooms, or middlemen; wants direct buyers, ready-stock catalog exposure, and optional simple costing.
3. **Medium Factory Owner (`21–80` people):** Uses notebooks/Excel or Daftra (ETA tax); bleeds `3–8%` on yarn waste & misquoting; wants vetted RFQs (`0%` GMV fee), 7-day BOM costing, and Daftra CSV coexistence.
4. **Large Factory / Overflow Issuer (`> 80` people):** Runs Daftra/Wafeq/Odoo; blocked today by missing staff RBAC/ETA bridges; valuable first as an **overflow subcontracting buyer** routing runs to smaller Factories.
5. **Buyer / Wholesaler / Brand (`0 EGP/mo`):** Mansoura wholesale trader or Cairo/online brand seeking verified Factories across all sizes, sealed quote comparison, and 6-stage milestone visibility.
6. **Supply-Chain Provider (`Yarn / Machinery / Parts / Fanni / Freight`):** `0 EGP` ecosystem waitlist capture today while validating Factory buying/repair demand.

---

## 6. Revised Factory-Based Pricing Strategy (`[HYPOTHESES]` — Unforced)

- **Free Features (`0 EGP`):** Basic Factory account, Free Physically-Verified Factory Listing (legal CR stored separately), ready-stock browsing/listing, `0 EGP/mo` Buyer RFQs + sealed quotes, and `0 EGP` supply-chain waitlist.
- **Pay-Per-Qualified Opportunity (`[HYPOTHESIS]`):** `0 EGP/mo` base + `100–200 EGP/unlocked vetted RFQ` OR `500–1,000 EGP` confirmed Order-#1 placement fee (primarily for `Individual` / `Micro` / `Small` Factories).
- **Pay-Per-Service (`[HYPOTHESIS]`):** Optional one-time SKU/costing setup (`250–500 EGP`) or buyer sample/QC chase service.
- **Optional Low-Cost Micro/Small Factory Plan (`[HYPOTHESIS]`):** `250–350 EGP/mo` lightweight yarn/piece cost tracking & wholesale catalog tiers (never forced; `Employee`/ERP bloat optional).
- **Paid Advanced Factory OS (`490–790–1,490 EGP/mo`):** **Starter (`490`)**, **Growth (`790`)**, **Multi-Line (`1,490` post-validation)** for `Medium`/`Large` Factories needing full costing, inventory, CRM, and Daftra CSV export (`0%` GMV fee).

---

## 7. Founder-Led Execution Model (`0 EGP` External Contractors)

The founder executes all codebase fixes, Salamoun & Tanamel discovery walks, machine verification, buyer credit vetting, WhatsApp concierge matching (`wa.me`), Google Sheets opportunity/payment ledgers, and onboarding (`15-min` lightweight setup vs. `48h` 5-SKU BOM setup) personally—no `12,000 EGP` sprint, no `6,000 EGP/mo` assistant, and no launch Meta ad burn (`60` active Factory solo capacity limit).

---

## 8. Updated Financial Model (`numbers.json` / `cfo.md` — `[UNVALIDATED ASSUMPTIONS]`)

- **Verification Caveat:** Modeled live cloud floor (**`1,948 EGP/month`**: `Altare Plus 434 + Supabase Pro 1,357 + Upstash PAYG 109 + Resend Free 0 + .com 48`) relies on **published vendor list rates (`54.27 EGP/USD`), NOT verified Cysle billing receipts** (`0 EGP` while pre-revenue sandboxed). Out-of-pocket variable cash cost: **`45 EGP`** / paid Factory-month; startup cash = **`0 EGP`**. Optional local transport/print/`.com.eg`/KYB require explicit founder approval.
- **Cash Break-Even vs. Economic Profitability (`unit_economics.py`):**
  - *Blended `350 EGP/mo` (`305` contrib.):* **Cash Break-Even = `7` Factories/mo** (`3,709 EGP` peak deficit); **Economic Break-Even** *(adding `7,000` statutory min founder wage + `1,500` CPA = `10,448 EGP/mo`)* = **`35` Factories/mo**.
  - *By Analytical Factory Segment (`1,948 EGP` cash floor vs. `10,448 EGP` economic floor):*
    - **Individual (`1` @ `150 EGP`):** `19`/mo cash (`7,173 EGP` peak deficit) · `100`/mo economic *(exceeds `60` solo cap; requires low-touch `<15 min` or buyer-funded fee)*.
    - **Micro (`2–5` @ `250 EGP`):** `10`/mo cash (`4,717 EGP` peak deficit) · `51`/mo economic.
    - **Small (`6–20` @ `290 EGP`):** `8`/mo cash (`4,129 EGP` peak deficit) · `43`/mo economic.
    - **Medium (`21–80` @ `490` / `790 EGP`):** `5` / `3`/mo cash (`3,006` / `2,406 EGP` peak) · `24` / `14`/mo economic.
    - **Large (`>80` @ `1,490 EGP`):** `2`/mo cash (`1,948 EGP` peak) · `8`/mo economic *(RBAC/ETA gated)*.

---

## 9. Independent Field Validation Plans (`dakahlia-field-validation-plan.md`)

- **Market A (`SALAMOUN`, `30–35` visits + `4–6` RFQs)** and **Market B (`TANAMEL`, `40–45` visits + `4–6` RFQs)** run completely independently using the **12-dimension Factory assessment rubric**, checking directory leads physically, mapping subcontracting/raw-material/maintenance needs, and collecting real EGP receipts across monetization arms before any cross-market comparison.

---

## 10. Measurable Success Criteria (Tracked Separately Per Market at Day 14 & Day 30)

1. Complete `30–35` (`SALAMOUN`) and `40–45` (`TANAMEL`) verified Factory assessments covering all 5 segments and `100%` of public directory leads.
2. Vet and route `4–6` real RFQs per market (`>= 60%` quoted `<48h`; log `<24h` SLA) yielding **`>= 3` real `Quote -> Order` matches**.
3. Identify clear Factory segment + monetization winner(s) covering the **`1,948 EGP/mo` cash floor** while keeping solo onboarding time sustainable (`<= 15–20 min` on free/low-cost tiers).
4. Complete the Day-30 evidence-only comparison table strictly from real field logs.

---

## 11. Main Business Risks

1. Stranger-buyer 30/60/90-day *sheekat* bounce risk if pre-RFQ buyer trade-reference vetting slips.
2. Founder time overload if manual support on `0 EGP` / `150 EGP` Individual Factory accounts breaches the `60`-account ceiling.
3. Buyer trust erosion if platform-verified physical Factories and legally registered `CR/Tax` Factories are not visually distinguished as separate attributes.
4. ETA e-invoicing & staff RBAC dealbreakers among `Medium`/`Large` Factories (`resolveFactoryContext()` / Daftra coexistence).
5. Unbuilt supply-chain expectations if yarn, spare parts, or *fanni* maintenance are miscommunicated as live today.

---

## 12. Technical Blockers — Resolved on Dev Branch (`deploy/altare-production-prep`)

*(Full implementation, DB migration safety plan, and test verification recorded in [`MASTER_FACTORY_ONLY_ALIGNMENT_REPORT.md`](MASTER_FACTORY_ONLY_ALIGNMENT_REPORT.md) and [`../docs/DB_MIGRATION_FACTORY_ONLY_PLAN.md`](../docs/DB_MIGRATION_FACTORY_ONLY_PLAN.md). Zero production DB or deploy changes executed):*
1. **DONE (Dev Branch):** `src/app/api/factories/register/route.ts` and `src/app/factories/register/page.tsx` now support `workerCount >= 1`, `machineCount >= 1`, `minOrderQuantity >= 1`, `monthlyCapacity >= 1`, optional CR/Tax uploads, and duplicate-registration guard (`409`).
2. **DONE (Dev Branch & SQLite `dev.db`):** `prisma/schema.prisma`, `prisma/schema.postgresql.prisma`, and PostgreSQL migration SQL add `workerCount`, `machineCount`, `commercialRegStatus`, and `taxRegStatus`; `src/lib/factory/classification.ts` computes the 5 analytical segments dynamically.
3. **DONE (Dev Branch):** Removed residual `"المصانع والورش"` / `"ورشته"` / `"والورشة"` UI copy from `register/page.tsx`, `faq/page.tsx`, `HowItWorksDualSection.tsx`, `factories/[slug]/page.tsx`, and `README.md`.
4. **DONE (Dev Branch):** `src/app/api/auth/register/route.ts` atomically creates `FactorySettings`, default `Warehouse`, `FactoryProfile` (`workerCount = 1`, `machineCount = 1`), sets `User.factoryId`, and uses neutral `"الدقهلية"` defaults.
5. **DONE (Dev Branch):** `src/config/locations.ts` & `Footer.tsx` display `"سلامون القماش – مركز المنصورة – الدقهلية"` and `"طنامل – مركز أجا – الدقهلية"`.
6. **DONE (Dev Branch):** `POST /api/rfqs` requires authentication (`401`/`403`); `quotes`/`products` enforce `marketplaceEnabled` + `VERIFIED`; `resolveFactoryContext()` rejects `ADMIN` `findFirst()` cross-tenant fallback across all environments (`400`/`404`). *(Remaining static UI screens & accounting CSV export deferred to post-validation or separate frontend backlog without blocking Day-1 field validation.)*

---

## 13. Prioritized Execution Roadmap *(Awaiting Explicit Founder Approval)*

1. **Founder Code Alignment (`0 EGP`):** Patch registration minimums (`1`-person+ support), separate legal status field, UI `"workshop"` cleanup, security/registration P0s, `locations.ts` label, CSV export, and `TexLink` scrub.
2. **Founder Governance Sign-Off:** Confirm separate legal-status badge copy, pricing experiment arms across the 5 Factory segments, and optional pocket budget (`0 EGP` vs. approved transport/print).
3. **Independent Buyer RFQ Seeding (`0 EGP`):** Collect `4–6` vetted RFQs for Salamoun and `4–6` for Tanamel.
4. **Independent 30-Day Field Execution:** Run Market A (`SALAMOUN`) and Market B (`TANAMEL`) validation logs separately.
5. **Day-30 Evidence Decision:** Populate post-validation comparison table and decide Month-2 focus strictly from paid evidence.
