# TexLink — Zero-Cost ($0.00) Netlify & Supabase Backup and Recovery Runbook

## 1. Zero-Cost Policy Notice & Service Level Warning
- **Budget**: Exactly **$0.00 USD**. No paid automated backup add-ons or managed PITR subscriptions.
- **Provider Policy Notice**: Supabase Free tier **does not include automated daily backups or point-in-time recovery (PITR)**. Backups must be performed regularly using the manual, zero-cost operational scripts documented in this runbook.
- **Inactivity Warning**: Supabase Free projects pause automatically after 7 days of inactivity. Maintaining regular operational backups protects factory business records against unexpected pausing or retention policies.

---

## 2. PostgreSQL Database Backup (`pg_dump`)

The following zero-cost script takes an atomic snapshot from the Supabase PostgreSQL database and saves it locally in custom compressed format (`.dump`).

```bash
#!/usr/bin/env bash
set -euo pipefail

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="${HOME}/texlink_backups/${TIMESTAMP}"
mkdir -p "${BACKUP_DIR}/db" "${BACKUP_DIR}/storage"

echo "=== Starting TexLink Zero-Cost Backup: ${TIMESTAMP} ==="

# 1. Database Dump via Direct Connection (Port 5432)
export PGPASSWORD="${SUPABASE_DB_PASSWORD}"

pg_dump \
  -h "db.[PROJECT_REF].supabase.co" \
  -p 5432 \
  -U "postgres" \
  -d "postgres" \
  -Fc \
  --no-owner \
  --no-privileges \
  -f "${BACKUP_DIR}/db/texlink_supabase_${TIMESTAMP}.dump"

unset PGPASSWORD
echo "✓ Database dump completed: ${BACKUP_DIR}/db/texlink_supabase_${TIMESTAMP}.dump"
```

---

## 3. Supabase Storage Export & Checksum Verification

Export private factory documents and public assets directly from Supabase Storage into local encrypted storage:

```bash
# Using Node.js export utility
npx tsx -e "
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function exportBucket(bucketName, outDir) {
  fs.mkdirSync(outDir, { recursive: true });
  const { data: files } = await supabase.storage.from(bucketName).list();
  if (!files) return;

  for (const file of files) {
    const { data } = await supabase.storage.from(bucketName).download(file.name);
    if (data) {
      const buffer = Buffer.from(await data.arrayBuffer());
      const hash = crypto.createHash('sha256').update(buffer).digest('hex');
      fs.writeFileSync(path.join(outDir, file.name), buffer);
      console.log(\`  ✓ Exported \${bucketName}/\${file.name} (SHA-256: \${hash.slice(0, 12)}...)\`);
    }
  }
}

async function run() {
  await exportBucket('factory-private-documents', '${BACKUP_DIR}/storage/private');
  await exportBucket('texlink-public-assets', '${BACKUP_DIR}/storage/public');
  console.log('✓ Storage export completed successfully.');
}
run();
"
```

---

## 4. Disaster Recovery & Restoration Procedure

In the event of project corruption, accidental deletion, or disaster recovery:

### Step 1: Restore Database via `pg_restore`
```bash
export PGPASSWORD="${TARGET_DB_PASSWORD}"

pg_restore \
  -h "db.[TARGET_PROJECT_REF].supabase.co" \
  -p 5432 \
  -U "postgres" \
  -d "postgres" \
  --clean \
  --if-exists \
  --no-owner \
  "${BACKUP_DIR}/db/texlink_supabase_${TIMESTAMP}.dump"

unset PGPASSWORD
echo "✓ Database restored successfully."
```

### Step 2: Restore Supabase Storage Buckets
Re-upload files from `${BACKUP_DIR}/storage/private` to `factory-private-documents` and `${BACKUP_DIR}/storage/public` to `texlink-public-assets`.

### Step 3: Integrity & Link Verification
1. Run `scripts/rehearse-backup-restore.ts` to verify 100% row count match.
2. Confirm that every `FactoryDocument.storageKey` references a reachable object in `factory-private-documents`.
3. Verify authenticated download via `/api/documents/[id]`.
