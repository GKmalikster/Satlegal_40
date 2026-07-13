/**
 * GET /api/admin/users   → list users (with filters)
 * POST /api/admin/users  → create user
 * PUT /api/admin/users   → update user role
 *
 * Also serves:
 *   POST /api/admin-login  → admin login (token issuance)
 *   legacy /api/admin-users route (admin/dashboard.html)
 *
 * Requires admin session token in Authorization header (except admin-login).
 */

const crypto = require('crypto');
const { connectDB, isAdmin, makeToken, getModels } = require('../_db');

const VALID_ROLES = ['end_user', 'tester', 'lawyer', 'admin'];

// ── In-memory rate limiter for /api/admin-login ───────────────────────────────
const _rl = new Map();
const RL_MAX = 5, RL_WIN = 15 * 60 * 1000;
function _rlCheck(ip) {
  const now = Date.now(), e = _rl.get(ip) || { n: 0, t: now };
  if (now - e.t > RL_WIN) { _rl.set(ip, { n: 1, t: now }); return true; }
  if (e.n >= RL_MAX) return false;
  e.n++; _rl.set(ip, e); return true;
}

// ── Load admin users from ADMIN_USERS env var ─────────────────────────────────
function _getAdmins() {
  try { if (process.env.ADMIN_USERS) return JSON.parse(process.env.ADMIN_USERS); } catch {}
  return [{
    email:    process.env.ADMIN_EMAIL    || 'tester@satlegal.in',
    password: process.env.ADMIN_PASSWORD || 'SL@QA#8847',
    name:     'SatLegal Admin',
    role:     'superadmin'
  }];
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

module.exports = async function handler(req, res) {
  const ALLOWED = ['https://satlegal.in','https://www.satlegal.in','https://satlegal-40.vercel.app'];
  const origin  = req.headers['origin'] || '';
  res.setHeader('Access-Control-Allow-Origin',  ALLOWED.includes(origin) ? origin : ALLOWED[0]);
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Vary', 'Origin');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // ── POST /api/admin-login — token issuance (no auth required) ──────────────
  const reqPath = (req.url || '').split('?')[0];
  if (reqPath === '/api/admin-login') {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    if (!process.env.ADMIN_SECRET) {
      return res.status(503).json({ success: false, message: 'Server configuration error.' });
    }
    const ip = ((req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0]).trim();
    if (!_rlCheck(ip)) {
      return res.status(429).json({ success: false, message: 'Too many login attempts. Wait 15 minutes.' });
    }
    const { email = '', password = '' } = req.body || {};
    if (!email || !password) return res.status(400).json({ success: false, message: 'email and password required' });
    const user = _getAdmins().find(u => u.email.toLowerCase() === email.toLowerCase().trim() && u.password === password);
    if (!user) return res.status(401).json({ success: false, message: 'Invalid email or password' });
    const token = makeToken(user.email, user.role);
    return res.json({ success: true, token, user: { email: user.email, name: user.name, role: user.role } });
  }

  if (!isAdmin(req)) return res.status(401).json({ success: false, message: 'Unauthorized' });

  await connectDB();
  const { User } = getModels();

  // ── GET: List users ─────────────────────────────────────────────────────────
  if (req.method === 'GET') {
    try {
      const { search = '', role = '', state = '', userType = '', limit = 200 } = req.query;
      const filter = {};
      if (search) {
        const safe = String(search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&').slice(0, 100);
        filter.$or = [
          { name:  { $regex: safe, $options: 'i' } },
          { email: { $regex: safe, $options: 'i' } },
          { phone: { $regex: safe, $options: 'i' } }
        ];
      }
      if (role)     filter.role     = String(role).slice(0, 30);
      if (state)    filter.state    = String(state).slice(0, 50);
      if (userType) filter.userType = String(userType).slice(0, 30);

      const users = await User.find(filter)
        .sort({ createdAt: -1 })
        .limit(Math.min(parseInt(limit) || 200, 500))
        .select('-password -resetPasswordToken -verificationToken');

      return res.json({ success: true, users, total: users.length });
    } catch (err) {
      console.error('[admin/users GET]', err.message);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  // ── POST: Create user ───────────────────────────────────────────────────────
  if (req.method === 'POST') {
    try {
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

      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) {
        return res.status(409).json({ success: false, message: 'Email already registered' });
      }

      const user = await User.create({
        name: String(name).slice(0, 100),
        email: String(email).toLowerCase().slice(0, 200),
        phone: String(phone || '').slice(0, 20),
        password: hashPassword(password),
        role,
        city: String(city || '').slice(0, 100),
        specialization: String(specialization || '').slice(0, 100),
        status: 'active'
      });

      return res.status(201).json({
        success: true,
        message: 'User created',
        user: { id: user._id, name: user.name, email: user.email, role: user.role }
      });
    } catch (err) {
      console.error('[admin/users POST]', err.message);
      if (err.code === 11000) {
        return res.status(409).json({ success: false, message: 'Duplicate email or field' });
      }
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  // ── PUT: Update user role ───────────────────────────────────────────────────
  if (req.method === 'PUT') {
    try {
      const { userId, role } = req.body || {};
      if (!userId || !role) {
        return res.status(400).json({ success: false, message: 'userId and role required' });
      }
      if (!VALID_ROLES.includes(role)) {
        return res.status(400).json({ success: false, message: `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}` });
      }

      const user = await User.findByIdAndUpdate(
        userId,
        { role },
        { new: true, select: '_id name email role' }
      );
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });

      return res.json({ success: true, message: 'Role updated', user });
    } catch (err) {
      console.error('[admin/users PUT]', err.message);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
