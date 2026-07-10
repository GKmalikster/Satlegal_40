/**
 * POST /api/sales  — record a sale/signup event (called from index.html, no auth)
 * GET  /api/sales  — list sales (admin auth required)
 *
 * Stores each sale as a document in the 'sales' collection.
 * index.html calls POST on signup + payment success (fire-and-forget).
 * admin-cms.html calls GET to populate the Sales Report panel.
 */

const mongoose = require('mongoose');
const { connectDB, isAdmin } = require('./_db');

const Sale = (() => {
  if (mongoose.models.Sale) return mongoose.models.Sale;
  return mongoose.model('Sale', new mongoose.Schema({
    id:        { type: String, index: true },   // uid from wizard
    name:      String,
    email:     { type: String, index: true },
    phone:     String,
    plan:      { type: String, default: 'report' },
    amt:       { type: Number, default: 0 },
    status:    { type: String, default: 'signup_completed' }, // signup_completed | payment_completed | failed
    laws:      [String],
    razorpay_payment_id: String,
    razorpay_order_id:   String,
    ts:        { type: Date, default: Date.now, index: true }
  }));
})();

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    await connectDB();

    // ── POST: record a sale (public — called fire-and-forget from index.html) ──
    if (req.method === 'POST') {
      if (JSON.stringify(req.body || {}).length > 10000) return res.status(413).json({ error: 'Payload too large' });
      // Respond immediately — never block the user
      res.status(200).json({ success: true });

      const body = req.body || {};
      if (!body.id && !body.email) return; // ignore empty pings

      try {
        // Upsert by id — if payment comes in after signup, update the record
        await Sale.findOneAndUpdate(
          { id: body.id || body.email + '_' + Date.now() },
          {
            $set: {
              name:   body.name  || '',
              email:  body.email || '',
              phone:  body.phone || '',
              plan:   body.plan  || 'report',
              amt:    parseInt(body.amt) || 0,
              status: body.status || 'signup_completed',
              laws:   Array.isArray(body.laws) ? body.laws.slice(0, 5) : [],
              ...(body.razorpay_payment_id ? { razorpay_payment_id: body.razorpay_payment_id } : {}),
              ...(body.razorpay_order_id   ? { razorpay_order_id:   body.razorpay_order_id   } : {}),
              ts: body.ts ? new Date(body.ts) : new Date()
            }
          },
          { upsert: true, new: true }
        );
      } catch (e) {
        console.error('[sales POST]', e.message);
      }
      return;
    }

    // ── GET: list sales (admin only) ──────────────────────────────────────────
    if (req.method === 'GET') {
      if (!isAdmin(req)) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const limit = Math.min(parseInt(req.query?.limit) || 500, 2000);
      const skip  = parseInt(req.query?.skip) || 0;
      const q     = req.query?.q || '';
      const plan  = req.query?.plan || '';
      const status = req.query?.status || '';

      const filter = {};
      if (q) {
        filter.$or = [
          { name:  { $regex: q, $options: 'i' } },
          { email: { $regex: q, $options: 'i' } },
          { phone: { $regex: q, $options: 'i' } }
        ];
      }
      if (plan)   filter.plan   = plan;
      if (status) filter.status = status;

      const [sales, total] = await Promise.all([
        Sale.find(filter).sort({ ts: -1 }).skip(skip).limit(limit).lean(),
        Sale.countDocuments(filter)
      ]);

      // KPI totals (unfiltered)
      const allSales = await Sale.find({}).lean();
      const kpi = {
        total:    allSales.reduce((s, t) => s + (t.amt || 0), 0),
        count:    allSales.length,
        reports:  allSales.filter(s => s.plan === 'report').length,
        consult:  allSales.filter(s => s.plan === 'consultation').length
      };

      return res.json({ success: true, sales, total, kpi });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('[sales]', err.message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
