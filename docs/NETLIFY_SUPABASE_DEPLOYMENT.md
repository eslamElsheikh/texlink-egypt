# TexLink — Netlify Free + Supabase Free Production Deployment Runbook

## 1. Zero-Cost Architecture Overview ($0.00 / Month)

| Layer | Provider | Free Plan Quota | Allocation / Usage | Cost |
| :--- | :--- | :--- | :--- | :--- |
| **Web & App Runtime** | Netlify Free | 300 build credits/mo, 100 GB bandwidth | Next.js 15.5.29 App Router, SSR, Middleware | **$0.00** |
| **Managed Database** | Supabase Free | 500 MB PostgreSQL, 2 projects, IPv6/Pooler | PostgreSQL 15/16 with Prisma 6.19.3 | **$0.00** |
| **File Storage** | Supabase Storage Free | 1 GB storage, 5 GB egress | Private docs & public catalog assets | **$0.00** |
| **Domain & SSL** | User Owned | Existing domain (`texlink-egypt.com`) | Free Let's Encrypt managed TLS via Netlify | **$0.00** |
| **Monitoring** | Internal App | In-memory health checks (`/api/admin/free-tier-health`) | 80% free quota alert threshold | **$0.00** |
| **TOTAL** | — | — | — | **$0.00 USD** |

---

## 2. Supabase Free Project Provisioning

### A. Create Project
1. Log in to [Supabase Dashboard](https://supabase.com/dashboard) ($0 Free Plan).
2. Create project named `texlink-production` in region `eu-central-1` (Frankfurt) or closest region for low latency to Egypt.
3. Save the generated database password securely.

### B. Storage Buckets Setup
In the Supabase Dashboard $\rightarrow$ **Storage**, create two buckets:
1. **`factory-private-documents`**:
   - **Public**: `false` (Private bucket).
   - *Allowed MIME types*: `application/pdf`, `image/jpeg`, `image/png`, `image/webp`.
   - *Max file size*: `10 MB`.
2. **`texlink-public-assets`**:
   - **Public**: `true` (Public bucket).
   - *Allowed MIME types*: `image/jpeg`, `image/png`, `image/webp`.
   - *Max file size*: `10 MB`.

---

## 3. Database Migration Deployment

Before building on Netlify, execute the migration once from your authorized terminal:

```bash
# Set direct database connection
export DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres?sslmode=require"

# Apply the approved PostgreSQL migration
npm run db:migrate:deploy:postgres

# Expected verification:
# 1 migration found in prisma/migrations
# Applying migration `20260301000000_init_postgresql`
# All migrations have been successfully applied.
```

---

## 4. Netlify Free Site Linking & Configuration

### A. Link Project
Using Netlify CLI:
```bash
# 1. Login to Netlify (cardless free account)
npx netlify login

# 2. Initialize and link site
npx netlify init --manual
# Name: texlink-egypt
```

### B. Build Configuration (`netlify.toml`)
The project includes `netlify.toml` which automatically instructs Netlify:
- **Build Command**: `npm run db:generate:postgres && npm run build`
- **Publish Directory**: `.next`
- **Plugin**: `@netlify/plugin-nextjs` (v5 with App Router SSR & Server Actions support)
- **Node Version**: `22`

---

## 5. Production Environment Variables in Netlify

Configure the following variables in Netlify Dashboard (**Site configuration $\rightarrow$ Environment variables**):

| Variable Name | Required Scope | Purpose |
| :--- | :--- | :--- |
| `DATABASE_URL` | Production & Preview | Supabase Transaction Pooler URL (`port 6543`, `?pgbouncer=true&sslmode=require`) |
| `DIRECT_URL` | Production only | Supabase Direct Session URL (`port 5432`, `?sslmode=require`) |
| `JWT_SECRET` | Production & Preview | Cryptographic session signing key ($\ge 32$ random hex characters) |
| `NEXT_PUBLIC_APP_URL` | Production | `https://texlink-egypt.com` |
| `NEXT_PUBLIC_SUPABASE_URL` | Production & Preview | `https://[PROJECT_REF].supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`| Production & Preview | Supabase public anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Production only | Supabase server-side secret key (never exposed to browser) |
| `NODE_ENV` | Production | `production` |

---

## 6. Existing Custom Domain & DNS Setup (`texlink-egypt.com`)

The user already owns `texlink-egypt.com`. Do **not** purchase or transfer domain ownership.

### DNS Records to add in your Domain Registrar (Namecheap / GoDaddy / Cloudflare):

| Type | Name / Host | Value / Target | TTL | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **A** | `@` (or apex) | `75.2.60.5` | Automatic / 300 | Netlify Apex Load Balancer |
| **CNAME** | `www` | `texlink-egypt.netlify.app` | Automatic / 300 | WWW Canonical Routing |

*Preserve existing MX, TXT (SPF/DKIM/DMARC) records completely.*

### SSL / TLS Certificate:
1. In Netlify Dashboard $\rightarrow$ **Domain management**, click **Add custom domain** and enter `texlink-egypt.com`.
2. Once DNS propagates, Netlify automatically provisions a **free Let's Encrypt SSL certificate** with automatic renewal ($0.00).

---

## 7. Verification & Post-Deployment Smoke Checklist

- [ ] **DNS & SSL**: `curl -I https://texlink-egypt.com` returns `HTTP/2 200` with valid TLS certificate.
- [ ] **Landing Page**: Cairo typography, Arabic RTL layout, hero banner, dual-audience section load cleanly.
- [ ] **Authentication**: Log in as Factory (`elnasr@mahalla-textile.com`) and Buyer (`buyer1@cairo-apparel.com`).
- [ ] **Factory OS ERP**: Access `/factory/dashboard`, log a production entry in `/factory/production`, verify stock movement in `/factory/inventory`.
- [ ] **Private Storage Security**: Upload document via `/factories/register` or `/factory/profile`; verify it stores in `factory-private-documents` on Supabase Storage.
- [ ] **Cross-Factory Access Denial**: Attempt accessing private document URL with another user session; verify `403 Forbidden`.
- [ ] **Free Quota Health**: Visit `/api/admin/free-tier-health` as Platform Admin; verify usage remains $< 1\%$ across all free limits.

---

## 8. Rollback Procedure

If any issue arises:
1. **Netlify One-Click Rollback**: In Netlify Dashboard $\rightarrow$ **Deploys**, select the previous successful build and click **Publish deploy**.
2. **Database Rollback**: Migrations are strictly backward-compatible (additive only); existing databases do not require destructive rollback.
