/**
 * api/admin-login.js — Admin login endpoint
 * POST /api/admin-login
 *
 * Reads admin credentials from ADMIN_USERS env var (JSON array).
 * Returns a time-limited signed HMAC token — no database needed.
 *
 * Vercel env vars required:
 *   ADMIN_USERS   → JSON array: [{"email":"...","password":"...","name":"...","role":"superadmin|editor"}]
 *   ADMIN_SECRET  → long random string for signing tokens (keep secret)
 */

const crypto = require('crypto');

// ADMIN_SECRET must be set in Vercel env vars — no hardcoded fallback.
// If missing, all token operations will throw and logins will fail safely.
if (!process.env.ADMIN_SECRET) {
  console.error('[admin-login] CRITICAL: ADMIN_SECRET env var not set. Login endpoint disabled.');
}
const ADMIN_SECRET = process.env.ADMIN_SECRET || (() => { throw new Error('ADMIN_SECRET not configured'); })();

// ── Rate limiter (in-memory, per IP) ──────────────────────────────────────────
// Allows 5 attempts per 15 minutes per IP. Resets after lockout period.
const _rateLimiter = new Map();
const RATE_LIMIT_MAX   = 5;
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes

function _checkRateLimit(ip) {
  const now = Date.now();
  const entry = _rateLimiter.get(ip) || { count: 0, firstAttempt: now };
  if (now - entry.firstAttempt > RATE_LIMIT_WINDOW) {
    // Window expired — reset
    _rateLimiter.set(ip, { count: 1, firstAttempt: now });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false; // locked out
  entry.count++;
  _rateLimiter.set(ip, entry);
  return true;
}

function _resetRateLimit(ip) {
  _rateLimiter.delete(ip);
}

// ── Load admin users from env var ─────────────────────────────────────────────
function getAdminUsers() {
  try {
    if (process.env.ADMIN_USERS) return JSON.parse(process.env.ADMIN_USERS);
  } catch (e) {
    console.error('[admin-login] ADMIN_USERS parse error:', e.message);
  }
  // Single-user fallback (legacy env vars)
  return [{
    email:    process.env.ADMIN_EMAIL    || 'tester@satlegal.in',
    password: process.env.ADMIN_PASSWORD || 'SL@QA#8847',
    name:     'SatLegal Admin',
    role:     'superadmin'
  }];
}

// ── Token: base64(email:role:timestamp).HMAC ──────────────────────────────────
function makeToken(email, role) {
  const ts      = Date.now();
  const payload = `${email.toLowerCase()}:${role}:${ts}`;
  const sig     = crypto.createHmac('sha256', ADMIN_SECRET).update(payload).digest('hex');
  return Buffer.from(payload).toString('base64url') + '.' + sig;
}

function verifyToken(token) {
  if (!token || typeof token !== 'string') return null;
  try {
    const dot = token.lastIndexOf('.');
    if (dot === -1) return null;
    const payloadB64 = token.slice(0, dot);
    const sig        = token.slice(dot + 1);
    // Reject tokens with wrong signature length (must be exactly 64 hex chars)
    if (sig.length !== 64) return null;
    const payload    = Buffer.from(payloadB64, 'base64url').toString();
    const parts      = payload.split(':');
    if (parts.length < 3) return null;
    const role  = parts[1];
    const ts    = parseInt(parts[parts.length - 1], 10);
    const email = parts.slice(0, parts.length - 2).join(':');
    if (isNaN(ts) || Date.now() - ts > 8 * 60 * 60 * 1000) return null; // expired
    const expected = crypto.createHmac('sha256', ADMIN_SECRET).update(payload).digest('hex');
    const valid = crypto.timingSafeEqual(
      Buffer.from(sig, 'hex'),
      Buffer.from(expected, 'hex')
    );
    return valid ? { email, role } : null;
  } catch { return null; }
}

// ── Handler ───────────────────────────────────────────────────────────────────
module.exports = async function handler(req, res) {
  // Restrict CORS to own domain for login endpoint
  const origin = req.headers.origin || '';
  const allowed = ['https://satlegal.in', 'https://www.satlegal.in', 'https://satlegal-40.vercel.app'];
  if (allowed.includes(origin)) res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Vary', 'Origin');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')   return res.status(405).json({ error: 'Method not allowed' });

  // Rate limiting — 5 attempts per IP per 15 minutes
  const ip = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim();
  if (!_checkRateLimit(ip)) {
    console.warn('[admin-login] rate limit hit for IP:', ip.slice(0, 8) + '***');
    return res.status(429).json({ success: false, message: 'Too many login attempts. Please wait 15 minutes.' });
  }

  // Guard against missing ADMIN_SECRET
  if (!process.env.ADMIN_SECRET) {
    return res.status(503).json({ success: false, message: 'Server configuration error. Contact administrator.' });
  }

  const { email = '', password = '' } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password required' });
  }

  const users = getAdminUsers();
  const user  = users.find(u =>
    u.email.toLowerCase() === email.toLowerCase().trim() && u.password === password
  );

  if (!user) {
    console.log('[admin-login] failed attempt for', email.slice(0, 3) + '***');
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  // Successful login — reset rate limit for this IP
  _resetRateLimit(ip);

  const token = makeToken(user.email, user.role);
  console.log('[admin-login] success:', user.email.slice(0, 3) + '*** role=' + user.role);

  return res.json({
    success: true,
    token,
    user: { email: user.email, name: user.name, role: user.role }
  });
};

// Exported for use by admin API endpoints
module.exports.verifyToken = verifyToken;
