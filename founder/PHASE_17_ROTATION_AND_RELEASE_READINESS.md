# CYSLE Egypt — Phase 17 Credential Rotation Readiness & Final Release Preparation

*Prepared: `2026-11-25` | Branch: `deploy/altare-production-prep` | HEAD SHA: `67400bba16020a367cb3b65132cc0cde15c0a966`*

> **Strict Boundaries Attestation:** No credential rotation, `git add` / staging, `git commit`, `git push`, branch merge, Git history rewrite, force-push, database migration, or deployment was executed. No production secrets were generated, displayed, transmitted, or stored.

---

## A. Retirement of Obsolete `scripts/deploy-netlify-prod.js`

1. **Zero-Dependency Verification (Observed):**
   - `git grep -n "deploy-netlify-prod"` across all tracked files returned `(none)`.
   - Automated scan of non-`founder/` untracked files returned `[]`.
   - Verified absent from `package.json`, `netlify.toml`, `.github/workflows/deploy.yml`, `.github/workflows/altare-ci.yml`, `Dockerfile`, `scripts/build.js`, and `scripts/build-netlify.js`.
2. **Recoverable Outside-Repository Backup:**
   - Copied the sanitized Phase 16 script (hardcoded secrets, Netlify UID, and Windows path already removed) outside the repository to:
     `C:\Users\eslam\.gemini\antigravity\brain\82b08487-4fb0-4a34-8813-f2298d1c3501\scratch\retired\deploy-netlify-prod.js.bak` (`3,316` bytes).
   - Historical pre-Phase-16 snapshot also remains readable locally via `git show HEAD:scripts/deploy-netlify-prod.js` until Git history rewrite.
3. **Working-Tree Removal Prepared Unstaged:**
   - Removed `scripts/deploy-netlify-prod.js` from the working tree (`D scripts/deploy-netlify-prod.js`, **unstaged**).
   - No other deployment workflows (`netlify.toml`, `.github/workflows/deploy.yml`, `.github/workflows/altare-ci.yml`, `scripts/build.js`, `scripts/build-netlify.js`) were modified.

---

## B. JWT Rotation Readiness Plan

### 1. Affected vs. Unaffected Environments

| Environment | Uses Exposed `JWT_SECRET`? | Rotation Required? | Notes |
| :--- | :--- | :--- | :--- |
| **Local Development** (`.env` / `.env.local` + external project env) | **Possibly Yes** (if copied from legacy `.env.local` or matching old Netlify setup) | **Yes — Verify & Replace** | Development falls back to `DEV_ONLY_FALLBACK_KEY` only when `JWT_SECRET` is unset (`NODE_ENV !== "production"`). Set a distinct `>=32` char dev secret. |
| **GitHub Actions CI (`altare-ci.yml`)** | **No** | **No** | `.github/workflows/altare-ci.yml` uses an ephemeral non-production CI key (`ci-testing-jwt-secret-key-...`) against disposable test containers. |
| **GitHub Actions Deploy (`deploy.yml`)** | **Possibly Yes** (`${{ secrets.JWT_SECRET }}`) | **Yes** | Deploys `master` to Netlify Production via `.github/workflows/deploy.yml`. |
| **Netlify Production & Preview** (`texlink-egypt.netlify.app` / CF Worker upstream) | **Likely Yes** (target of retired `scripts/deploy-netlify-prod.js`) | **Yes (if active)** | Rotate in Netlify Site Environment Variables + trigger deploy/republish (Cloudflare Worker in `cloudflare-worker/` proxies this upstream seamlessly without holding `JWT_SECRET`). |
| **Altare Staging** (`texlink-factory-staging`) | **Possibly Yes** (if migrated from same secret) | **Yes** | Use an isolated staging-only secret distinct from Production. |
| **Altare Production** (`texlink-factory-production`) | **Possibly Yes** (if configured with legacy key) | **Yes** | Must use a unique 384-bit (`48`-byte) production-only key. |

*(Defense-in-depth: Because a personal Netlify user ID was also exposed in `6df8970`, rotate `NETLIFY_AUTH_TOKEN` in Netlify User Settings and GitHub Actions Secrets if Netlify deployment remains active.)*

### 2. Secure Secret Generation & Compatibility Requirements

- **Runtime Enforcement (`src/lib/auth/jwt-config.ts` & `src/instrumentation.ts`):**
  - Strictly enforces `HS256` (`JWT_ALGORITHM = "HS256"`), single-key `JWT_SECRET` lookup, minimum length `>= 32` characters, and rejection of `KNOWN_INSECURE_SECRETS`.
  - **Important Behavior:** `JWT_SECRET_PREVIOUS` (referenced in `docs/SECURITY_JWT_PROCEDURES.md`) is **not implemented** in `src/lib/auth/jwt-config.ts` or `src/lib/auth/session.ts`. Rotating `JWT_SECRET` immediately invalidates **all** prior `texlink_session` cookies (`30d` TTL), which is **mandatory here** because keeping a leaked key accepted during a grace window would allow token forgery.
- **How to Generate Fresh Keys Locally (Distinct Key Per Environment):**
  ```bash
  npm run jwt:generate
  # Alternative:
  openssl rand -base64 48
  ```
  *(Verified locally: `npm run jwt:generate` produces a 64-character `base64url` string = 384 bits entropy, compatible with `resolveJwtSecret()`. Never paste generated values into Git, chat logs, or CI transcripts.)*

### 3. Environment-by-Environment Rotation & Verification Checklist

#### Environment 1: Local Development
- **Where to configure:** Local git-ignored `.env` / `.env.local` (`JWT_SECRET="<distinct-local-secret>"`).
- **Consistency check:** Restart local `npm run dev` / `npm start` processes so Node reloads `process.env.JWT_SECRET`.
- **Session check:** Clear/keep pre-rotation `texlink_session` cookie -> `GET /api/auth/me` returns `{"user":null}` -> sign in via `POST /api/auth/login` -> `GET /api/auth/me` returns authenticated user.
- **Recovery:** If server fails boot when testing `NODE_ENV=production`, verify `JWT_SECRET.trim().length >= 32` and not in `KNOWN_INSECURE_SECRETS`.

#### Environment 2: GitHub Actions (`.github/workflows/deploy.yml`)
- **Where to configure:** GitHub Repository -> **Settings -> Secrets and variables -> Actions -> Repository secrets** -> update `JWT_SECRET` (and `NETLIFY_AUTH_TOKEN` as defense-in-depth). Match the active Netlify Production `JWT_SECRET` so Next.js build + runtime align.
- **Consistency check:** Inspect latest workflow run timestamp; verify deploy succeeds without startup errors.

#### Environment 3: Netlify Production & Preview (If Still Active)
- **Where to configure:** Netlify Dashboard -> Site `texlink-egypt` -> **Site configuration -> Environment variables** -> update `JWT_SECRET` for **Production** (and a separate value for **Deploy Previews** / **Branch deploys**).
- **Consistency check:** Trigger a fresh production build & deploy (`Clear cache and deploy site` or GitHub `deploy.yml` push) so all Netlify serverless/Edge function bundles run against the new `JWT_SECRET`.
- **Session & health verification:** Probe `GET https://<site>/api/health` (`200`), verify pre-rotation `texlink_session` returns `{"user":null}` on `GET /api/auth/me`, then confirm new login issues working session across multiple requests (also test through Cloudflare Worker URL if used).
- **Recovery:** If serverless routes fail with `500` or fail startup, verify Netlify env scope includes runtime functions and `JWT_SECRET` has no surrounding quotes/newlines or `<32` length; redeploy cleanly. Never revert to the leaked `6df8970` key.

#### Environment 4: Altare Staging (`texlink-factory-staging`)
- **Where to configure:** Altare Console (`https://console.altare.gg/`) -> Staging App -> **Settings -> Environment Variables** -> set Staging-unique `JWT_SECRET`.
- **Consistency check:** Trigger container rolling restart/redeploy -> wait until old container revision terminates (`GET /api/health` returns `200`). Run `5`+ consecutive requests with the newly issued `texlink_session` cookie to `GET /api/auth/me` to confirm zero stale instances remain on the old secret (intermittent `user: null` indicates mixed container revisions).
- **Session check:** Old `texlink_session` -> `GET /api/auth/me` returns `{"user":null}`; fresh login -> `{"user":{...}}`.
- **Recovery:** If container exits immediately (`ExitCode != 0`), inspect Altare startup logs for `FATAL_SECURITY_ERROR` (`JWT_SECRET` missing/short/placeholder); correct env var in Altare Console and restart.

#### Environment 5: Altare Production (`texlink-factory-production`)
- **Where to configure:** Altare Console -> Production App -> **Settings -> Environment Variables** -> set Production-unique 384-bit `JWT_SECRET` (within approved maintenance/release window).
- **Consistency check:** Confirm rollout completed (`100%` of replicas on new revision; zero old revision instances serving traffic), `GET /api/health` returns `200`, and repeated `GET /api/auth/me` calls after fresh login remain consistently authenticated across instances.
- **Session check:** Confirm pre-rotation cookies return `{"user":null}` and protected endpoints return `401`, while fresh `POST /api/auth/login` restores access cleanly (notify active factories/buyers that a one-time re-login is expected).
- **Recovery:** If authentication fails across users after rollout:
  1. Check Altare logs for `FATAL_SECURITY_ERROR` or `RATE_LIMITER_UNAVAILABLE` (`503` on Redis outage — unrelated to JWT).
  2. Check for accidental whitespace/quotes or mismatched secrets across replicas/blue-green slots and trigger a clean full restart.
  3. If compromised-key contamination is suspected, generate a **new** 384-bit secret (`npm run jwt:generate`), update Altare Console, and redeploy — **never fall back to the exposed `6df8970` credential**.

---

## C. Git History Cleanup Plan (Separate Operation — Not Executed)

- **Target Commit Introducing Exposure:** `6df8970ef95c918052e8c3e9553bfc3cd31727b9` (`2026-11-07 13:40:19 +0200`).
- **Affected Branches (`23` total refs — 100% of branches in repo contain `6df8970`):**
  - Local (`20`): `deploy/altare-production-prep`, `master`, `release/candidate-v1.0`, `feat/concierge-dispatch`, `feat/concierge-only-ui`, `feat/flexible-payments`, `feat/homepage-order`, `feat/homepage-sections`, `feat/roadmap-remaining`, `feat/ui-ux-polish`, `fix/audit-remediation`, `fix/clear-errors`, `fix/delivery-phone-privacy`, `fix/delivery-privacy-sweep`, `fix/flexible-payments-hardening`, `fix/pre-migration-closeout`, `fix/qa-validation-sweep`, `fix/security-audit`, `fix/security-audit-2`, `fix/security-audit-3`.
  - Remote (`3`): `remotes/origin/HEAD`, `remotes/origin/master`, `remotes/origin/deploy/altare-production-prep`.
- **Affected Tags (`2` total — 100% of tags contain `6df8970`):**
  - `pre-audit-merge-20261114`
  - `pre-phase4-2026-11-14`
- **Mandatory Prerequisite:** Complete **Section B live secret rotation** *before* rewriting Git history.
- **Execution Sequence (After Explicit Founder Approval):**
  1. **Required Backups (Outside Repo):**
     - Commit/freeze working release branches first, then take a full mirror clone (`git clone --mirror <origin-url> cysle-mirror-backup.git`) and bundle (`git bundle create cysle-pre-rewrite.bundle --all`).
  2. **History Rewrite on Mirror Clone:**
     - Run `git filter-repo --path scripts/deploy-netlify-prod.js --invert-paths` (or `--replace-text` substituting `<REDACTED>` if keeping file history is desired; `--invert-paths` is preferred since the script is retired).
     - Verify `git log --all -S "<target-prefix-check>"` returns zero commits on the rewritten mirror.
  3. **Force-Push Implications:**
     - `git push --force --all origin` and `git push --force --tags origin` will rewrite every commit SHA from `6df8970` onward across all branches and both tags, invalidating open PRs, commit links, and CI badge SHAs.
  4. **Required Collaborator Actions:**
     - Every developer/CI runner with an existing clone **must NOT merge** pre-rewrite local branches back into `origin`; they must either take a fresh `git clone` or run `git fetch origin && git checkout -B <branch> origin/<branch>` followed by `git reflog expire --expire=now --all && git gc --prune=now`.
  5. **GitHub Cache / Fork Limitations:**
     - Force-pushing does **not** purge GitHub's unreachable object cache, closed PR `refs/pull/*/head` views, fork clones, or third-party mirrors/caches that already fetched `6df8970`. After force-pushing, request repository cache garbage collection via GitHub Support and treat the historical secret as permanently burned (already neutralized once Section B rotation completes).

---

## D. Proposed Final Release Packaging (5 Unstaged Commits — Awaiting Approval)

All changes remain **unstaged** (`0` files staged). Simulated buyer panel artifacts (`108` files under `founder/panel/` & `founder/panel-retest/`) and historical superseded `v1` snapshots (`7` files) stay excluded from application release commits.

1. **Commit 1 — Application Fixes (`36` files):**
   - `35` modified tracked files under `src/` (API routes, Next.js pages, components, `src/config/locations.ts`, `src/lib/auth/factory-context.ts`, `src/lib/matching/engine.ts`).
   - `1` untracked file: `src/lib/factory/classification.ts`.
2. **Commit 2 — Tests (`4` files):**
   - `2` modified tracked files: `tests/unit/cysle-rebrand-and-locations.test.ts`, `tests/unit/document-authorization.test.ts`.
   - `2` untracked files: `tests/unit/factory-only-alignment.test.ts`, `tests/unit/phase13-remediation-security.test.ts`.
3. **Commit 3 — Database Migrations & Configuration (`13` items):**
   - `4` modified tracked files: `.gitignore`, `package.json`, `prisma/schema.prisma`, `prisma/schema.postgresql.prisma`.
   - `2` deleted tracked files: `prisma/migrations_postgresql/20260301000000_init_postgresql/migration.sql`, `prisma/migrations_postgresql/migration_lock.toml`.
   - `7` untracked files: `prisma/sqlite.config.mjs`, `2` PostgreSQL migrations under `prisma/migrations/`, and `4` SQLite migration/lock files under `prisma/migrations_sqlite/`.
4. **Commit 4 — Documentation & Governance (`12` core files + optional splits):**
   - `1` modified tracked file: `README.md`.
   - `1` untracked migration doc: `docs/DB_MIGRATION_FACTORY_ONLY_PLAN.md`.
   - `10` governance/audit reports: `founder/DECISION_REVIEW.md`, `EXECUTIVE_SUMMARY.md`, `FACTORY_ONLY_CLASSIFICATION_DECISION.md`, `FINAL_APPROVAL_PACKAGE.md`, `MASTER_FACTORY_ONLY_ALIGNMENT_REPORT.md`, `POST_IMPLEMENTATION_VERIFICATION.md`, `PHASE_13_TARGETED_REMEDIATION_REPORT.md`, `PHASE_13_FINAL_REVIEW.md`, `PHASE_14_MIGRATION_AND_GIT_HYGIENE_REPORT.md`, `PHASE_15_PRE_COMMIT_INVENTORY.md` *(redacted)*.
   - *Excluded / Optional separate founder/tooling commits:* `108` `founder/panel/` & `founder/panel-retest/` artifacts (exclude), `7` superseded `v1` founder snapshots (exclude), `19` active business/market/ops docs under `founder/` (optional founder-docs commit), `20` files under `.agents/skills/` (optional tooling commit).
5. **Commit 5 — Security Cleanup (`3` items):**
   - `D scripts/deploy-netlify-prod.js` *(deleted from working tree, recoverable backup saved externally)*.
   - `founder/PHASE_16_SECRET_REMEDIATION_REPORT.md`.
   - `founder/PHASE_17_ROTATION_AND_RELEASE_READINESS.md`.

---

## E. Post-Retirement Verification Evidence

| Check | Scope & Command | Observed Result |
| :--- | :--- | :--- |
| Working-tree secret / UID / local-path scan | Redacted scan across `453` files (`277` tracked + `176` untracked) after all Phase 17 edits | **PASSED** (`EXPOSED_CREDENTIAL_OR_UID_OR_PATH_HITS: []`) |
| Git cleanliness & boundaries | `git diff --cached --name-only` + `git status --porcelain` | **`0` staged**, `42` modified `M`, `3` deleted `D` (`prisma/migrations_postgresql/*` + `scripts/deploy-netlify-prod.js`) |
| JWT generator vs validation compatibility | `node scripts/generate-jwt-secret.js` vs `src/lib/auth/jwt-config.ts` | **PASSED** (`len=64 base64url=True`, satisfies `>=32` char requirement without printing generated key) |
| Deployment scripts CLI / log exposure audit | `scripts/build.js`, `scripts/build-netlify.js`, `scripts/generate-jwt-secret.js`, `.github/workflows/deploy.yml`, `scripts/migrate-sqlite-to-postgres.ts` | Active `build*.js` log only Prisma schema paths (zero secrets in CLI args/logs); `deploy-netlify-prod.js` removed (see Remaining Risks for untouched `.github/workflows/deploy.yml` & `migrate-sqlite-to-postgres.ts`) |
| ESLint | `npm.cmd run lint` | **PASSED** (exit `0`; pre-existing `<img>` / hook warnings only, `0` errors) |
| TypeScript | `npx.cmd tsc --noEmit` | **PASSED** (exit `0`) |
| Unit & Security Tests | `npx.cmd vitest run` (`7` files: `auth-jwt-security`, `seed-safety`, `supabase-private-storage`, `factory-only-alignment`, `phase13-remediation-security`, `cysle-rebrand-and-locations`, `document-authorization`) | **PASSED** (`7` files, `69` tests passed, `0` skipped in `5.58s`) |

---

## F. Remaining Risks

1. **External Secrets Still Unrotated Until Founder Action:** Production/staging/Netlify/GitHub Actions/local `.env` rotation has not yet been executed externally; any environment still holding the `6df8970` `JWT_SECRET` remains exposed until Section B is completed.
2. **Git History Still Contains `6df8970` Until Section C:** Commit `6df8970` remains reachable across all `23` branch refs and `2` tags on `origin` until history rewrite & force-push occur after secret rotation.
3. **Minor Script/Workflow Hardening Outside Phase 17 Edit Scope (Untouched per Boundary):**
   - `.github/workflows/deploy.yml` (line 46) passes `--auth "${{ secrets.NETLIFY_AUTH_TOKEN }}"` as a CLI argument even though `NETLIFY_AUTH_TOKEN` is already supplied via `env:` (line 44). Recommend dropping `--auth ...` in a later CI tidy-up PR.
   - `scripts/migrate-sqlite-to-postgres.ts` (line 19) logs raw `Target: ${postgresUrl}` to stdout; redact credentials in logs before running against non-local PostgreSQL URLs.
4. **Live PostgreSQL & Redis Integration Tests:** Integration suites requiring live Redis/PostgreSQL services (`tests/integration/**`) were not run locally (daemons offline); full CI pipeline execution (`altare-ci.yml`) should verify those upon approved push.

---

**STOPPED — Waiting for Explicit Founder Approval** before rotating external credentials, staging/committing Commits 1–5, pushing, running Git history rewrite, or deploying.
