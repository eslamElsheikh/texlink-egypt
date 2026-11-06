const cp = require("child_process");

const dbUrl = process.env.DATABASE_URL || "";
const isPostgres = dbUrl.startsWith("postgres") || process.env.NODE_ENV === "production";
const schema = isPostgres ? "prisma/schema.postgresql.prisma" : "prisma/schema.prisma";

console.log(`[Netlify Build] Generating Prisma Client using schema: ${schema}`);
cp.execSync(`npx prisma generate --schema=${schema}`, { stdio: "inherit" });

console.log("[Netlify Build] Executing Next.js production build...");
cp.execSync("npx next build", { stdio: "inherit" });
