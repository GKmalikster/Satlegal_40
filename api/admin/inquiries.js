/**
 * GET  /api/admin/inquiries — list inquiries (supports ?status=no_match|abandoned|…)
 * POST /api/admin/inquiries — manually assign a lawyer to a no_match/abandoned inquiry
 *
 * Supports ?search=&status=&lawType=&matchType=none&needsAction=1
 * Requires admin session token.
 */

const { connectDB, isAdmin, verifyToken, getModels } = require('../_db');

module.exports = async function handler(req, res) {
  const ALLOWED_ORIGINS = ['https://satlegal.in','https://www.satlegal.in','https://satlegal-40.vercel.app'];
  const origin = req.headers['origin'] || '';
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGINS.includes(origin) ? origin : '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // ── POST /api/inquiry/contact — public contact form (no auth) ────────────────
  const reqPath = (req.url || '').split('?')[0];
  if (reqPath === '/api/inquiry/contact') {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const { name, email, phone, subject, message } = req.body || {};
    if (!name || !email || !message || message.length < 5) {
      return res.status(400).json({ success: false, message: 'Name, email and message are required.' });
    }

    // Fire email via Resend (non-blocking — respond immediately)
    res.status(200).json({ success: true });

    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      const subj = subject ? `[Contact] ${subject} — ${name}` : `[Contact] New enquiry from ${name}`;
      const html = `
        <h2 style="color:#1a3a1a;font-family:sans-serif">New Contact Form Submission</h2>
        <table style="font-family:sans-serif;font-size:14px;border-collapse:collapse;width:100%">
          <tr><td style="padding:6px 12px;font-weight:700;width:120px">Name</td><td style="padding:6px 12px">${String(name).replace(/</g,'&lt;')}</td></tr>
          <tr style="background:#f5f5f5"><td style="padding:6px 12px;font-weight:700">Email</td><td style="padding:6px 12px">${String(email).replace(/</g,'&lt;')}</td></tr>
          <tr><td style="padding:6px 12px;font-weight:700">Phone</td><td style="padding:6px 12px">${phone ? String(phone).replace(/</g,'&lt;') : 'Not provided'}</td></tr>
          <tr style="background:#f5f5f5"><td style="padding:6px 12px;font-weight:700">Subject</td><td style="padding:6px 12px">${subject ? String(subject).replace(/</g,'&lt;') : 'General Inquiry'}</td></tr>
          <tr><td style="padding:6px 12px;font-weight:700;vertical-align:top">Message</td><td style="padding:6px 12px">${String(message).replace(/</g,'&lt;').replace(/\n/g,'<br>')}</td></tr>
        </table>
        <p style="font-family:sans-serif;font-size:12px;color:#888;margin-top:24px">Sent from satlegal.in contact form · ${new Date().toLocaleString('en-IN',{timeZone:'Asia/Kolkata'})}</p>
      `;
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'SatLegal <contact@satlegal.in>',
          to: ['contact@satlegal.in'],
          reply_to: String(email),
          subject: subj,
          html
        })
      }).catch(err => console.error('[contact email]', err.message));
    } else {
      console.warn('[contact] RESEND_API_KEY not set — email not sent');
    }
    return; // response already sent
  }

  // ── POST /api/user/inquiry — save wizard-completed inquiry to MongoDB ─────────
  if (reqPath === '/api/user/inquiry') {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const auth = (req.headers['authorization'] || '').replace('Bearer ', '').trim();
    const decoded = verifyToken(auth);
    if (!decoded) return res.status(401).json({ success: false, message: 'Not authenticated' });
    try {
      await connectDB();
      const { CaseInquiry, User } = getModels();
      const user = await User.findOne({ email: decoded.email }).select('_id');
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      const { description = '', applicableLaws = [], status = 'assessed' } = req.body || {};
      if (!description || !applicableLaws.length) {
        return res.status(400).json({ success: false, message: 'description and applicableLaws required' });
      }
      const inquiryId = 'INQ-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).slice(2,5).toUpperCase();
      const inquiry = await CaseInquiry.create({
        inquiryId,
        userId: user._id,
        description: String(description).slice(0, 1000),
        applicableLaws: applicableLaws.map(l => ({
          caseType: l.caseType || '',
          actName: l.actName || '',
          confidence: Number(l.confidence) || 0
        })),
        status: ['draft','assessed','completed','lawyer_requested'].includes(status) ? status : 'assessed',
        matchType: 'none',
        matchedCount: 0
      });
      return res.status(201).json({ success: true, inquiryId, id: inquiry._id });
    } catch (err) {
      console.error('[user/inquiry POST]', err.message);
      if (err.code === 11000) return res.status(200).json({ success: true, message: 'Already saved' });
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  // ── GET /api/user/payments — user's own payment orders ───────────────────────
  if (reqPath === '/api/user/payments') {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
    const auth = (req.headers['authorization'] || '').replace('Bearer ', '').trim();
    const decoded = verifyToken(auth);
    if (!decoded) return res.status(401).json({ success: false, message: 'Not authenticated' });
    try {
      await connectDB();
      const { Payment } = getModels();
      const payments = await Payment.find({ userEmail: decoded.email })
        .sort({ createdAt: -1 }).limit(50)
        .select('orderId amount type status utrNumber verifiedAt createdAt').lean();
      return res.json({ success: true, payments });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // ── GET /api/user/inquiries — user's own inquiries (no admin required) ────────
  if (reqPath === '/api/user/inquiries') {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
    const auth = (req.headers['authorization'] || '').replace('Bearer ', '').trim();
    const decoded = verifyToken(auth);
    if (!decoded) return res.status(401).json({ success: false, message: 'Not authenticated' });
    try {
      await connectDB();
      const { CaseInquiry, User } = getModels();
      const user = await User.findOne({ email: decoded.email }).select('_id');
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      const { status = '' } = req.query || {};
      const filter = { userId: user._id };
      if (status) filter.status = status;
      const inquiries = await CaseInquiry.find(filter).sort({ createdAt: -1 }).limit(100).lean();
      return res.json({ success: true, inquiries, total: inquiries.length });
    } catch (err) {
      console.error('[user/inquiries]', err.message);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  if (!isAdmin(req)) return res.status(401).json({ success: false, message: 'Unauthorized' });

  // ── POST: manually assign a lawyer to a no_match / abandoned inquiry ──────────
  if (req.method === 'POST') {
    try {
      await connectDB();
      const { CaseInquiry, LawyerProfile, LawyerLead } = getModels();
      const { inquiryId, lawyerId } = req.body || {};
      if (!inquiryId || !lawyerId) {
        return res.status(400).json({ success: false, message: 'inquiryId and lawyerId required.' });
      }

      const inquiry = await CaseInquiry.findOne({ inquiryId });
      if (!inquiry) return res.status(404).json({ success: false, message: 'Inquiry not found.' });

      const profile = await LawyerProfile.findById(lawyerId).select('_id status');
      if (!profile || profile.status !== 'approved') {
        return res.status(400).json({ success: false, message: 'Lawyer not found or not approved.' });
      }

      // Check if lead already exists for this lawyer+inquiry pair
      const existing = await LawyerLead.findOne({ lawyerId: profile._id, inquiryId: inquiry._id });
      if (existing) {
        return res.status(409).json({ success: false, message: 'Lead already exists for this lawyer.' });
      }

      const caseTypes = (inquiry.applicableLaws || []).map(l => l.caseType).filter(Boolean);
      const leadId = 'LD-ADM-' + Date.now() + '-' + Math.random().toString(36).slice(2,5).toUpperCase();

      await LawyerLead.create({
        leadId,
        lawyerId:    profile._id,
        userId:      inquiry.userId,
        inquiryId:   inquiry._id,
        caseTypes,
        description: (inquiry.description || '').slice(0, 500),
        urgency:     'high',    // admin-assigned leads get high urgency
        status:      'new'
      });

      // Update inquiry status and matchedCount
      await CaseInquiry.findByIdAndUpdate(inquiry._id, {
        status:       'lawyer_requested',
        matchedCount: (inquiry.matchedCount || 0) + 1,
        updatedAt:    new Date()
      });

      return res.json({ success: true, message: 'Lawyer assigned. Lead created.', leadId });

    } catch (err) {
      console.error('[admin/inquiries POST]', err.message);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  // ── GET: list inquiries ───────────────────────────────────────────────────────
  try {
    await connectDB();
    const { CaseInquiry } = getModels();

    const { search = '', status = '', lawType = '', matchType = '', needsAction = '', limit = 100 } = req.query;
    const filter = {};
    if (status)    filter.status = status;
    if (matchType) filter.matchType = matchType;
    if (lawType)   filter['applicableLaws.caseType'] = { $regex: lawType, $options: 'i' };

    // ?needsAction=1 → show only no_match + abandoned + zero-matched lawyer_requested
    if (needsAction === '1') {
      filter.$or = [
        { status: 'no_match' },
        { status: 'abandoned' },
        { status: 'lawyer_requested', matchedCount: 0 }
      ];
    }

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

    // Attach summary flags for admin UI
    const enriched = inquiries.map(i => ({
      _id:           i._id,
      inquiryId:     i.inquiryId,
      status:        i.status,
      matchType:     i.matchType,
      matchedCount:  i.matchedCount,
      notifyEmail:   i.notifyEmail,
      description:   (i.description || '').slice(0, 200),
      caseTypes:     (i.applicableLaws || []).map(l => l.caseType),
      userName:      i.userId?.name  || 'Anonymous',
      userEmail:     i.userId?.email || '',
      userState:     i.userId?.state || '',
      needsAction:   ['no_match', 'abandoned'].includes(i.status) || (i.status === 'lawyer_requested' && i.matchedCount === 0),
      createdAt:     i.createdAt
    }));

    // Summary counts for admin dashboard badges
    const summary = {
      total:     enriched.length,
      no_match:  enriched.filter(i => i.status === 'no_match').length,
      abandoned: enriched.filter(i => i.status === 'abandoned').length,
      needs_action: enriched.filter(i => i.needsAction).length
    };

    return res.json({ success: true, inquiries: enriched, summary, total: enriched.length });

  } catch (err) {
    console.error('[admin/inquiries]', err.message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
