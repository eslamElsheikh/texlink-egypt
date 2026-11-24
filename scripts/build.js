const cp = require("child_process");

const dbUrl = process.env.DATABASE_URL || "";
const isPostgres = dbUrl.startsWith("postgres") || dbUrl.startsWith("postgresql") || process.env.USE_POSTGRES_SCHEMA === "true";
const schema = process.env.PRISMA_SCHEMA || (isPostgres ? "prisma/schema.postgresql.prisma" : "prisma/schema.prisma");

console.log(`[Altare Build] Generating Prisma Client using schema: ${schema}`);
cp.execSync(`npx prisma generate --schema=${schema}`, { stdio: "inherit" });

console.log("[Altare Build] Executing Next.js production build...");
cp.execSync("npx next build", { stdio: "inherit" });
