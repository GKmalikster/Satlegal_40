/**
 * GET /api/admin/stats           → dashboard overview counts
 * GET /api/admin/analytics/summary → search analytics (merged to avoid function limit)
 *
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

  // Route: ?action=analytics → analytics summary (was admin/analytics/summary.js)
  if (req.query.action === 'analytics') {
    try {
      await connectDB();
      const { SearchQuery, User } = getModels();

      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      const [totalSearches, topLawsAgg, dailyTrendAgg, totalUsers, recentSearches] = await Promise.all([
        SearchQuery.countDocuments(),
        SearchQuery.aggregate([
          { $unwind: '$detectedLaws' },
          { $group: { _id: '$detectedLaws', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 15 }
        ]),
        SearchQuery.aggregate([
          { $match: { ts: { $gte: thirtyDaysAgo } } },
          { $group: {
              _id: { year: { $year: '$ts' }, month: { $month: '$ts' }, day: { $dayOfMonth: '$ts' } },
              count: { $sum: 1 }
          }},
          { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
        ]),
        User.countDocuments({ role: { $in: ['user', 'end_user'] } }),
        SearchQuery.find().sort({ ts: -1 }).limit(10).select('query detectedLaws source ts')
      ]);

      const topLaws    = topLawsAgg.map(l => ({ name: l._id, count: l.count }));
      const dailyTrend = dailyTrendAgg.map(d => ({
        date: `${d._id.year}-${String(d._id.month).padStart(2,'0')}-${String(d._id.day).padStart(2,'0')}`,
        count: d.count
      }));

      return res.json({ success: true, totalSearches, totalUsers, topLaws, dailyTrend, recentSearches });
    } catch (err) {
      console.error('[admin/analytics/summary]', err.message);
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // Default: overview stats
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
