# Cysle Egypt — Altare Staging Deployment & Validation Runbook

**Environment**: Staging (`cysle-staging.altare.gg`)  
**Deployment Target Branch**: `deploy/altare-production-prep`  
**Repository**: `https://github.com/eslamElsheikh/texlink-egypt`  
**Runtime**: Next.js 15 Standalone (Node.js 24 LTS, UID 1001 Non-Root)  
**Security Status**: Verified via CI Run #45386700749 (Docker, PostgreSQL 16, Redis 7, JWT, 227 Automated Tests)

---

## 1. Altare Staging Pre-Deployment Checklist

Follow these steps sequentially prior to routing traffic to staging:

- [ ] **1. Infrastructure Provisioning on Altare Console**
  - [ ] Managed PostgreSQL 15/16 database provisioned (`cysle_staging_db`).
  - [ ] Managed Redis 7+ instance provisioned (`cysle_staging_redis`).
  - [ ] Internal network / VPC connectivity verified between app container runner, database, and Redis.
  - [ ] Object Storage provisioned: Supabase Storage project or Altare S3-compatible buckets (`factory-private-documents` private, `texlink-public-assets` public).
- [ ] **2. Database Schema & Migration Execution**
  - [ ] Verify `_prisma_migrations` table state on staging database.
  - [ ] Execute `npx prisma migrate deploy --schema=prisma/schema.postgresql.prisma` via administrative terminal using direct connection (`DIRECT_URL`).
  - [ ] Confirm zero migration drift (`npx prisma migrate status`).
  - [ ] **CRITICAL**: Never run `prisma db push` or destructive seed scripts against staging/production databases.
- [ ] **3. Environment Variables Injection**
  - [ ] Inject all required variables from the template below into the Altare App Console.
  - [ ] Generate a fresh 384-bit cryptographic secret (`npm run jwt:generate`) for `JWT_SECRET`.
  - [ ] Verify `NODE_ENV=production` is set.
  - [ ] Set `TRUSTED_PROXY_DEPTH=1`, `TRUST_CF_CONNECTING_IP=false`, `TRUST_REAL_IP=false` (defensive defaults).
- [ ] **4. Container Deployment Execution**
  - [ ] Select branch `deploy/altare-production-prep` (Commit `09e01de` / `adc4449`).
  - [ ] Set build command: uses production `Dockerfile` (multi-stage build).
  - [ ] Set health check probe path: `/api/health`.
  - [ ] Set health check parameters: Interval 15s, Timeout 5s, Initial Delay 10s, Success Threshold 1, Failure Threshold 3.
  - [ ] Trigger deployment in Altare Console.

---

## 2. Secure Staging Environment Variable Template

> [!IMPORTANT]
> The values below are secure illustrative placeholders. **NEVER** expose actual credentials or commit secrets into version control.

```ini
# ==============================================================================
# Cysle Egypt — Staging Environment Variables Template
# Altare App Hosting Platform
# ==============================================================================

# ------------------------------------------------------------------------------
# 1. CORE APPLICATION RUNTIME
# ------------------------------------------------------------------------------
# Enforces production-grade security gates and disables dev mock keys
NODE_ENV="production"
# Container internal binding port (matched to Dockerfile EXPOSE 3000)
PORT=3000
# Fully qualified staging domain URL (used for CORS and canonical links)
NEXT_PUBLIC_APP_URL="https://cysle-staging.altare.gg"

# ------------------------------------------------------------------------------
# 2. MANAGED POSTGRESQL DATABASE
# ------------------------------------------------------------------------------
# Transaction-pooled connection string (e.g. PgBouncer port 6543) for runtime queries
DATABASE_URL="postgresql://<staging_db_user>:<staging_db_password>@<staging_postgres_host>:5432/<staging_db_name>?schema=public&connection_limit=10&sslmode=require"
# Direct non-pooling connection string (Port 5432) strictly for Prisma migrations
DIRECT_URL="postgresql://<staging_db_user>:<staging_db_password>@<staging_postgres_host>:5432/<staging_db_name>?schema=public&sslmode=require"

# ------------------------------------------------------------------------------
# 3. AUTHENTICATION & JWT SECURITY
# ------------------------------------------------------------------------------
# 384-bit cryptographic secret (generate using: npm run jwt:generate)
# Server boot is refused if absent, < 32 characters, or matching placeholder strings
JWT_SECRET="<generate-using-npm-run-jwt-generate-minimum-48-bytes-base64url>"

# ------------------------------------------------------------------------------
# 4. DISTRIBUTED RATE LIMITING & REDIS CLUSTER
# ------------------------------------------------------------------------------
# Live Redis 7 connection string (Required in production mode)
REDIS_URL="redis://<staging_redis_host>:6379"
# Single-instance override: leave commented out in production/staging cluster
# ALLOW_SINGLE_INSTANCE_MEMORY_LIMITER="false"

# ------------------------------------------------------------------------------
# 5. TRUSTED INGRESS & REVERSE-PROXY CONFIGURATION
# ------------------------------------------------------------------------------
# Proxy hop depth to extract rightmost client IP from X-Forwarded-For (Default: 1)
TRUSTED_PROXY_DEPTH=1
# Trust CF-Connecting-IP only if Altare's edge sanitizes/strips client-injected headers
TRUST_CF_CONNECTING_IP="false"
# Trust X-Real-IP only if Altare ingress explicitly sets and overwrites it
TRUST_REAL_IP="false"

# ------------------------------------------------------------------------------
# 6. PERSISTENT OBJECT STORAGE (SUPABASE / S3-COMPATIBLE)
# ------------------------------------------------------------------------------
# Supabase project URL for document & asset storage
NEXT_PUBLIC_SUPABASE_URL="https://<staging-project-id>.supabase.co"
# Anon public key for client-side asset access
NEXT_PUBLIC_SUPABASE_ANON_KEY="<staging-supabase-anon-key>"
# Service role key for private document upload & signature verification
SUPABASE_SERVICE_ROLE_KEY="<staging-supabase-service-role-key>"

# ------------------------------------------------------------------------------
# 7. EXTERNAL INTEGRATIONS & NOTIFICATIONS (OPTIONAL)
# ------------------------------------------------------------------------------
# Resend API key for staging email delivery
RESEND_API_KEY="re_<staging-resend-api-key>"
```

---

## 3. Database & Redis Specifications

### PostgreSQL 15/16 Configuration
- **Connection Pooling**: Configure PgBouncer in `transaction` mode. Set application pool size between `10` and `15` connections per container instance (`connection_limit=10`).
- **SSL/TLS**: Enable `sslmode=require` to encrypt database traffic between Altare container runners and database hosts.
- **Direct Port for Migrations**: Prisma migrations require transactional DDL locks that can fail when run through connection poolers. Ensure `DIRECT_URL` points directly to port `5432` without going through PgBouncer.

### Redis 7.x Configuration
- **Memory Management**: Set `maxmemory-policy volatile-lru` or `noeviction`. Rate-limiting keys use rolling expiration windows with microsecond TTLs (`PEXPIRE`).
- **Fail-Closed Policy**: Under `NODE_ENV=production`, sensitive authentication endpoints (`/api/auth/login`) and file upload routes (`/api/upload`) strictly fail closed (HTTP 503 `RATE_LIMITER_UNAVAILABLE`) if Redis is partitioned, preventing brute force attacks during infrastructure outages.

---

## 4. Altare Trusted Ingress Proxy Verification Procedure

To determine whether Altare ingress safely sanitizes or overwrites edge headers:

### Step 1: Send Spoofed Test Probe
From an external machine, send a probe with spoofed edge headers:
```bash
curl -i -X POST https://cysle-staging.altare.gg/api/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Forwarded-For: 198.51.100.1, 198.51.100.2" \
  -H "CF-Connecting-IP: 203.0.113.99" \
  -H "X-Real-IP: 203.0.113.100" \
  -d '{"email":"proxy-test@cysle.com","password":"invalidpassword123"}'
```

### Step 2: Query Staging Redis Rate Limit Keys
Connect to the staging Redis instance:
```bash
redis-cli -u $REDIS_URL keys "cysle:ratelimit:login:*"
```
Inspect the recorded IP address in the Redis keys:
- **Expected Secure Result**: The recorded IP matches your **real external public IP address** (or the rightmost IP appended by Altare ingress), and does **NOT** equal `198.51.100.1`, `203.0.113.99`, or `203.0.113.100`.
- **Verdict**: If the real external IP was recorded, client IP spoofing is completely defeated under `TRUSTED_PROXY_DEPTH=1`.
- **Conditional Tuning**: If Altare documentation or support confirms that Cloudflare edge sanitizes `CF-Connecting-IP` upstream, `TRUST_CF_CONNECTING_IP=true` can be enabled.

---

## 5. Comprehensive Staging Smoke Test Suite

Execute these executable smoke tests against the deployed staging environment:

### Test 1: Application Boot & Database Health Probe
```bash
curl -s -i https://cysle-staging.altare.gg/api/health
```
- **Expected Status**: `HTTP/2 200`
- **Expected Body**:
  ```json
  {
    "status": "ok",
    "service": "texlink-factory-os",
    "database": {
      "status": "connected",
      "latencyMs": 5
    }
  }
  ```

### Test 2: Database Connectivity & Query Latency Check
Verify that the reported database latency is within normal parameters:
```bash
LATENCY=$(curl -s https://cysle-staging.altare.gg/api/health | jq '.database.latencyMs')
echo "Database Latency: ${LATENCY}ms"
test "$LATENCY" -lt 50 && echo "PASS: Latency acceptable" || echo "WARN: High database latency"
```

### Test 3: Redis Distributed Cache Connectivity
```bash
redis-cli -u $REDIS_URL ping
# Expected Output: PONG

redis-cli -u $REDIS_URL info server | grep redis_version
# Expected Output: redis_version:7.x.x
```

### Test 4: Staging Login & Authentication Flow
Execute test login to generate session cookie:
```bash
curl -s -i -c /tmp/staging_cookies.txt -X POST https://cysle-staging.altare.gg/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"staging-test@cysle.com","password":"StagingTestPassword123!"}'
```
- **Expected Response**:
  - `HTTP/2 200`
  - Header: `Set-Cookie: texlink_session=...; Path=/; HttpOnly; SameSite=Lax`
  - Body: `{"user":{"id":"...","email":"staging-test@cysle.com","role":"..."}}`

Verify session resolution:
```bash
curl -s -b /tmp/staging_cookies.txt https://cysle-staging.altare.gg/api/auth/me
```
- **Expected Status**: `HTTP/2 200` with user profile payload.

### Test 5: Rate Limiting Enforcement & Volumetric Throttling
Send rapid burst of 25 authentication requests:
```bash
for i in {1..25}; do
  CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST https://cysle-staging.altare.gg/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"flood-test@cysle.com","password":"wrongpassword"}')
  echo "Request $i: HTTP $CODE"
done
```
- **Expected Result**: Requests 1–20 return `HTTP 401` (invalid credentials); Requests 21–25 return `HTTP 429` (Rate limit quota exceeded with `Retry-After` header).

### Test 6: Redis Outage Fail-Closed Behavior
1. Temporarily pause staging Redis container or adjust network security group to block port 6379:
2. Execute login request:
   ```bash
   curl -s -i -X POST https://cysle-staging.altare.gg/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"outage-test@cysle.com","password":"testpassword123"}'
   ```
- **Expected Status**: `HTTP/2 503 Service Unavailable`
- **Expected Body**:
  ```json
  {
    "error": "نظام حماية الحسابات غير متاح مؤقتاً، يرجى المحاولة بعد قليل",
    "code": "RATE_LIMITER_UNAVAILABLE"
  }
  ```
3. Restore Redis connectivity and verify login operations immediately return to normal without container restart.

### Test 7: Private File Uploads & Confidentiality Boundary
1. Test unauthenticated upload rejection:
   ```bash
   curl -s -i -X POST https://cysle-staging.altare.gg/api/upload \
     -F "file=@test-doc.pdf"
   ```
   - **Expected Status**: `HTTP/2 401 Unauthorized`
2. Test authenticated private document upload:
   ```bash
   curl -s -i -b /tmp/staging_cookies.txt -X POST https://cysle-staging.altare.gg/api/upload \
     -F "file=@test-doc.pdf" \
     -F "isPrivate=true"
   ```
   - **Expected Status**: `HTTP/2 200 OK` (when Supabase Storage is configured) or `HTTP/2 503` (if storage keys are absent in staging). Ephemeral container filesystem is never used for private files.

### Test 8: Tenant Isolation Safeguards
Verify that Factory A cannot read Factory B's inventory:
```bash
# Logged in as Factory A
curl -s -b /tmp/factory_a_cookie.txt https://cysle-staging.altare.gg/api/factory/inventory
```
- Verify that every returned record matches Factory A's tenant ID.
- Attempting to query an order belonging to Factory B returns `HTTP 403 Forbidden` or `HTTP 404 Not Found`.

### Test 9: User Roles and Permission Enforcement
Verify role-based boundary:
```bash
# Attempt to perform factory machine operation using Buyer session
curl -s -i -b /tmp/buyer_cookie.txt -X POST https://cysle-staging.altare.gg/api/factory/machines \
  -H "Content-Type: application/json" \
  -d '{"name":"Machine 1","type":"Sewing"}'
```
- **Expected Status**: `HTTP/2 403 Forbidden` (`غير مصرح لك بالوصول`).

---

## 6. Staging Rollback Procedure

If a critical issue is detected during staging validation:

### Step 1: Immediate Container Rollback (Altare Console)
1. In the Altare App dashboard, navigate to **Deployments**.
2. Identify the previous stable deployment build ID.
3. Click **Redeploy** on the stable build.
4. Traffic is routed to the previous container image in under 60 seconds.

### Step 2: Database Migration Reversal (If Required)
If schema migrations were applied that are incompatible with the previous code:
1. Connect via administrative terminal using `DIRECT_URL`.
2. Inspect applied migrations:
   ```bash
   npx prisma migrate status --schema=prisma/schema.postgresql.prisma
   ```
3. Apply targeted down-migration SQL scripts (or restore from the pre-deployment database snapshot).

### Step 3: Redis Cache & Rate-Limit Invalidation
Flush transient rate-limit keys and cached states:
```bash
redis-cli -u $REDIS_URL keys "cysle:*" | xargs -r redis-cli -u $REDIS_URL del
```

### Step 4: Post-Rollback Health Verification
Verify that the rolled-back instance is healthy:
```bash
curl -s -f https://cysle-staging.altare.gg/api/health
```

---

## 7. External Infrastructure Prerequisites (Altare Access Required)

The following items cannot be validated through CI or code audits and require interactive validation within the Altare App Hosting environment:

| Prerequisite | Technical Question | Risk If Unverified | Mitigation in Cysle Codebase |
| :--- | :--- | :--- | :--- |
| **Altare Ingress Header Behavior** | Does Altare ingress strip `CF-Connecting-IP` / `X-Real-IP`, or append client IP to `X-Forwarded-For`? | An attacker could inject spoofed headers to bypass rate limits if unstripped single headers were trusted. | **Default secure**: Application ignores `CF-Connecting-IP` and `X-Real-IP` unless explicitly enabled, extracting rightmost IP from `X-Forwarded-For`. |
| **Altare Internal DNS Resolution** | Can the container runner resolve internal hostnames (e.g. `postgres.internal`, `redis.internal`)? | Application cannot boot or fails health check. | Fall back to explicit private IPv4 addresses if internal DNS resolution is not supported. |
| **Altare TLS / SSL Termination** | Does Altare provide automated Let's Encrypt certificates or requires custom cert uploads? | HTTPS protocol errors or mixed-content warnings. | Configure `NEXT_PUBLIC_APP_URL` matching the active SSL domain name. |
| **Altare Storage Persistence** | Does Altare provide persistent local volume mounts? | Ephemeral container files are wiped upon restart. | **Zero local dependency**: Application strictly utilizes Supabase / S3-compatible cloud object storage for uploads. |
