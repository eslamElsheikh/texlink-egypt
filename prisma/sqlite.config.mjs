import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "prisma/config";

// Ensure .env is loaded when --config bypasses Prisma's implicit .env loader, without overriding explicit env vars
if (!process.env.DATABASE_URL) {
  const envPath = path.resolve(import.meta.dirname, "..", ".env");
  if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
      if (match && !process.env[match[1]]) {
        process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, "");
      }
    }
  }
}

// Paths are resolved relative to the directory containing sqlite.config.mjs (prisma/)
export default defineConfig({
  schema: "schema.prisma",
  migrations: {
    path: "migrations_sqlite",
  },
});
