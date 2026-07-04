/**
 * GET /api/admin/inquiries
 * Returns case inquiries/leads list.
 * Supports ?search=&status=&lawType= filters.
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
    const { CaseInquiry } = getModels();

    const { search = '', status = '', lawType = '', limit = 100 } = req.query;
    const filter = {};
    if (status)  filter.status = status;
    if (lawType) filter['applicableLaws.caseType'] = { $regex: lawType, $options: 'i' };

    let inquiries = await CaseInquiry.find(filter)
      .populate('userId', 'name email state')
      .sort({ createdAt: -1 })
      .limit(Math.min(parseInt(limit) || 100, 500));

    if (search) {
      const s = search.toLowerCase();
      inquiries = inquiries.filter(i =>
        (i.description || '').toLowerCase().includes(s) ||
        (i.inquiryId || '').toLowerCase().includes(s) ||
        (i.userId?.name || '').toLowerCase().includes(s)
      );
    }

    return res.json({ success: true, inquiries, total: inquiries.length });
  } catch (err) {
    console.error('[admin/inquiries]', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};
