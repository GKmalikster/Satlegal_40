/**
 * api/lawyer.js — Merged lawyer endpoint
 *
 * GET  /api/lawyer/list     → public lawyer directory (was lawyer-list.js)
 * POST /api/lawyer/register → public registration (was lawyer-register.js)
 *
 * Vercel env vars required:
 *   MONGODB_URI  — MongoDB connection string
 *   AUTH_SECRET  — secret for HMAC token signing (falls back to ADMIN_SECRET)
 */

const crypto = require('crypto');
const { connectDB, getModels } = require('./_db');

// ═══════════════════════════════════════════════════════════════════════════════
// REGISTER helpers
// ═══════════════════════════════════════════════════════════════════════════════

const _secret = () => {
  const s = process.env.AUTH_SECRET || process.env.ADMIN_SECRET;
  if (!s) throw new Error('AUTH_SECRET not configured');
  return s;
};

function makeToken(userId, role) {
  const ts      = Date.now();
  const payload = `${userId}:${role}:${ts}`;
  const sig     = crypto.createHmac('sha256', _secret()).update(payload).digest('hex');
  return Buffer.from(payload).toString('base64url') + '.' + sig;
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

// Rate limiting — 10 registrations / 10 min per IP
const _rl = new Map();
function checkRate(ip) {
  const now = Date.now();
  const e   = _rl.get(ip) || { c: 0, t: now };
  if (now - e.t > 10 * 60 * 1000) { _rl.set(ip, { c: 1, t: now }); return true; }
  if (e.c >= 10) return false;
  e.c++; _rl.set(ip, e); return true;
}

// Validation helpers
const str = (v, max = 200) => (typeof v === 'string' ? v.trim() : '').slice(0, max);
const num = (v) => { const n = parseFloat(v); return isNaN(n) ? 0 : Math.max(0, n); };
const arr = (v, allowed) => {
  if (!Array.isArray(v)) return [];
  const clean = v.map(x => str(x, 100)).filter(Boolean);
  return allowed ? clean.filter(x => allowed.includes(x)) : clean;
};

const COURTS_ALLOWED = [
  'District Court', 'State High Court', 'Supreme Court of India',
  'NCDRC / State Consumer Forum', 'NCLT / NCLAT',
  'Income Tax Appellate Tribunal', 'Labour Court / Industrial Tribunal',
  'Armed Forces Tribunal', 'Revenue / Taluk Court'
];
const LANGS_ALLOWED = [
  'Hindi','English','Tamil','Telugu','Kannada','Malayalam',
  'Marathi','Bengali','Gujarati','Punjabi','Odia','Urdu','Assamese','Sanskrit'
];
const PRACTICE_TYPES = ['litigation', 'transactional', 'both'];
const CLIENT_TYPES   = ['Individuals','Startups / MSMEs','Corporates','NGOs / Trusts'];
const FIRM_TYPES     = ['solo', 'firm'];
const DAYS_ALLOWED   = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

// ═══════════════════════════════════════════════════════════════════════════════
// LIST helpers
// ═══════════════════════════════════════════════════════════════════════════════

// Escape regex special chars to prevent ReDoS
const esc = (v) => String(v || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&').slice(0, 100);

// ═══════════════════════════════════════════════════════════════════════════════
// HANDLER
// ═══════════════════════════════════════════════════════════════════════════════

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // ── GET: List approved lawyers ──────────────────────────────────────────────
  if (req.method === 'GET') {
    res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
    try {
      await connectDB();
      const { LawyerProfile } = getModels();

      const q      = req.query || {};
      const limit  = Math.min(parseInt(q.limit) || 50, 100);
      const page   = Math.max(parseInt(q.page)  || 1, 1);
      const skip   = (page - 1) * limit;

      const filter = { status: 'approved' };
      if (q.city)     filter.city     = { $regex: esc(q.city),     $options: 'i' };
      if (q.state)    filter.state    = { $regex: esc(q.state),    $options: 'i' };
      if (q.district) filter.district = { $regex: esc(q.district), $options: 'i' };
      if (q.spec) {
        const specRe = { $regex: esc(q.spec), $options: 'i' };
        filter.$or = [{ primarySpecialization: specRe }, { specializations: specRe }];
      }
      if (q.lang) filter.languagesSpoken = { $regex: esc(q.lang), $options: 'i' };
      if (q.practiceType && PRACTICE_TYPES.includes(q.practiceType)) {
        filter.practiceType = q.practiceType;
      }
      if (q.court)        filter.courtsOfPractice = q.court;
      if (q.bookable === '1') filter['feeStructure.consultationFee'] = { $gt: 0 };

      const [lawyers, total] = await Promise.all([
        LawyerProfile.find(filter)
          .sort({ 'stats.rating': -1, createdAt: -1 })
          .skip(skip).limit(limit)
          .select([
            'userId','firmType','firmName','city','district','state',
            'primarySpecialization','specializations','courtsOfPractice',
            'practiceType','clientTypes','languagesSpoken','yearsOfExperience',
            'feeStructure.consultationFee','feeStructure.currency',
            'availability','bio','profilePhoto','stats','linkedinUrl','websiteUrl','createdAt'
          ])
          .populate('userId', 'name email phone'),
        LawyerProfile.countDocuments(filter)
      ]);

      const results = lawyers.map(l => ({
        id:           l._id,
        name:         l.userId?.name  || 'Unknown',
        email:        l.userId?.email || '',
        phone:        l.userId?.phone || '',
        firmType:     l.firmType,
        firmName:     l.firmName,
        city:         l.city,
        district:     l.district,
        state:        l.state,
        primarySpec:  l.primarySpecialization,
        specs:        l.specializations    || [],
        courts:       l.courtsOfPractice   || [],
        practiceType: l.practiceType,
        clientTypes:  l.clientTypes        || [],
        languages:    l.languagesSpoken    || [],
        experience:   l.yearsOfExperience,
        consultFee:   l.feeStructure?.consultationFee || 0,
        currency:     l.feeStructure?.currency        || 'INR',
        availability: l.availability || {},
        bio:          l.bio          || '',
        photo:        l.profilePhoto || '',
        rating:       l.stats?.rating       || 0,
        reviews:      l.stats?.totalReviews || 0,
        linkedin:     l.linkedinUrl  || '',
        website:      l.websiteUrl   || ''
      }));

      return res.json({ success: true, total, page, pages: Math.ceil(total / limit), lawyers: results });

    } catch (err) {
      console.error('[lawyer/list]', err.message);
      return res.status(500).json({ success: false, message: 'Could not fetch lawyers.' });
    }
  }

  // ── POST: Register new lawyer ───────────────────────────────────────────────
  if (req.method === 'POST') {
    const ip = ((req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown')
      .split(',')[0].trim());
    if (!checkRate(ip)) {
      return res.status(429).json({ success: false, message: 'Too many registration attempts. Try again later.' });
    }

    try {
      const b = req.body || {};

      const name     = str(b.name, 100);
      const email    = str(b.email, 200).toLowerCase();
      const phone    = str(b.phone, 20).replace(/\D/g, '');
      const password = typeof b.password === 'string' ? b.password : '';

      if (!name || !email || !phone || !password) {
        return res.status(400).json({ success: false, message: 'Name, email, phone and password are required.' });
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ success: false, message: 'Invalid email address.' });
      }
      if (phone.length < 10) {
        return res.status(400).json({ success: false, message: 'Invalid phone number.' });
      }
      if (password.length < 8) {
        return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' });
      }

      const barCouncilNumber      = str(b.barCouncilNumber, 50);
      const barCouncilState       = str(b.barCouncilState, 100);
      const yearsOfExperience     = num(b.yearsOfExperience);
      const city                  = str(b.city, 100);
      const state                 = str(b.state, 100);
      const primarySpecialization = str(b.primarySpecialization, 100);

      if (!barCouncilNumber || !barCouncilState || !city || !state || !primarySpecialization) {
        return res.status(400).json({ success: false, message: 'Bar council details, city, state and primary specialization are required.' });
      }

      const firmType      = FIRM_TYPES.includes(b.firmType) ? b.firmType : 'solo';
      const firmName      = str(b.firmName, 150);
      const district      = str(b.district, 100);
      const bio           = str(b.bio, 1000);
      const linkedinUrl   = str(b.linkedinUrl, 300);
      const websiteUrl    = str(b.websiteUrl, 300);
      const practiceType  = PRACTICE_TYPES.includes(b.practiceType) ? b.practiceType : 'both';

      const specializations  = arr(b.specializations);
      const courtsOfPractice = arr(b.courtsOfPractice, COURTS_ALLOWED);
      const clientTypes      = arr(b.clientTypes, CLIENT_TYPES);
      const languagesSpoken  = arr(b.languagesSpoken, LANGS_ALLOWED);
      const availDays        = arr(b.availabilityDays, DAYS_ALLOWED);
      const availHours       = str(b.availabilityHours, 50) || '10 AM – 6 PM';

      // ── Multi-office locations ────────────────────────────────
      const rawOffices = Array.isArray(b.offices) ? b.offices : [];
      const offices = rawOffices
        .filter(o => o && typeof o === 'object')
        .slice(0, 10) // max 10 offices
        .map((o, i) => ({
          city:      str(o.city, 100),
          district:  str(o.district, 100),
          state:     str(o.state, 100),
          address:   str(o.address, 300),
          isPrimary: i === 0
        }))
        .filter(o => o.city && o.state);

      const feeStructure = {
        consultationFee: num(b.consultationFee),
        hourlyRate:      num(b.hourlyRate),
        caseFilingFee:   num(b.caseFilingFee),
        minimumFee:      num(b.minimumFee),
        currency: 'INR'
      };

      await connectDB();
      const { User, LawyerProfile } = getModels();

      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(409).json({ success: false, message: 'An account with this email already exists. Please log in.' });
      }
      const existingBar = await LawyerProfile.findOne({ barCouncilNumber });
      if (existingBar) {
        return res.status(409).json({ success: false, message: 'This Bar Council number is already registered.' });
      }

      const hashed = hashPassword(password);
      const user = await User.create({
        name, email, phone, password: hashed,
        role: 'lawyer', state, city, status: 'active', isVerified: false
      });

      await LawyerProfile.create({
        userId: user._id, barCouncilNumber, barCouncilState, yearsOfExperience,
        city, district, state,
        offices: offices.length ? offices : [{ city, district, state, isPrimary: true }],
        firmType, firmName, primarySpecialization,
        specializations, courtsOfPractice, practiceType, clientTypes, languagesSpoken,
        bio, linkedinUrl, websiteUrl, feeStructure,
        availability: { days: availDays, hours: availHours },
        status: 'pending_review'
      });

      const token = makeToken(user._id.toString(), 'lawyer');
      console.log('[lawyer/register] new registration:', email.slice(0, 3) + '***');

      return res.status(201).json({
        success: true,
        message: 'Registration successful! Your profile is under review.',
        token,
        user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: 'lawyer', status: 'pending_review' }
      });

    } catch (err) {
      console.error('[lawyer/register]', err.message);
      if (err.code === 11000) {
        const field = Object.keys(err.keyPattern || {})[0] || 'field';
        return res.status(409).json({ success: false, message: `Duplicate ${field}. This value is already registered.` });
      }
      return res.status(500).json({ success: false, message: 'Registration failed. Please try again.' });
    }
  }

  return res.status(405).json({ success: false, message: 'Method not allowed' });
};
