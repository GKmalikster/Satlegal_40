/**
 * GET  /api/admin/lawyers          — list all lawyers (with user info)
 * PUT  /api/admin/lawyers          — verify/update lawyer status
 *      body: { lawyerId, status: 'approved'|'rejected'|'suspended' }
 * Requires admin session token.
 */

const { connectDB, isAdmin, getModels } = require('../_db');

module.exports = async function handler(req, res) {
  const ALLOWED_ORIGINS = ['https://satlegal.in','https://www.satlegal.in','https://satlegal-40.vercel.app'];
  const origin = req.headers['origin'] || '';
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGINS.includes(origin) ? origin : '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!isAdmin(req)) return res.status(401).json({ success: false, message: 'Unauthorized' });

  try {
    await connectDB();
    const { LawyerProfile } = getModels();

    // ── GET: list lawyers ──────────────────────────────────────────────────
    if (req.method === 'GET') {
      const { status = '', search = '', limit = 100 } = req.query;
      const filter = {};
      if (status) filter.status = status;

      let query = LawyerProfile.find(filter)
        .populate('userId', 'name email phone createdAt')
        .sort({ createdAt: -1 })
        .limit(Math.min(parseInt(limit) || 100, 500));

      let lawyers = await query;

      // Apply search filter after populate
      if (search) {
        const s = search.toLowerCase();
        lawyers = lawyers.filter(l =>
          (l.userId?.name || '').toLowerCase().includes(s) ||
          (l.userId?.email || '').toLowerCase().includes(s) ||
          (l.barCouncilNumber || '').toLowerCase().includes(s)
        );
      }

      // Flatten for admin-cms compatibility
      const result = lawyers.map(l => ({
        _id:            l._id,
        name:           l.userId?.name || '—',
        email:          l.userId?.email || '—',
        phone:          l.userId?.phone || '—',
        barNumber:      l.barCouncilNumber,
        barCouncilNumber: l.barCouncilNumber,
        barCouncilState:  l.barCouncilState,
        specialisation: (l.specializations || []).slice(0, 2).join(', '),
        specializations: l.specializations,
        yearsOfExperience: l.yearsOfExperience,
        city:           l.city,
        state:          l.state,
        status:         l.status,
        feeStructure:   l.feeStructure,
        createdAt:      l.createdAt,
        userId:         l.userId
      }));

      return res.json({ success: true, lawyers: result, total: result.length });
    }

    // ── PUT: update status ─────────────────────────────────────────────────
    if (req.method === 'PUT') {
      const { lawyerId, status } = req.body || {};
      const allowed = ['approved', 'rejected', 'suspended', 'pending'];
      if (!lawyerId || !allowed.includes(status)) {
        return res.status(400).json({ success: false, message: 'lawyerId and valid status required' });
      }
      const lawyer = await LawyerProfile.findByIdAndUpdate(
        lawyerId,
        { status, updatedAt: new Date() },
        { new: true }
      ).select('fullName email practiceAreas city state barCouncilId');

      // ── Approval welcome email — fire-and-forget ──────────────────────────
      if (status === 'approved' && lawyer && lawyer.email) {
        const _rk = process.env.RESEND_API_KEY;
        if (_rk) {
          const firstName = (lawyer.fullName || 'Lawyer').split(' ')[0];
          const practiceList = (lawyer.practiceAreas || []).slice(0, 3).join(', ') || 'your practice areas';
          fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${_rk}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              from: 'SatLegal Support <support@satlegal.in>',
              to: [lawyer.email],
              subject: '🎉 Congratulations! Your SatLegal lawyer profile is now live',
              html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1a1a1a">
                <div style="background:linear-gradient(135deg,#0d3d0d,#1a6b1a);padding:32px 28px;border-radius:10px 10px 0 0;text-align:center">
                  <img src="https://satlegal.in/assets/logo.png" alt="SatLegal" style="height:48px;margin-bottom:12px" />
                  <h1 style="color:#fff;font-size:22px;margin:0">Welcome to SatLegal, ${firstName}!</h1>
                  <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px">Your lawyer profile has been verified and approved ✅</p>
                </div>
                <div style="background:#fff;padding:28px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 10px 10px">
                  <p style="font-size:15px;line-height:1.6">Dear <strong>${firstName}</strong>,</p>
                  <p style="font-size:14px;line-height:1.7;color:#374151">We are pleased to inform you that your SatLegal lawyer profile has been <strong style="color:#1a6b1a">approved and is now live</strong>. Clients seeking legal help in <em>${practiceList}</em> can now discover and connect with you through our platform.</p>

                  <div style="background:#f0fbf0;border:1px solid #a8e8a4;border-radius:8px;padding:18px 20px;margin:20px 0">
                    <p style="font-weight:700;color:#0d3d0d;margin:0 0 10px;font-size:14px">🚀 Your next steps:</p>
                    <ol style="margin:0;padding-left:20px;font-size:14px;color:#374151;line-height:2">
                      <li>Log in to your <a href="https://satlegal.in/lawyer/dashboard.html" style="color:#1a6b1a;font-weight:600">Lawyer Dashboard</a> to manage your profile</li>
                      <li>Set your <strong>availability & consultation slots</strong> so clients can book you</li>
                      <li>Review incoming <strong>client leads</strong> matched to your specialisation</li>
                      <li>Respond to leads promptly — faster responses earn higher placement</li>
                    </ol>
                  </div>

                  <div style="background:#fff4e6;border:1px solid #ffcc99;border-radius:8px;padding:14px 18px;margin:16px 0;font-size:13px;color:#7a3800">
                    <strong>📋 Your profile details on file:</strong><br/>
                    Name: ${lawyer.fullName || '—'} &nbsp;|&nbsp; Location: ${[lawyer.city, lawyer.state].filter(Boolean).join(', ') || '—'}<br/>
                    Bar Council ID: ${lawyer.barCouncilId || 'On file'}
                  </div>

                  <p style="font-size:14px;color:#374151;line-height:1.7">If you have any questions or need help getting started, simply reply to this email or write to us at <a href="mailto:support@satlegal.in" style="color:#1a6b1a">support@satlegal.in</a>.</p>

                  <p style="font-size:14px;color:#374151">We look forward to connecting you with clients who need your expertise.</p>

                  <a href="https://satlegal.in/lawyer/dashboard.html" style="display:inline-block;margin-top:10px;background:#138808;color:#fff;border-radius:8px;padding:12px 24px;text-decoration:none;font-size:14px;font-weight:700">Go to My Dashboard →</a>

                  <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>
                  <p style="font-size:12px;color:#9ca3af;margin:0">SatLegal · Legal information made accessible · <a href="https://satlegal.in" style="color:#9ca3af">satlegal.in</a><br/>This email was sent to ${lawyer.email} because your lawyer profile was approved on SatLegal.</p>
                </div>
              </div>`
            })
          }).catch(e => console.error('[lawyer approval email]', e.message));
        } else {
          console.warn('[lawyer approval] RESEND_API_KEY not set — approval email not sent');
        }
      }

      return res.json({ success: true, message: `Lawyer ${status}` });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('[admin/lawyers]', err.message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
