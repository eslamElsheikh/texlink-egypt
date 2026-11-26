# CYSLE Egypt — Phase 18 Rotation & Git-History Rewrite Execution Checklist

*Prepared: `2026-11-26` | Branch: `deploy/altare-production-prep` | HEAD SHA: `67400bba16020a367cb3b65132cc0cde15c0a966`*

> **Strict Restrictions Attestation:** Zero credentials were generated, displayed, transmitted, or rotated. Zero staging, commits, pushes, merges, history rewrites, force-pushes, or deployments were executed.

---

## Part 1: Live `JWT_SECRET` Rotation Execution Checklist

Complete **Part 1** across every applicable environment **before** executing Part 2 (Git history rewrite). Do **not** share the same `JWT_SECRET` between Local Development, Altare Staging, and Production.

### Step 0 — Pre-Rotation Readiness & Key Generation (Offline)
- [ ] Confirm you hold direct administrative console access for all active platforms:
  - GitHub Repository Settings (`eslamElsheikh/texlink-egypt` -> Secrets & variables -> Actions)
  - Netlify Dashboard (Site linked to `.netlify/state.json` / `texlink-egypt`)
  - Altare Cloud Console (`https://console.altare.gg/`, if Staging or Production apps exist)
  - Local developer machine `.env` / `.env.local`
- [ ] Generate **separate** 384-bit (`48`-byte) `base64url` keys offline in your local terminal (one unique key per active environment; **never** paste keys into Git, tickets, or CI logs):
  ```bash
  npm run jwt:generate
  # Alternative:
  openssl rand -base64 48
  ```
- [ ] Verify each generated string is `>= 32` characters, contains no whitespace/quotes, and is not in `KNOWN_INSECURE_SECRETS` (`src/lib/auth/jwt-config.ts`).

---

### Step 1 — Local Development Rotation
- [ ] Open local `.env` (and any external project `.env.local` if still used).
- [ ] Replace `JWT_SECRET` with a dedicated **local-only** `>=32` character random key (never the `6df8970` key and never a production key).
- [ ] Restart any running `next dev` / `next start` server processes so Node reloads `process.env.JWT_SECRET`.
- [ ] Verify locally:
  1. Keep an older `texlink_session` cookie (or inspect pre-restart session): `GET http://localhost:3000/api/auth/me` returns `{"user":null}`.
  2. Sign in via `POST http://localhost:3000/api/auth/login` -> verify `Set-Cookie: texlink_session=...` is issued and subsequent `GET /api/auth/me` returns your authenticated user JSON.

---

### Step 2 — Netlify Production & GitHub Actions (`deploy.yml`) Rotation (If Site Active)
> Because `master` (`34a4de0`) triggers `.github/workflows/deploy.yml` -> Netlify Production and `.netlify/state.json` links a Netlify site, inspect Netlify Dashboard first. If the Netlify site has been decommissioned, verify it is disabled/deleted and document closure; otherwise execute every sub-step below:

- [ ] **2A. Update Netlify Runtime Variables (Primary Runtime Store):**
  1. Netlify Dashboard -> Site **Site configuration -> Environment variables**.
  2. Set `JWT_SECRET` for **Production** scope to the newly generated Production key.
  3. Set a **different** random `JWT_SECRET` for **Deploy Previews / Branch deploys** (if enabled).
  4. *(Defense-in-depth because a personal Netlify user ID was exposed in `6df8970`):* Revoke/regenerate your Netlify Personal Access Token in Netlify User Settings -> Applications.
- [ ] **2B. Align GitHub Actions Secrets (`.github/workflows/deploy.yml`):**
  1. GitHub Repo -> **Settings -> Secrets and variables -> Actions -> Repository secrets**.
  2. Update `JWT_SECRET` to the **exact same Production key** entered into Netlify Production (so build-time and runtime match if `deploy.yml` builds `master`).
  3. If `NETLIFY_AUTH_TOKEN` was regenerated in Step 2A, update repository secret `NETLIFY_AUTH_TOKEN` as well.
  4. Confirm `altare-ci.yml` does **not** use repository `secrets.JWT_SECRET` (it uses an ephemeral `"ci-testing-..."` test string inside disposable CI containers only).
- [ ] **2C. Redeploy Netlify Production & Verify Cloudflare Bridge:**
  1. Trigger a clean production build & deploy in Netlify (**Clear cache and deploy site**, or after approved release commit/merge to `master`).
  2. Verify `GET https://texlink-egypt.netlify.app/api/health` (and the Cloudflare Worker URL `texlink-egypt-bridge.*.workers.dev/api/health`, if active) returns HTTP `200` (`"status":"ok"`).
  3. Confirm pre-rotation `texlink_session` cookies return `{"user":null}` on `GET /api/auth/me` (and `401` on protected endpoints).
  4. Confirm fresh `POST /api/auth/login` sets a new `texlink_session` cookie and `GET /api/auth/me` succeeds consistently across `5` consecutive requests (both directly and through the Cloudflare Worker cookie rewriter).
- [ ] **2D. Safe Rollback / Recovery (If Netlify Auth Fails):**
  - If functions return `500` or fail boot (`FATAL_SECURITY_ERROR`), check Netlify Env Vars for accidental quotes/whitespace/newlines or `<32` char length and re-save + **Clear cache and deploy site**.
  - **NEVER** revert `JWT_SECRET` to the exposed `6df8970` credential; generate a brand-new key if uncertain.

---

### Step 3 — Altare Staging Rotation (`texlink-factory-staging`)
> Evidence in `docs/STAGING_DEPLOYMENT_CHECKLIST.md` (`[ ]` boxes) indicates Altare Staging may not yet be provisioned. Check `https://console.altare.gg/` first:

- [ ] **If Staging project already exists on Altare:**
  1. Altare Console -> Staging service -> **Settings -> Environment Variables**.
  2. Replace `JWT_SECRET` with a **Staging-unique** 384-bit secret (generated via `npm run jwt:generate`).
  3. Trigger a full container redeploy / rolling restart so 100% of replicas run the new revision (`runner` stage does not bake `JWT_SECRET`).
  4. Verify container health & replica uniformity:
     - Altare startup logs show zero `FATAL_SECURITY_ERROR` exits.
     - `GET https://<staging-host>/api/health` returns `200` (`"status":"ok"`).
     - Old `texlink_session` -> `GET /api/auth/me` returns `{"user":null}`.
     - Fresh login -> issue `5`+ sequential `GET /api/auth/me` requests; confirm **every** response returns the user object (intermittent `{"user":null}` means an old container instance is still attached to the load balancer and must be terminated).
- [ ] **If Staging project has NOT been provisioned yet:**
  1. Before first deploy, configure a fresh Staging-unique 384-bit `JWT_SECRET` in Altare Console (`Settings -> Environment Variables`) alongside `NODE_ENV=production`, `DATABASE_URL`, `DIRECT_URL`, `REDIS_URL`, `SUPABASE_SERVICE_ROLE_KEY`, etc.

---

### Step 4 — Altare Production Rotation (`texlink-factory-production`)
> Evidence indicates Altare Production is currently pre-deployment (`CONDITIONAL GO`, gated on Staging ingress verification).

- [ ] **If Production project already exists on Altare:**
  1. Schedule/announce a brief authentication cutover notice (all logged-in users will be logged out once because `src/lib/auth/jwt-config.ts` validates a single `JWT_SECRET` without `JWT_SECRET_PREVIOUS` — required for compromised-key containment).
  2. Altare Console -> Production service -> **Settings -> Environment Variables** -> set Production-unique 384-bit `JWT_SECRET`.
  3. Trigger full container rollout; confirm zero previous-revision pods/containers remain running.
  4. Verify `GET https://<prod-host>/api/health` (`200`), pre-rotation cookie rejection (`GET /api/auth/me` -> `{"user":null}`), and `5`+ consecutive `GET /api/auth/me` probes after fresh `POST /api/auth/login`.
- [ ] **If Production project has NOT been provisioned yet:**
  1. Complete Staging verification first (`docs/STAGING_DEPLOYMENT_CHECKLIST.md`), then provision Production with its own dedicated 384-bit `JWT_SECRET` (never reused from Staging, Netlify, or Local).
- [ ] **Safe Recovery (If Production Auth Fails):**
  1. Inspect Altare container logs for `FATAL_SECURITY_ERROR` (bad `JWT_SECRET`) vs `RATE_LIMITER_UNAVAILABLE` (`503` Redis outage).
  2. If multi-replica intermittent `user: null` occurs, verify identical `JWT_SECRET` value across all service instances and restart/terminate stale containers.
  3. If secret corruption is suspected, generate another fresh 384-bit secret and redeploy — **never fall back to the compromised `6df8970` key**.

---

## Part 2: Git-History Rewrite Execution Checklist (Separate Operation)

> **CRITICAL ORDERING RULE:** Execute Part 2 **ONLY AFTER** Part 1 live credential rotation is 100% verified, and **only with explicit founder authorization**. Rewriting history does not revoke secrets already copied from `origin`; Part 1 neutralizes the secret, while Part 2 removes the object from reachable repository history.

### 1. Pre-Rewrite Working State & Backup
- [ ] Confirm all approved local release commits (`Commits 1–5`) are cleanly committed (or stashed/exported) so zero uncommitted working-tree changes exist during rewrite.
- [ ] Create an isolated **offline backup outside the repository** before modifying any history:
  ```bash
  git clone --mirror https://github.com/eslamElsheikh/texlink-egypt.git cysle-mirror-pre-rewrite.git
  git -C cysle-mirror-pre-rewrite.git bundle create ../cysle-pre-rewrite.bundle --all
  git bundle verify ../cysle-pre-rewrite.bundle
  ```
- [ ] Verify `git bundle verify` outputs `... is okay` and lists all branches and tags before proceeding.

### 2. Affected References Inventory (100% Contain Commit `6df8970`)
All `23` branch refs and both tags currently inherit commit `6df8970ef95c918052e8c3e9553bfc3cd31727b9`:
- **Local branches (`20`):** `deploy/altare-production-prep`, `master`, `release/candidate-v1.0`, `feat/concierge-dispatch`, `feat/concierge-only-ui`, `feat/flexible-payments`, `feat/homepage-order`, `feat/homepage-sections`, `feat/roadmap-remaining`, `feat/ui-ux-polish`, `fix/audit-remediation`, `fix/clear-errors`, `fix/delivery-phone-privacy`, `fix/delivery-privacy-sweep`, `fix/flexible-payments-hardening`, `fix/pre-migration-closeout`, `fix/qa-validation-sweep`, `fix/security-audit`, `fix/security-audit-2`, `fix/security-audit-3`.
- **Remote refs (`3`):** `origin/HEAD`, `origin/master`, `origin/deploy/altare-production-prep`.
- **Tags (`2`):** `pre-audit-merge-20261114`, `pre-phase4-2026-11-14`.

### 3. History Rewrite Commands (On Fresh Working Clone / Mirror)
- [ ] Install `git-filter-repo` (preferred over deprecated `git filter-branch`).
- [ ] Remove `scripts/deploy-netlify-prod.js` across all commits and refs:
  ```bash
  git clone --no-local cysle-mirror-pre-rewrite.git cysle-rewrite-work
  cd cysle-rewrite-work
  git filter-repo --path scripts/deploy-netlify-prod.js --invert-paths --force
  ```
- [ ] Re-attach `origin` remote (removed by `filter-repo` safety check) and verify the retired file and credential no longer exist anywhere in history:
  ```bash
  git remote add origin https://github.com/eslamElsheikh/texlink-egypt.git
  git log --all --oneline -- scripts/deploy-netlify-prod.js   # must return empty
  ```
- [ ] Temporarily allow force-pushes on any GitHub branch protection rules covering `master` / `deploy/altare-production-prep`, then force-push all refs and tags:
  ```bash
  git push --force --all origin
  git push --force --tags origin
  ```
- [ ] Re-enable GitHub branch protection rules immediately after force-push (`Block force pushes = ON`).

### 4. Force-Push Implications & Required Collaborator Actions
- **Implications:** Every commit SHA from `6df8970` onward changes across all `23` branches and both tags; CI status links, GitHub Actions run links referencing old SHAs, and open PR commit pointers will break or require re-basing.
- **Collaborators & CI Runners (Mandatory):** No collaborator may `git pull` / `git merge` old local branches back into `origin` (which would re-introduce `6df8970`!). Every team member must either re-clone fresh or hard-reset local refs:
  ```bash
  git fetch origin --prune --tags --force
  git checkout -B deploy/altare-production-prep origin/deploy/altare-production-prep
  git checkout -B master origin/master
  git reflog expire --expire=now --all
  git gc --prune=now --aggressive
  ```

### 5. GitHub Cache, PR Refs, & Fork Limitations
- **Unreachable Object Cache & PR Refs:** Force-pushing does **not** immediately purge unreachable Git objects in GitHub's backend, GitHub pull-request virtual refs (`refs/pull/<id>/head` and `refs/pull/<id>/merge`), Web commit URLs cached by direct SHA lookup, or third-party forks/local clones.
- **Required Follow-Up:** After force-pushing, open a **GitHub Support** request asking for repository cache / unreachable object garbage collection & PR ref cleanup on `eslamElsheikh/texlink-egypt`, and never assume history rewrite alone revokes an already-pushed secret (hence **Part 1 rotation is mandatory**).
