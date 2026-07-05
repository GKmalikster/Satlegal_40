# SatLegal — VAPT Security Assessment Report

**Date:** July 2026  
**Scope:** satlegal-v40-DEPLOY codebase + satlegal-40.vercel.app live deployment  
**Conducted by:** Automated static analysis + manual code review + live endpoint tests  
**Standard:** OWASP Top 10 (2021)

---

## Executive Summary

| Severity  | Found | Fixed in this report |
|-----------|-------|----------------------|
| 🔴 Critical | 2 | 2 ✅ |
| 🟠 High    | 5 | 4 ✅ |
| 🟡 Medium  | 4 | 1 ✅ |
| 🟢 Low     | 3 | — (accepted risk) |
| ℹ️ Info    | 2 | — |

**Good news:** npm audit found **0 known CVEs** in all dependencies. The authentication architecture (server-side HMAC tokens) is sound. MongoDB injection vectors are limited.

---

## 🔴 CRITICAL

### C1 — Hardcoded Admin Credentials in Frontend JavaScript
**File:** `dashboard/admin-cms.html` (lines 229–231, pre-fix)  
**OWASP:** A02 Cryptographic Failures / A07 Identification & Authentication Failures  

**Issue:** Three admin user objects (email + plaintext password) were embedded directly in the browser-visible JavaScript:
```js
const ADMIN_USERS = [
  {email:'admin@satlegal.in', password:'Admin@2024', ...},
  {email:'cms@satlegal.in',   password:'CMS@2024',   ...},
  {email:'contactus@gkconsulting.in', password:'GKAdmin@2024', ...}
];
```
Anyone who opened browser DevTools → Sources could read all three passwords instantly.

**Impact:** Full admin console access for any visitor to the dashboard URL.

**Fix applied:** Removed `ADMIN_USERS` array entirely. `adminDoLogin()` now calls `POST /api/admin-login` (server-side credential check). Only the signed HMAC token is stored in localStorage — never a password.

---

### C2 — Hardcoded ADMIN_SECRET Fallback in Token Signing
**File:** `api/admin-login.js` (line 15, pre-fix)  
**OWASP:** A02 Cryptographic Failures  

**Issue:**
```js
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'sl-admin-secret-x7k9q2m4p1';
```
If the `ADMIN_SECRET` Vercel env var was missing or deleted, the HMAC signing key fell back to a known string visible in the public GitHub repository. Any attacker who knew this string could forge valid admin tokens for any email/role.

**Impact:** Full admin API access without knowing any credentials.

**Fix applied:** Removed the fallback. The module now throws at cold-start if `ADMIN_SECRET` is not set. The endpoint returns HTTP 503 with a generic message.

---

## 🟠 HIGH

### H1 — Forgeable Legacy Token (Timestamp-Only Auth)
**File:** `api/_db.js` (lines 26–30, pre-fix)  
**OWASP:** A07 Identification & Authentication Failures  

**Issue:** `isAdmin()` accepted tokens of the form `admin-session-<timestamp>` with no cryptographic signature — just a timestamp check. An attacker could construct `admin-session-1720000000000` and gain admin access.

**Fix applied:** Legacy token branch removed. Only HMAC-signed tokens (format: `base64url.hex`) are now accepted.

---

### H2 — No Rate Limiting on Login Endpoint
**File:** `api/admin-login.js`  
**OWASP:** A07 Identification & Authentication Failures  

**Issue:** `POST /api/admin-login` had no throttling. An attacker could attempt unlimited password guesses programmatically.

**Fix applied:** In-memory rate limiter added — 5 failed attempts per IP per 15 minutes. IP extracted from `x-forwarded-for` (Vercel proxy header). Successful login resets the counter.

---

### H3 — MongoDB ReDoS via Unescaped Regex Input
**File:** `api/admin/users.js` (line 24, pre-fix)  
**OWASP:** A03 Injection  

**Issue:** The `?search=` query parameter was passed directly to MongoDB `$regex` without escaping:
```js
{ name: { $regex: search, $options: 'i' } }
```
A crafted input like `(a+)+$` triggers catastrophic backtracking in the regex engine, potentially causing the function to time out (DoS).

**Fix applied:** Input is now escaped (`replace(/[.*+?^${}()|[\]\\]/g, '\\$&')`) and capped at 100 characters before regex use.

---

### H4 — No Security Headers on Any Page or API Response
**File:** `vercel.json`  
**OWASP:** A05 Security Misconfiguration  

**Issue:** All pages and API responses were served with zero security headers. This enables:
- **Clickjacking** (no `X-Frame-Options`)
- **MIME sniffing attacks** (no `X-Content-Type-Options`)
- **XSS escalation** (no `X-XSS-Protection`)
- **Downgrade attacks** (no `Strict-Transport-Security`)

**Fix applied:** Added to `vercel.json`:
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
Cache-Control: no-store (on all /api/* routes)
```

---

### H5 — Internal Error Messages Leaked to Clients
**File:** Multiple API files (`api/admin/users.js`, `api/admin/stats.js`, etc.)  
**OWASP:** A05 Security Misconfiguration  

**Issue:**
```js
return res.status(500).json({ success: false, message: err.message });
```
MongoDB error messages (`err.message`) can reveal database structure, schema names, collection paths, and internal state to any caller.

**Fix applied (users.js):** Changed to `message: 'Internal server error'`. **Action required:** Apply the same fix to `stats.js`, `lawyers.js`, `inquiries.js`, `content.js`, `config.js`, and `sales.js`.

---

## 🟡 MEDIUM

### M1 — CORS Wildcard on Admin Endpoints
**File:** All `api/admin/*.js` files  
**OWASP:** A05 Security Misconfiguration  

**Issue:** All endpoints (including admin ones) set `Access-Control-Allow-Origin: *`. While the auth token is still required, a wildcard allows any website to make cross-origin preflight requests to admin APIs and observe response timing/status.

**Fix applied (admin-login.js):** CORS now restricted to `satlegal.in`, `www.satlegal.in`, and `satlegal-40.vercel.app` for the login endpoint.  
**Action required:** Apply same restriction to `api/admin/*.js` files.

---

### M2 — Token Signature Padding/Truncation Bug
**File:** `api/admin-login.js` — `verifyToken()` (pre-fix)  
**OWASP:** A02 Cryptographic Failures  

**Issue:**
```js
Buffer.from(sig.padEnd(64, '0').slice(0, 64), 'hex')
```
A short/truncated signature would be zero-padded before comparison instead of rejected. This is a theoretical bypass vector if the HMAC output space is explored.

**Fix applied:** Added strict 64-character length check on signature before any comparison. Tokens with wrong-length signatures are rejected immediately.

---

### M3 — No Input Body Size Limit on Public Endpoints
**File:** `api/sales.js`, `api/track.js`, `api/feedback.js`  
**OWASP:** A05 Security Misconfiguration  

**Issue:** POST endpoints accept arbitrarily large JSON bodies. A 10MB payload could consume full Lambda memory and time limit.

**Action required (not yet fixed):** Add body size validation:
```js
if (JSON.stringify(req.body).length > 10000) return res.status(413).json({error:'Payload too large'});
```
Or configure Vercel's built-in body size limit in `vercel.json`.

---

### M4 — Plaintext Password Comparison (No Hashing)
**File:** `api/admin-login.js`  
**OWASP:** A02 Cryptographic Failures  

**Issue:** Admin passwords stored in `ADMIN_USERS` env var are compared as plaintext strings. If the env var is ever exposed (e.g., via a Vercel misconfiguration or breach), passwords are immediately readable.

**Assessment:** Accepted risk for now — env vars are the correct storage location, and Vercel encrypts them at rest. If the env var is leaked, the entire deployment is compromised anyway.  
**Recommendation:** Hash passwords with bcrypt before storing in `ADMIN_USERS`. Store as `{email, passwordHash, name, role}`.

---

## 🟢 LOW

### L1 — `api/admin-users.js` (Old File) Still in Repository
**File:** `api/admin-users.js`  
**Issue:** The old admin-users file is excluded from deployment via `.vercelignore` but remains in the git repo. While it can't be accessed at runtime, it may contain outdated logic and causes confusion.  
**Recommendation:** Delete the file from the repository in the next cleanup commit.

### L2 — Admin Token Not Revocable
**Issue:** HMAC tokens have an 8-hour window but cannot be revoked if stolen (no token blacklist). A compromised token remains valid until expiry.  
**Recommendation:** For higher security, maintain a server-side token revocation list in MongoDB. This adds a DB lookup on every admin request.

### L3 — `slTrack()` Analytics Calls Before Consent Finalised
**Issue:** On first page load, analytics events may be queued before the cookie banner resolves. The cookie consent manager queues and flushes appropriately, but timing edge cases exist on very fast interactions.  
**Assessment:** Low risk — no PII is in track events. Cookie consent script handles the queue correctly.

---

## ℹ️ INFO

### I1 — Dependency Audit: 0 Vulnerabilities
`npm audit` found **zero known CVEs** across all production dependencies. Packages are up to date.

### I2 — HTTPS Enforced by Vercel Automatically
Vercel enforces HTTPS and redirects HTTP to HTTPS at the CDN level. The `Strict-Transport-Security` header added in this report further locks this in for browsers that have visited once.

---

## Required Actions After This Report

The following fixes were **NOT** auto-applied and require manual changes:

| # | Action | Priority | File(s) |
|---|--------|----------|---------|
| 1 | Apply `message: 'Internal server error'` to all remaining 500 handlers | High | `stats.js`, `lawyers.js`, `inquiries.js`, `content.js`, `config.js`, `sales.js` |
| 2 | Restrict CORS to own domains on all admin endpoints | Medium | All `api/admin/*.js` |
| 3 | Add body size limit to public POST endpoints | Medium | `sales.js`, `track.js`, `feedback.js` |
| 4 | Delete `api/admin-users.js` from repository | Low | — |
| 5 | Set `ADMIN_SECRET` env var in Vercel if not already set | **Critical — do immediately** | Vercel Dashboard |

---

## Vercel Environment Variable Checklist

Verify these are set in Vercel → Settings → Environment Variables:

| Variable | Required | Notes |
|----------|----------|-------|
| `MONGODB_URI` | ✅ Yes | MongoDB Atlas connection string |
| `ANTHROPIC_API_KEY` | ✅ Yes | Claude API key |
| `ADMIN_SECRET` | ✅ **Critical** | Long random string (32+ chars). Generate: `openssl rand -hex 32` |
| `ADMIN_USERS` | ✅ Yes | JSON array of admin users |
| `RAZORPAY_KEY_ID` | ✅ Yes | Razorpay live key |
| `RAZORPAY_KEY_SECRET` | ✅ Yes | Razorpay secret |

---

*Report generated by SatLegal internal security review — July 2026*
