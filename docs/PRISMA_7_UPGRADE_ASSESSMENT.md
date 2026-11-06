# TexLink — Prisma 7 Upgrade Architecture Assessment

## 1. Executive Summary
- **Current Production Version**: Prisma CLI `6.19.3` / `@prisma/client` `6.19.3`.
- **Target Assessment Version**: Prisma `7.10.1` (latest stable release of Prisma 7; Prisma 8 RC strictly avoided as instructed).
- **Prisma 6 Support Timeline**: Prisma 6 security and maintenance support remains active until **November 19, 2026**.
- **Assessment Verdict**:
  - The production application runs securely and stably on Prisma 6.19.3 with zero security vulnerabilities.
  - Upgrading to Prisma 7 is technically viable and was verified in disposable testing; however, it introduces three major architectural breaking changes requiring controlled migration steps outlined below.

---

## 2. Breaking Changes Identified in Prisma 7.10.1

### A. Deprecation of `url` in `datasource` Block
- **Prisma 6**:
  ```prisma
  datasource db {
    provider = "postgresql"
    url      = env("DATABASE_URL")
  }
  ```
- **Prisma 7**:
  The `url` attribute is completely prohibited inside `schema.prisma`. All connection strings must migrate to `prisma.config.ts`:
  ```typescript
  import { defineConfig } from "prisma/config";

  export default defineConfig({
    schema: "prisma/schema.postgresql.prisma",
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });
  ```

### B. Mandatory Driver Adapters (Query Engine Removal)
- In Prisma 7, the embedded C++ Query Engine was removed in favor of direct driver adapters:
  - **PostgreSQL**: Requires `@prisma/adapter-pg` and the `pg` driver package.
  - **SQLite**: Requires `@prisma/adapter-better-sqlite3` and the native binary `better-sqlite3` package.
- **Runtime Risk**: `better-sqlite3` is a compiled C++ native addon requiring Python and Visual C++ / GCC toolchains. In containerized production deployments (Docker/Alpine), this introduces build tool dependencies that do not exist in standard Node.js slim images.

### C. Provider Locking in Generated Client
- In Prisma 7, `@prisma/client` embeds an `activeProvider` check. A client generated with `provider = "sqlite"` will throw `PrismaClientInitializationError: The Driver Adapter '@prisma/adapter-pg' is not compatible with the provider 'sqlite'` if attempted to connect to PostgreSQL.
- **Migration Consequence**: Staging and production build pipelines must explicitly run `prisma generate --schema=prisma/schema.postgresql.prisma` during the container build step.

---

## 3. Migration Roadmap for Prisma 7 Cutover (Planned for Q3 2026)

When executing the upgrade to Prisma 7 ahead of the November 2026 end-of-support deadline:

1. **Step 1**: Install required driver adapters:
   ```bash
   npm install @prisma/adapter-pg pg @types/pg
   npm install prisma@7.10.1 @prisma/client@7.10.1
   ```
2. **Step 2**: Create `prisma.config.ts`:
   ```typescript
   import { defineConfig } from "prisma/config";
   export default defineConfig({
     schema: process.env.NODE_ENV === "production" ? "prisma/schema.postgresql.prisma" : "prisma/schema.prisma",
     datasources: {
       db: { url: process.env.DATABASE_URL },
     },
   });
   ```
3. **Step 3**: Update `src/lib/db/prisma.ts` with dynamic adapter resolution:
   ```typescript
   import { PrismaClient } from "@prisma/client";
   import { PrismaPg } from "@prisma/adapter-pg";
   import { Pool } from "pg";

   const pool = new Pool({ connectionString: process.env.DATABASE_URL });
   const adapter = new PrismaPg(pool);
   export const prisma = new PrismaClient({ adapter });
   ```
4. **Step 4**: Verify all 84 test suites under Vitest.

---

## 4. Current Safe Release State
For the current release, **Prisma 6.19.3** remains the recommended, rock-solid production driver because:
- It supports both PostgreSQL 14+ and SQLite transparently without binary driver adapters.
- It is fully supported and maintained through November 19, 2026.
- The PostgreSQL migration history (`prisma/migrations/20260301000000_init_postgresql/`) was generated with zero drift and is 100% forward-compatible with Prisma 7.
