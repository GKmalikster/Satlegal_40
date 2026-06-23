/**
 * api/admin-login.js — Admin / Tester login endpoint
 * POST /api/admin-login
 *
 * Validates admin credentials and returns a signed token.
 * Token is an HMAC-SHA256 signature — no database or JWT library needed.
 *
 * Set these in Vercel environment variables for production:
 *   ADMIN_EMAIL     → the admin email address
 *   ADMIN_PASSWORD  → the admin password
 *   ADMIN_SECRET    → a long random string used to sign tokens (keep secret)
 *
 * If env vars are not set, falls back to hardcoded defaults below.
 * CHANGE THE DEFAULTS before going to production.
 */

const crypto = require('crypto');

// ── Credentials (override via Vercel env vars) ────────────────────────────────
const ADMIN_EMAIL    = process.env.ADMIN_EMAIL    || 'tester@satlegal.in';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'SL@QA#8847';
const ADMIN_SECRET   = process.env.ADMIN_SECRET   || 'sl-admin-secret-x7k9q2m4p1';

/**
 * Generate a deterministic signed token for a given email.
 * Token = HMAC-SHA256("tester:" + email, ADMIN_SECRET)
 * Deterministic so Vercel cold starts don't invalidate tokens.
 */
function makeToken(email) {
  return crypto
    .createHmac('sha256', ADMIN_SECRET)
    .update('tester:' + email.toLowerCase())
    .digest('hex');
}

/**
 * Verify a token presented in a request.
 * Exported so api/analyse.js can import and use it.
 */
function verifyToken(token) {
  if (!token || typeof token !== 'string') return false;
  const expected = makeToken(ADMIN_EMAIL);
  // Constant-time comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(token, 'hex'),
      Buffer.from(expected, 'hex')
    );
  } catch { return false; }
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')   return res.status(405).json({ error: 'Method not allowed' });

  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password required' });
  }

  // Case-insensitive email comparison
  const emailMatch    = email.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase();
  const passwordMatch = password === ADMIN_PASSWORD;

  if (!emailMatch || !passwordMatch) {
    // Deliberate vague error — don't reveal which field was wrong
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  const token = makeToken(email);

  console.log('[admin-login] successful login for', email.slice(0, 3) + '***');

  return res.json({
    success: true,
    token,
    user: {
      name:  'SatLegal Admin',
      email: ADMIN_EMAIL,
      role:  'tester',
    },
  });
};

// Export verifyToken so other API functions can use it
module.exports.verifyToken = verifyToken;
