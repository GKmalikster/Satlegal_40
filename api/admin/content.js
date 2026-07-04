/**
 * GET  /api/admin/content  — load CMS content (public, no auth needed)
 * PUT  /api/admin/content  — save CMS content (admin auth required)
 *
 * Stores the entire CMS content JSON as a single document keyed 'main'.
 * admin-cms.html calls PUT on every save; index.html calls GET for banners.
 */

const mongoose    = require('mongoose');
const { connectDB, isAdmin } = require('../_db');

// Inline schema — single document per site key
const CmsContent = (() => {
  if (mongoose.models.CmsContent) return mongoose.models.CmsContent;
  return mongoose.model('CmsContent', new mongoose.Schema({
    key:       { type: String, unique: true, default: 'main' },
    data:      { type: mongoose.Schema.Types.Mixed, default: {} },
    updatedAt: { type: Date, default: Date.now },
    updatedBy: { type: String, default: '' }
  }));
})();

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    await connectDB();

    // ── GET: load content (public — homepage needs it) ──────────────────────
    if (req.method === 'GET') {
      const doc = await CmsContent.findOne({ key: 'main' }).lean();
      return res.json({ success: true, content: doc?.data || null });
    }

    // ── PUT: save content (admin only) ───────────────────────────────────────
    if (req.method === 'PUT') {
      if (!isAdmin(req)) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const data = req.body;
      if (!data || typeof data !== 'object') {
        return res.status(400).json({ success: false, message: 'Content body required' });
      }

      // Extract updatedBy from token if possible
      let updatedBy = '';
      try {
        const { verifyToken } = require('../admin-login');
        const tok = (req.headers['authorization'] || '').replace('Bearer ', '').trim();
        const decoded = verifyToken(tok);
        if (decoded) updatedBy = decoded.email;
      } catch (e) {}

      await CmsContent.findOneAndUpdate(
        { key: 'main' },
        { data, updatedAt: new Date(), updatedBy },
        { upsert: true, new: true }
      );

      return res.json({ success: true, message: 'Content saved' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('[admin/content]', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};
