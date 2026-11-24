# TexLink Factory OS — Altare Production & Staging Deployment Guide

> **Platform:** [Altare Cloud Console](https://console.altare.gg/)  
> **Official Documentation:** [https://altare.gg/docs](https://altare.gg/docs)  
> **Target System:** TexLink Factory OS & B2B Textile Marketplace (Cysle Egypt)  
> **Runtime Target:** Node.js 24 LTS / Next.js 15 Standalone Docker Container  
> **Database:** Managed PostgreSQL 14+ with PgBouncer Connection Pooling  
> **Storage:** Persistent S3-Compatible / Supabase Object Storage  
> **Security Level:** Enterprise Multi-Tenant Isolation with HTTPS / Strict HSTS  

---

## Table of Contents
1. [Architecture Overview & Altare Services](#1-architecture-overview--altare-services)
2. [Staging vs. Production Environment Architecture](#2-staging-vs-production-environment-architecture)
3. [Pre-Deployment Prerequisites](#3-pre-deployment-prerequisites)
4. [Altare Application Provisioning Procedure](#4-altare-application-provisioning-procedure)
5. [Runtime, Build & Start Settings](#5-runtime-build--start-settings)
6. [Environment Variables Reference](#6-environment-variables-reference)
7. [PostgreSQL Database & Connection Pooling Setup](#7-postgresql-database--connection-pooling-setup)
8. [Prisma Migration Deployment Procedure](#8-prisma-migration-deployment-procedure)
9. [Persistent Object Storage Configuration](#9-persistent-object-storage-configuration)
10. [HTTPS, TLS & Custom Domain Routing](#10-https-tls--custom-domain-routing)
11. [Health Checks & Automated Uptime Probes](#11-health-checks--automated-uptime-probes)
12. [Disaster Recovery: Backup & Restoration Strategy](#12-disaster-recovery-backup--restoration-strategy)
13. [Zero-Downtime Rollback Procedure](#13-zero-downtime-rollback-procedure)
14. [Operational Troubleshooting Matrix](#14-operational-troubleshooting-matrix)

---

## 1. Architecture Overview & Altare Services

TexLink Factory OS is an enterprise manufacturing execution system (MES) and B2B textile marketplace. On Altare, it runs as a containerized Next.js 15 App Router workload backed by managed relational persistence and persistent object storage.

```
                      +------------------------------------------+
                      |          Altare Edge / Anycast CDN       |
                      |        HTTPS (TLS 1.3 / Port 443)       |
                      +--------------------+---------------------+
                                           |
                                           v
                      +--------------------+---------------------+
                      |       Altare Application Service         |
                      |   (Docker / Node.js 24 Standalone)       |
                      |   Port 3000 | Health: /api/health        |
                      +---------+--------------------+-----------+
                                |                    |
         +----------------------+                    +----------------------+
         |                                                                  |
         v                                                                  v
+--------+------------------------+                        +----------------+------------------------+
| Managed PostgreSQL 14+          |                        | Persistent S3 / Supabase Storage       |
| - Transaction Pool (PgBouncer)  |                        | - Bucket: texlink-public-assets        |
| - Direct URL (Prisma Migrations)|                        | - Bucket: factory-private-documents    |
| - Tenant Isolation (factoryId)  |                        |   (Commercial Reg, Tax Cards, PII)     |
+---------------------------------+                        +-----------------------------------------+
```

### Required Altare Cloud Services
1. **Altare Web App Hosting / Container Service:**
   - Multi-stage Docker container runner (`node:24-slim`).
   - Memory allocation: Minimum 1 GB RAM (2 GB recommended for production traffic).
   - CPU: 1 vCPU minimum (2 vCPU recommended).
   - Port forwarding: HTTP port 3000 mapped to public HTTPS (443).
2. **Altare Managed PostgreSQL (or External Managed RDS / Supabase):**
   - PostgreSQL 14+ engine.
   - Dual connection endpoints:
     - Transaction Pooler (Port 6543 / PgBouncer mode) for web concurrency.
     - Direct Connection (Port 5432) for deterministic migration execution.
3. **Altare Persistent Storage (or S3-Compatible Cloud Storage):**
   - S3-compatible API or Supabase Storage integration.
   - Must support private bucket read authorization and public CDN distribution.

---

## 2. Staging vs. Production Environment Architecture

To strictly comply with production rules, zero live migrations or untested deployments may occur directly in production.

| Attribute | Staging Environment | Production Environment |
| :--- | :--- | :--- |
| **Altare Project Name** | `texlink-factory-staging` | `texlink-factory-production` |
| **Domain** | `staging.texlink.example.com` | `texlink.example.com` / `cysle.eg` |
| **Database Instance** | `texlink_staging` (Disposable) | `texlink_prod` (Protected, Point-in-Time Recovery) |
| **Prisma Migrations** | Automatically tested & applied | Executed only during approved deployment windows |
| **Storage Buckets** | `staging-public-assets`, `staging-private-docs` | `texlink-public-assets`, `factory-private-documents` |
| **Resource Tier** | 1 vCPU / 1 GB RAM | 2 vCPU / 2 GB RAM (or higher) |
| **Backup Frequency** | Daily snapshot (7-day retention) | Hourly WAL archiving + Daily Full (30-day retention) |

---

## 3. Pre-Deployment Prerequisites

Before initiating application creation in Altare Console:
1. Verify access to [https://console.altare.gg/](https://console.altare.gg/).
2. Confirm the target Git repository is linked or personal access token is configured.
3. Target branch for staging: `deploy/altare-production-prep`.
4. Ensure target PostgreSQL database credentials and S3/Supabase credentials are ready.
5. Generate a cryptographically secure 256-bit JWT secret:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

---

## 4. Altare Application Provisioning Procedure

1. **Log in to Altare Console:**
   - Navigate to [https://console.altare.gg/](https://console.altare.gg/).
2. **Create New Project:**
   - Click **Create Project** -> Select **Web Application**.
   - Set Project Name: `texlink-factory-os` (or environment-specific name).
3. **Connect Source Repository:**
   - Link GitHub/GitLab repository.
   - Set Branch: `deploy/altare-production-prep` (for staging review).
4. **Select Deployment Engine:**
   - Choose **Dockerfile** (Recommended) to leverage the hardened multi-stage image.
   - Alternatively, choose **Node.js Native** with Node version `24`.

---

## 5. Runtime, Build & Start Settings

### Option A: Dockerfile Deployment (Recommended)
Altare automatically detects the root `Dockerfile` and executes the multi-stage build:
- **Build Context:** `.` (Application Root)
- **Dockerfile Path:** `./Dockerfile`
- **Exposed Port:** `3000`

### Option B: Native Node.js Deployment
If deploying via Altare's native runtime without Docker:
- **Node.js Version:** `24.x`
- **Install Command:** `npm ci`
- **Build Command:** `npm run build:altare`  
  *(Executes `node scripts/build.js`, which dynamically generates the PostgreSQL Prisma client and compiles the Next.js bundle).*
- **Start Command:** `npm run start`  
  *(Or `node server.js` if running from `.next/standalone`).*
- **Port:** `3000`

---

## 6. Environment Variables Reference

Configure the following variables in the Altare Console dashboard under **Settings > Environment Variables**:

| Variable Name | Environment | Required | Description / Example |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | All | Yes | `production` |
| `PORT` | All | Yes | `3000` |
| `DATABASE_URL` | Production | Yes | `postgresql://texlink_user:PASSWORD@postgres.internal:5432/texlink_prod?schema=public&sslmode=require&pgbouncer=true` |
| `DIRECT_URL` | Production | Yes | `postgresql://texlink_user:PASSWORD@postgres.internal:5432/texlink_prod?schema=public&sslmode=require` |
| `JWT_SECRET` | Production | Yes | 64-char random hex string (minimum 32 bytes) |
| `NEXT_PUBLIC_APP_URL`| Production | Yes | `https://texlink.example.com` (No trailing slash) |
| `NEXT_PUBLIC_SUPABASE_URL` | Production | Yes | `https://your-project.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production | Yes | Public anonymous API key for public storage CDN |
| `SUPABASE_SERVICE_ROLE_KEY` | Production | Yes | Elevated service key for private storage upload/download |
| `RESEND_API_KEY` | Production | Optional | Production transactional email key (`re_...`) |

> [!CAUTION]
> Never commit actual credentials or database passwords to git. Always input them exclusively through the Altare Console Secrets UI.

---

## 7. PostgreSQL Database & Connection Pooling Setup

### Connection String Format
Next.js serverless and server-rendered routes execute concurrent connection requests. Using PgBouncer transaction pooling avoids exhausting PostgreSQL connection limits (`max_connections`).

1. **Pooled Connection (`DATABASE_URL`):**
   ```
   postgresql://[user]:[password]@[host]:[port]/[database]?schema=public&sslmode=require&pgbouncer=true
   ```
2. **Direct Connection (`DIRECT_URL`):**
   ```
   postgresql://[user]:[password]@[host]:5432/[database]?schema=public&sslmode=require
   ```

### Sizing and Limits
- **Application Pool Limit:** `connection_limit=10` per replica.
- **Connect Timeout:** `connect_timeout=10`.
- **SSL Enforcement:** Always specify `sslmode=require` on production networks.

---

## 8. Prisma Migration Deployment Procedure

> [!IMPORTANT]
> Never use `prisma db push` in production. Always apply committed, deterministic migrations via `prisma migrate deploy`.

### Safe Migration Execution Steps

#### Phase 1: Verification Against Disposable Staging
1. Point `DATABASE_URL` and `DIRECT_URL` to the staging database.
2. Check pending migration status:
   ```bash
   npx prisma migrate status --schema=prisma/schema.postgresql.prisma
   ```
3. Deploy migrations to staging:
   ```bash
   npx prisma migrate deploy --schema=prisma/schema.postgresql.prisma
   ```
4. Confirm exit code is `0` and all 43 models and PostgreSQL relations are healthy.

#### Phase 2: Production Migration Execution
Once staging validation passes and production approval is authorized:
1. Schedule a brief maintenance window (if structural changes are non-additive).
2. Take an immediate pre-migration database snapshot.
3. Execute the migration via Altare Console Release Command or CI/CD runner using the direct connection:
   ```bash
   DIRECT_URL="[DIRECT_POSTGRES_URL]" npx prisma migrate deploy --schema=prisma/schema.postgresql.prisma
   ```
4. Verify migration state:
   ```bash
   npx prisma migrate status --schema=prisma/schema.postgresql.prisma
   ```

---

## 9. Persistent Object Storage Configuration

TexLink implements a strict dual-classification storage architecture:
1. **Public Catalog Assets:**
   - Bucket: `texlink-public-assets`
   - Access: Public Read via CDN.
   - Contains: Product catalog photos, factory logos, header covers.
2. **Private Confidential Documents:**
   - Bucket: `factory-private-documents`
   - Access: Private, zero public access.
   - Contains: Commercial registrations, tax cards, industrial registers.
   - Serving: Authenticated streaming proxy via `/api/documents/[id]` which validates session role and factory tenant ownership before serving binary bytes.

### Storage Initialization in Supabase / S3
1. Create buckets:
   - `texlink-public-assets` (Public bucket = ON)
   - `factory-private-documents` (Public bucket = OFF)
2. In production, local filesystem upload fallback is intentionally disabled (`503 Service Unavailable` returned if cloud storage credentials are missing) to prevent silent data loss in ephemeral containers.

---

## 10. HTTPS, TLS & Custom Domain Routing

Altare provides automated TLS certificate issuance via Let's Encrypt.

### Custom Domain Configuration Steps
1. In Altare Console, open **Project Settings > Domains**.
2. Click **Add Domain** -> Enter custom domain (e.g. `texlink.example.com`).
3. Add the displayed DNS records to your DNS registrar (Cloudflare, GoDaddy, Namecheap):
   - **Type:** `CNAME`
   - **Host:** `@` or `texlink`
   - **Target:** `domains.altare.gg` (or value provided in console)
4. Confirm TLS certificate verification reaches **Active / Secure**.
5. The application automatically enforces:
   - `Strict-Transport-Security: max-age=31536000` (HSTS).
   - `X-Content-Type-Options: nosniff`.
   - `X-Frame-Options: SAMEORIGIN`.
   - `Content-Security-Policy`.

---

## 11. Health Checks & Automated Uptime Probes

The application provides a dedicated, lightweight, unauthenticated health endpoint:

```http
GET /api/health
```

### Response Example (Healthy - HTTP 200)
```json
{
  "status": "ok",
  "service": "texlink-factory-os",
  "timestamp": "2026-11-24T01:10:00.000Z",
  "uptimeSeconds": 8420,
  "database": {
    "status": "connected",
    "latencyMs": 4
  },
  "totalDurationMs": 5
}
```

### Response Example (Degraded - HTTP 503)
```json
{
  "status": "degraded",
  "database": "disconnected",
  "timestamp": "2026-11-24T01:10:00.000Z",
  "uptimeSeconds": 8420,
  "error": "Database connectivity check failed"
}
```

### Altare Healthcheck Settings
- **Path:** `/api/health`
- **Initial Delay:** `15s`
- **Interval:** `30s`
- **Timeout:** `5s`
- **Healthy Threshold:** `1`
- **Unhealthy Threshold:** `3`

---

## 12. Disaster Recovery: Backup & Restoration Strategy

### Database Automated Backups
1. **Automated Snapshots:** Ensure Altare Managed Postgres (or AWS RDS / Supabase) automated daily backups are enabled with at least 14 days retention.
2. **Manual Pre-Deployment Snapshot:**
   Always take a manual snapshot before deploying any migration.
3. **Manual CLI Dump:**
   ```bash
   pg_dump -h [HOST] -U [USER] -d [DB_NAME] -F c -b -v -f "./backups/backup_$(date +%Y%m%d_%H%M%S).dump"
   ```

### Database Restoration Procedure
1. If migration or operational error requires restoration:
   ```bash
   pg_restore -h [HOST] -U [USER] -d [DB_NAME] -v --clean --if-exists "./backups/target_backup.dump"
   ```
2. Re-verify record parity and foreign key constraints using `scripts/rehearse-backup-restore.ts`.

---

## 13. Zero-Downtime Rollback Procedure

If a deployed version experiences degraded performance or critical bugs:

1. **Instant Rollback via Altare Console:**
   - Go to **Deployments** in Altare Console.
   - Locate the previous successful deployment.
   - Click **Redeploy / Rollback**. Altare shifts live traffic back to the previous container image in < 10 seconds.
2. **Database Reversion Policy:**
   - Since Prisma migrations are forward-compatible (additive columns/tables), rolling back code does not break database schema.
   - If a migration must be reverted, apply an explicit forward rollback migration (e.g. `npx prisma migrate dev --name revert_...`), never drop production tables.

---

## 14. Operational Troubleshooting Matrix

| Symptom | Root Cause | Remediation |
| :--- | :--- | :--- |
| **HTTP 503 on Uploads** | `isSupabaseStorageConfigured()` is false in production. | Configure `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in Altare environment settings. |
| **HTTP 503 on `/api/health`** | PostgreSQL database unreachable or credentials expired. | Check `DATABASE_URL` host, port, SSL certificate, and database server status. |
| **Prisma P1001: Can't reach database** | Network firewall / IP allowlist blocking Altare container IP. | Ensure PostgreSQL allows incoming connections from Altare IPs or internal VPC subnet. |
| **Prisma P1012: Invalid datasource URL** | `DATABASE_URL` format invalid or starts with `file:` in production. | Change `DATABASE_URL` to begin with `postgresql://`. |
| **Error: P2025 Record not found** | Foreign key mismatch or cross-tenant query attempted. | Review tenant `factoryId` context resolution logs. |
| **Next.js Type error during build** | Missing optional chaining on independent supplier relations. | Ensure latest code from `deploy/altare-production-prep` is built. |
