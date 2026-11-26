# CYSLE Egypt — Phase 16 Secret Exposure Investigation & Remediation Report

*Prepared: `2026-11-25` | Branch: `deploy/altare-production-prep` | HEAD SHA: `67400bba16020a367cb3b65132cc0cde15c0a966`*

> **Strict Boundaries Observed:** Zero staging (`git add`), zero commits, zero pushes, zero merges, zero deployments, zero production database operations, and zero production credential rotations occurred. No secret values are reproduced in this report.

---

## 1. Executive Exposure Assessment

- **Target File Investigated:** `scripts/deploy-netlify-prod.js`
- **Credential Classification:** **Real / Potentially Compromised Credential** (not a placeholder).
  - Line 31 contained a hardcoded **64-character lowercase hexadecimal `JWT_SECRET`** (256-bit / 32-byte random-hex format, distinct from `KNOWN_INSECURE_SECRETS` and placeholder patterns in `src/lib/auth/jwt-config.ts`).
  - The same script also contained:
    - Line 8: A **hardcoded 24-hex personal Netlify user ID** indexing `%USERPROFILE%\AppData\Roaming\netlify\Config\config.json` to extract the developer's Netlify OAuth token and pass it via CLI flag `--auth` (line 43).
    - Line 10: A **machine-specific Windows filesystem path** reading a local `.env.local` file outside the repository to extract Supabase PostgreSQL and API credentials.
    - Lines 27 & 42: Legacy deployment domain (`texlink-egypt.netlify.app`) and `?schema=texlink` connection query suffixes.
- **Script Reference Status:** **Unreferenced / Superseded by CI & Altare Workflows.**
  - `git grep` confirms **zero** references to `deploy-netlify-prod` in `package.json`, `netlify.toml`, `.github/workflows/deploy.yml`, `.github/workflows/altare-ci.yml`, `Dockerfile`, `scripts/build.js`, `scripts/build-netlify.js`, or any source/test file.
  - Automated `master` deploys are already defined in `.github/workflows/deploy.yml` (using GitHub Secrets), while `deploy/altare-production-prep` targets Docker/Altare via `Dockerfile` and `scripts/build.js`.

---

## 2. Git History & Public Exposure Findings

- **Introducing Commit:** `6df8970ef95c918052e8c3e9553bfc3cd31727b9` (`fix: remove demo accounts card from login page and add Linux binaryTargets`, committed `2026-11-07 13:40:19 +0200`).
- **Occurrences in Tracked Files & History (`101` commits scanned across `--all`):**
  - The hardcoded `JWT_SECRET` and personal Netlify user ID appear **only** in `scripts/deploy-netlify-prod.js` from commit `6df8970` onward among tracked files.
  - **Working-Tree Cleanup Note:** Automated post-edit scanning detected that the previously generated untracked Phase 15 inventory (`founder/PHASE_15_PRE_COMMIT_INVENTORY.md`, lines 14 & 291) had copied the plaintext `JWT_SECRET` and local `.env.local` path strings during documentation. Both values have now been redacted in `founder/PHASE_15_PRE_COMMIT_INVENTORY.md`.
- **Remote / Public Reachability:**
  - `git branch -a --contains 6df8970` and `git tag --contains 6df8970` confirm commit `6df8970` is present on **`remotes/origin/master`**, **`remotes/origin/deploy/altare-production-prep`**, `19` local branches, and `2` tags (`pre-audit-merge-20261114`, `pre-phase4-2026-11-14`) on remote `origin` (`https://github.com/eslamElsheikh/texlink-egypt.git`).
  - **Exposure Verdict:** Because `6df8970` was pushed to `origin` across branches and tags, the secret **must be treated as exposed** regardless of whether the GitHub repository is currently private or public. Editing or deleting the file in a new commit removes it from future tree snapshots only — **the credential remains readable in Git history (`6df8970`) until rotated everywhere and (if required by policy) purged via history rewrite.**

---

## 3. Repository-Wide Security Scan Summary (Tracked Files & All History)

All `277` tracked files (`git ls-files`) and all `101` commits (`git log --all -p`) were scanned via redacted pattern matching covering JWT tokens, `JWT_SECRET` / API key assignments, DB credentials, Netlify tokens/IDs, private key PEM blocks, and local machine paths:

| Scope / File | Finding Type | Assessment | Action Status |
| :--- | :--- | :--- | :--- |
| `scripts/deploy-netlify-prod.js` (commit `6df8970` to pre-Phase 16 `HEAD`) | Hardcoded 64-hex `JWT_SECRET`, personal Netlify user ID, local Windows `.env.local` path, CLI `--auth` token passing | **Real exposure / security violation** | **Remediated in working tree** (awaiting commit & remote secret rotation) |
| `founder/PHASE_15_PRE_COMMIT_INVENTORY.md` (untracked report, lines 14 & 291) | Plaintext copy of the exposed `JWT_SECRET` and local `.env.local` path from Phase 15 reporting | **Residual plaintext copy in working tree** | **Redacted** in working tree |
| Early `.env.example` in pre-hardening commits (`da92c7c3` / `88039a5c`, documented in `docs/SECURITY_AUDIT.md`) | Legacy weak placeholder `JWT_SECRET` (`texlink-egypt-secret-key-...`) | Superseded historical weak default (not present in `HEAD`; already blacklisted/documented) | Previously fixed prior to `HEAD`; verify live envs do not retain legacy defaults |
| `.github/workflows/altare-ci.yml`, `Dockerfile`, `.env.example`, `docs/STAGING_DEPLOYMENT_CHECKLIST.md`, `docs/PRODUCTION_READINESS_FINAL_REPORT.md`, `docs/POSTGRESQL_STAGING_TEST_RESULTS.md`, `tests/unit/auth-jwt-security.test.ts`, `tests/unit/seed-safety.test.ts`, `tests/unit/supabase-private-storage.test.ts`, `scripts/migrate-sqlite-to-postgres.ts`, `scripts/rehearse-backup-restore.ts` | CI/test/doc placeholder secrets, `postgres:postgres@localhost`, `***` masked examples, synthetic test keys | **Benign non-production test/doc placeholders** | Clean — no real credentials |
| `docs/SECURITY_MASTER_REPORT.md` (history `14d0f37d`), `tests/integration/*.test.ts` (history), `src/app/page.tsx` | Vitest workspace banner path in old audit report; `@/components/home/...` false-positive `/home/` substring match | **Benign false positives** | Clean — no local user credentials |
| All tracked files & full Git history for PEM keys / `eyJ...` live JWTs / live Resend, Stripe, GitHub, or Netlify `nfp_` tokens | Private key blocks & live token prefixes | **Zero real matches found** | Verified clean |

---

## 4. Credential Rotation Plan & Session Impact

### A. Environments Potentially Dependent on the Exposed `JWT_SECRET`
Any environment ever deployed using `scripts/deploy-netlify-prod.js` or sharing the same `JWT_SECRET` must be rotated:
1. **Netlify Production & Preview (`texlink-egypt` / `texlink-egypt.netlify.app`):** Site configuration -> Environment variables -> `JWT_SECRET` (also note `cloudflare-worker/wrangler.toml` proxies this Netlify origin).
2. **GitHub Actions Secrets (`.github/workflows/deploy.yml`):** Repository Secrets -> `JWT_SECRET` (and verify `NETLIFY_AUTH_TOKEN`, `DATABASE_URL`, `DIRECT_URL`, `SUPABASE_SERVICE_ROLE_KEY`).
3. **Altare Staging & Production (`console.altare.gg`):** Service Environment Variables -> `JWT_SECRET` (if any prior setup reused the Netlify key).
4. **Local Developer `.env` / `.env.local` (including external local env files):** Replace local `JWT_SECRET` if shared with the exposed value.
5. **Defense-in-Depth Related Credentials:** While external Supabase values (`<external-project>/.env.local`) and the Netlify OAuth token in `AppData` were **not** committed into Git, rotating `NETLIFY_AUTH_TOKEN` (since a personal Netlify user ID was exposed) and confirming external Supabase DB/service-role keys were never committed elsewhere is recommended.

### B. Session Invalidation & JWT Compatibility Implications (Verified Against Code)
- **Token Mechanism (`src/lib/auth/session.ts` & `src/lib/auth/jwt-config.ts`):**
  - User authentication relies on stateless `HS256` (`jose`) JWTs stored in the HTTP-only `texlink_session` cookie with **`30d` expiration (`maxAge: 30 * 24 * 60 * 60`)** and **no server-side session table or revocation blocklist**.
  - **Code-vs-Docs Discrepancy Found:** `docs/SECURITY_JWT_PROCEDURES.md` (line 53) mentions `JWT_SECRET_PREVIOUS` for dual-key transition windows, **but `JWT_SECRET_PREVIOUS` is NOT implemented in `src/lib/auth/jwt-config.ts` or `src/lib/auth/session.ts`**. Only a single `process.env.JWT_SECRET` key is resolved by `getJwtSecretKey()`.
- **Impact of Rotation:**
  - Rotating `JWT_SECRET` immediately invalidates **100% of active `texlink_session` cookies** across Factory, Buyer, and Admin users on their next request (`verifySessionToken` returns `null`), prompting re-login.
  - **Why Single-Key Immediate Invalidation Is Required Here:** Because the old `JWT_SECRET` was exposed in Git history, **dual-key verification MUST NOT be used** — keeping the compromised key valid during a grace window would allow anyone who extracted commit `6df8970` to forge valid Admin/Factory/Buyer JWTs until the window closed. Immediate single-key cutover intentionally revokes every token signed with the leaked secret.
- **Startup Guard Behavior (`src/instrumentation.ts`):** Production boot checks `assertProductionStartupJwtSecret()`, aborting startup (`process.exit(1)`) if the replacement `JWT_SECRET` is missing, shorter than `32` characters, or matches `KNOWN_INSECURE_SECRETS`.

### C. Step-by-Step Rotation Procedure (Founder Execution Required)
1. **Generate Replacement Secret Offline (never commit or paste into logs):**
   ```bash
   npm run jwt:generate
   # or: openssl rand -base64 48
   ```
2. **Update Secret Stores & Trigger Redeploy:**
   - Update `JWT_SECRET` in **Netlify**, **GitHub Actions Secrets**, **Altare Console** (Staging & Production), and any active local `.env` files.
   - Optionally rotate `NETLIFY_AUTH_TOKEN` in Netlify User Settings and GitHub Actions Secrets.
   - Trigger a clean deployment so all running server instances pick up the new `JWT_SECRET` and terminate validity of pre-rotation `texlink_session` cookies.
3. **Optional Git History Purge (After Rotation & Coordinated Team Sync):**
   - Because `6df8970` sits on `remotes/origin/master` and `remotes/origin/deploy/altare-production-prep`, rotating the live secret first neutralizes active forging risk.
   - If policy also requires scrubbing commit `6df8970` from GitHub history, use `git filter-repo --path scripts/deploy-netlify-prod.js --invert-paths` (or `replace-text`) on a mirror clone, force-push branches/tags, re-create/delete affected tags (`pre-audit-merge-20261114`, `pre-phase4-2026-11-14`), and contact GitHub Support if cached PR commits remain accessible.

---

## 5. Remediation Applied & Obsolescence Proposal

### A. In-Place Remediation Applied to `scripts/deploy-netlify-prod.js`
- Removed the hardcoded 64-char `JWT_SECRET`.
- Removed `%USERPROFILE%\AppData\Roaming\netlify\Config\config.json` access and the personal 24-char Netlify user ID.
- Removed the machine-specific local Windows `.env.local` path and hardcoded legacy `texlink-egypt.netlify.app` / `?schema=texlink` strings.
- Removed `--auth <token>` CLI argument interpolation (which exposed tokens in OS process tables), relying instead on child-process `env` variables (`NETLIFY_AUTH_TOKEN`, `NETLIFY_SITE_ID`).
- Added fail-closed `validateDeployEnv(sourceEnv)` enforcing presence of `NETLIFY_AUTH_TOKEN`, `NETLIFY_SITE_ID`, `DATABASE_URL` (or `POSTGRES_PRISMA_URL`), `DIRECT_URL` (or `POSTGRES_URL_NON_POOLING`), `JWT_SECRET` (`>= 32` chars, non-placeholder), `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`, while preserving `runDeploy()` CLI behavior under `if (require.main === module)`.

### B. Safe Removal Proposal (If Founder Prefers Retiring Manual Netlify CLI Deploys)
Because `scripts/deploy-netlify-prod.js` has **zero references** in `package.json`, `netlify.toml`, `.github/workflows/deploy.yml`, or `.github/workflows/altare-ci.yml`, the founder may alternatively authorize removing the file completely once `JWT_SECRET` is rotated:
- `git rm scripts/deploy-netlify-prod.js` (to be authorized and committed alongside approved Phase 15/16 commits).

---

## 6. Files Changed & Preservation Check

- **Tracked File Modified (`1` file added to prior working tree changes):**
  - `scripts/deploy-netlify-prod.js` (`M`, `+97/-37` lines in diff stat)
- **Untracked Files Created / Updated:**
  - `founder/PHASE_15_PRE_COMMIT_INVENTORY.md` (redacted residual plaintext `JWT_SECRET` and local `.env.local` path on lines 14 & 291)
  - `founder/PHASE_16_SECRET_REMEDIATION_REPORT.md` (this report)
- **Unrelated Files Check:** All prior Phase 13/14 and Factory-Only working tree modifications (`42` previously modified tracked files + `2` deleted tracked files in `prisma/migrations_postgresql/` + existing untracked files) remain preserved untouched, with **`0` staged changes (`git diff --cached --name-only`)** and **`0` commits/pushes**.

---

## 7. Verification Performed (After Final Code & Redaction Edits)

| Check | Command | Outcome | Notes |
| :--- | :--- | :--- | :--- |
| Script env validation | `node -e "...validateDeployEnv..."` | **PASSED** (`DEPLOY_SCRIPT_ENV_VALIDATION_OK`) | Verified missing vars, `<32` char `JWT_SECRET`, and placeholder rejection throw; valid env sets `NODE_ENV=production` |
| ESLint | `npm.cmd run lint` | **PASSED** (exit `0`) | Existing `<img>` / `react-hooks/exhaustive-deps` warnings only; `0` errors; `scripts/deploy-netlify-prod.js` clean |
| TypeScript check | `npx.cmd tsc --noEmit` | **PASSED** (exit `0`) | Zero type errors across project |
| Relevant security & Phase 13/alignment tests | `npx.cmd vitest run tests/unit/auth-jwt-security.test.ts tests/unit/seed-safety.test.ts tests/unit/supabase-private-storage.test.ts tests/unit/factory-only-alignment.test.ts tests/unit/phase13-remediation-security.test.ts` | **PASSED** (`5` files, `48` tests, `0` skipped) | Covered JWT fail-closed validation, `HS256` verification, storage key separation, seed safety, Factory-Only alignment, and Phase 13 controls (`2.90s`) |
| Working-tree secret & UID re-scan | Redacted Python check across `453` files (`277` tracked + `176` untracked) | **PASSED** (`[]` matches) | Zero occurrences of the exposed `JWT_SECRET`, personal Netlify UID, or external `.env.local` path remain in any tracked or untracked working-tree file |

---

## 8. Remaining Risks

1. **Live Secret Still Active Until Rotated:** If any live deployment (Netlify, Altare, GitHub Actions, or local env) currently uses the `JWT_SECRET` committed in `6df8970`, tokens can still be forged offline until the founder rotates `JWT_SECRET` across those secret stores and redeploys.
2. **Git History Persistence (`6df8970`):** Commit `6df8970` remains in Git object history on `origin/master`, `origin/deploy/altare-production-prep`, and two Git tags until rotated + optionally rewritten/force-pushed.
3. **Full Integration Suite (`npm test`):** Integration suites requiring live Redis/PostgreSQL (`tests/integration/**`) were not run locally in Phase 16 (Redis/PostgreSQL daemons not active locally); targeted unit/security suites (`5` files, `48` tests), lint, and `tsc --noEmit` passed.

---

**Explicit Attestation:** No `git add`, `git commit`, `git push`, branch merge, deployment, database migration, or production credential rotation was performed during Phase 16.

**STOPPED — Waiting for Explicit Founder Approval** to proceed with secret rotation, Commit A/B/C/D packaging (adding `scripts/deploy-netlify-prod.js` remediation to Commit C or removing it if retired), and any subsequent release steps.
