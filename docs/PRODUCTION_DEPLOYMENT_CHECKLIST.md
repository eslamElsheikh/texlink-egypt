# TexLink Platform — Production Deployment Runbook & Checklist

## 1. Pre-Deployment Configuration & Environment Variables

Ensure the production environment contains strong, cryptographically secure secrets. Never commit production credentials into source control.

| Environment Variable | Description | Production Requirement |
| :--- | :--- | :--- |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/texlink_production?sslmode=require` |
| `DIRECT_URL` | Direct unpooled PostgreSQL connection | Required if using PgBouncer/Supabase pooler for migrations |
| `JWT_SECRET` | Session token signing key | $\ge 32$ random characters (`openssl rand -hex 32`) |
| `NEXT_PUBLIC_APP_URL` | Canonical platform domain | `https://texlink-egypt.com` |
| `NODE_ENV` | Environment identifier | `production` |
| `PORT` | Web server listening port | `3000` (or host assigned) |

---

## 2. Infrastructure & Persistent Storage Mounts

The application distinguishes between public web assets and confidential factory documents.

### Mount Configuration:
- **Private Document Directory**: Mount a persistent block volume or dedicated filesystem at:
  `/app/storage/private/documents`
  *Permissions*: `chmod 700 /app/storage/private/documents` (accessible only by the Node.js application user).
- **Public Assets Directory**: Mount persistent volume at:
  `/app/public/uploads`

---

## 3. Pre-Flight Backup

Before deploying any new migration or release, create an atomic database backup:

```bash
# Atomic snapshot of production database
export PGPASSWORD="${DB_PASSWORD}"
pg_dump -h "${DB_HOST}" -p 5432 -U "${DB_USER}" -d texlink_production -Fc -f "/var/backups/texlink/pre_deploy_$(date +%Y%m%d_%H%M%S).dump"
unset PGPASSWORD
```

---

## 4. Database Migration Execution

Migrations must execute **before** traffic is routed to the new application containers.

```bash
# 1. Inspect migration status
npm run db:migrate:status:postgres

# 2. Apply pending migrations
npm run db:migrate:deploy:postgres

# Expected output:
# All migrations have been successfully applied.
```

*Safety Rule*: Migrations run strictly once per release deployment; concurrent migration processes must be prevented.

---

## 5. Build and Application Start

```bash
# 1. Generate Prisma Client for PostgreSQL
npm run db:generate:postgres

# 2. Build optimized Next.js production bundle
npm run build

# 3. Start production server
npm run start
```

---

## 6. Post-Deployment Verification Checklist (Smoke Tests)

Execute the following manual verification steps immediately following traffic cutover:

- [ ] **Health & Public Pages**:
  - Visit `https://texlink-egypt.com` — verify hero section, Cairo font rendering, RTL alignment.
  - Visit `/factories` — verify directory loads only verified, active factories.
- [ ] **Security Headers Validation**:
  - Run `curl -I https://texlink-egypt.com` and verify:
    - `Strict-Transport-Security: max-age=31536000`
    - `X-Content-Type-Options: nosniff`
    - `X-Frame-Options: SAMEORIGIN`
    - `Content-Security-Policy` with no `'unsafe-eval'` in production.
    - No obsolete `X-XSS-Protection` header present.
- [ ] **Authentication & Tenant Isolation**:
  - Log in with factory owner account (`elnasr@mahalla-textile.com`).
  - Verify redirection to `/factory/dashboard`.
  - Confirm sidebar displays exclusively Factory OS navigation items.
- [ ] **Factory OS Operational Check**:
  - Open `/factory/production` — log a production entry (e.g. 50 pieces: 48 good, 2 defective).
  - Open `/factory/inventory` — verify transactional stock movements ledger updates atomically.
  - Open `/factory/maintenance` — verify machine breakdown and ticket resolution flow.
- [ ] **Private Document Security Check**:
  - Upload a test commercial registry in `/factory/profile` or registration.
  - Verify file is stored in `/app/storage/private/documents/priv_*.dat`.
  - Download document via `/api/documents/[id]` using authorized session.
  - Attempt unauthenticated request (`curl /api/documents/[id]`) — verify `401 Unauthorized`.
  - Attempt download with a different factory account — verify `403 Forbidden`.
- [ ] **Marketplace State Consistency**:
  - Verify `/factory/settings` toggle for marketplace participation works atomically without data loss.

---

## 7. Rollback & Contingency Plan

If an unexpected production blocker occurs:

1. **Traffic Rollback**: Divert ingress/load balancer back to the previous stable release container image.
2. **Database Rollback**:
   - If backward-compatible migrations were applied, no database rollback is needed (expand-and-contract model).
   - If a catastrophic database failure occurred:
     ```bash
     pg_restore -h "${DB_HOST}" -U "${DB_USER}" -d texlink_production --clean --if-exists -j 4 "/var/backups/texlink/pre_deploy_<timestamp>.dump"
     ```
3. **Storage Verification**: Confirm `/app/storage/private/documents` retains all physical files.
