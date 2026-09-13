/**
 * POST /api/sales              — record a sale/signup event (fire-and-forget from index.html)
 * GET  /api/sales              — list sales (admin auth required)
 *
 * Payment routes (QR / UTR flow — Razorpay kept inactive):
 * POST /api/payment/create     — initiate a new payment order (returns orderId + amount)
 * POST /api/payment/confirm    — user submits UTR after paying (marks pending→awaiting verification)
 * GET  /api/payment/status     — check status of an order (?orderId=...)
 */

const mongoose = require('mongoose');
const { connectDB, isAdmin, verifyToken, getModels } = require('./_db');

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

// ── Order ID generator ────────────────────────────────────────────────────────
function genOrderId(type) {
  const prefix = type === 'consultation' ? 'SL-CON' : 'SL-RPT';
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${rand}`;
}

module.exports = async function handler(req, res) {
  const ALLOWED = ['https://satlegal.in','https://www.satlegal.in','https://satlegal-40.vercel.app'];
  const origin = req.headers['origin'] || '';
  res.setHeader('Access-Control-Allow-Origin', ALLOWED.includes(origin) ? origin : '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const reqPath = (req.url || '').split('?')[0].replace(/\/$/, '');

  // ── POST /api/payment/create — initiate a payment order ────────────────────
  if (reqPath === '/api/payment/create') {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    try {
      await connectDB();
      const { Payment } = getModels();
      const body = req.body || {};
      const { type, inquiryId, lawyerId, lawsSelected, name, email, phone } = body;

      const PRICES = { report: 499, consultation: 2499 };
      if (!['report','consultation'].includes(type)) {
        return res.status(400).json({ success: false, message: 'Invalid payment type' });
      }

      // Check for logged-in user
      const auth = (req.headers['authorization'] || '').replace('Bearer ', '').trim();
      const decoded = auth ? verifyToken(auth) : null;
      let userId = null, userEmail = email || '', userName = name || '', userPhone = phone || '';

      if (decoded) {
        const { User } = getModels();
        const u = await User.findOne({ email: decoded.email }).select('_id name email phone').lean();
        if (u) { userId = u._id; userEmail = u.email; userName = u.name; userPhone = u.phone || phone || ''; }
      }

      const orderId = genOrderId(type);
      const amount  = PRICES[type];

      await Payment.create({
        orderId, userId, userEmail, userName, userPhone, amount, type,
        inquiryId: inquiryId || null,
        lawyerId:  lawyerId  || null,
        lawsSelected: Array.isArray(lawsSelected) ? lawsSelected.slice(0, 10) : [],
        status: 'pending'
      });

      return res.status(201).json({ success: true, orderId, amount, type,
        message: 'Order created. Scan the QR code and pay, then submit your UTR.' });
    } catch (err) {
      console.error('[payment/create]', err.message);
      return res.status(500).json({ success: false, message: 'Could not create order' });
    }
  }

  // ── POST /api/payment/confirm — user submits UTR after paying ───────────────
  if (reqPath === '/api/payment/confirm') {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    try {
      await connectDB();
      const { Payment } = getModels();
      const { orderId, utrNumber } = req.body || {};
      if (!orderId || !utrNumber) {
        return res.status(400).json({ success: false, message: 'orderId and utrNumber are required' });
      }
      const utr = String(utrNumber).trim().toUpperCase();
      if (utr.length < 6 || utr.length > 30) {
        return res.status(400).json({ success: false, message: 'Invalid UTR number format' });
      }
      const payment = await Payment.findOneAndUpdate(
        { orderId, status: 'pending' },
        { $set: { utrNumber: utr } },
        { new: true }
      );
      if (!payment) {
        return res.status(404).json({ success: false, message: 'Order not found or already processed' });
      }
      // Notify admin by email (fire-and-forget)
      const _rk = process.env.RESEND_API_KEY;
      if (_rk) {
        fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${_rk}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: 'SatLegal Payments <support@satlegal.in>',
            to: ['support@satlegal.in'],
            subject: `💳 Payment UTR submitted — ${orderId}`,
            html: `<p>A payment UTR has been submitted and awaits verification.</p>
              <table style="font-family:monospace;border-collapse:collapse;font-size:13px">
                <tr><td style="padding:4px 12px 4px 0"><b>Order ID</b></td><td>${orderId}</td></tr>
                <tr><td style="padding:4px 12px 4px 0"><b>UTR</b></td><td>${utr}</td></tr>
                <tr><td style="padding:4px 12px 4px 0"><b>Amount</b></td><td>₹${payment.amount}</td></tr>
                <tr><td style="padding:4px 12px 4px 0"><b>Type</b></td><td>${payment.type}</td></tr>
                <tr><td style="padding:4px 12px 4px 0"><b>User</b></td><td>${payment.userName} (${payment.userEmail})</td></tr>
              </table>
              <p><a href="https://satlegal.in/admin/payments.html">→ Open Admin Payment Dashboard</a></p>`
          })
        }).catch(e => console.error('[payment confirm notify]', e.message));
      }
      return res.json({ success: true, message: 'UTR submitted. Your payment will be verified within 2 business hours.' });
    } catch (err) {
      console.error('[payment/confirm]', err.message);
      return res.status(500).json({ success: false, message: 'Could not confirm payment' });
    }
  }

  // ── GET /api/payment/status — check order status (?orderId=...) ─────────────
  if (reqPath === '/api/payment/status') {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
    try {
      await connectDB();
      const { Payment } = getModels();
      const { orderId } = req.query || {};
      if (!orderId) return res.status(400).json({ success: false, message: 'orderId required' });
      const p = await Payment.findOne({ orderId }).select('orderId amount type status utrNumber createdAt verifiedAt').lean();
      if (!p) return res.status(404).json({ success: false, message: 'Order not found' });
      return res.json({ success: true, payment: p });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

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
