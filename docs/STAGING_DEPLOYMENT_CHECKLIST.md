# Cysle Egypt — Altare Staging Deployment & Validation Runbook

**Environment**: Staging (`cysle-staging.altare.gg`)  
**Deployment Target Branch**: `deploy/altare-production-prep`  
**Repository**: `https://github.com/eslamElsheikh/texlink-egypt`  
**Runtime**: Next.js 15 Standalone (Node.js 24 LTS, UID 1001 Non-Root)  
**Security Status**: Verified via CI Run #45386700749 (Docker, PostgreSQL 16, Redis 7, JWT, 227+ Automated Tests)

---

## 1. Altare Staging Pre-Deployment Checklist

Follow these steps sequentially prior to routing traffic to staging:

- [ ] **1. Infrastructure Provisioning on Altare Console**
  - [ ] Managed PostgreSQL 15/16 database provisioned (`cysle_staging_db`) with PgBouncer connection pooling.
  - [ ] Managed Redis 7+ instance provisioned (`cysle_staging_redis`) in the same internal network/VPC.
  - [ ] Internal network / VPC security groups configured so the application runner can reach PostgreSQL (port 6543 pooled, port 5432 direct) and Redis (port 6379).
  - [ ] Supabase Storage project provisioned with two designated buckets: `factory-private-documents` (private read/write) and `texlink-public-assets` (public read).
- [ ] **2. Durable Encrypted Database Backup & Pre-Migration Verification**
  - [ ] **MANDATORY**: Take a full PostgreSQL snapshot and store it in durable, encrypted cloud storage (never exclusively in `/tmp`):
    ```bash
    pg_dump -Fc "$DIRECT_URL" | gzip > /secure/backups/cysle_staging_pre_deploy_$(date +%Y%m%d_%H%M%S).dump.gz
    ```
  - [ ] Inspect existing migration status against PostgreSQL schema:
    ```bash
    npx prisma migrate status --schema=prisma/schema.postgresql.prisma
    ```
  - [ ] Apply pending migrations using the **direct connection** (`DIRECT_URL`, port 5432):
    ```bash
    npx prisma migrate deploy --schema=prisma/schema.postgresql.prisma
    ```
  - [ ] Verify zero schema drift post-migration.
  - [ ] **CRITICAL SAFETY RULES**:
    - **Never** use `prisma db push` in staging or production.
    - **Never** run seed scripts (`prisma db seed` or `scripts/seed-*.ts`) against staging or production.
    - Understand that `prisma migrate deploy` does **not** auto-generate down migrations; recovery relies on pre-tested forward migrations or the fresh-database restore procedure documented in Section 6.
- [ ] **3. Environment Variables Injection**
  - [ ] Inject all required variables from the template below into the Altare App Console.
  - [ ] Generate a fresh 384-bit cryptographic secret (`npm run jwt:generate`) for `JWT_SECRET`.
  - [ ] Verify `NODE_ENV=production` is set to activate security assertions and fail-closed protections.
  - [ ] Configure provisional proxy settings: `TRUSTED_PROXY_DEPTH=1`, `TRUST_CF_CONNECTING_IP=false`, `TRUST_REAL_IP=false`.
- [ ] **4. Container Deployment Execution**
  - [ ] Select branch `deploy/altare-production-prep`.
  - [ ] Ensure build uses the production multi-stage `Dockerfile` (`node:24-slim`).
  - [ ] Configure the Altare platform health probe (distinct from Docker internal healthcheck):
    - Path: `/api/health`
    - Interval: `15s`, Timeout: `5s`, Initial Delay: `10s`, Failure Threshold: `3`
  - [ ] Trigger manual build and verify the process boots as unprivileged user `UID 1001` (`nextjs`).

---

## 2. Secure Staging Environment Variable Template

> [!IMPORTANT]
> The template below uses explicit, secure placeholders. **NEVER** expose actual production credentials or commit secrets into version control.

```ini
# ==============================================================================
# Cysle Egypt — Staging Environment Variables Template
# Altare App Hosting Platform
# ==============================================================================

# ------------------------------------------------------------------------------
# 1. CORE APPLICATION RUNTIME
# ------------------------------------------------------------------------------
# Required: Activates production-grade security gates and disables dev mock keys
NODE_ENV="production"
# Required: Container internal binding port (matches Dockerfile EXPOSE 3000)
PORT=3000
# Required: Staging public base URL (used for CORS and canonical link generation)
NEXT_PUBLIC_APP_URL="https://cysle-staging.altare.gg"

# ------------------------------------------------------------------------------
# 2. MANAGED POSTGRESQL DATABASE (POOLED VS DIRECT)
# ------------------------------------------------------------------------------
# Required for Application Runtime Queries:
# Connects through PgBouncer in transaction-pooling mode on port 6543 with SSL.
# Prevents backend connection exhaustion across horizontal container instances.
DATABASE_URL="postgresql://<staging_db_user>:<staging_db_password>@<staging_postgres_host>:6543/<staging_db_name>?schema=public&connection_limit=10&sslmode=require"

# Required Strictly for Prisma Migrations (npx prisma migrate deploy):
# Connects directly to PostgreSQL on port 5432 with SSL (bypassing PgBouncer).
# Required because transactional DDL and advisory locks fail across PgBouncer poolers.
# DO NOT interchange DATABASE_URL and DIRECT_URL.
DIRECT_URL="postgresql://<staging_db_user>:<staging_db_password>@<staging_postgres_host>:5432/<staging_db_name>?schema=public&sslmode=require"

# ------------------------------------------------------------------------------
# 3. AUTHENTICATION & JWT SECURITY
# ------------------------------------------------------------------------------
# Required: 384-bit cryptographic secret for session signing (generate with npm run jwt:generate)
# Next.js instrumentation halts container startup immediately if absent, < 32 chars, or matching placeholders
JWT_SECRET="<generate-using-npm-run-jwt-generate-minimum-48-bytes-base64url>"

# ------------------------------------------------------------------------------
# 4. DISTRIBUTED RATE LIMITING & REDIS CLUSTER
# ------------------------------------------------------------------------------
# Required: Live Redis 7 connection string for atomic sliding-window rate limiting
REDIS_URL="redis://<staging_redis_host>:6379"
# Optional Override: Permitted ONLY when explicitly testing single-instance mode without Redis
# ALLOW_SINGLE_INSTANCE_MEMORY_LIMITER="false"

# ------------------------------------------------------------------------------
# 5. TRUSTED INGRESS & REVERSE-PROXY CONFIGURATION
# ------------------------------------------------------------------------------
# Provisional: Number of reverse-proxy hops to extract rightmost client IP from X-Forwarded-For
# Defaults to 1; must be verified against Altare's ingress behavior prior to live traffic
TRUSTED_PROXY_DEPTH=1
# Security Gate: Set to true ONLY after verifying that Altare's edge sanitizes/strips client headers
TRUST_CF_CONNECTING_IP="false"
# Security Gate: Set to true ONLY after verifying that Altare ingress overwrites X-Real-IP
TRUST_REAL_IP="false"

# ------------------------------------------------------------------------------
# 6. PERSISTENT OBJECT STORAGE (SUPABASE STORAGE API)
# ------------------------------------------------------------------------------
# Note: Cysle Egypt uses the Supabase Storage JavaScript client (@supabase/supabase-js).
# The repository does NOT implement generic AWS S3 SDK (@aws-sdk/client-s3).
NEXT_PUBLIC_SUPABASE_URL="https://<staging-project-id>.supabase.co"
# Public anon key for accessing public catalog assets
NEXT_PUBLIC_SUPABASE_ANON_KEY="<staging-supabase-anon-key>"
# Service role key strictly used server-side for private document upload and signed verification
SUPABASE_SERVICE_ROLE_KEY="<staging-supabase-service-role-key>"

# ------------------------------------------------------------------------------
# 7. NOTIFICATIONS & EXTERNAL INTEGRATIONS (OPTIONAL)
# ------------------------------------------------------------------------------
# Optional: Resend API key for staging email delivery
RESEND_API_KEY="re_<staging-resend-api-key>"
```

---

## 3. PostgreSQL & Redis Architecture Specifications

### PostgreSQL 15/16 Connection Architecture
- **Transaction Pooling (`DATABASE_URL`, Port 6543)**:
  - Connects through PgBouncer in `transaction` mode.
  - Set `connection_limit=10` per Next.js container instance.
  - Multiplexes queries to prevent backend process exhaustion.
- **Direct Connection (`DIRECT_URL`, Port 5432)**:
  - Connects directly to PostgreSQL without pooling.
  - Strictly required for `npx prisma migrate deploy` because Prisma migration locks require session-level advisory locks (`pg_advisory_lock`) that fail when routed through transaction poolers.
- **SSL Enforcement**:
  - Both URLs require `sslmode=require` to protect customer data in transit.
- **URL Incompatibility**:
  - `DATABASE_URL` and `DIRECT_URL` are **not interchangeable**. Using `DATABASE_URL` for migrations will cause migration deadlocks; using `DIRECT_URL` for runtime queries will quickly exhaust PostgreSQL connection limits.

### Redis 7.x Configuration & Safety
- **Memory Management**: Set `maxmemory-policy volatile-lru` or `noeviction`. Rate-limiting keys use millisecond rolling expiration (`PEXPIRE`).
- **Production Fail-Closed Policy**: Under `NODE_ENV=production`, sensitive authentication endpoints (`/api/auth/login`) and file upload routes (`/api/upload`) strictly fail closed (HTTP 503 `RATE_LIMITER_UNAVAILABLE`) if Redis is partitioned, preventing brute force attacks during infrastructure outages.
- **Cache Invalidation Safety**:
  - **NEVER** run `KEYS cysle:*` or mass-delete commands in production or staging.
  - Mass deletion can evict active user sessions, distributed lock tokens, or unrelated application cache.
  - Always use `SCAN` with specific, isolated key patterns (e.g. `cysle:ratelimit:login:*:<test-ip>*`).

---

## 4. Trusted Ingress Proxy Verification Procedure

> [!WARNING]
> `TRUSTED_PROXY_DEPTH=1` is **provisional** until Altare's actual reverse-proxy ingress behavior is validated.  
> Never enable `TRUST_CF_CONNECTING_IP=true` or `TRUST_REAL_IP=true` without evidence that Altare ingress strips incoming client-supplied headers.

### Step 1: Send Diagnostic Test Probe
From an external testing machine with a known public IP, send a request with forged edge headers:
```bash
curl -i -X POST https://cysle-staging.altare.gg/api/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Forwarded-For: 198.51.100.1, 198.51.100.2" \
  -H "CF-Connecting-IP: 203.0.113.99" \
  -H "X-Real-IP: 203.0.113.100" \
  -d '{"email":"proxy-diagnostic@cysle.com","password":"invalidpassword123"}'
```

### Step 2: Query Staging Redis Rate Limit Keys via SCAN
Connect to staging Redis and inspect the recorded IP in the rate-limit keys:
```bash
# Safely inspect keys using SCAN instead of KEYS
redis-cli -u "$REDIS_URL" --scan --pattern "cysle:ratelimit:login:ip:*"
```
- **Expected Secure Result**: The recorded Redis key contains your **real external public IP address** (redacted as `203.0.113.xxx` in reports).
- **Security Invariant**: The recorded key must **NOT** contain `198.51.100.1` (the forged XFF prefix), `203.0.113.99` (the spoofed CF IP), or `203.0.113.100` (the spoofed Real IP).
- **Provisional Depth Confirmation**: If the recorded key reflects your real client IP, `TRUSTED_PROXY_DEPTH=1` correctly extracted the rightmost proxy-appended address. If Altare's edge adds two hops (e.g. Cloudflare -> Altare Ingress), update `TRUSTED_PROXY_DEPTH=2`.
- **Public Privacy Safeguard**: Never log or expose raw client IP addresses in public HTTP responses or shared reports.

---

## 5. Comprehensive Staging Smoke Test Suite

Execute these smoke tests against staging (`https://cysle-staging.altare.gg`):

### Test 1: Application Boot & Database Health Probe
```bash
curl -s -i https://cysle-staging.altare.gg/api/health
```
- **Expected HTTP Status**: `HTTP/2 200`
- **Actual Route JSON Response Structure**:
  ```json
  {
    "status": "ok",
    "service": "texlink-factory-os",
    "timestamp": "2026-11-24T14:40:00.000Z",
    "uptimeSeconds": 42,
    "database": {
      "status": "connected",
      "latencyMs": 3
    },
    "totalDurationMs": 4
  }
  ```
- **Failure Behavior**: If the database is unreachable, the route returns `HTTP 503` with:
  ```json
  {
    "status": "degraded",
    "database": "disconnected",
    "timestamp": "2026-11-24T14:40:00.000Z",
    "uptimeSeconds": 42,
    "error": "Database connectivity check failed"
  }
  ```

### Test 2: Database Connectivity & Query Timing Check
Inspect the database query execution time:
```bash
curl -s https://cysle-staging.altare.gg/api/health | jq '{service, db_status: .database.status, db_latency_ms: .database.latencyMs}'
```
- **Verification**: Confirms `db_status == "connected"` and records the observed latency dynamically without assuming arbitrary thresholds.

### Test 3: Redis Distributed Cache Connectivity
```bash
redis-cli -u "$REDIS_URL" ping
# Expected Output: PONG

redis-cli -u "$REDIS_URL" info server | grep redis_version
# Expected Output: redis_version:7.x.x
```

### Test 4: Staging Login & Authentication Flow
```bash
# 1. Login with test credentials
curl -s -i -c /tmp/staging_cookies.txt -X POST https://cysle-staging.altare.gg/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"staging-test@cysle.com","password":"StagingTestPassword123!"}'

# Expected Status: HTTP 200
# Expected Header: Set-Cookie: texlink_session=...; Path=/; HttpOnly; SameSite=Lax

# 2. Session verification
curl -s -b /tmp/staging_cookies.txt https://cysle-staging.altare.gg/api/auth/me
# Expected Status: HTTP 200 with user profile JSON
```

### Test 5A: IP-Wide Rate-Limit Smoke Test (Broad Volumetric Defense)
- **Rule**: 20 requests per 60 seconds per IP (`login:ip:${ip}`).
- **Isolation Guarantee**: Uses dedicated test source IP `198.51.100.11` and **distinct email addresses** (`ip-flood-${i}@cysle.com`) so that the compound account limit is never reached.
```bash
TEST_IP_A="198.51.100.11"

for i in {1..25}; do
  RES=$(curl -s -i -X POST https://cysle-staging.altare.gg/api/auth/login \
    -H "Content-Type: application/json" \
    -H "X-Forwarded-For: ${TEST_IP_A}" \
    -d "{\"email\":\"ip-flood-${i}@cysle.com\",\"password\":\"wrongpassword123\"}")
  
  STATUS=$(echo "$RES" | grep -i "^HTTP" | awk '{print $2}')
  RETRY=$(echo "$RES" | grep -i "^Retry-After" | awk '{print $2}' | tr -d '\r')
  echo "Request $i -> Status: $STATUS, Retry-After: $RETRY"
done
```
- **Expected Verification**:
  - Requests 1–20: Return `HTTP 401` (invalid credentials reached after broad IP check passes).
  - Requests 21–25: Return `HTTP 429 Too Many Requests` with:
    `{"error":"تم تجاوز الحد المسموح به لمحاولات تسجيل الدخول من هذا العنوان. يرجى الانتظار."}`.
  - **Retry-After Validation**: `Retry-After` exists and is a positive integer within the 60-second window (`1 <= Retry-After <= 60`). Do **not** expect exact equality to 60 due to rolling millisecond windows.

### Test 5B: Compound IP + Account Rate-Limit Smoke Test (Targeted Brute-Force Defense)
- **Rule**: 5 attempts per 15 minutes per IP + normalized email pair (`login:compound:${ip}:${email}`).
- **Isolation Guarantee**: Uses independent test source IP `198.51.100.22` targeting the **exact same email address**.
```bash
TEST_IP_B="198.51.100.22"
TARGET_EMAIL="targeted-account@cysle.com"

for i in {1..6}; do
  RES=$(curl -s -i -X POST https://cysle-staging.altare.gg/api/auth/login \
    -H "Content-Type: application/json" \
    -H "X-Forwarded-For: ${TEST_IP_B}" \
    -d "{\"email\":\"${TARGET_EMAIL}\",\"password\":\"wrongpassword123\"}")
  
  STATUS=$(echo "$RES" | grep -i "^HTTP" | awk '{print $2}')
  RETRY=$(echo "$RES" | grep -i "^Retry-After" | awk '{print $2}' | tr -d '\r')
  echo "Attempt $i -> Status: $STATUS, Retry-After: $RETRY"
done
```
- **Expected Verification**:
  - Attempts 1–5: Return `HTTP 401` (credential validation fails).
  - Attempt 6: Returns `HTTP 429 Too Many Requests` with compound lockout error:
    `{"error":"تم حظر محاولات الدخول لهذا الحساب مؤقتاً من هذا العنوان بسبب تكرار المحاولات الخاطئة. يرجى الانتظار 15 دقيقة."}`.
  - **Retry-After Validation**: `Retry-After` exists and is a positive integer within the 900-second window (`1 <= Retry-After <= 900`).
- **Anti-Denial-of-Service Verification (Independent of IP Exhaustion)**:
  Because `TEST_IP_B` has only executed 6 requests (well under the 20-request IP limit), the broad IP bucket is **not** exhausted. Immediately attempt a login for an unaffected user from the same IP:
  ```bash
  curl -s -o /dev/null -w "%{http_code}" -X POST https://cysle-staging.altare.gg/api/auth/login \
    -H "Content-Type: application/json" \
    -H "X-Forwarded-For: ${TEST_IP_B}" \
    -d '{"email":"unaffected-user@cysle.com","password":"wrongpassword123"}'
  ```
  - **Expected Status**: `HTTP 401` (NOT 429), proving that an attacker cannot lock out third-party accounts globally.

### Test 6: Redis Outage Fail-Closed Behavior on Managed Redis
Because cloud-managed Redis instances cannot be paused with `docker pause`, simulate an outage using one of two non-destructive procedures:

- **Method A (Staging Environment Variable Reconfiguration)**:
  1. In the Altare Staging Console, temporarily change `REDIS_URL` to an unreachable port: `redis://<staging_redis_host>:6399`.
  2. Restart the staging container instance.
  3. Execute login attempt:
     ```bash
     curl -s -i -X POST https://cysle-staging.altare.gg/api/auth/login \
       -H "Content-Type: application/json" \
       -d '{"email":"outage-test@cysle.com","password":"testpassword123"}'
     ```
  4. **Expected Status**: `HTTP/2 503 Service Unavailable`.
  5. **Expected Response Body**:
     ```json
     {
       "error": "نظام حماية الحسابات غير متاح مؤقتاً، يرجى المحاولة بعد قليل",
       "code": "RATE_LIMITER_UNAVAILABLE"
     }
     ```
  6. Restore the valid `REDIS_URL` and confirm login immediately returns to normal.

- **Method B (VPC Security Group / Firewall Simulation)**:
  1. Temporarily add an egress rule blocking outbound port 6379 from the staging app runner.
  2. Verify login requests return `HTTP 503` fail-closed.
  3. Remove the temporary rule.

### Test 7: Private File Uploads & Confidentiality Boundary
- **Architecture Note**: Cysle Egypt uses the Supabase Storage client (`@supabase/supabase-js`). Generic AWS S3 SDK is not implemented.
1. **Unauthenticated Upload Rejection**:
   ```bash
   curl -s -i -X POST https://cysle-staging.altare.gg/api/upload \
     -F "file=@test-doc.pdf"
   ```
   - **Expected Status**: `HTTP/2 401 Unauthorized`.
2. **Authenticated Private Document Upload**:
   ```bash
   curl -s -i -b /tmp/staging_cookies.txt -X POST https://cysle-staging.altare.gg/api/upload \
     -F "file=@test-doc.pdf" \
     -F "isPrivate=true"
   ```
   - **Expected Status**: `HTTP/2 200 OK` (when Supabase Storage is configured) returning `{ "url": "/api/documents/priv_<userId>_<uuid>.dat" }`. If unconfigured in staging, returns `HTTP 503`.
3. **Private Document Access Verification**:
   - Directly requesting the storage key without session returns `HTTP 401`:
     ```bash
     curl -s -o /dev/null -w "%{http_code}" https://cysle-staging.altare.gg/api/documents/priv_sample.dat
     # Expected Status: 401
     ```
   - Private documents can **never** be accessed via public CDN URLs.

### Test 8: Tenant Isolation Safeguards
Verify that Factory A cannot read Factory B's inventory:
```bash
curl -s -b /tmp/factory_a_cookie.txt https://cysle-staging.altare.gg/api/factory/inventory
```
- Confirm every returned record belongs strictly to Factory A's tenant ID.
- Querying an order belonging to Factory B returns `HTTP 403 Forbidden` or `HTTP 404 Not Found`.

### Test 9: User Roles and Permission Enforcement
```bash
# Attempt to perform factory machine operation using Buyer session
curl -s -i -b /tmp/buyer_cookie.txt -X POST https://cysle-staging.altare.gg/api/factory/machines \
  -H "Content-Type: application/json" \
  -d '{"name":"Sewing Machine 1","type":"Sewing"}'
```
- **Expected Status**: `HTTP/2 403 Forbidden` (`غير مصرح لك بالوصول`).

---

## 6. Staging Database Migration & Rollback Safeguards

### Durable Encrypted Pre-Deployment Backup
Before running any migration against staging:
1. Export a full PostgreSQL snapshot and write it to durable, encrypted cloud storage (never exclusively in `/tmp`):
   ```bash
   pg_dump -Fc "$DIRECT_URL" | gzip > /secure/backups/cysle_staging_pre_deploy_$(date +%Y%m%d_%H%M%S).dump.gz
   ```
2. Verify migration status:
   ```bash
   npx prisma migrate status --schema=prisma/schema.postgresql.prisma
   ```

### Why `pg_restore --clean` Does NOT Guarantee Exact Rollback
- `pg_restore --clean` only generates `DROP` statements for objects present in the dump archive.
- It does **not** drop new tables, enum types, or columns introduced by a failed migration that did not exist in the archive.
- Foreign key dependencies and concurrent table locks can cause `--clean` drops to fail or abort mid-restore, leaving the database in an inconsistent hybrid state.

### Reliable Blue/Green Database Rollback Procedure
If a database rollback is required:
1. **Restore to a Fresh Target Database**:
   Create a fresh staging database (e.g. `cysle_staging_recovery_db`) and restore the clean snapshot into it:
   ```bash
   gunzip -c /secure/backups/cysle_staging_pre_deploy_*.dump.gz | pg_restore -d "$RECOVERY_DIRECT_URL"
   ```
2. **Validate the Recovered Database**:
   ```bash
   npx prisma migrate status --schema=prisma/schema.postgresql.prisma
   # Run diagnostic query to verify data integrity
   psql "$RECOVERY_DIRECT_URL" -c "SELECT COUNT(*) FROM \"User\";"
   ```
3. **Switch Environment Variables**:
   Update `DATABASE_URL` and `DIRECT_URL` in the Altare Staging Console to point to the validated `cysle_staging_recovery_db`.
4. **Redeploy / Restart App Instances**:
   Traffic immediately connects to the clean, recovered database.
5. **Decommission**:
   Safely archive or drop the broken database after full validation.

### Expand-and-Contract Migration Pattern
Because `prisma migrate deploy` does **not** auto-generate down migrations:
1. **Backward-Compatible Schema Changes**: All schema changes must follow expand-and-contract:
   - *Expand Phase*: Add new columns as nullable or with default values; add new tables. Old code and new code can query the database simultaneously.
   - *Deploy Phase*: Deploy new code that writes to and reads from the new schema fields.
   - *Contract Phase*: Once the release is permanently stable, drop legacy columns in a subsequent migration.
2. **Safe Code Rollback**: If the application code is rolled back, the previous build continues functioning without schema errors because no destructive changes were applied.

### Safe Redis Rate-Limit Cleanup Procedure
Never run `KEYS cysle:* | xargs del`. Use `SCAN` scoped strictly to test IP keys:
```bash
TEST_IP="198.51.100.42"

# Safely delete rate-limit keys for the test IP without touching session or application data
redis-cli -u "$REDIS_URL" --scan --pattern "cysle:ratelimit:login:*:${TEST_IP}*" | while read -r key; do
  [ -n "$key" ] && redis-cli -u "$REDIS_URL" del "$key"
done
```

---

## 7. Health Check: Docker vs Altare Platform Distinction

| Dimension | Docker Container HEALTHCHECK | Altare Platform Health Probe |
| :--- | :--- | :--- |
| **Location** | Defined inside `Dockerfile` | Configured in Altare App Hosting Console |
| **Directive** | `HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 CMD curl -f http://localhost:3000/api/health \|\| exit 1` | Ingress HTTP health check |
| **Execution** | Executes internally within the container network | Probes the container from Altare's ingress proxy |
| **Purpose** | Reports container status (`healthy` / `unhealthy`) to Docker daemon | Determines traffic routing and zero-downtime deployment rollover |
| **Success Condition** | `/api/health` exits with code 0 (`HTTP 200`) | Receives `HTTP 200 OK` |
| **Failure Condition** | Non-zero exit code (`HTTP 503` or timeout) | Receives `HTTP 503` or exceeds timeout |

---

## 8. Remaining External Prerequisites (Altare Access Required)

The following items cannot be verified in local or GitHub Actions CI environments and require manual verification on Altare staging:

1. **Altare Ingress Header Sanitization**:
   - Confirm whether Altare strips client-injected `CF-Connecting-IP` / `X-Real-IP` and how it appends client addresses to `X-Forwarded-For`.
   - `TRUSTED_PROXY_DEPTH=1` remains provisional until validated via the test in Section 4.
2. **Internal DNS / Service Discovery**:
   - Confirm that the container runner can resolve internal hostnames (e.g. `postgres.internal`, `redis.internal`). If unsupported, use private IPv4 addresses.
3. **Altare TLS / SSL Edge Certificates**:
   - Confirm whether Altare manages Let's Encrypt certificates automatically for custom domains or requires manual certificate injection.
4. **Volume Storage Policy**:
   - Confirm that containers operate on ephemeral filesystems. Persistent uploads must strictly use Supabase Storage.
