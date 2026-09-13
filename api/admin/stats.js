/**
 * GET /api/admin/stats             → dashboard overview counts
 * GET /api/admin/analytics/summary → search analytics
 * GET /api/admin/payments          → list payments (?status=&search=&from=&to=&limit=)
 * PUT /api/admin/payments          → verify / reject a payment {orderId, action, adminNotes}
 * GET /api/admin/payments/export   → CSV export (?from=&to=&status=)
 *
 * Requires admin session token in Authorization header.
 */

const { connectDB, isAdmin, getModels } = require('../_db');

module.exports = async function handler(req, res) {
  const ALLOWED_ORIGINS = ['https://satlegal.in','https://www.satlegal.in','https://satlegal-40.vercel.app'];
  const origin = req.headers['origin'] || '';
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGINS.includes(origin) ? origin : '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (!isAdmin(req)) return res.status(401).json({ success: false, message: 'Unauthorized' });

  const reqPath = (req.url || '').split('?')[0].replace(/\/$/, '');

  // ── GET /api/admin/payments — list with filters ───────────────────────────
  if (reqPath === '/api/admin/payments' && req.method === 'GET') {
    try {
      await connectDB();
      const { Payment } = getModels();
      const { status = '', search = '', from = '', to = '', type = '', limit = 200 } = req.query || {};
      const filter = {};
      if (status) filter.status = status;
      if (type)   filter.type   = type;
      if (from || to) {
        filter.createdAt = {};
        if (from) filter.createdAt.$gte = new Date(from);
        if (to)   filter.createdAt.$lte = new Date(to + 'T23:59:59Z');
      }
      if (search) {
        const re = { $regex: search, $options: 'i' };
        filter.$or = [{ orderId: re }, { userEmail: re }, { userName: re }, { utrNumber: re }];
      }
      const payments = await Payment.find(filter)
        .sort({ createdAt: -1 }).limit(Math.min(parseInt(limit)||200, 1000)).lean();

      // KPIs
      const all = await Payment.find({}).lean();
      const kpi = {
        totalOrders:   all.length,
        totalVerified: all.filter(p => p.status === 'verified').length,
        totalPending:  all.filter(p => p.status === 'pending').length,
        totalRejected: all.filter(p => p.status === 'rejected').length,
        totalRevenue:  all.filter(p => p.status === 'verified').reduce((s, p) => s + (p.amount||0), 0),
        pendingRevenue:all.filter(p => p.status === 'pending' && p.utrNumber).reduce((s,p)=>s+(p.amount||0),0),
        reportCount:   all.filter(p => p.status==='verified' && p.type==='report').length,
        consultCount:  all.filter(p => p.status==='verified' && p.type==='consultation').length
      };
      return res.json({ success: true, payments, total: payments.length, kpi });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // ── PUT /api/admin/payments — verify or reject ────────────────────────────
  if (reqPath === '/api/admin/payments' && req.method === 'PUT') {
    try {
      await connectDB();
      const { Payment } = getModels();
      const { orderId, action, adminNotes } = req.body || {};
      if (!orderId || !['verify','reject','refund'].includes(action)) {
        return res.status(400).json({ success: false, message: 'orderId and action (verify|reject|refund) required' });
      }
      const adminToken = (req.headers['authorization']||'').replace('Bearer ','').trim();
      const update = {
        status:     action === 'verify' ? 'verified' : action === 'refund' ? 'refunded' : 'rejected',
        adminNotes: adminNotes || '',
        verifiedBy: adminToken.slice(0, 8) + '…'
      };
      if (action === 'verify') update.verifiedAt = new Date();
      if (action === 'reject') update.rejectedAt = new Date();
      const payment = await Payment.findOneAndUpdate({ orderId }, { $set: update }, { new: true });
      if (!payment) return res.status(404).json({ success: false, message: 'Order not found' });

      // Notify user (fire-and-forget)
      const _rk = process.env.RESEND_API_KEY;
      if (_rk && payment.userEmail) {
        const isVerified = action === 'verify';
        fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${_rk}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: 'SatLegal Support <support@satlegal.in>',
            to: [payment.userEmail],
            subject: isVerified
              ? `✅ Payment confirmed — Order ${orderId}`
              : `❌ Payment not verified — Order ${orderId}`,
            html: isVerified
              ? `<div style="font-family:sans-serif;max-width:560px;margin:0 auto">
                  <h2 style="color:#138808">✅ Payment Verified!</h2>
                  <p>Dear ${payment.userName || 'User'},</p>
                  <p>Your payment of <strong>₹${payment.amount}</strong> for your <strong>${payment.type === 'report' ? 'Digital Legal Report' : 'Expert Consultation'}</strong> has been verified.</p>
                  <p><strong>Order ID:</strong> ${orderId}<br/><strong>UTR:</strong> ${payment.utrNumber}</p>
                  <p><a href="https://satlegal.in/dashboard/user-dashboard.html" style="background:#138808;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block">View My Dashboard →</a></p>
                  <p style="font-size:12px;color:#888">SatLegal · support@satlegal.in</p>
                </div>`
              : `<div style="font-family:sans-serif;max-width:560px;margin:0 auto">
                  <h2 style="color:#c0392b">Payment Not Verified</h2>
                  <p>Dear ${payment.userName || 'User'},</p>
                  <p>We could not verify payment for Order <strong>${orderId}</strong>. ${adminNotes ? `Reason: ${adminNotes}` : ''}</p>
                  <p>Please contact us at <a href="mailto:support@satlegal.in">support@satlegal.in</a> with your UTR number <strong>${payment.utrNumber}</strong> and we will resolve this within 24 hours.</p>
                  <p style="font-size:12px;color:#888">SatLegal · support@satlegal.in</p>
                </div>`
          })
        }).catch(e => console.error('[payment notify user]', e.message));
      }
      return res.json({ success: true, message: `Payment ${update.status}`, payment });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // ── GET /api/admin/payments/export — CSV download ─────────────────────────
  if (reqPath === '/api/admin/payments/export' && req.method === 'GET') {
    try {
      await connectDB();
      const { Payment } = getModels();
      const { from = '', to = '', status = '' } = req.query || {};
      const filter = {};
      if (status) filter.status = status;
      if (from || to) {
        filter.createdAt = {};
        if (from) filter.createdAt.$gte = new Date(from);
        if (to)   filter.createdAt.$lte = new Date(to + 'T23:59:59Z');
      }
      const payments = await Payment.find(filter).sort({ createdAt: -1 }).lean();
      const header = ['Order ID','Date','Name','Email','Phone','Type','Amount (INR)','UTR Number','Status','Verified At','Admin Notes'];
      const rows = payments.map(p => [
        p.orderId,
        p.createdAt ? new Date(p.createdAt).toISOString().slice(0,19).replace('T',' ') : '',
        p.userName  || '',
        p.userEmail || '',
        p.userPhone || '',
        p.type      || '',
        p.amount    || 0,
        p.utrNumber || '',
        p.status    || '',
        p.verifiedAt ? new Date(p.verifiedAt).toISOString().slice(0,19).replace('T',' ') : '',
        (p.adminNotes||'').replace(/,/g,' ')
      ]);
      const csv = [header, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
      const fname = `satlegal_payments_${new Date().toISOString().slice(0,10)}.csv`;
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${fname}"`);
      return res.send(csv);
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  // Route: ?action=unmapped → coverage-gap form submissions
  if (req.query.action === 'unmapped') {
    try {
      await connectDB();
      const { AnalyticsEvent } = getModels();
      const [total, recent] = await Promise.all([
        AnalyticsEvent.countDocuments({ event: 'unmapped_form' }),
        AnalyticsEvent.find({ event: 'unmapped_form' })
          .sort({ ts: -1 }).limit(50)
          .select('query data sessionId ts')
      ]);
      return res.json({ success: true, total, items: recent });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

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
        User.countDocuments(),
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
      User.countDocuments(),
      User.countDocuments({ role: 'lawyer' }),
      LawyerProfile.countDocuments({ status: 'pending' }),
      LawyerProfile.countDocuments({ status: 'approved' }),
      CaseInquiry.countDocuments(),
      LawyerLead.countDocuments(),
      SearchQuery.countDocuments(),
      User.find({ role: { $in: ['user', 'end_user', 'tester'] } })
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
