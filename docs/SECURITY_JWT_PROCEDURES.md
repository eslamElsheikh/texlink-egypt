# Cysle Egypt — Production Cryptographic JWT Secret Procedures

## 1. Overview & Security Requirements
Cysle Egypt authenticates users through encrypted HTTP-only session cookies signed with HMAC-SHA256 (`HS256`).

In accordance with DevSecOps standards:
- **Minimum Entropy**: Minimum 256 bits (32 bytes), recommended **384 bits (48 bytes)**.
- **Algorithm Enforcement**: Strictly locked to `HS256` (`jose`). Any incoming token with `alg: none` or mismatched algorithms is rejected immediately.
- **Fail-Closed Startup Enforcement**: Next.js 15 `instrumentation.ts` invokes `assertProductionStartupJwtSecret()` on server boot in the standalone runtime (`node server.js`). If `JWT_SECRET` is unset, shorter than 32 characters, or matches blacklisted placeholder keys (`123456`, `changeme`, etc.), application startup is aborted immediately.

---

## 2. Generating Production Secrets

### Method A: Project CLI (Recommended)
Run the built-in cryptographically secure secret generator:
```bash
npm run jwt:generate
```
This generates a 48-byte (384 bits) URL-safe base64 string using Node.js `crypto.randomBytes()`.

### Method B: OpenSSL CLI
```bash
openssl rand -base64 48
```

### Method C: One-Liner Node.js
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

---

## 3. Injecting Secret into Altare App Hosting

1. Log in to the Altare Console: [https://console.altare.gg/](https://console.altare.gg/).
2. Select the **TexLink / Cysle Egypt** application.
3. Open **Settings -> Environment Variables**.
4. Set the variable:
   * **Key**: `JWT_SECRET`
   * **Value**: `<generated-48-character-secret>`
   * **Scope**: Production
5. Trigger redeployment. The Next.js standalone container will validate the key on startup.

---

## 4. Zero-Downtime Secret Rotation Procedure

When rotating the `JWT_SECRET`:
1. Generate the new production secret key.
2. In multi-instance rolling deployments, update the environment variable in the Altare Console.
3. As container instances restart, existing sessions signed by the previous key will expire gracefully upon their standard TTL or prompt users to log in again.
4. If strict dual-key grace periods are desired, secondary verification keys can be supplied via `JWT_SECRET_PREVIOUS` during transition windows.
