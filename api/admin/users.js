/**
 * GET /api/admin/users   → list users (with filters)
 * POST /api/admin/users  → create user
 * PUT /api/admin/users   → update user role
 *
 * Also serves legacy /api/admin-users route (admin/dashboard.html).
 * Requires admin session token in Authorization header.
 */

const crypto = require('crypto');
const { connectDB, isAdmin, getModels } = require('../_db');

const VALID_ROLES = ['end_user', 'tester', 'lawyer', 'admin'];

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

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
