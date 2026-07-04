/**
 * GET  /api/admin/config  — load flow config (public, index.html needs it)
 * PUT  /api/admin/config  — save flow config (admin auth required)
 *
 * Stores the entire flow config JSON as a single document keyed 'flow'.
 * admin-cms.html calls PUT on every save; index.html calls GET on load.
 */

const mongoose = require('mongoose');
const { connectDB, isAdmin } = require('../_db');

// Inline schema — single document per site key
const SiteConfig = (() => {
  if (mongoose.models.SiteConfig) return mongoose.models.SiteConfig;
  return mongoose.model('SiteConfig', new mongoose.Schema({
    key:       { type: String, unique: true, default: 'flow' },
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

    // ── GET: load config (public — index.html needs it without auth) ──────────
    if (req.method === 'GET') {
      const doc = await SiteConfig.findOne({ key: 'flow' }).lean();
      return res.json({ success: true, config: doc?.data || null });
    }

    // ── PUT: save config (admin only) ─────────────────────────────────────────
    if (req.method === 'PUT') {
      if (!isAdmin(req)) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const data = req.body;
      if (!data || typeof data !== 'object') {
        return res.status(400).json({ success: false, message: 'Config body required' });
      }

      let updatedBy = '';
      try {
        const { verifyToken } = require('../admin-login');
        const tok = (req.headers['authorization'] || '').replace('Bearer ', '').trim();
        const decoded = verifyToken(tok);
        if (decoded) updatedBy = decoded.email;
      } catch (e) {}

      await SiteConfig.findOneAndUpdate(
        { key: 'flow' },
        { data, updatedAt: new Date(), updatedBy },
        { upsert: true, new: true }
      );

      return res.json({ success: true, message: 'Config saved' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('[admin/config]', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};
