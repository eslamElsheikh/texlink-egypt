# Implementation Plan: TexLink Egypt Platform

## Overview
TexLink Egypt is an Arabic-first (RTL) B2B knitwear platform connecting Egyptian textile factories (المحلة، شبرا الخيمة، العاشر من رمضان، المنوفية) with wholesale buyers and apparel brand owners. It provides two core commercial flows: custom manufacturing through Request For Quotes (RFQ) with factory matching, side-by-side comparison, and order milestone tracking; and wholesale ready-made stock purchase requests with quantity price tiers.

## Visual Reference & Design Language
- Reference: `design/home.png`
- Primary Purple: `#4f28a6` / `#5833b6` (Buttons, Buyer highlights, Active nav)
- Dark Navy: `#0b1320` / `#0f172a` (Top bar, Hero background)
- Factory Green: `#008a4b` / `#059669` (Factory badges, CTA, Factory cards)
- Light Backgrounds: Lavender `#f5f3ff` (Buyers), Mint `#eefaf3` (Factories)
- Typography: Cairo font (Google Fonts), Arabic-first RTL (`dir="rtl"`)
- Brand: TexLink Egypt wordmark with clothes hanger icon

---

## Gate 1: Product Scope & Core Flows
1. **Scope Boundaries:**
   - **In MVP:**
     - Homepage visually faithful to `design/home.png` (desktop & mobile).
     - Multi-step factory onboarding with industrial documentation upload & admin KYC review.
     - Complete RFQ lifecycle: Post request -> Automatic factory matching -> Factory quote submission -> Buyer side-by-side comparison table -> Acceptance.
     - Contact anti-bypass protection: Hiding phone/address/links across profiles, listings, and in-app chat before quote acceptance; automatic unmasking after acceptance.
     - Post-acceptance order management: Milestones (Sample -> Sample Approval -> Production -> Ready -> Shipped -> Delivered) + mutual reviews.
     - Ready-made stock product catalog with volume tier pricing (e.g. 50/100/500 pcs) and purchase order requests.
     - In-app messaging with file attachments and anti-bypass filtering.
     - Multi-channel notification architecture: In-app inbox + Email adapter (Resend) + WhatsApp adapter (`wa.me` templates + URL generator).
     - Role dashboards: Buyer, Factory, Admin.
     - Static pages: About, Contact, FAQ, Terms, Privacy Policy.
     - Rich Egyptian seed data: 5 real-world factories, 15 wholesale products, 8 detailed RFQs.
   - **Deferred to v2:**
     - Direct payment gateway / escrow processing (schema stores terms, milestone approvals, and ready payment hooks).
     - Native mobile applications (responsive PWA/web prioritized).
     - Live courier shipping tracking API integration.
     - E-invoicing / ETA portal sync.

---

## Gate 2: Architecture & Adapter Boundaries
1. **Stack:** Next.js 15+ (App Router), TypeScript, Tailwind CSS with custom palette & RTL, Prisma ORM with PostgreSQL, Auth.js (v5) credentials + role authorization, Zod validation, next-intl for Arabic RTL structure, Vitest & Playwright.
2. **Adapters:**
   - `StorageService`: Pluggable storage (Local filesystem in dev/test, Cloudinary/Supabase in production).
   - `NotificationService`: Interface with `EmailAdapter` (Resend), `WhatsAppAdapter` (`wa.me` links & structured templates), `InAppNotificationAdapter`.
   - `AntiBypassService`: Pattern-matching sanitizer masking phone numbers (`010/011/012/015/+20`), links, and contact evasion tactics.
   - `MatchingService`: Scoring algorithm pairing RFQ product type, fabric, monthly capacity, and governorate with factory capabilities.

---

## Gate 3: Roadmap & Execution Phases
- **Phase 0:** Setup, RTL layout, Cairo font, design tokens, logo SVG, base UI library.
- **Phase 1:** Database schema (Prisma), Auth.js authentication, Egyptian knitwear seed data.
- **Phase 2:** Factory onboarding wizard, factory directory & filtering, public profile with contact masking, admin approval panel.
- **Phase 3:** Full homepage matching `design/home.png` with live database feeds.
- **Phase 4:** Complete RFQ engine (wizard, matching, quote submission, comparison table, acceptance).
- **Phase 5:** In-app messaging with contact anti-bypass protection & notification adapters.
- **Phase 6:** Post-acceptance order milestone tracker, contact unmasking, mutual reviews.
- **Phase 7:** Ready-made wholesale product catalog with price tiers & purchase request flow.
- **Phase 8:** Static pages, SEO metadata, performance optimization, unit & E2E tests, README.
