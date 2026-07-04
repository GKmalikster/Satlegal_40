/**
 * GET /api/admin/users
 * Returns list of all users. Supports ?search=&role=&state= filters.
 * Requires admin session token.
 */

const { connectDB, isAdmin, getModels } = require('../_db');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  if (!isAdmin(req)) return res.status(401).json({ success: false, message: 'Unauthorized' });

  try {
    await connectDB();
    const { User } = getModels();

    const { search = '', role = '', state = '', userType = '', limit = 200 } = req.query;
    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    if (role)     filter.role     = role;
    if (state)    filter.state    = state;
    if (userType) filter.userType = userType;

    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .limit(Math.min(parseInt(limit) || 200, 500))
      .select('-password -resetPasswordToken -verificationToken');

    return res.json({ success: true, users, total: users.length });
  } catch (err) {
    console.error('[admin/users]', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};
