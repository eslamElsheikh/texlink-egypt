# TexLink — Netlify & Supabase Environment Variable Matrix

This matrix documents required configuration parameters across deployment tiers. **Never commit actual secret values into version control.**

| Variable | Local Development | Netlify Preview / Staging | Netlify Production | Client Exposed? |
| :--- | :--- | :--- | :--- | :--- |
| `DATABASE_URL` | `file:./dev.db` | `postgresql://...:6543/postgres?pgbouncer=true` | `postgresql://...:6543/postgres?pgbouncer=true` | **No** (Server only) |
| `DIRECT_URL` | *Optional* | `postgresql://...:5432/postgres?sslmode=require` | `postgresql://...:5432/postgres?sslmode=require` | **No** (Server only) |
| `JWT_SECRET` | `local-dev-secret-key-32chars...` | Staging random hex secret | Strong production random hex secret | **No** (Server only) |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | `https://preview--texlink.netlify.app` | `https://texlink-egypt.com` | **Yes** (Client & Server) |
| `NEXT_PUBLIC_SUPABASE_URL` | *Optional local fallback* | `https://[STAGING_REF].supabase.co` | `https://[PROD_REF].supabase.co` | **Yes** (Public API URL) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | *Optional local fallback* | Staging Anon Public Key | Production Anon Public Key | **Yes** (Safe Public Key) |
| `SUPABASE_SERVICE_ROLE_KEY` | *Optional* | Staging Service Role Secret | Production Service Role Secret | **No (CRITICAL SERVER SECRET)** |
| `NODE_ENV` | `development` | `production` | `production` | **No** (Runtime mode) |
| `PORT` | `3000` | Netlify Serverless assigned | Netlify Serverless assigned | **No** |

---

## Secret Generation Guidelines

- **JWT Secret**: Generate via terminal:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- **Supabase Keys**:
  - Found under: **Project Settings $\rightarrow$ API** in the Supabase Dashboard.
  - The `anon` `public` key is safe for client bundling (`NEXT_PUBLIC_`).
  - The `service_role` `secret` key **must never** be prefixed with `NEXT_PUBLIC_` and must only be stored in Netlify server environment variables.
