/**
 * api/lawyer/me.js
 *
 * GET  /api/lawyer/me   — own profile + aggregate stats + monthly trend
 * PUT  /api/lawyer/me   — update profile (bio, fees, availability, offices, languages)
 *
 * Auth: Authorization: Bearer <HMAC lawyer token>
 * Env:  MONGODB_URI, AUTH_SECRET (or ADMIN_SECRET)
 */

const crypto = require('crypto');
const { connectDB, getModels } = require('../_db');

// ── Token verification (identical to leads.js) ───────────────────────────────
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
  if (isNaN(ts) || Date.now() - ts > 30 * 24 * 60 * 60 * 1000) return null;
  const secret = process.env.AUTH_SECRET || process.env.ADMIN_SECRET;
  if (!secret) return null;
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  if (expected !== sig) return null;
  return { userId, role };
}

const DAYS  = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const LANGS = ['Hindi','English','Tamil','Telugu','Kannada','Malayalam','Marathi','Bengali','Gujarati','Punjabi','Odia','Urdu','Assamese','Sanskrit'];
const str   = (v, max = 300) => (typeof v === 'string' ? v.trim() : '').slice(0, max);
const num   = v => { const n = parseFloat(v); return isNaN(n) ? 0 : Math.max(0, n); };

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const session = verifyLawyer(req);
  if (!session) return res.status(401).json({ success: false, message: 'Authentication required.' });

  try {
    await connectDB();
    const { User, LawyerProfile, LawyerLead } = getModels();

    const [user, profile] = await Promise.all([
      User.findById(session.userId).select('name email phone role status isVerified createdAt'),
      LawyerProfile.findOne({ userId: session.userId })
    ]);

    if (!user || !profile) {
      return res.status(404).json({ success: false, message: 'Profile not found.' });
    }

    // ── GET: profile + stats ─────────────────────────────────────────────────
    if (req.method === 'GET') {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const [statAgg, monthlyTrend] = await Promise.all([
        LawyerLead.aggregate([
          { $match: { lawyerId: profile._id } },
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ]),
        LawyerLead.aggregate([
          { $match: { lawyerId: profile._id, createdAt: { $gte: sixMonthsAgo } } },
          { $group: {
            _id:   { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
            count: { $sum: 1 },
            accepted:  { $sum: { $cond: [{ $eq: ['$status', 'accepted']  }, 1, 0] } },
            completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } }
          }},
          { $sort: { '_id.year': 1, '_id.month': 1 } }
        ])
      ]);

      const sc = {};
      statAgg.forEach(s => { sc[s._id] = s.count; });
      const completed   = sc.completed || 0;
      const accepted    = sc.accepted  || 0;
      const totalLeads  = Object.values(sc).reduce((a, b) => a + b, 0);
      const closureRate = (accepted + completed) > 0
        ? Math.round(completed / (accepted + completed) * 100)
        : 0;

      return res.json({
        success: true,
        user: {
          name:        user.name,
          email:       user.email,
          phone:       user.phone,
          status:      user.status,
          isVerified:  user.isVerified,
          memberSince: user.createdAt
        },
        profile: {
          id:                    profile._id,
          status:                profile.status,
          firmType:              profile.firmType,
          firmName:              profile.firmName,
          bio:                   profile.bio,
          profilePhoto:          profile.profilePhoto,
          linkedinUrl:           profile.linkedinUrl,
          websiteUrl:            profile.websiteUrl,
          barCouncilNumber:      profile.barCouncilNumber,
          barCouncilState:       profile.barCouncilState,
          yearsOfExperience:     profile.yearsOfExperience,
          highCourtJurisdiction: profile.highCourtJurisdiction,
          city:                  profile.city,
          district:              profile.district,
          state:                 profile.state,
          offices:               profile.offices               || [],
          primarySpecialization: profile.primarySpecialization,
          specializations:       profile.specializations       || [],
          courtsOfPractice:      profile.courtsOfPractice      || [],
          practiceType:          profile.practiceType,
          clientTypes:           profile.clientTypes           || [],
          languagesSpoken:       profile.languagesSpoken       || [],
          feeStructure:          profile.feeStructure          || {},
          availability:          profile.availability          || {},
          rejectionReason:       profile.rejectionReason       || '',
          createdAt:             profile.createdAt
        },
        stats: {
          totalLeads,
          new:          sc.new       || 0,
          active:       accepted,
          completed,
          rejected:     sc.rejected  || 0,
          closureRate,
          rating:       profile.stats?.rating       || 0,
          totalReviews: profile.stats?.totalReviews || 0,
          monthlyTrend
        }
      });
    }

    // ── PUT: update profile ──────────────────────────────────────────────────
    if (req.method === 'PUT') {
      const b = req.body || {};
      const updates = { updatedAt: new Date() };

      if (b.bio        !== undefined) updates.bio        = str(b.bio,  1000);
      if (b.linkedinUrl !== undefined) updates.linkedinUrl = str(b.linkedinUrl);
      if (b.websiteUrl  !== undefined) updates.websiteUrl  = str(b.websiteUrl);
      if (b.firmName    !== undefined) updates.firmName    = str(b.firmName, 150);

      if (b.feeStructure && typeof b.feeStructure === 'object') {
        updates.feeStructure = {
          consultationFee: num(b.feeStructure.consultationFee),
          hourlyRate:      num(b.feeStructure.hourlyRate),
          caseFilingFee:   num(b.feeStructure.caseFilingFee),
          minimumFee:      num(b.feeStructure.minimumFee),
          currency: 'INR'
        };
      }

      if (b.availability && typeof b.availability === 'object') {
        updates.availability = {
          days:  Array.isArray(b.availability.days)
            ? b.availability.days.filter(d => DAYS.includes(d))
            : (profile.availability?.days || []),
          hours: str(b.availability.hours, 50) || '10 AM – 6 PM'
        };
      }

      if (Array.isArray(b.languagesSpoken)) {
        updates.languagesSpoken = b.languagesSpoken.filter(l => LANGS.includes(l));
      }

      if (Array.isArray(b.offices)) {
        const offices = b.offices
          .filter(o => o && typeof o === 'object')
          .slice(0, 10)
          .map((o, i) => ({
            city:      str(o.city,    100),
            district:  str(o.district, 100),
            state:     str(o.state,   100),
            address:   str(o.address, 300),
            isPrimary: i === 0
          }))
          .filter(o => o.city && o.state);
        if (offices.length) {
          updates.offices  = offices;
          updates.city     = offices[0].city;
          updates.district = offices[0].district;
          updates.state    = offices[0].state;
        }
      }

      const updated = await LawyerProfile.findByIdAndUpdate(profile._id, updates, { new: true });
      return res.json({ success: true, message: 'Profile updated.', profile: updated });
    }

    return res.status(405).json({ success: false, message: 'Method not allowed.' });

  } catch (err) {
    console.error('[lawyer/me]', err.message);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};
