/**
 * GET  /api/admin/lawyers          — list all lawyers (with user info)
 * PUT  /api/admin/lawyers          — verify/update lawyer status
 *      body: { lawyerId, status: 'approved'|'rejected'|'suspended' }
 * Requires admin session token.
 */

const { connectDB, isAdmin, getModels } = require('../_db');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!isAdmin(req)) return res.status(401).json({ success: false, message: 'Unauthorized' });

  try {
    await connectDB();
    const { LawyerProfile } = getModels();

    // ── GET: list lawyers ──────────────────────────────────────────────────
    if (req.method === 'GET') {
      const { status = '', search = '', limit = 100 } = req.query;
      const filter = {};
      if (status) filter.status = status;

      let query = LawyerProfile.find(filter)
        .populate('userId', 'name email phone createdAt')
        .sort({ createdAt: -1 })
        .limit(Math.min(parseInt(limit) || 100, 500));

      let lawyers = await query;

      // Apply search filter after populate
      if (search) {
        const s = search.toLowerCase();
        lawyers = lawyers.filter(l =>
          (l.userId?.name || '').toLowerCase().includes(s) ||
          (l.userId?.email || '').toLowerCase().includes(s) ||
          (l.barCouncilNumber || '').toLowerCase().includes(s)
        );
      }

      // Flatten for admin-cms compatibility
      const result = lawyers.map(l => ({
        _id:            l._id,
        name:           l.userId?.name || '—',
        email:          l.userId?.email || '—',
        phone:          l.userId?.phone || '—',
        barNumber:      l.barCouncilNumber,
        barCouncilNumber: l.barCouncilNumber,
        barCouncilState:  l.barCouncilState,
        specialisation: (l.specializations || []).slice(0, 2).join(', '),
        specializations: l.specializations,
        yearsOfExperience: l.yearsOfExperience,
        city:           l.city,
        state:          l.state,
        status:         l.status,
        feeStructure:   l.feeStructure,
        createdAt:      l.createdAt,
        userId:         l.userId
      }));

      return res.json({ success: true, lawyers: result, total: result.length });
    }

    // ── PUT: update status ─────────────────────────────────────────────────
    if (req.method === 'PUT') {
      const { lawyerId, status } = req.body || {};
      const allowed = ['approved', 'rejected', 'suspended', 'pending'];
      if (!lawyerId || !allowed.includes(status)) {
        return res.status(400).json({ success: false, message: 'lawyerId and valid status required' });
      }
      await LawyerProfile.findByIdAndUpdate(lawyerId, { status, updatedAt: new Date() });
      return res.json({ success: true, message: `Lawyer ${status}` });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('[admin/lawyers]', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};
