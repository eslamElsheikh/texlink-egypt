# Implementation Tasks: TexLink Egypt Platform

## Phase 0: Foundation & Design System
- [ ] Task 0.1: Initialize Next.js 15+ App Router, TypeScript, Tailwind CSS, Cairo font, RTL setup
- [ ] Task 0.2: Configure design tokens matching `design/home.png` (Purples, Navies, Greens, Light tints)
- [ ] Task 0.3: Build brand assets (TexLink Egypt logo with hanger SVG) and base layout components (TopBar, Header, Footer)

## Phase 1: Database, Auth & Egyptian Seed Data
- [ ] Task 1.1: Design complete Prisma schema (User, FactoryProfile, Document, Product, PriceTier, RFQ, Quote, Order, Milestone, Conversation, Message, Review, Notification)
- [ ] Task 1.2: Set up Auth.js with credentials provider, password hashing, and role-based permissions (Buyer, Factory, Admin)
- [ ] Task 1.3: Create comprehensive seed script with 5 Egyptian knitwear factories, 15 ready-made products, and 8 RFQs

## Phase 2: Factory Onboarding, Directory & Admin Verification
- [ ] Task 2.1: Implement multi-step factory registration wizard with document uploads (commercial register, tax card)
- [ ] Task 2.2: Implement factory directory with search and multi-facet filters (governorate, fabric, capacity, verified)
- [ ] Task 2.3: Implement public factory profile with contact masking (phone/address hidden before quote acceptance)
- [ ] Task 2.4: Implement Admin factory verification dashboard (approve/reject with reason)

## Phase 3: Homepage Matching Design Reference
- [ ] Task 3.1: Build TopBar (WhatsApp support, phone, login, register) and Main Navigation
- [ ] Task 3.2: Build Hero section with dark navy overlay, textile factory visual, bold typography, and CTA
- [ ] Task 3.3: Build dual action cards (Green For Factories, Purple For Buyers) matching visual reference
- [ ] Task 3.4: Build Featured Factories (3 cards) and Latest RFQs (3 rows) connected to real database queries
- [ ] Task 3.5: Build Trust bar and complete footer

## Phase 4: Custom RFQ Flow (Posting, Matching, Quotes, Comparison)
- [ ] Task 4.1: Build dynamic RFQ creation wizard (product type, fabric, GSM, colors, size breakdown table, attachments)
- [ ] Task 4.2: Implement deterministic factory matching engine based on capabilities and location
- [ ] Task 4.3: Implement public RFQ board with filters and factory quote submission modal/page
- [ ] Task 4.4: Build buyer quote comparison matrix (side-by-side specs, price tiers, sample lead time) and quote acceptance

## Phase 5: Messaging & Multi-Channel Notifications
- [ ] Task 5.1: Build in-app conversation engine tied to RFQs and Orders
- [ ] Task 5.2: Implement Egyptian contact anti-bypass filter (blocking phone numbers, WhatsApp links, and emails)
- [ ] Task 5.3: Build notification adapter abstraction: In-App store, Email (Resend), WhatsApp (`wa.me` template builder)

## Phase 6: Order Milestone Tracking & Reviews
- [ ] Task 6.1: Implement Order generation upon quote acceptance with contact details unmasking
- [ ] Task 6.2: Build interactive Order timeline (Sample -> Approval -> Production -> Ready -> Shipped -> Delivered)
- [ ] Task 6.3: Implement mutual rating and review system after order completion

## Phase 7: Ready-Made Stock Products & Purchase Requests
- [ ] Task 7.1: Build wholesale product catalog with category, fabric, and price filtering
- [ ] Task 7.2: Build product detail page with volume tiered pricing table (e.g. 50/100/500 pieces)
- [ ] Task 7.3: Implement wholesale purchase order request flow and factory approval dashboard

## Phase 8: Static Pages, SEO, Tests & Documentation
- [ ] Task 8.1: Build static pages (About Us, Contact with WhatsApp & form, FAQ, Terms, Privacy Policy)
- [ ] Task 8.2: Add metadata, sitemap, OpenGraph tags in Arabic for factories and products
- [ ] Task 8.3: Implement Vitest unit tests (anti-bypass, matching, pricing) and Playwright E2E smoke tests
- [ ] Task 8.4: Create comprehensive README with setup instructions, env vars, and verification evidence
