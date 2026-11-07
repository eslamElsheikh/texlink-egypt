const fs = require("fs");
const path = require("path");
const cp = require("child_process");

const home = process.env.USERPROFILE || process.env.HOME;
const netlifyCfgPath = path.join(home, "AppData", "Roaming", "netlify", "Config", "config.json");
const netlifyCfg = JSON.parse(fs.readFileSync(netlifyCfgPath, "utf8"));
const netlifyToken = netlifyCfg.users["69aadecba29525c0a3349b41"].auth.token;

const envLines = fs.readFileSync("D:/build to sell/frist_try/sharqyeg/.env.local", "utf8").split("\n");
const supaEnv = {};
for (const l of envLines) {
  const t = l.trim();
  if (!t || t.startsWith("#")) continue;
  const parts = t.split("=");
  supaEnv[parts[0].trim()] = parts.slice(1).join("=").trim().replace(/^[\"']|[\"']$/g, "");
}

const dbUrl = supaEnv.POSTGRES_PRISMA_URL.split("?")[0] + "?schema=texlink&sslmode=require&pgbouncer=true";
const directUrl = supaEnv.POSTGRES_URL_NON_POOLING.split("?")[0] + "?schema=texlink&sslmode=require";

const env = {
  ...process.env,
  NETLIFY_AUTH_TOKEN: netlifyToken,
  DATABASE_URL: dbUrl,
  DIRECT_URL: directUrl,
  NEXT_PUBLIC_APP_URL: "https://texlink-egypt.netlify.app",
  NEXT_PUBLIC_SUPABASE_URL: supaEnv.SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: supaEnv.SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: supaEnv.SUPABASE_SERVICE_ROLE_KEY,
  JWT_SECRET: "17139dc52874f849a85f5a6ae66b5062a7bc209177f20ab6885ef6c4717548f9",
  NODE_ENV: "production",
};

console.log("=== TexLink Production Deploy Pipeline ===");
console.log("1. Generating Prisma Client for PostgreSQL with Linux AWS Lambda binary targets...");
cp.execSync("npx prisma generate --schema=prisma/schema.postgresql.prisma", { stdio: "inherit", env });

console.log("2. Building Next.js production bundle with live Supabase database connectivity...");
cp.execSync("npx next build", { stdio: "inherit", env });

console.log("3. Deploying published bundle to Netlify Production (https://texlink-egypt.netlify.app)...");
cp.execSync("npx.cmd netlify deploy --prod --auth " + netlifyToken, { stdio: "inherit", env });

console.log("✓ Live production deploy completed successfully!");
