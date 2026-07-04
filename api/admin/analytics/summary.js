/**
 * GET /api/admin/analytics/summary
 * Returns: totalSearches, topLaws, daily trend (last 30 days)
 * Used by admin-cms.html Analytics panel.
 * Requires admin session token.
 */

const { connectDB, isAdmin, getModels } = require('../../_db');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  if (!isAdmin(req)) return res.status(401).json({ success: false, message: 'Unauthorized' });

  try {
    await connectDB();
    const { SearchQuery, User, CaseInquiry } = getModels();

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [totalSearches, topLawsAgg, dailyTrendAgg, totalUsers, recentSearches] = await Promise.all([
      SearchQuery.countDocuments(),

      // Top laws by frequency
      SearchQuery.aggregate([
        { $unwind: '$detectedLaws' },
        { $group: { _id: '$detectedLaws', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 15 }
      ]),

      // Daily search trend (last 30 days)
      SearchQuery.aggregate([
        { $match: { ts: { $gte: thirtyDaysAgo } } },
        { $group: {
            _id: {
              year:  { $year: '$ts' },
              month: { $month: '$ts' },
              day:   { $dayOfMonth: '$ts' }
            },
            count: { $sum: 1 }
        }},
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
      ]),

      User.countDocuments({ role: { $in: ['user', 'end_user'] } }),

      // Recent 10 searches
      SearchQuery.find().sort({ ts: -1 }).limit(10).select('query detectedLaws source ts')
    ]);

    const topLaws = topLawsAgg.map(l => ({ name: l._id, count: l.count }));
    const dailyTrend = dailyTrendAgg.map(d => ({
      date: `${d._id.year}-${String(d._id.month).padStart(2,'0')}-${String(d._id.day).padStart(2,'0')}`,
      count: d.count
    }));

    return res.json({
      success: true,
      totalSearches,
      totalUsers,
      topLaws,
      dailyTrend,
      recentSearches
    });
  } catch (err) {
    console.error('[admin/analytics/summary]', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};
