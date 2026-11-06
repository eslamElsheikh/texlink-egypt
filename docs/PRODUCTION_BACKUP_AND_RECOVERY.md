# TexLink Platform — Production Backup and Disaster Recovery Runbook

## 1. Overview & Scope
This runbook defines the formal operational procedure for backing up and restoring the **TexLink Platform** (B2B Marketplace & Factory OS).

### Backup Components & Invariants:
1. **Relational Database**: PostgreSQL 14+ database containing tenant data, production logs, stock movements, and CRM relationships.
2. **Private Document Storage (`storage/private/documents/`)**: Encrypted/restricted factory compliance documents (Commercial Registration, Tax Cards, Industrial Certificates).
3. **Public Assets (`public/uploads/`)**: Product catalog images, factory logos, and gallery assets.
4. **Application Configuration**: Environment variable templates (`.env.production`), strictly excluding active secret values.

---

## 2. Backup Architecture & Automation

### A. PostgreSQL Database Backup (`pg_dump`)
PostgreSQL backups must be performed using PostgreSQL custom-format archive (`-Fc`), which includes built-in compression, supports parallel restoration (`pg_restore -j`), and captures schema metadata.

```bash
#!/usr/bin/env bash
set -euo pipefail

# 1. Set timestamp and target paths
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/var/backups/texlink"
mkdir -p "${BACKUP_DIR}/db" "${BACKUP_DIR}/storage"

# 2. Database Backup (Atomic snapshot via MVCC)
# Note: Use pg_dump with credentials passed via ~/.pgpass or environment
export PGPASSWORD="${DB_PASSWORD}"
pg_dump \
  -h "${DB_HOST:-localhost}" \
  -p "${DB_PORT:-5432}" \
  -U "${DB_USER:-postgres}" \
  -d "${DB_NAME:-texlink_production}" \
  -Fc \
  --no-owner \
  --no-privileges \
  -f "${BACKUP_DIR}/db/texlink_db_${TIMESTAMP}.dump"

unset PGPASSWORD
echo "✓ Database backup completed: texlink_db_${TIMESTAMP}.dump"
```

### B. Private & Public Storage Backup
Private documents and public uploads must be archived and synchronized with an off-site, immutable object store (e.g. AWS S3 with Object Lock or Cloudflare R2).

```bash
# 3. Archive storage directories
tar -czf "${BACKUP_DIR}/storage/texlink_private_docs_${TIMESTAMP}.tar.gz" -C /app storage/private/documents/
tar -czf "${BACKUP_DIR}/storage/texlink_public_uploads_${TIMESTAMP}.tar.gz" -C /app public/uploads/

# 4. Off-site sync with encryption
aws s3 sync "${BACKUP_DIR}/" "s3://${BACKUP_S3_BUCKET}/backups/${TIMESTAMP}/" --sse aws:kms

echo "✓ File storage backup synchronized to off-site S3"
```

---

## 3. Retention & Encryption Policy
- **Hourly Point-in-Time Recovery (PITR)**: Enable PostgreSQL Write-Ahead Log (WAL) archiving for 7 days.
- **Daily Snapshots**: Retained for 30 days.
- **Weekly Snapshots**: Retained for 12 weeks.
- **Monthly Snapshots**: Retained for 12 months.
- **Encryption**: Backups stored on disk and in S3 must be encrypted using AES-256 (KMS-managed keys).

---

## 4. Disaster Recovery & Restoration Procedure

### Step 1: Prepare Clean Target Database
```bash
# Connect to PostgreSQL instance as administrator
psql -h "${DB_HOST}" -U "${DB_USER}" -d postgres -c "CREATE DATABASE texlink_production_recovery;"
```

### Step 2: Restore Database from Custom Dump
```bash
# Restore schema, tables, indexes, and data
pg_restore \
  -h "${DB_HOST}" \
  -U "${DB_USER}" \
  -d texlink_production_recovery \
  --clean \
  --if-exists \
  --no-owner \
  -j 4 \
  "${BACKUP_DIR}/db/texlink_db_${TIMESTAMP}.dump"
```

### Step 3: Restore File Storage Volumes
```bash
# Extract private documents into the application's persistent storage mount
tar -xzf "${BACKUP_DIR}/storage/texlink_private_docs_${TIMESTAMP}.tar.gz" -C /app/

# Extract public uploads
tar -xzf "${BACKUP_DIR}/storage/texlink_public_uploads_${TIMESTAMP}.tar.gz" -C /app/

# Ensure strict filesystem permissions
chmod 700 /app/storage/private/documents/
```

### Step 4: Verification & Integrity Health Check
Execute the following verification checklist before pointing application traffic to the restored instance:

1. **Table Count & Migration Status**:
   ```bash
   npx prisma migrate status --schema=prisma/schema.postgresql.prisma
   ```
   *Expected output*: `Database schema is up to date!`
2. **Factory Tenant Record Verification**:
   Verify count of `User`, `FactoryProfile`, `ProductionOrder`, `StockMovement`, and `FactoryDocument`.
3. **Private Document Storage Links**:
   Verify that all `FactoryDocument.storageKey` entries point to an existing physical file inside `/app/storage/private/documents/`.
4. **Smoke Test Execution**:
   Run authenticated smoke test against `/api/health` and verify Factory OS dashboard loads.

---

## 5. Recovery Time & Point Objectives (RTO / RPO)
- **RPO (Recovery Point Objective)**: $\le 15 \text{ minutes}$ (with WAL archiving) or $\le 24 \text{ hours}$ (daily cold dumps).
- **RTO (Recovery Time Objective)**: $\le 30 \text{ minutes}$ to provision new container/instance, restore database dump, extract storage, and pass health checks.
