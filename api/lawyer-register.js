/**
 * POST /api/lawyer/register
 * Public — no auth required.
 *
 * Creates a User (role=lawyer) + LawyerProfile (status=pending_review).
 * Returns a session token so the lawyer can view their dashboard immediately.
 *
 * Vercel env vars required:
 *   MONGODB_URI  — MongoDB connection string
 *   AUTH_SECRET  — secret for HMAC token signing (falls back to ADMIN_SECRET)
 */

const crypto = require('crypto');
const { connectDB, getModels } = require('./_db');

// ── Token helpers ─────────────────────────────────────────────────────────────
// Uses same pattern as admin-login.js but for lawyer/user sessions.
// Token format: base64url(userId:role:timestamp).HMAC-SHA256
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

// ── Password hashing (no bcrypt — use Node built-in scrypt) ──────────────────
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

// ── Rate limiting (10 registrations / 10 min per IP) ─────────────────────────
const _rl = new Map();
function checkRate(ip) {
  const now = Date.now();
  const e   = _rl.get(ip) || { c: 0, t: now };
  if (now - e.t > 10 * 60 * 1000) { _rl.set(ip, { c: 1, t: now }); return true; }
  if (e.c >= 10) return false;
  e.c++; _rl.set(ip, e); return true;
}

// ── Validation helpers ────────────────────────────────────────────────────────
const str   = (v, max = 200) => (typeof v === 'string' ? v.trim() : '').slice(0, max);
const num   = (v) => { const n = parseFloat(v); return isNaN(n) ? 0 : Math.max(0, n); };
const arr   = (v, allowed) => {
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
const PRACTICE_TYPES  = ['litigation', 'transactional', 'both'];
const CLIENT_TYPES    = ['Individuals','Startups / MSMEs','Corporates','NGOs / Trusts'];
const FIRM_TYPES      = ['solo', 'firm'];
const DAYS_ALLOWED    = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')   return res.status(405).json({ success: false, message: 'Method not allowed' });

  // Rate limit
  const ip = ((req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown')
    .split(',')[0].trim());
  if (!checkRate(ip)) {
    return res.status(429).json({ success: false, message: 'Too many registration attempts. Try again later.' });
  }

  try {
    // ── Parse & validate body ───────────────────────────────────────────────
    const b = req.body || {};

    // Required user fields
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

    // Required lawyer fields
    const barCouncilNumber = str(b.barCouncilNumber, 50);
    const barCouncilState  = str(b.barCouncilState, 100);
    const yearsOfExperience = num(b.yearsOfExperience);
    const city              = str(b.city, 100);
    const state             = str(b.state, 100);
    const primarySpecialization = str(b.primarySpecialization, 100);

    if (!barCouncilNumber || !barCouncilState || !city || !state || !primarySpecialization) {
      return res.status(400).json({ success: false, message: 'Bar council details, city, state and primary specialization are required.' });
    }

    // Optional / segmentation fields
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

    const feeStructure = {
      consultationFee: num(b.consultationFee),
      hourlyRate:      num(b.hourlyRate),
      caseFilingFee:   num(b.caseFilingFee),
      minimumFee:      num(b.minimumFee),
      currency: 'INR'
    };

    // ── Connect + check duplicate email / bar council ───────────────────────
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

    // ── Create User ──────────────────────────────────────────────────────────
    const hashed = hashPassword(password);
    const user = await User.create({
      name,
      email,
      phone,
      password: hashed,
      role: 'lawyer',
      state,
      city,
      status: 'active',
      isVerified: false
    });

    // ── Create LawyerProfile ─────────────────────────────────────────────────
    await LawyerProfile.create({
      userId: user._id,
      barCouncilNumber,
      barCouncilState,
      yearsOfExperience,
      city,
      district,
      state,
      firmType,
      firmName,
      primarySpecialization,
      specializations,
      courtsOfPractice,
      practiceType,
      clientTypes,
      languagesSpoken,
      bio,
      linkedinUrl,
      websiteUrl,
      feeStructure,
      availability: { days: availDays, hours: availHours },
      status: 'pending_review'
    });

    // ── Issue session token ───────────────────────────────────────────────────
    const token = makeToken(user._id.toString(), 'lawyer');

    console.log('[lawyer-register] new registration:', email.slice(0, 3) + '***', '| barCouncil:', barCouncilNumber.slice(0, 4) + '***');

    return res.status(201).json({
      success: true,
      message: 'Registration successful! Your profile is under review.',
      token,
      user: {
        id:    user._id,
        name:  user.name,
        email: user.email,
        phone: user.phone,
        role:  'lawyer',
        status: 'pending_review'
      }
    });

  } catch (err) {
    console.error('[lawyer-register]', err.message);
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern || {})[0] || 'field';
      return res.status(409).json({ success: false, message: `Duplicate ${field}. This value is already registered.` });
    }
    return res.status(500).json({ success: false, message: 'Registration failed. Please try again.' });
  }
};
