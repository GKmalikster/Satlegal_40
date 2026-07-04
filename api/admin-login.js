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

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'sl-admin-secret-x7k9q2m4p1';

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
    const payload    = Buffer.from(payloadB64, 'base64url').toString();
    const parts      = payload.split(':');
    if (parts.length < 3) return null;
    const role  = parts[1];
    const ts    = parseInt(parts[parts.length - 1], 10);
    const email = parts.slice(0, parts.length - 2).join(':'); // handle emails with colons
    if (Date.now() - ts > 8 * 60 * 60 * 1000) return null; // expired
    const expected = crypto.createHmac('sha256', ADMIN_SECRET).update(payload).digest('hex');
    const valid = crypto.timingSafeEqual(
      Buffer.from(sig.padEnd(64, '0').slice(0, 64), 'hex'),
      Buffer.from(expected, 'hex')
    );
    return valid ? { email, role } : null;
  } catch { return null; }
}

// ── Handler ───────────────────────────────────────────────────────────────────
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')   return res.status(405).json({ error: 'Method not allowed' });

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
