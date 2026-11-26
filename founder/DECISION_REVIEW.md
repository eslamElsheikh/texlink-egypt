# Cysle Egypt — Independent Investment Committee Decision Review

*Date: `2026-11-25` (Updated with Part 6 Historical Addendum and Part 7 Final Founder Mandates Override — see [`FACTORY_ONLY_CLASSIFICATION_DECISION.md`](FACTORY_ONLY_CLASSIFICATION_DECISION.md) and [`FINAL_APPROVAL_PACKAGE.md`](FINAL_APPROVAL_PACKAGE.md)).*

> **Methodology & Epistemic Rules:** Zero application code, Prisma schemas, databases, or production configs were modified. Parts 1–4 reflect the historical committee critique (including external terms like *al-werash* / *"workshops"* in their original historical context); **Part 5 and Part 7 reflect the final founder mandates (`FACTORY`-only entity, 5 analytical size segments starting from `1` person, independent Salamoun & Tanamel markets, unforced Factory pricing, and `0 EGP` external dev/contractor budgets).**

---

## Executive Committee Summary

The previous 11-skill plan already made major healthy cuts (dropping the `2.5%` offline GMV commission, freezing 5 unbuilt marketplace verticals, and cutting `1,490 EGP/mo` blind entry pricing). **However, an adversarial review exposes four remaining vulnerabilities that could still stall launch:**

1. **Splitting 1 solo founder across 2 cities (`El-Mahalla` + `Gesr El-Suez/Obour`)** cuts hub liquidity in half and increases travel/burn under `0 EGP` payroll. **Committee Decision: CHANGE to 1 primary hub first.**
2. **Pre-discounting Cohort #1 to flat `490 EGP/mo` for 3 months** creates a `-19,423 EGP` Year-1 operating loss at steady overhead (`44`-factory break-even) and builds a dangerous `+61%` Month-4 churn cliff to `790 EGP/mo`. **Committee Decision: TEST `790 EGP/mo` and `490 EGP + 200 EGP/extra RFQ` first alongside `490 EGP`.**
3. **Treating `20–150` workers as one homogeneous factory segment** hides two incompatible buyers (`20–40` informal WhatsApp workshops vs. `80–150` ETA/RBAC-dependent plants). **Committee Decision: NARROW / TEST `25–80` workers first.**
4. **Pitching "Factory OS + RFQ" evenly** ignores that simulated factories rejected cold Factory OS (`0/11` baseline, `0/7` re-test) while Apparel Brands converted at `17% -> 25%` (`0 EGP`). **Committee Decision: Lead with Demand (Vetted Brand RFQs + Ready-Stock Catalog) as Acquisition Engine, and use Per-Piece Costing + Work Orders as the Retention Engine.**

---

## Part 1 — Challenge of the 8 Core Business Decisions

### Decision 1: Factory OS + Vetted Apparel RFQ as the Initial Commercial Wedge
- **Original recommendation:** Sell 7-day per-piece costing (`Factory OS`) paired with vetted brand RFQ access as a single combined wedge.
- **Evidence supporting it:**
  - Both capabilities are actually built in code today (`ProductionOrder`, `StockMovement`, `WasteRecord`, `ProductionCost`, `Rfq`, `Quote`, `matchFactoriesForRfq()`, `Order -> ProductionOrder` conversion).
  - Pure Factory OS lacks ETA e-invoicing (`Daftra`, `Wafeq`, `Edara` all have it); pure RFQ marketplaces suffer post-Sample-#1 WhatsApp disintermediation. Pairing demand + floor costing solves both traps in theory.
- **Evidence against it:**
  - Even with the `490 EGP/mo` offer stack and 48h migration, **`0/7` simulated factories bought** in `panel-retest/`. Selling *both* internal ERP workflow change *and* an unproven B2B marketplace doubles the mental switching cost in a 10-minute pitch.
  - Factories that want orders resist entering internal fabric/BOM data upfront; factories that want costing don't want marketplace profiles exposed.
  - `POST /api/auth/register` currently fails to provision `FactorySettings`/`Warehouse`, and `Employee` RBAC isn't wired—meaning multi-user Factory OS onboarding hits friction on Day 1.
- **Hidden assumptions:** (1) That the same person (factory owner) values both internal waste math and external buyer RFQs equally on Day 1; (2) That an owner will tolerate 48h BOM data migration before seeing an order.
- **What would make it fail?** If factories take the vetted RFQs, quote on paper/WhatsApp, ignore the 17-module OS after Month 1, and churn once they have the brand's WhatsApp number.
- **Cheapest real-world experiment:** In the first **20 live Cairo/Mahalla factory visits**, split the door-opener strictly across **10 Demand-First pitches** (*"Quote these 2 vetted brand RFQs in 48h + track your order margin"*) vs. **10 Costing-First pitches** (*"See exact per-piece profit/waste on your active run in 10 minutes"*). Measure paid cash closes (`>= 490 EGP`) and Day-14 usage on each arm.
- **Final decision:** **TEST FIRST (with narrower Demand-Hook -> Costing-Retention framing).**

### Decision 2: Targeting Factories With 20–150 Workers
- **Original recommendation:** Target domestic SME knitwear/RMG factories with `20–150` workers.
- **Evidence supporting it:**
  - Avoids micro *al-werash* (`< 15–20` workers, extreme price resistance to `490–790 EGP/mo`) and large export/QIZ plants (`200+` workers, locked into SAP/Odoo/custom ERP).
  - Runs at `20–150` workers handle `200–2,000+` piece MOQs where yarn waste (`3–8%`) matters financially.
- **Evidence against it:**
  - `20–150` spans **two opposite operating structures**:
    - *20–40 workers:* Owner runs floor personally, zero dedicated cost accountant, relies heavily on informal cash/WhatsApp, rejects fixed software overhead.
    - *80–150 workers:* Has formal accountants, **requires ETA e-invoicing** and **role-separated staff logins** (`PRODUCTION_EMPLOYEE` vs `CRM_MANAGER` vs `OWNER`)—where Cysle's unlinked `Employee` table and uniform `resolveFactoryContext()` permissions become an active blocker!
- **Hidden assumptions:** That a `120`-worker factory shares the same UX, RBAC, and compliance expectations as a `25`-worker workshop.
- **What would make it fail?** Smaller workshops (`20–35`) churn over `490–790 EGP/mo` budget resistance; larger plants (`90–150`) reject Cysle over missing multi-user RBAC and native ETA e-invoicing.
- **Cheapest real-world experiment:** Track factory size on every demo in the first 20–30 visits across sub-bands (`15–35`, `35–80`, `80–150`) and compare `demo -> cash paid` conversion and Day-14 active usage.
- **Final decision:** **CHANGE -> Narrow initial target to `25–80` worker growth-stage domestic factories, and test sub-bands empirically.**

### Decision 3: Launching in El-Mahalla and Gesr El-Suez / Obour
- **Original recommendation:** Launch Founding Hub Cohort #1 simultaneously across **both** `El-Mahalla El-Kubra` (`10` seats) and `Gesr El-Suez / Obour` (`10` seats).
- **Evidence supporting it:**
  - Both are premier real Egyptian knitwear/RMG manufacturing clusters (`market-researcher` `#5`).
  - Capping 10 factories per hub creates capacity-backed scarcity.
- **Evidence against it:**
  - Under the bootstrapped budget (`0 EGP` payroll M1–M4, `3,500 EGP/mo` travel+telecom+ads), **1 solo founder cannot work two hubs 130 km apart simultaneously** without losing full workdays to Cairo–Gharbia highway transit.
  - Marketplace liquidity depends on **local density**. Splitting 10 factories into 5 in Mahalla + 5 in Gesr El-Suez halves local social proof and slows sample courier handoffs between Cairo apparel brands and factories.
  - Code check: `src/config/locations.ts` currently only defines industrial sub-areas for Dakahlia (`mansoura-salamon`, `mansoura-tanamil`), not Mahalla or Gesr El-Suez!
- **Hidden assumptions:** That Cairo brands treat Mahalla circular-knit mills and Gesr El-Suez cut-and-sew workshops interchangeably, and that one founder has bandwidth to verify/onboard two separate geographies in 21 days.
- **What would make it fail?** Diluted field cadence, missed 48h migration SLAs, slow sample loops to Cairo brands, and neither hub reaching the critical mass needed for word-of-mouth referrals.
- **Cheapest real-world experiment:** Seed **5 real Cairo brand RFQs** first and inspect *which* hub matches their actual fabric/garment specs and accepts same-day sample pickup. Run **100% of Weeks 1–4 field walks in ONE hub** (default: **Gesr El-Suez / Obour** if founder is Cairo-based for instant brand sample proximity, OR **El-Mahalla** if founder is Gharbia-based for circular-knit concentration) until `>= 10` paying factories and `>= 5` matched runs close.
- **Final decision:** **CHANGE -> Launch ONE primary hub first; unlock Hub #2 only after 10 paying factories in Hub #1.**

### Decision 4: Starter 490 EGP and Growth 790 EGP Monthly Pricing
- **Original recommendation:** Launch at `490 EGP/mo` Founding rate (3 months on `790 EGP/mo` Growth tier), stepping up to `790 EGP/mo` Growth or `490 EGP/mo` Starter from Month 4 (`590 EGP/mo` blended target).
- **Evidence supporting it:**
  - Van Westendorp (`n=30`) placed acceptable pricing at **`248–901 EGP/mo`** (`OPP 302`, `IPP 490`, `PME 901`; Factory-only `IPP 603`, `PME 1,103`).
  - Matches local SME SaaS anchor (`Daftra ~490–733 EGP/mo`, `Wafeq 805–2,490 EGP/mo`).
- **Evidence against it:**
  - **Financial weakness of flat `490 EGP/mo`:** At `14,544 EGP/mo` steady overhead, `490 EGP` loses `-11,194 EGP/mo` at 10 factories, loses `-6,169 EGP/mo` at 25 factories, and loses **`-19,423 EGP`** across Year 1 (`44`-factory break-even).
  - **The Month-4 Churn Cliff:** Giving Growth (`790 EGP`) for **`490 EGP` for 3 months** anchors early factories at `490 EGP`. Asking a price-sensitive workshop to pay `+61%` more (`490 -> 790 EGP`) in Month 4 risks mass downgrade to `490` Starter or churn—trapping Cysle below the `590 EGP` profitability line!
  - Meanwhile, **`790 EGP/mo` breaks even at just `12` factories (bootstrapped) or `25` factories (steady)**—nearly half the customers needed at `490 EGP`!
- **Hidden assumptions:** That factories convert meaningfully better at `490` than `790 EGP/mo` *when real brand RFQs are on the table*, and that 50%+ will voluntarily accept a Month-4 price jump.
- **What would make it fail?** Either `790 EGP/mo` stalls (`<10%` close) OR Cohort #1 locks into `490 EGP/mo` forever and refuses the Month-4 upgrade, capping Year-1 margins in the red.
- **Cheapest real-world experiment:** Skip a blanket 3-month `490 EGP` giveaway. Across the first 20 demos, run an immediate live A/B test using real payment links: **10 factories pitched `490 EGP/mo` Starter + `200 EGP` per extra vetted RFQ** vs. **10 factories pitched `790 EGP/mo` Growth (First Month `490 EGP` Onboarding Trial -> `790 EGP` Month 2, or straight `790 EGP` annual-discounted)**.
- **Final decision:** **TEST FIRST (Replace 3-month `490` lock-in with Day-1 A/B test of `790 EGP/mo` vs `490 + 200 EGP/extra RFQ`).**

### Decision 5: Free Buyer Access (`0 EGP/mo`)
- **Original recommendation:** Keep Egyptian apparel brands/buyers permanently at `0 EGP/mo` for submitting RFQs, comparing sealed quotes, and tracking order milestones.
- **Evidence supporting it:**
  - Every benchmarked B2B marketplace (`Fashinza`, `Alibaba`, `Tradeling`, `Egytex`) offers `0 EGP` buyer browsing/RFQ intake.
  - Only Apparel Brands converted positively in both simulated panels (`17%` baseline -> `25%` re-test).
- **Evidence against it:**
  - Free self-serve access invites **non-serious price checkers** and micro startups asking for `50–100` mixed pieces—wasting factory estimators' time and poisoning factory perception of Cysle RFQs.
  - Today's codebase (`POST /api/rfqs` lines 97–112) even allows **unauthenticated guests** to post RFQs!
- **Hidden assumptions:** That free buyer volume won't degrade lead quality and that Cysle ops can manually vet every free brand brief without blowing up `35 EGP/factory-mo` support estimates.
- **What would make it fail?** Routing 3+ unvetted, low-MOQ, or financially flaky buyer RFQs destroys factory trust permanently—even faster than charging a fee.
- **Cheapest real-world experiment:** Keep `0 EGP` for verified brands **only behind mandatory pre-routing gating** (Commercial Register + 2 trade references + explicit MOQ `>= 200` pcs + deposit/check terms), and measure whether `>= 1` in `3` brands would pay **`1,500 EGP` flat Sample-Chase Concierge** when urgent deadlines hit.
- **Final decision:** **KEEP (strictly with mandatory pre-routing buyer vetting + fixing guest `POST /api/rfqs`).**

### Decision 6: Removing the 2.5% GMV Commission
- **Original recommendation:** Drop the static UI `2.5%` GMV commission (`0%` take-rate on buyer-factory order value).
- **Evidence supporting it:**
  - Codebase has **zero** payment gateway, escrow, invoicing, or commission ledger (`Payment` model doesn't exist; `/admin/settings` `2.5%` is local React state).
  - Pre-order chat phone masking lifts once `Order` exists, and `WhatsAppAdapter` generates `wa.me` deep links.
  - Egyptian B2B runs on **30/60/90-day post-dated checks (*sheekat*)** and cash, while InstaPay (`70k/tx`, `400k/mo`) and mobile wallets (`60k/day`, `200k/mo`) cap far below bulk factory runs.
- **Evidence against it:**
  - Foregoing `%` GMV leaves upside unmonetized on large deals (`2.5%` of a `400,000 EGP` order = `10,000 EGP`), and cash-shy factories often say *"take a commission from my order instead of charging me monthly."*
- **Hidden assumptions:** That SaaS + optional per-RFQ fees capture sufficient LTV (`>= 335–591 EGP/mo` CM) without needing GMV take-rate, and that future escrow/financing is too distant to justify launch focus.
- **What would make it fail?** If factories categorically refuse fixed monthly SaaS (`< 10%` conversion at both `490` and `790 EGP`) and will ONLY pay per **won order** (`concierge placement fee` on Order #1).
- **Cheapest real-world experiment:** Keep ongoing `%` GMV off the table; if fixed SaaS hits `< 15%` conversion in Gate 1, test a **flat Order-#1 Concierge Placement Fee (`1,500–2,500 EGP` per won contract)** collected before releasing verified brand contract introductions—no ongoing *sheekat* policing required.
- **Final decision:** **KEEP (`0%` ongoing GMV tax; retain flat Order-#1 Concierge Fee as immediate Pivot B).**

### Decision 7: Deferring Yarn, Machinery, Spare Parts, Repair, and Logistics Verticals
- **Original recommendation:** Freeze all 5 adjacent verticals and capture interest solely via `0 EGP` waitlists until core factory-brand liquidity exists.
- **Evidence supporting it:**
  - Direct codebase audit confirms **zero** models, pages, or APIs exist for any of those 5 marketplaces today.
  - Simulated panel (`0/13` baseline, `0/9` re-test) showed `100%` rejection on waitlist/unbuilt pitches (`timing`/`need`), proving pitching them early only damages credibility.
  - Multi-sided marketplaces fail when trying to seed 7 sides simultaneously with `< 80k EGP` budget.
- **Evidence against it:**
  - Spare parts (`Ataba` / `Ismailia Rd` needles, sinkers) and emergency *fanni* machine repair have **high frequency, high urgency**, and lower *sheekat* risk than bulk garment manufacturing (`500–5,000 EGP` cash tickets!).
  - Yarn/machinery suppliers carry larger advertising budgets than 25-worker workshops.
- **Hidden assumptions:** That the Apparel Factory + Brand loop alone can reach break-even (`12–34` factories) faster than pivoting to a spare-parts/*fanni* directory.
- **What would make it fail?** If the Apparel RFQ + Costing OS wedge fails Gate 1 (`<= 1/20` demos paid) while `0 EGP` waitlist signups from *fanni*/parts show explosive inbound pull.
- **Cheapest real-world experiment:** Keep `0` engineering lines on all 5 verticals during Days 1–30; embed a clean 1-click **"Request Parts / Yarn / Fanni / Freight Beta Access (Free)"** tracker during factory onboarding and log real weekly factory requests to see which vertical generates real pull post-Month 3.
- **Final decision:** **KEEP.**

### Decision 8: Requiring 5 Paying Pilots and 3 Matched Transactions Before Scaling
- **Original recommendation:** Require `>= 5` paying factories (`490 EGP/mo`) by Day 21 and `>= 3` real end-to-end matched runs by Day 30 before unlocking Meta ads or hiring.
- **Evidence supporting it:**
  - Prevents burning `39k–80k+ EGP` on unvalidated ads (`2,000 EGP/mo`) and contractor payroll (`6,000 EGP/mo`) when simulated buy rates were only `3%–5%`.
- **Evidence against it:**
  - `5` pilots at `490 EGP` = `2,450 EGP/mo` MRR—still deeply cash-negative (`-4,575 EGP/mo` at `7,025 EGP` burn), and `5` buyers can easily be skewed by personal favors/friends.
  - Requiring `3` full production runs in 21–30 days risks tempting the founder to over-subsidize uneconomic deals just to check a box, because Egyptian apparel sampling + commercial sign-off often takes `2–4+` weeks!
  - Furthermore, **Month-1 cash does not prove retention**: factories might pay `490 EGP` once to grab an RFQ and cancel in Month 2 unless `>= 80%` renew!
- **Hidden assumptions:** That 5 Month-1 signups and 3 first matches predict sustainable Month-2+ retention and scalable CAC.
- **What would make it fail?** Unlocking `6,000 EGP/mo` recurring payroll after 5 one-month pilots who then demand 30-day refunds or churn in Month 2.
- **Cheapest real-world experiment:** Split into **two strict gates**:
  - **Gate 1 (Day 21 — Unlock `1,000 EGP` Micro-Ad Test ONLY):** `>= 5` **arm's-length (non-friend)** factories paid full pilot cash + `>= 80%` active BOM/costing + `>= 60%` of vetted RFQs quoted `< 48h`.
  - **Gate 2 (Day 45–60 — Unlock `6,000 EGP/mo` Assistant Hire):** `>= 10` paying factories **AND `>= 80%` Month-2 cash renewal** + `>= 3` unsubsidized commercial `Order -> ProductionOrder` matches.
- **Final decision:** **CHANGE (Split into Gate 1 Ad Test vs. Gate 2 Payroll Unlock with Month-2 Renewal Proof).**

---

## Part 2 — Answers to the 7 Critical Strategic Questions

### 1. Can Factory OS generate enough recurring value without marketplace transactions?
**Mostly NO at `790 EGP/mo`, and ONLY narrowly at `490 EGP/mo` for waste-bleeding shops—unless ETA e-invoicing is bridged or built.**  
Formal Egyptian SMEs must pay for an ETA-compliant tool (`Daftra ~490–733 EGP/mo` or `Wafeq 805+ EGP/mo`). Without marketplace orders *or* ETA tax compliance, a standalone ERP faces `0 EGP` WhatsApp/Excel inertia on the low end and Daftra on the formal end. Pure Factory OS retains factories *only* when they lose `> 2,000 EGP/mo` on misquoted piece rates or yarn/fabric theft (`StockMovement` + `WasteRecord`).

### 2. Can Cysle acquire factories through a free operational tool and monetize later?
**NO for the full 17-module OS; YES ONLY for a zero-touch micro-tool.**  
Giving away full Factory OS onboarding burns `~40–83 EGP/factory-mo` in manual migration, WhatsApp support, and DB/storage overhead while attracting non-serious free-riders and proving zero willingness to pay. If Cysle ever offers a free wedge tool, it must be a **100% self-serve, zero-support single utility** (e.g., an *Arabic 60-Second Knitwear Piece-Costing & Quote PDF Calculator* requiring no database migration) that upsells into paid Workspace/RFQs.

### 3. Could the marketplace be the acquisition engine while Factory OS becomes the retention engine?
**YES — this is the strongest strategic repositioning of Cysle.**  
Look at all evidence together:
- Simulated factories refused cold OS (`0%`) saying *"bring me paid orders first"*, while Apparel Brands converted at `17% -> 25%` (`0 EGP`).
- Yet marketplaces alone get bypassed on WhatsApp + *sheekat* after Order #1.
- **Inverting the pitch fixes both:** **Lead with Vetted Brand RFQs + Dead-Stock Catalog (Acquisition Hook)** to get the factory owner into the product today, then convert that accepted RFQ in 1 click (`POST /api/factory/orders/convert`) into **Per-Piece Costing, Fabric Stock Ledger, and Waste Alerts (Retention Engine)** so the factory runs *all* orders (including off-platform repeat orders) inside Cysle every day.

### 4. Is a hybrid pricing model better than a fixed subscription?
**Low-Base Hybrid (`290 base + 200/RFQ`) is WORSE; SaaS-Floor + Demand-Upside Hybrid (`490 base + 200/extra RFQ`) is BETTER than flat `490 EGP`.**  
As the financial matrix in Part 3 proves mathematically:
- Dropping base SaaS to `290 EGP/mo` + `200 EGP/RFQ` under realistic cold-start liquidity (`0.5` paid RFQs/mo = `390 EGP` ARPU) pushes break-even to **`60` factories** (at `14,544 EGP` overhead) and **loses money even at `50` paying factories (`-2,244 EGP/mo`)**.
- Conversely, **`490 EGP/mo` base (incl. 2 quotes) + `200 EGP` per extra vetted RFQ / `1,500 EGP` concierge pack** protects recurring downside (`21–44` break-even) while expanding ARPU to **`690+ EGP/mo`** (`30`-factory break-even) as RFQ liquidity grows—avoiding a harsh Month-4 cliff!

### 5. Which features can generate revenue immediately?
Strictly verified in `src/` and `prisma/schema.prisma` **today** (zero new vertical builds required):
1. **Vetted Apparel RFQ Matching & Sealed Quote Comparison** (`/rfqs`, `/rfqs/[id]/compare`, `matchFactoriesForRfq()`) — sellable via paid factory access (`490–790 EGP/mo`) or flat Order-#1 Concierge fee.
2. **Ready-Stock Wholesale Catalog + Volume Price Tiers** (`/products`, `ProductPriceTier`, `POST /api/products/[id]/order`) — immediate cash recovery for factories sitting on unsold seasonal fleece/jersey stock.
3. **7-Day Per-Piece Costing, Fabric Ledger & Waste Tracking** (`ProductionOrder`, `StockMovement`, `WasteRecord`, `ProductionCost`) — immediate ROI wedge once paired with 48h Done-With-You onboarding.

### 6. Is there a smaller initial product that could be sold within 30 days?
**YES: "Cysle Cost & Orders" (2-Loop Product + Manual Concierge, sellable within 7–14 days).**  
Instead of presenting 17 Factory OS tabs + 12 CRM tabs + static Admin pages, restrict the Day-1 pitch and navigation to **3 existing capabilities**:
1. **Vetted Apparel RFQ + Ready-Stock Catalog Inbox** (demand hook).
2. **Order -> ProductionOrder + 5-SKU Per-Piece Costing / Fabric Waste Sheet** (execution & margin protection).
3. **Manual InstaPay/Fawry Receipt + CSV Export to Daftra/Wafeq** (frictionless payment & accountant handoff).

### 7. What is the strongest alternative to the current business model?
If factories reject monthly SaaS (`< 15%` cash close) during the 20-factory test, **two strong alternatives exist:**
- **Alternative A — Tech-Enabled Apparel Sourcing Brokerage (Demand-First Concierge):** `0 EGP/mo` factory listing + free internal costing OS for active runs, monetizing **`1,500–3,000 EGP` flat brand/factory Order-#1 Coordination Fees** (or `5%` paid strictly on the *initial* escrow/deposit milestone collected by Cysle before phone handover), eliminating SaaS resistance entirely.
- **Alternative B — Daftra/Wafeq Accountant Channel Partner Add-On:** Stop competing with Daftra/Wafeq; bundle Cysle (`490 EGP/mo`, `20–25%` rev-share to industrial accountants) explicitly as the **Textile Production & Waste Module** feeding Daftra's ETA invoicing.

---

## Part 3 — Financial Challenge Matrix (10 / 25 / 50 / 100 Factories)

All figures below are in **Egyptian Pounds (EGP)** computed deterministically via Python (`days_per_month = 1`). Every assumption is explicitly marked:

### Explicit Financial Assumptions
- **Variable Cost Assumptions (`[ESTIMATE]` except payment fees):**
  - Payment gateway blend (`2.65%` Paymob/Fawry + InstaPay mix, rounded to EGP).
  - Refund / credit reserve: `12%` of ARPU on fixed SaaS cohorts (`numbers.json` baseline); `8%` on low-base Hybrid (lower refund exposure on pay-per-use); `10%` on SaaS+ Hybrid.
  - Amortized 48h BOM migration (`40 EGP/factory-mo` across 6-month retention `[ESTIMATE]`).
  - Manual RFQ vetting & WhatsApp floor concierge (`35 EGP/factory-mo` base SaaS `[ESTIMATE]`; rises to `55 / 65 / 85 EGP` on RFQ-heavy Hybrid models due to manual brief vetting).
  - Marginal cloud/email buffer (`8–10 EGP/factory-mo` `[ESTIMATE]`).
- **Fixed Overhead Modes (All `[ESTIMATE]` for non-cloud line items; `0 EGP` founder salary draw):**
  - **Steady `numbers.json` Overhead (`14,544 EGP/mo`):** `3,544 EGP` verified cloud/domain (`Altare Plus + Supabase Pro + Upstash Fixed + Resend Pro + .com.eg/.com`) + `6,000 EGP` PT Hub Assistant + `3,500 EGP` travel/telecom/Meta + `1,500 EGP` bookkeeping/legal.
  - **Realistic Tiered Overhead (`Step-Function`):**
    - `N <= 25`: **`7,025 EGP/mo`** (Bootstrapped founder-led ops, `0 EGP` assistant hire, Resend Free, Upstash PAYG).
    - `26 <= N <= 75`: **`14,544 EGP/mo`** (Unlocks 1 PT Hub Assistant + full stack).
    - `N > 75` (incl. `100` factories): **`20,544 EGP/mo`** (Adds 2nd PT hub coordinator `+6,000 EGP` `[ESTIMATE]` as `100`-factory founder capacity limit is reached).
- **12-Month Ramps Tested for Peak Cash (`25,000 EGP` Startup Spend included):**
  - To reach `10`: `[1, 2, 3, 4, 5, 6, 7, 8, 8, 9, 10, 10]`
  - To reach `25`: `[2, 4, 6, 8, 10, 12, 15, 17, 19, 21, 23, 25]`
  - To reach `50`: `[3, 6, 10, 15, 20, 25, 30, 35, 39, 43, 47, 50]`
  - To reach `100`: `[3, 7, 13, 21, 30, 40, 50, 60, 70, 80, 90, 100]`

### Table A — Per-Factory Unit Economics & Break-Even Across Pricing Models

| Pricing Model | ARPU (EGP) | Est. Variable Cost (EGP) | Contribution Margin (EGP / %) | Break-Even (Bootstrapped `7,025`) | Break-Even (Steady `14,544`) |
|---|---:|---:|---:|---:|---:|
| **1. `490 EGP` Flat Starter / Cohort** *(Base `numbers.json`)* | `490` | `155` | **`335` (`68.4%`)** | `21` factories | `44` factories |
| **2. `590 EGP` Blended Step-Up** *(Starter + Growth mix)* | `590` | `170` | **`420` (`71.2%`)** | `17` factories | `35` factories |
| **3. `790 EGP` Full Growth** | `790` | `199` | **`591` (`74.8%`)** | **`12` factories** | **`25` factories** |
| **4. Hybrid-Low (`290` base + `0.5` × `200` RFQ)** | `390` | `144` | `246` (`63.1%`) | `29` factories | `60` factories |
| **5. Hybrid-Active (`290` base + `1.5` × `200` RFQ)** | `590` | `198` | `392` (`66.4%`) | `18` factories | `38` factories |
| **6. Hybrid-SaaS+ (`490` base + `1.0` × `200` extra RFQ)** | `690` | `202` | **`488` (`70.7%`)** | `15` factories | `30` factories |

### Table B — Monthly Operating P&L & Cash Requirements at `10`, `25`, `50`, and `100` Factories

| Model | `N` | Monthly Revenue | Est. Variable Cost | Contribution Margin | Net Profit / Loss (`14,544` Steady Fixed) | Net Profit / Loss (Realistic Tiered Fixed) | 12-Mo Peak Cash Needed (`14,544` Fixed / Tiered Fixed) |
|---|---:|---:|---:|---:|---:|---:|---:|
| **`490 EGP`** | `10` | `4,900` | `1,550` | `3,350` | **`-11,194`** | `-3,675` (`7,025`) | `175,073` / `84,845` |
| **`490 EGP`** | `25` | `12,250` | `3,875` | `8,375` | **`-6,169`** | `+1,350` (`7,025`) | `145,258` / `57,070` |
| **`490 EGP`** | `50` | `24,500` | `7,750` | `16,750` | `+2,206` | `+2,206` (`14,544`) | `94,730` / `49,616` |
| **`490 EGP`** | `100` | `49,000` | `15,500` | `33,500` | `+18,956` | `+12,956` (`20,544`) | `74,074` / `43,998` |
| **`590 EGP`** | `10` | `5,900` | `1,700` | `4,200` | `-10,344` | `-2,825` (`7,025`) | `168,868` / `78,640` |
| **`590 EGP`** | `25` | `14,750` | `4,250` | `10,500` | `-4,044` | `+3,475` (`7,025`) | `131,488` / `50,235` |
| **`590 EGP`** | `50` | `29,500` | `8,500` | `21,000` | `+6,456` | `+6,456` (`14,544`) | `81,028` / `38,820` |
| **`590 EGP`** | `100` | `59,000` | `17,000` | `42,000` | `+27,456` | `+21,456` (`20,544`) | `66,640` / `36,564` |
| **`790 EGP`** | `10` | `7,900` | `1,990` | `5,910` | `-8,634` | `-1,115` (`7,025`) | `156,385` / `66,157` |
| **`790 EGP`** | `25` | `19,750` | `4,975` | `14,775` | **`+231`** | **`+7,750`** (`7,025`) | `104,017` / `42,395` |
| **`790 EGP`** | `50` | `39,500` | `9,950` | `29,550` | `+15,006` | `+15,006` (`14,544`) | `65,806` / `34,846` |
| **`790 EGP`** | `100` | `79,000` | `19,900` | `59,100` | `+44,556` | `+38,556` (`20,544`) | `57,172` / `33,140` |
| **Hybrid-Low (`390`)** | `10` | `3,900` | `1,440` | `2,460` | `-12,084` | `-4,565` (`7,025`) | `181,570` / `91,342` |
| **Hybrid-Low (`390`)** | `25` | `9,750` | `3,600` | `6,150` | `-8,394` | `-875` (`7,025`) | `159,676` / `69,448` |
| **Hybrid-Low (`390`)** | `50` | `19,500` | `7,200` | `12,300` | **`-2,244`** | **`-2,244`** (`14,544`) | `120,070` / `74,956` |
| **Hybrid-Low (`390`)** | `100` | `39,000` | `14,400` | `24,600` | `+10,056` | `+4,056` (`20,544`) | `86,464` / `56,388` |
| **Hybrid-Active (`590`)** | `10` | `5,900` | `1,980` | `3,920` | `-10,624` | `-3,105` (`7,025`) | `170,912` / `80,684` |
| **Hybrid-Active (`590`)** | `25` | `14,750` | `4,950` | `9,800` | `-4,744` | `+2,775` (`7,025`) | `136,024` / `52,192` |
| **Hybrid-Active (`590`)** | `50` | `29,500` | `9,900` | `19,600` | `+5,056` | `+5,056` (`14,544`) | `84,904` / `39,790` |
| **Hybrid-Active (`590`)** | `100` | `59,000` | `19,800` | `39,200` | `+24,656` | `+18,656` (`20,544`) | `68,712` / `38,636` |
| **Hybrid-SaaS+ (`690`)** | `10` | `6,900` | `2,020` | `4,880` | `-9,664` | `-2,145` (`7,025`) | `163,904` / `73,676` |
| **Hybrid-SaaS+ (`690`)** | `25` | `17,250` | `5,050` | `12,200` | `-2,344` | `+5,175` (`7,025`) | `120,472` / `46,654` |
| **Hybrid-SaaS+ (`690`)** | `50` | `34,500` | `10,100` | `24,400` | `+9,856` | `+9,856` (`14,544`) | `73,712` / `36,803` |
| **Hybrid-SaaS+ (`690`)** | `100` | `69,000` | `20,200` | `48,800` | `+34,256` | `+28,256` (`20,544`) | `61,704` / `34,851` |

### Key Financial Insights
1. **At `10` paying factories, EVERY model loses money monthly** (`-1,115` to `-4,565 EGP/mo` bootstrapped; `-8,634` to `-12,084 EGP/mo` steady). `10` pilots is purely a validation milestone, never a viable business state.
2. **Hiring the `6,000 EGP/mo` assistant before `25` paying factories breaks unit cash:** Notice that at `N=25`, `490 EGP` and `590 EGP` are profitable (`+1,350` and `+3,475 EGP/mo`) **ONLY** under `7,025 EGP` founder-led overhead; under `14,544 EGP` overhead, they lose `-6,169` and `-4,044 EGP/mo`! (The earlier `founder/launch.md` Gate of hiring the `6,000 EGP/mo` assistant at `10` pilots is **financially premature**—wait until `20–25` paying factories OR `590–790 EGP/mo` ARPU is confirmed!)
3. **Price beats cost-cutting:** Moving ARPU from `490` -> `790 EGP/mo` cuts peak cash nearly in half (`57,070 -> 42,395 EGP` at `N=25` tiered) and achieves positive operating profit even under full steady overhead at `25` factories (`+231 EGP/mo`).
4. **Founder Salary Caveat:** Adding even `15,000 EGP/mo` founder living draw pushes break-even from `25` -> `50` factories at `790 EGP/mo` and `44` -> `89` factories at `490 EGP/mo`.

---

## Part 4 — Technical Reality Classification (Verified Codebase Audit)

Classified strictly from direct inspection of `src/`, `prisma/`, and the read-only codebase audit (`no code modified`):

### A. Security Blockers (Must Fix Before Onboarding Real Paying Tenants)
1. **Unauthenticated Guest RFQ Hijacking (`src/app/api/rfqs/route.ts` lines 99–112):** Anonymous `POST /api/rfqs` silently assigns incoming RFQs to `prisma.user.findFirst({ where: { role: "BUYER" } })`. Any unauthenticated spammer can inject RFQs under a real buyer's account.
2. **Unenforced `FactorySettings.marketplaceEnabled` & Verification Gate (`src/app/api/rfqs/[id]/quotes/route.ts`, `src/app/api/products/route.ts`):** `MANAGEMENT_ONLY` or `PENDING` unverified factories can still submit RFQ quotes directly via API if they know an `rfqId`, and their ready-stock products appear publicly on `/products`.
3. **Zero Backend Role-Permission Boundaries Across Staff Accounts (`src/lib/auth/factory-context.ts`):** Although middleware defines `CRM_MANAGER`, `SALES_EMPLOYEE`, `PRODUCTION_EMPLOYEE`, and `WAREHOUSE_EMPLOYEE`, `resolveFactoryContext()` grants all factory roles identical access across `/api/factory/*` and `/api/crm/*` APIs—exposing owner financial margins/expenses to floor staff if staff accounts are created.

### B. Payment / Onboarding Blockers (Must Fix or Bridge Before Commercial Cash)
1. **`POST /api/auth/register` Omitting `FactorySettings` & Default `Warehouse` (`src/app/api/auth/register/route.ts` lines 66–84):** Unlike `/api/factories/register`, general account registration creates `factoryProfile` without `factorySettings` (making new factories invisible to `GET /api/factories`) and without a default `Warehouse` (causing stock intake failures).
2. **Zero Billing, Invoice, or Subscription Persistence (`prisma/schema.prisma`):** Zero `Subscription` or `Payment` models exist; manual InstaPay/Paymob/Fawry tracking + grace-period/expiry enforcement must exist operationally (or via minimal subscription status fields) before billing cohorts.
3. **Fake/Unpersisted Admin & CRM Settings UI (`src/app/admin/settings/page.tsx`, `src/app/crm/settings/page.tsx`, `/admin/categories`, `/admin/analytics`, plus 8 missing documented routes):** Displaying `"2.5% commission saved"` and hardcoded `64.8%` / `42,500 EGP` mock stats creates immediate operator errors and false pricing expectations. Hide or disable static/fake UI prior to pilot onboarding.
4. **Daftra / Wafeq Accounting Export Gap:** Without a clean CSV summary export of orders/costs, formal factories face manual double-entry into their ETA e-invoicing tool.

### C. Important But Not Launch-Blocking (Bridge Operationally for First 10–25 Pilots)
1. **No WebSockets / Polling on Chat & Notifications (`src/app/messages/page.tsx`, `NotificationDropdown.tsx`):** Page only fetches on mount/send. Bridge with a 15–30s lightweight polling interval or WhatsApp quote alerts (`SOP 2`).
2. **Manual `wa.me` Links Instead of WhatsApp Business Cloud API (`src/lib/notifications/index.ts`):** Works fine for concierge founder operation up to 25 factories; replace hardcoded `https://texlink-egypt.netlify.app` fallback URLs with `NEXT_PUBLIC_APP_URL`.
3. **Missing Staff Invite Flow (`Employee` table unlinked from `User`):** Bridge initially by keeping login to Owner/Manager only while floor supervisors submit end-of-shift WhatsApp photos or owner-supervised entry.
4. **No Offline Sync on `/factory/floor`:** Bridge with 17:00 end-of-shift desktop/WhatsApp photo batching when floor 4G drops.
5. **Legacy `TexLink` Strings & Incomplete Hub Sub-Areas (`package.json`, `README.md`, `/api/health`, `locations.ts`):** Add priority sub-areas for the chosen launch hub and scrub user-facing `TexLink` brand/email strings (`admin@texlink-egypt.com`).

### D. Post-Launch Enhancements (Defer Until Gate 2 / `>= 25` Factories)
1. **Unbuilt Adjacent Marketplaces (Yarn, Machinery, Spare Parts, *Fanni*, Automated Logistics/Bosta/Trella API):** Keep strictly as `0 EGP` waitlist interest capture.
2. **Native Egyptian Tax Authority (ETA) E-Invoicing Integration:** Defer behind CSV export bridge.
3. **Automated Paymob/Fawry Recurring Subscription Engine & CBE-Licensed Escrow / *Sheekat* Underwriting.**
4. **WhatsApp AI Voice-Note-to-BOM Parser & Real-Time WebSockets.**

---

## Part 5 — Committee Final Conclusions

### 1. The Best Business Model for Cysle Today *(Updated in Part 7 for Factory-Only Model)*
**Founder-led, unified `FACTORY` platform (`0 EGP` external dev/payroll) helping textile Factories of every size (`1` person upward) find opportunities, manage operations, and connect with the textile supply chain (`0%` GMV fee, `0 EGP` buyer access).**
- Test modular Factory-based pricing empirically per analytical size segment (**Free Basic Account & Verified Factory Listing**, **Pay-Per-Qualified Opportunity**, **Pay-Per-Service**, **Optional Low-Cost Micro/Small Factory Plan**, and **Factory Starter/Growth OS `490–790 EGP/mo`**), never forcing subscriptions on solo/micro operators.

### 2. The Smallest Sellable Product
**"Cysle Verified Factory Directory + Opportunity & Costing OS":**
1. **For Buyers (`0 EGP`):** Vetted Apparel & Subcontracting RFQ intake (WhatsApp/web) + Sealed Quote Comparison (`/rfqs/[id]/compare`).
2. **For Factories (`1` person upward):** Free Verified Factory Listing (`CR/Tax` tracked as a separate legal attribute) + Ready-Stock Catalog (`/products`) + Per-Piece Costing / Daftra CSV Export for multi-SKU Factories needing daily OS control.

### 3. The First Customer Segment *(Updated in Part 7 for Unified `FACTORY` Classification)*
- **Demand Side (`0 EGP`):** Mansoura apparel wholesalers (`El-Sikka El-Gedida`, `El-Abbasi`), Large Factory overflow buyers, Cairo brands, and visiting traders.
- **Supply Side (`1` person upward — Unified `FACTORY` Entity):** **Market A: Salamoun El-Qomash (`سلامون القماش`)** and **Market B: Tanamel (`طنامل`)** tracked **independently** across **5 analytical Factory size segments**: **Individual Factory (`1` person)**, **Micro Factory (`2–5`)**, **Small Factory (`6–20`)**, **Medium Factory (`21–80`)**, and **Large Factory (`>80`)**.

### 4. The First 30-Day Execution Plan *(Founder-Led, `0 EGP` External Dev/Contractors)*
- **Founder Code Alignment First (`0 EGP` external budget):** Fix `factories/register` minimums (`monthlyCapacity >= 100`, `minOrderQuantity >= 10`), add `workerCount` / separate `legalRegistrationStatus`, remove `"المصانع والورش"` UI wording, patch guest `POST /api/rfqs` & `POST /api/auth/register` parity, enforce `marketplaceEnabled`, scrub `TexLink`, and hide fake static screens.
- **Two Independent Field Validation Plans (`dakahlia-field-validation-plan.md`):** Execute **Market A (`SALAMOUN`: `30–35` visits + `4–6` RFQs)** and **Market B (`TANAMEL`: `40–45` visits + `4–6` RFQs)** independently with zero spending/outreach before founder approval.

### 5. Decisions Requiring Founder Approval
Summarized in full inside [`FACTORY_ONLY_CLASSIFICATION_DECISION.md`](FACTORY_ONLY_CLASSIFICATION_DECISION.md) and [`FINAL_APPROVAL_PACKAGE.md`](FINAL_APPROVAL_PACKAGE.md).

---

## Part 6 — Historical Geography Addendum *(Superseded by Part 7)*

Following the founder's geography selection retiring El-Mahalla El-Kubra and Gesr El-Suez / Obour, focus shifted to **Salamoun El-Qomash** and **Tanamel**. Part 6 originally modeled them as a combined cluster with a `12,000 EGP` sprint, `6,000 EGP/mo` assistant, and workshop tiers; those temporary committee assumptions are **permanently overridden in Part 7 below**.

---

## Part 7 — Final Founder Mandates Override (`2026-11-25`)

The founder's five final mandates permanently govern the strategy:

1. **ONE Production Entity (`FACTORY` Only — Zero Workshop Classification):** Every independent production unit from `1` person / `1` machine to `>80` workers is a **Factory** inside CYSLE (`FACTORY_ONLY_CLASSIFICATION_DECISION.md`). All Workshop entities, seller categories, personas, pricing tiers, verification tiers (`Tier-A` vs. `Tier-B Village Workshop`), and onboarding splits are removed. Legal registration (`CR/Tax`) is recorded as a separate attribute, never a Factory-eligibility gate.
2. **Five Analytical Factory Size Segments (Research & Planning Only):** **Individual Factory (`1`)**, **Micro Factory (`2–5`)**, **Small Factory (`6–20`)**, **Medium Factory (`21–80`)**, and **Large Factory (`>80`)** — never creating separate platform account types or permissions.
3. **Salamoun El-Qomash and Tanamel Are TWO INDEPENDENT MARKETS:** Tracked and validated completely independently (`dakahlia-market-research.md`, `dakahlia-field-validation-plan.md`), compared only after field evidence is collected.
4. **Factory-Based Modular Pricing:** Differentiate only by Factory size, features, usage, production needs, and marketplace services (Free Account & Verified Listing, Pay-Per-Opportunity, Pay-Per-Service, Optional Low-Cost Micro/Small Factory Plan, and Advanced Factory OS `490–790–1,490 EGP/mo`) — never by Factory vs. Workshop.
5. **Complete Removal of `EGP 12,000` Dev Sprint & External Contractor Budgets:** `0 EGP` external dev, assistant, or ad launch spend; founder executes personally against an unbilled published-rate infra baseline (`1,948 EGP/mo` live), distinguishing cash break-even (`7` blended units/mo) from true economic profitability (`35` units/mo incl. imputed founder min wage + CPA).

