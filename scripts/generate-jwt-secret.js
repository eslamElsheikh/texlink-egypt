#!/usr/bin/env node
/**
 * Cysle Egypt — Production Cryptographic JWT Secret Generator
 *
 * Generates high-entropy (48 bytes / 384 bits) secrets formatted as base64url.
 * Usage:
 *   node scripts/generate-jwt-secret.js
 */

const crypto = require("crypto");

const secret = crypto.randomBytes(48).toString("base64url");

console.log("═════════════════════════════════════════════════════════════════");
console.log("🔐 CYSLE EGYPT — CRYPTOGRAPHIC JWT SECRET GENERATOR");
console.log("═════════════════════════════════════════════════════════════════");
console.log(`Generated Key (${secret.length} characters, 384 bits entropy):`);
console.log(`\n  ${secret}\n`);
console.log("Instructions for Altare App Hosting:");
console.log("1. Open Altare Console: https://console.altare.gg/");
console.log("2. Navigate to your Application -> Environment Variables.");
console.log("3. Add/Update JWT_SECRET with the value above.");
console.log("4. Redeploy the application. Next.js startup validation will verify the key.");
console.log("═════════════════════════════════════════════════════════════════");
