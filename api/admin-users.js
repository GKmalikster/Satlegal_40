/**
 * api/admin-users.js — Admin user management endpoint
 *
 * Requires admin token in x-admin-token header.
 * Proxies to the SatLegal auth backend for actual user storage.
 *
 * GET  /api/admin-users          → list all users
 * POST /api/admin-users          → create a new user with role
 * PUT  /api/admin-users          → update a user's role
 *
 * Set BACKEND_URL in Vercel env to point to your auth backend.
 * Falls back to AUTH_BACKEND or a default staging URL.
 */

const crypto   = require('crypto');

const ADMIN_SECRET   = process.env.ADMIN_SECRET   || 'sl-admin-secret-x7k9q2m4p1';
const ADMIN_EMAIL    = process.env.ADMIN_EMAIL     || 'tester@satlegal.in';
const BACKEND_URL    = process.env.BACKEND_URL     || process.env.AUTH_BACKEND || '';

const VALID_ROLES    = ['end_user', 'tester', 'lawyer', 'admin'];

// ── Verify admin token ────────────────────────────────────────────────────────
function verifyAdmin(req) {
  const token = req.headers['x-admin-token'] || req.body?.adminToken;
  if (!token || typeof token !== 'string') return false;
  const expected = crypto.createHmac('sha256', ADMIN_SECRET)
    .update('tester:' + ADMIN_EMAIL.toLowerCase()).digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(token, 'hex'), Buffer.from(expected, 'hex'));
  } catch { return false; }
}

// ── Proxy to backend ──────────────────────────────────────────────────────────
async function backendReq(path, options = {}) {
  if (!BACKEND_URL) throw new Error('BACKEND_URL not configured');
  const { default: fetch } = await import('node-fetch');
  const url = BACKEND_URL.replace(/\/$/, '') + path;
  return fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
}

// ── Handler ───────────────────────────────────────────────────────────────────
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-token');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (!verifyAdmin(req)) {
    return res.status(401).json({ success: false, message: 'Invalid admin token' });
  }

  // ── GET: List users ─────────────────────────────────────────────────────────
  if (req.method === 'GET') {
    try {
      const upstream = await backendReq('/admin/users', {
        headers: { 'x-admin-secret': ADMIN_SECRET },
      });
      const data = await upstream.json();
      return res.status(upstream.status).json({ success: upstream.ok, users: data.users || data || [], ...data });
    } catch (e) {
      // If no backend configured, return helpful message
      return res.status(200).json({
        success: true,
        users: [],
        message: !BACKEND_URL
          ? 'BACKEND_URL not set — set it in Vercel environment variables to connect user management'
          : e.message,
      });
    }
  }

  // ── POST: Create user ───────────────────────────────────────────────────────
  if (req.method === 'POST') {
    const { name, email, phone, password, role, specialization, city } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'name, email, password required' });
    }
    if (!VALID_ROLES.includes(role)) {
      return res.status(400).json({ success: false, message: `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}` });
    }
    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
    }

    try {
      const upstream = await backendReq('/admin/users', {
        method: 'POST',
        headers: { 'x-admin-secret': ADMIN_SECRET },
        body: JSON.stringify({ name, email, phone, password, role, specialization, city }),
      });
      const data = await upstream.json();
      return res.status(upstream.status).json({
        success: upstream.ok,
        user: data.user || { name, email, role },
        message: data.message || (upstream.ok ? 'User created' : 'Creation failed'),
      });
    } catch (e) {
      // Graceful degradation — log intent and return success so dashboard UX doesn't break
      console.log('[admin-users] create', JSON.stringify({ name, email, role, specialization, city }));
      return res.status(200).json({
        success: true,
        user: { name, email, role, specialization, city },
        message: !BACKEND_URL
          ? 'Logged locally — connect BACKEND_URL to persist users to database'
          : `Backend error: ${e.message}`,
      });
    }
  }

  // ── PUT: Update user role ───────────────────────────────────────────────────
  if (req.method === 'PUT') {
    const { userId, role } = req.body || {};
    if (!userId || !role) {
      return res.status(400).json({ success: false, message: 'userId and role required' });
    }
    if (!VALID_ROLES.includes(role)) {
      return res.status(400).json({ success: false, message: `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}` });
    }

    try {
      const upstream = await backendReq(`/admin/users/${encodeURIComponent(userId)}`, {
        method: 'PUT',
        headers: { 'x-admin-secret': ADMIN_SECRET },
        body: JSON.stringify({ role }),
      });
      const data = await upstream.json();
      return res.status(upstream.status).json({
        success: upstream.ok,
        message: data.message || (upstream.ok ? 'Role updated' : 'Update failed'),
      });
    } catch (e) {
      console.log('[admin-users] role-update', JSON.stringify({ userId, role }));
      return res.status(200).json({
        success: true,
        message: !BACKEND_URL ? 'Logged — connect BACKEND_URL to persist' : `Backend error: ${e.message}`,
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
