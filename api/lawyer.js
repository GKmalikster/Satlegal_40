/**
 * api/lawyer.js — Merged lawyer endpoint
 *
 * GET   /api/lawyer/list     → public lawyer directory
 * POST  /api/lawyer/register → public registration
 * POST  /api/lawyer/match    → create CaseInquiry + auto-match top 5 lawyers
 * GET   /api/lawyer/slots    → available 30-min slots for a lawyer on a date
 * POST  /api/lawyer/book     → book a consultation slot
 * GET   /api/lawyer/bookings → list appointments for authenticated lawyer
 * PATCH /api/lawyer/bookings → update appointment status/meetingLink
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
// SHARED AUTH (lawyer token verification — same logic as leads.js / me.js)
// ═══════════════════════════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════════════════════════
// MATCHING helpers
// ═══════════════════════════════════════════════════════════════════════════════

// Map caseTypes (from analyse.js) to primarySpecialization values
const SPEC_MAP = {
  'Civil Litigation':              ['Civil','Contract','SARFAESI','Arbitration','Defamation','Cheque','PIL','Constitutional','Succession','Specific Performance','Money Recovery','Partition','Mental Healthcare','MTP','MGNREGA','Senior Citizen'],
  'Criminal Litigation':           ['Criminal','BNS','POCSO','SC/ST','Police','Medical Negligence','Rape','Corruption','Cyber','Domestic Violence'],
  'Real Estate Law':               ['Property','RERA','Rent','Land','Boundary','Encroachment','Real Estate'],
  'Labour & Employment Law':       ['Employment','Labour','MSME','Shops','Maternity'],
  'Family Law':                    ['Family','Divorce','Custody','Domestic Violence','Maintenance','Adoption'],
  'Estate, Succession and Trust Law': ['Succession','Inheritance','Will','Probate','Trust'],
  'Cyber Crime Law':               ['Cyber','Digital','Data Privacy','DPDP','Online Fraud'],
  'Intellectual Property Law':     ['Intellectual Property','IP','Trademark','Copyright','Patent'],
  'Consumer Dispute Law':          ['Consumer','Motor Accident','Product Defect'],
  'Data and Privacy Law':          ['Data','Privacy','DPDP','Aadhaar','Cyber']
};

function scoreLawyer(lawyer, caseTypes = [], userState = '', userCity = '') {
  let score = 0;
  const ps  = (lawyer.primarySpecialization || '').toLowerCase();
  const sps = (lawyer.specializations || []).map(s => s.toLowerCase());

  // Specialization match
  for (const ct of caseTypes) {
    const ctLow = ct.toLowerCase();
    if (ps.includes(ctLow) || ctLow.includes(ps)) score += 40;
    for (const kw of (SPEC_MAP[lawyer.primarySpecialization] || [])) {
      if (ctLow.includes(kw.toLowerCase()) || kw.toLowerCase().includes(ctLow.split(' ')[0])) {
        score += 30; break;
      }
    }
    for (const sp of sps) {
      if (ctLow.includes(sp) || sp.includes(ctLow.split(' ')[0])) { score += 20; break; }
    }
  }

  // Location match
  if (userState && lawyer.state && lawyer.state.toLowerCase() === userState.toLowerCase()) score += 15;
  if (userCity  && lawyer.city  && lawyer.city.toLowerCase()  === userCity.toLowerCase())  score += 10;

  // Experience bonus
  const yoe = lawyer.yearsOfExperience || 0;
  if (yoe >= 10) score += 10;
  else if (yoe >= 5) score += 5;

  // Rating bonus (0–5 → 0–10 pts)
  score += Math.round((lawyer.stats?.rating || 0) * 2);

  return score;
}

// Generate all 30-min slots between startTime and endTime (both 'HH:MM' 24h)
function generateSlots(startTime, endTime) {
  const slots = [];
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  let cur = sh * 60 + sm;
  const end = eh * 60 + em;
  while (cur + 30 <= end) {
    const hh = String(Math.floor(cur / 60)).padStart(2, '0');
    const mm = String(cur % 60).padStart(2, '0');
    slots.push(`${hh}:${mm}`);
    cur += 30;
  }
  return slots;
}

function dayName(date) {
  return ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][new Date(date).getDay()];
}

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
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // Route by path
  const path = (req.url || '').split('?')[0].replace(/\/$/, '');

  // ── POST /api/lawyer/match — create inquiry + auto-match top lawyers ─────────
  if (path === '/api/lawyer/match' && req.method === 'POST') {
    try {
      const b = req.body || {};
      const { description, applicableLaws = [], documents = [], probabilityScores = [],
              userState = '', userCity = '', userName = '', userEmail = '', userPhone = '',
              userId } = b;

      if (!description || String(description).length < 10) {
        return res.status(400).json({ success: false, message: 'Description required.' });
      }

      await connectDB();
      const { LawyerProfile, CaseInquiry, LawyerLead } = getModels();

      // Create the CaseInquiry record
      const inquiryId = 'INQ-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
      const inquiry = await CaseInquiry.create({
        userId:     userId || new (require('mongoose').Types.ObjectId)(),
        inquiryId,
        description: String(description).slice(0, 5000),
        applicableLaws,
        probabilityScores,
        documents,
        status: 'lawyer_requested',
        lawyerRequested: true,
        requestedAt: new Date()
      });

      // Find approved lawyers with a weekly schedule
      const allLawyers = await LawyerProfile.find({ status: 'approved' })
        .select('userId primarySpecialization specializations state city yearsOfExperience stats weeklySchedule');

      const caseTypes = applicableLaws.map(l => l.caseType || '').filter(Boolean);

      // Score and rank
      const ranked = allLawyers
        .map(l => ({ lawyer: l, score: scoreLawyer(l, caseTypes, userState, userCity) }))
        .filter(x => x.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);

      // Create LawyerLead for each match
      const leads = [];
      for (const { lawyer } of ranked) {
        const leadId = 'LD-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
        const lead = await LawyerLead.create({
          leadId,
          lawyerId:    lawyer._id,
          userId:      inquiry.userId,
          inquiryId:   inquiry._id,
          caseTypes,
          description: String(description).slice(0, 500),
          urgency:     'medium',
          userName:    userName || 'Anonymous',
          userEmail:   userEmail || '',
          userPhone:   userPhone || '',
          status:      'new'
        });
        leads.push({ lawyerId: lawyer._id, leadId: lead.leadId });
      }

      return res.json({
        success: true,
        inquiryId: inquiry.inquiryId,
        inquiryDbId: inquiry._id,
        matchedCount: leads.length,
        leads
      });

    } catch (err) {
      console.error('[lawyer/match]', err.message);
      return res.status(500).json({ success: false, message: 'Matching failed.' });
    }
  }

  // ── GET /api/lawyer/slots — available slots for a lawyer on a date ────────────
  if (path === '/api/lawyer/slots' && req.method === 'GET') {
    try {
      const { lawyerId, date } = req.query || {};
      if (!lawyerId || !date) {
        return res.status(400).json({ success: false, message: 'lawyerId and date required.' });
      }
      // Validate date format
      const d = new Date(date);
      if (isNaN(d.getTime())) {
        return res.status(400).json({ success: false, message: 'Invalid date.' });
      }
      // Block booking today or in the past
      const today = new Date(); today.setHours(0,0,0,0);
      if (d < today) {
        return res.json({ success: true, slots: [], reason: 'past' });
      }

      await connectDB();
      const { LawyerProfile, Appointment } = getModels();

      const profile = await LawyerProfile.findById(lawyerId)
        .select('weeklySchedule blockedDates status');

      if (!profile || profile.status !== 'approved') {
        return res.json({ success: true, slots: [], reason: 'unavailable' });
      }

      const dayOfWeek = dayName(date);
      const schedule  = (profile.weeklySchedule || []).find(s => s.day === dayOfWeek && s.isActive);

      if (!schedule) {
        return res.json({ success: true, slots: [], reason: 'not_available_on_day' });
      }

      // Check if blocked date
      const isBlocked = (profile.blockedDates || []).some(bd => {
        const bd2 = new Date(bd); bd2.setHours(0,0,0,0);
        return bd2.getTime() === d.getTime();
      });
      if (isBlocked) {
        return res.json({ success: true, slots: [], reason: 'blocked' });
      }

      // Get all booked slots for this lawyer on this date
      const dateStart = new Date(date); dateStart.setHours(0,0,0,0);
      const dateEnd   = new Date(date); dateEnd.setHours(23,59,59,999);
      const booked = await Appointment.find({
        lawyerId: profile._id,
        slotDate: { $gte: dateStart, $lte: dateEnd },
        status:   { $in: ['pending', 'confirmed'] }
      }).select('slotTime');

      const bookedTimes = new Set(booked.map(b => b.slotTime));
      const allSlots    = generateSlots(schedule.startTime, schedule.endTime);
      const available   = allSlots.filter(s => !bookedTimes.has(s));

      return res.json({ success: true, slots: available, day: dayOfWeek, date });

    } catch (err) {
      console.error('[lawyer/slots]', err.message);
      return res.status(500).json({ success: false, message: 'Could not fetch slots.' });
    }
  }

  // ── POST /api/lawyer/book — book a slot ───────────────────────────────────────
  if (path === '/api/lawyer/book' && req.method === 'POST') {
    try {
      const b = req.body || {};
      const { lawyerId, date, slotTime, userName, userEmail, userPhone, userNotes, caseType, inquiryId } = b;

      if (!lawyerId || !date || !slotTime || !userName || !userEmail) {
        return res.status(400).json({ success: false, message: 'lawyerId, date, slotTime, userName and userEmail are required.' });
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail)) {
        return res.status(400).json({ success: false, message: 'Invalid email.' });
      }

      const slotDate = new Date(date);
      if (isNaN(slotDate.getTime())) {
        return res.status(400).json({ success: false, message: 'Invalid date.' });
      }
      slotDate.setHours(0,0,0,0);

      await connectDB();
      const { LawyerProfile, Appointment, CaseInquiry } = getModels();

      const profile = await LawyerProfile.findById(lawyerId).select('weeklySchedule blockedDates status');
      if (!profile || profile.status !== 'approved') {
        return res.status(404).json({ success: false, message: 'Lawyer not available.' });
      }

      // Verify slot is still available
      const existing = await Appointment.findOne({
        lawyerId: profile._id,
        slotDate,
        slotTime,
        status: { $in: ['pending', 'confirmed'] }
      });
      if (existing) {
        return res.status(409).json({ success: false, message: 'This slot is no longer available. Please choose another.' });
      }

      const appointmentId = 'APT-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();

      // Resolve inquiryId if passed as string
      let inquiryDbId = null;
      if (inquiryId) {
        const inq = await CaseInquiry.findOne({ inquiryId }).select('_id');
        if (inq) inquiryDbId = inq._id;
      }

      const appointment = await Appointment.create({
        appointmentId,
        lawyerId:  profile._id,
        inquiryId: inquiryDbId,
        userName:  String(userName).slice(0, 100),
        userEmail: String(userEmail).slice(0, 200).toLowerCase(),
        userPhone: String(userPhone || '').replace(/\D/g, '').slice(0, 15),
        slotDate,
        slotTime,
        duration: 30,
        caseType: String(caseType || '').slice(0, 100),
        userNotes: String(userNotes || '').slice(0, 1000),
        status: 'pending'
      });

      return res.status(201).json({
        success: true,
        message: 'Appointment booked. The lawyer will confirm shortly.',
        appointmentId: appointment.appointmentId,
        slotDate: date,
        slotTime
      });

    } catch (err) {
      console.error('[lawyer/book]', err.message);
      return res.status(500).json({ success: false, message: 'Booking failed. Please try again.' });
    }
  }

  // ── GET /api/lawyer/bookings — appointments for authenticated lawyer ───────────
  if (path === '/api/lawyer/bookings' && req.method === 'GET') {
    const session = verifyLawyer(req);
    if (!session) return res.status(401).json({ success: false, message: 'Authentication required.' });

    try {
      await connectDB();
      const { LawyerProfile, Appointment } = getModels();

      const profile = await LawyerProfile.findOne({ userId: session.userId }).select('_id');
      if (!profile) return res.status(404).json({ success: false, message: 'Profile not found.' });

      const q        = req.query || {};
      const status   = q.status;
      const upcoming = q.upcoming === '1';
      const filter   = { lawyerId: profile._id };

      if (status && ['pending','confirmed','cancelled','completed','no_show'].includes(status)) {
        filter.status = status;
      }
      if (upcoming) {
        const now = new Date(); now.setHours(0,0,0,0);
        filter.slotDate = { $gte: now };
        filter.status   = { $in: ['pending','confirmed'] };
      }

      const appointments = await Appointment.find(filter)
        .sort({ slotDate: 1, slotTime: 1 })
        .limit(100);

      return res.json({ success: true, appointments });

    } catch (err) {
      console.error('[lawyer/bookings]', err.message);
      return res.status(500).json({ success: false, message: 'Could not fetch bookings.' });
    }
  }

  // ── PATCH /api/lawyer/bookings — update appointment status / meetingLink ──────
  if (path === '/api/lawyer/bookings' && req.method === 'PATCH') {
    const session = verifyLawyer(req);
    if (!session) return res.status(401).json({ success: false, message: 'Authentication required.' });

    try {
      const b = req.body || {};
      const { appointmentId, status, meetingLink, lawyerNotes } = b;
      if (!appointmentId) return res.status(400).json({ success: false, message: 'appointmentId required.' });

      await connectDB();
      const { LawyerProfile, Appointment } = getModels();

      const profile = await LawyerProfile.findOne({ userId: session.userId }).select('_id');
      if (!profile) return res.status(404).json({ success: false, message: 'Profile not found.' });

      const apt = await Appointment.findOne({ _id: appointmentId, lawyerId: profile._id });
      if (!apt) return res.status(404).json({ success: false, message: 'Appointment not found.' });

      const updates = { updatedAt: new Date() };
      const VALID_APT = ['pending', 'confirmed', 'cancelled', 'completed', 'no_show'];
      if (status && VALID_APT.includes(status)) updates.status = status;
      if (typeof meetingLink === 'string') updates.meetingLink  = meetingLink.slice(0, 500);
      if (typeof lawyerNotes === 'string') updates.lawyerNotes  = lawyerNotes.slice(0, 1000);

      const updated = await Appointment.findByIdAndUpdate(appointmentId, updates, { new: true });
      return res.json({ success: true, appointment: updated });

    } catch (err) {
      console.error('[lawyer/bookings PATCH]', err.message);
      return res.status(500).json({ success: false, message: 'Update failed.' });
    }
  }

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
