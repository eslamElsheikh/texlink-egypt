# TexLink / Cysle Egypt — Production Readiness Baseline Audit Report

**Date**: November 2026  
**Auditor**: Senior DevOps & Production Readiness Auditor  
**Repository**: `https://github.com/eslamElsheikh/texlink-egypt`  
**Target Deployment Branch**: `deploy/altare-production-prep`  
**Current Audited Commit**: `da92c7c3cb3024176851b2c9c33d995fdc2a09b4`  
**Target Platform**: Altare App Hosting (`https://console.altare.gg/`)  

---

## 1. Executive Summary

This baseline report documents the state of the Cysle Egypt (TexLink Egypt) codebase at commit `da92c7c` on the `deploy/altare-production-prep` branch. The codebase is a full-featured industrial B2B marketplace and Factory OS with Arabic localization, CRM, production planning, warehouse management, machine maintenance, and multi-tenant authorization.

While all 21 test suites (164 tests) pass locally and the Next.js standalone container build completes cleanly, several P0 security and architecture items must be hardened before this software can be safely hosted in production on Altare:
1. **P0 JWT Secret Hardcoded Fallback**: The JWT session verification and middleware fell back to a static string (`texlink-egypt-default-fallback-secret-2026`).
2. **P0 Destructive Seed Script**: `prisma/seed.ts` contained 43 unconditional `deleteMany()` operations and hardcoded passwords with no environment guards against execution in production.
3. **P0 Prisma Architecture & Schema Dualism**: Dual schema structure (SQLite for dev/test, PostgreSQL for production) lacked `directUrl` for connection-pooled PostgreSQL (PgBouncer/Supabase/Altare) and had outdated v7 `@prisma/adapter-*` references in `package.json`.
4. **P0 CI/CD Separation**: The repository only had `.github/workflows/deploy.yml` deploying to Netlify on `master`. A dedicated non-deploying CI verification pipeline is required for Altare branch pushes.
5. **P1 Rate Limiting & Storage Guard**: Upload endpoint requires rate limiting and strict production storage safeguards.

---

## 2. Environment and Runtime Versions

| Component | Target / Current Version | Notes |
| :--- | :--- | :--- |
| **Node.js** | `24.x` (LTS) / Docker `node:24-slim` | Multi-stage Dockerfile configured |
| **Package Manager** | `npm` 10.x with `package-lock.json` | Lockfile verified |
| **Framework** | Next.js `15.5.29` (App Router) | `output: "standalone"` enabled |
| **UI Library** | React `19.0.0` / React DOM `19.0.0` | React Server Components + Client Hooks |
| **ORM** | Prisma CLI & `@prisma/client` `6.19.3` | Dual schema strategy |
| **Token Auth** | `jose` `5.9.6` | EdDSA / HS256 JWT implementation |
| **Test Engine** | `vitest` `3.0.5` | 21 test files, 164 passing tests |

---

## 3. Database Architecture Analysis

### Dual-Schema Model
- **Development & Local Test**: `prisma/schema.prisma` (SQLite: `DATABASE_URL="file:./dev.db"`). Allows rapid zero-dependency CI and local testing without external Postgres dependencies.
- **Production Staging & Altare**: `prisma/schema.postgresql.prisma` (PostgreSQL 14+). Enforces strict relational foreign keys, binary targets (`["native", "rhel-openssl-3.0.x", "debian-openssl-3.0.x"]`), and production indexes.

### Connection Pooling & Migration Requirements
- Production database environments frequently employ connection poolers (PgBouncer on Altare or Supabase on port 6543) that do not support Prisma's schema migration transaction commands.
- `prisma/schema.postgresql.prisma` must define:
  ```prisma
  datasource db {
    provider  = "postgresql"
    url       = env("DATABASE_URL")
    directUrl = env("DIRECT_URL")
  }
  ```
- **Migration Execution Command**:
  ```bash
  npx prisma migrate deploy --schema=prisma/schema.postgresql.prisma
  ```

---

## 4. Existing Security Risks & Vulnerabilities

| Severity | Issue | Location | Remediation Plan |
| :--- | :--- | :--- | :--- |
| **P0** | Hardcoded Fallback JWT Secret | `src/lib/auth/session.ts`<br>`src/middleware.ts` | Eliminate fallback; create centralized `src/lib/auth/jwt-config.ts` requiring >= 32 chars and failing closed on startup in production. |
| **P0** | Destructive Unbounded Database Wipe | `prisma/seed.ts` | Guard with multi-indicator production block (`NODE_ENV`, `DATABASE_URL`, `ALLOW_DESTRUCTIVE_DEV_SEED`). Eliminate hardcoded `"123456"`. |
| **P0** | Prisma Adapter Dependency Mismatch | `package.json` | Remove unused `@prisma/adapter-*` v7 dependencies that conflict with Prisma 6.19.3. |
| **P0** | Missing Altare CI Pipeline | `.github/workflows/` | Create `.github/workflows/altare-ci.yml` strictly for automated testing and type-checking without production deployments. |
| **P1** | Lack of Rate Limiting on Uploads | `src/app/api/upload/route.ts` | Add in-memory sliding window rate limiter to prevent denial of service and storage exhaustion. |
| **P1** | Zero-Warehouse Deadlock | Handled in `da92c7c` | Preserved and verified: auto-creates default warehouse upon registration. |

---

## 5. Existing Test Coverage

Current local execution via `npm test` runs 21 test suites with 164 passing tests:
- `tests/unit/factory-os.test.ts` (Factory OS operations, negative stock prevention)
- `tests/unit/admin-profile.test.ts`
- `tests/unit/anti-bypass.test.ts`
- `tests/unit/auth-security.test.ts`
- `tests/unit/continuous-qa-fixes.test.ts`
- `tests/unit/cysle-rebrand-and-locations.test.ts`
- `tests/unit/dashboard-architecture.test.ts`
- `tests/unit/dual-subscription-modes.test.ts`
- `tests/unit/factory-recommendations.test.ts`
- `tests/unit/financial-precision.test.ts`
- `tests/unit/free-tier-monitor.test.ts`
- `tests/unit/multi-workspace.test.ts`
- `tests/unit/rfq-integrity.test.ts`
- `tests/unit/security-audit.test.ts`
- `tests/unit/whatsapp-adapter.test.ts`
- `tests/unit/workspace-sidebar.test.ts`
- `tests/integration/complete-workflows-e2e.test.ts`
- `tests/integration/cross-role-security.test.ts`
- `tests/integration/new-factory-isolation.test.ts`
- `tests/integration/real-tenant-isolation.test.ts`
- `tests/integration/role-based-qa-audit.test.ts`

**Missing Security Tests to Add**:
- `tests/unit/auth-jwt-security.test.ts`: Missing secrets in production, weak secret rejection, invalid algorithm attacks, expiration validation, token tampering.
- `tests/unit/seed-safety.test.ts`: Proof that destructive seeds abort when targeting production or lacking explicit dev bypass flags.

---

## 6. Target Action Plan

1. **Phase B**: Implement `src/lib/auth/jwt-config.ts`, refactor `src/lib/auth/session.ts` and `src/middleware.ts`, author `tests/unit/auth-jwt-security.test.ts`.
2. **Phase C**: Clean up `package.json` Prisma adapter packages, update `prisma/schema.postgresql.prisma` with `directUrl`, validate schemas.
3. **Phase D**: Harden `prisma/seed.ts` with multi-indicator checks, author `tests/unit/seed-safety.test.ts`.
4. **Phase E**: Implement `src/lib/security/rate-limit.ts` and integrate into `src/app/api/upload/route.ts`.
5. **Phase F**: Create `.github/workflows/altare-ci.yml`.
6. **Phase G**: Full regression execution (`npm run lint`, `npx tsc --noEmit`, `npm test`, `npm run build:altare`).
7. **Phase H**: Final reports and documentation.
