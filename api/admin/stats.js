/**
 * GET /api/admin/stats
 * Returns dashboard overview stats: user counts, lawyer counts, inquiry counts.
 * Requires admin session token in Authorization header.
 */

const { connectDB, isAdmin, getModels } = require('../_db');

module.exports = async function handler(req, res) {
  const ALLOWED_ORIGINS = ['https://satlegal.in','https://www.satlegal.in','https://satlegal-40.vercel.app'];
  const origin = req.headers['origin'] || '';
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]);
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  if (!isAdmin(req)) return res.status(401).json({ success: false, message: 'Unauthorized' });

  try {
    await connectDB();
    const { User, LawyerProfile, CaseInquiry, LawyerLead, SearchQuery } = getModels();

    const [totalUsers, totalLawyers, pendingLawyers, approvedLawyers,
           totalInquiries, totalLeads, totalSearches, recentUsers] = await Promise.all([
      User.countDocuments({ role: { $in: ['user', 'end_user'] } }),
      User.countDocuments({ role: 'lawyer' }),
      LawyerProfile.countDocuments({ status: 'pending' }),
      LawyerProfile.countDocuments({ status: 'approved' }),
      CaseInquiry.countDocuments(),
      LawyerLead.countDocuments(),
      SearchQuery.countDocuments(),
      User.find({ role: { $in: ['user', 'end_user'] } })
        .sort({ createdAt: -1 }).limit(5)
        .select('name email createdAt state gender userType')
    ]);

    return res.json({
      success: true,
      stats: { totalUsers, totalLawyers, pendingLawyers, approvedLawyers,
               totalInquiries, totalLeads, totalSearches },
      recentUsers
    });
  } catch (err) {
    console.error('[admin/stats]', err.message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
