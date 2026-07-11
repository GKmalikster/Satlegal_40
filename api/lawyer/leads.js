/**
 * api/lawyer/leads.js
 *
 * GET  /api/lawyer/leads   — list leads for authenticated lawyer (+ aggregate stats)
 * PUT  /api/lawyer/leads   — update lead status, notes, quoted fee
 *
 * Auth: Authorization: Bearer <HMAC lawyer token>
 * Env:  MONGODB_URI, AUTH_SECRET (or ADMIN_SECRET)
 */

const crypto = require('crypto');
const { connectDB, getModels } = require('../_db');

// ── Token verification ───────────────────────────────────────────────────────
function verifyLawyer(req) {
  const auth = (req.headers.authorization || '').trim();
  if (!auth.startsWith('Bearer ')) return null;
  const token = auth.slice(7).trim();
  const dot   = token.lastIndexOf('.');
  if (dot < 0) return null;
  const payload64 = token.slice(0, dot);
  const sig       = token.slice(dot + 1);
  let payload;
  try { payload = Buffer.from(payload64, 'base64url').toString('utf8'); } catch { return null; }
  const parts = payload.split(':');
  if (parts.length < 3) return null;
  const [userId, role, tsStr] = parts;
  if (!userId || !['lawyer', 'admin'].includes(role)) return null;
  const ts = parseInt(tsStr, 10);
  if (isNaN(ts) || Date.now() - ts > 30 * 24 * 60 * 60 * 1000) return null; // 30-day expiry
  const secret = process.env.AUTH_SECRET || process.env.ADMIN_SECRET;
  if (!secret) return null;
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  if (expected !== sig) return null;
  return { userId, role };
}

const VALID_STATUSES = ['new', 'viewed', 'accepted', 'rejected', 'completed', 'cancelled'];

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const session = verifyLawyer(req);
  if (!session) return res.status(401).json({ success: false, message: 'Authentication required.' });

  try {
    await connectDB();
    const { LawyerProfile, LawyerLead } = getModels();

    const profile = await LawyerProfile.findOne({ userId: session.userId });
    if (!profile) return res.status(404).json({ success: false, message: 'Lawyer profile not found.' });

    // ── GET: list leads ────────────────────────────────────────────────────
    if (req.method === 'GET') {
      const status = req.query.status;
      const page   = Math.max(parseInt(req.query.page)  || 1, 1);
      const limit  = Math.min(parseInt(req.query.limit) || 20, 50);
      const skip   = (page - 1) * limit;

      const filter = { lawyerId: profile._id };
      if (status && VALID_STATUSES.includes(status)) filter.status = status;

      const [leads, total] = await Promise.all([
        LawyerLead.find(filter)
          .populate({
            path: 'inquiryId',
            select: 'description applicableLaws probabilityScores documents assessments status'
          })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        LawyerLead.countDocuments(filter)
      ]);

      // Per-status counts + closure rate
      const statAgg = await LawyerLead.aggregate([
        { $match: { lawyerId: profile._id } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]);
      const sc = {};
      statAgg.forEach(s => { sc[s._id] = s.count; });
      const completed  = sc.completed || 0;
      const accepted   = sc.accepted  || 0;
      const totalAll   = Object.values(sc).reduce((a, b) => a + b, 0);
      const closureRate = (accepted + completed) > 0
        ? Math.round(completed / (accepted + completed) * 100)
        : 0;

      return res.json({
        success: true,
        total,
        page,
        pages: Math.ceil(total / limit),
        stats: {
          total: totalAll,
          new:       sc.new       || 0,
          viewed:    sc.viewed    || 0,
          accepted,
          completed,
          rejected:  sc.rejected  || 0,
          cancelled: sc.cancelled || 0,
          closureRate,
          rating:       profile.stats?.rating       || 0,
          totalReviews: profile.stats?.totalReviews || 0
        },
        leads: leads.map(l => ({
          id:          l._id,
          leadId:      l.leadId,
          status:      l.status,
          urgency:     l.urgency,
          caseTypes:   l.caseTypes   || [],
          description: l.description || '',
          // Contact info — only expose after lawyer accepts
          userName:    l.userName   || '',
          userEmail:   ['accepted', 'completed'].includes(l.status) ? (l.userEmail || '') : '',
          userPhone:   ['accepted', 'completed'].includes(l.status) ? (l.userPhone || '') : '',
          userMessage: l.userMessage || '',
          lawyerNotes: l.lawyerNotes || '',
          quotedFee:   l.quotedFee  || null,
          viewedAt:    l.viewedAt,
          respondedAt: l.respondedAt,
          createdAt:   l.createdAt,
          inquiry: l.inquiryId ? {
            id:                l.inquiryId._id,
            description:       l.inquiryId.description,
            applicableLaws:    l.inquiryId.applicableLaws    || [],
            probabilityScores: l.inquiryId.probabilityScores || [],
            documents:         l.inquiryId.documents         || [],
            status:            l.inquiryId.status
          } : null
        }))
      });
    }

    // ── PUT: update lead ───────────────────────────────────────────────────
    if (req.method === 'PUT') {
      const b = req.body || {};
      if (!b.leadId) return res.status(400).json({ success: false, message: 'leadId is required.' });

      const lead = await LawyerLead.findOne({ _id: b.leadId, lawyerId: profile._id });
      if (!lead) return res.status(404).json({ success: false, message: 'Lead not found.' });

      const updates = { updatedAt: new Date() };

      if (b.status && VALID_STATUSES.includes(b.status)) {
        updates.status = b.status;
        if (b.status === 'viewed' && !lead.viewedAt)       updates.viewedAt    = new Date();
        if (['accepted','rejected'].includes(b.status) && !lead.respondedAt) {
          updates.respondedAt = new Date();
        }
      }
      if (typeof b.lawyerNotes === 'string') {
        updates.lawyerNotes = b.lawyerNotes.trim().slice(0, 2000);
      }
      if (b.quotedFee && typeof b.quotedFee.amount === 'number') {
        updates.quotedFee = {
          amount:      Math.max(0, b.quotedFee.amount),
          description: String(b.quotedFee.description || '').slice(0, 300),
          currency:    'INR'
        };
      }

      const updated = await LawyerLead.findByIdAndUpdate(b.leadId, updates, { new: true });
      return res.json({ success: true, lead: updated });
    }

    return res.status(405).json({ success: false, message: 'Method not allowed.' });

  } catch (err) {
    console.error('[lawyer/leads]', err.message);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};
