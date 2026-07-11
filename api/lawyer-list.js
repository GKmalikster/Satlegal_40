/**
 * GET /api/lawyer/list
 * Public — no auth required.
 *
 * Returns approved lawyers with optional filters:
 *   ?city=&state=&district=&spec=&lang=&practiceType=&court=&limit=&page=
 *
 * Used by lawyers.html (directory) and consultation/book.html (booking).
 */

const { connectDB, getModels } = require('./_db');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET')    return res.status(405).json({ success: false, message: 'Method not allowed' });

  try {
    await connectDB();
    const { User, LawyerProfile } = getModels();

    // Parse query params — sanitise to prevent ReDoS
    const esc = (v) => String(v || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&').slice(0, 100);
    const q   = req.query || {};
    const limit  = Math.min(parseInt(q.limit) || 50, 100);
    const page   = Math.max(parseInt(q.page) || 1, 1);
    const skip   = (page - 1) * limit;

    // Build filter — only approved lawyers are public
    const filter = { status: 'approved' };

    if (q.city)  filter.city  = { $regex: esc(q.city),  $options: 'i' };
    if (q.state) filter.state = { $regex: esc(q.state), $options: 'i' };
    if (q.district) filter.district = { $regex: esc(q.district), $options: 'i' };

    if (q.spec) {
      const specRe = { $regex: esc(q.spec), $options: 'i' };
      filter.$or = [
        { primarySpecialization: specRe },
        { specializations: specRe }
      ];
    }
    if (q.lang) {
      filter.languagesSpoken = { $regex: esc(q.lang), $options: 'i' };
    }
    if (q.practiceType && ['litigation','transactional','both'].includes(q.practiceType)) {
      filter.practiceType = q.practiceType;
    }
    if (q.court) {
      filter.courtsOfPractice = q.court;
    }
    // Booking-mode: only show lawyers with a set consultation fee
    if (q.bookable === '1') {
      filter['feeStructure.consultationFee'] = { $gt: 0 };
    }

    const [lawyers, total] = await Promise.all([
      LawyerProfile.find(filter)
        .sort({ 'stats.rating': -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select([
          'userId', 'firmType', 'firmName',
          'city', 'district', 'state',
          'primarySpecialization', 'specializations',
          'courtsOfPractice', 'practiceType', 'clientTypes',
          'languagesSpoken', 'yearsOfExperience',
          'feeStructure.consultationFee', 'feeStructure.currency',
          'availability', 'bio', 'profilePhoto', 'stats',
          'linkedinUrl', 'websiteUrl', 'createdAt'
        ])
        .populate('userId', 'name email phone'),
      LawyerProfile.countDocuments(filter)
    ]);

    // Shape output — never expose raw DB IDs to public unnecessarily
    const results = lawyers.map(l => ({
      id:           l._id,
      name:         l.userId?.name   || 'Unknown',
      email:        l.userId?.email  || '',
      phone:        l.userId?.phone  || '',
      firmType:     l.firmType,
      firmName:     l.firmName,
      city:         l.city,
      district:     l.district,
      state:        l.state,
      primarySpec:  l.primarySpecialization,
      specs:        l.specializations || [],
      courts:       l.courtsOfPractice || [],
      practiceType: l.practiceType,
      clientTypes:  l.clientTypes || [],
      languages:    l.languagesSpoken || [],
      experience:   l.yearsOfExperience,
      consultFee:   l.feeStructure?.consultationFee || 0,
      currency:     l.feeStructure?.currency || 'INR',
      availability: l.availability || {},
      bio:          l.bio || '',
      photo:        l.profilePhoto || '',
      rating:       l.stats?.rating || 0,
      reviews:      l.stats?.totalReviews || 0,
      linkedin:     l.linkedinUrl || '',
      website:      l.websiteUrl || ''
    }));

    return res.json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      lawyers: results
    });

  } catch (err) {
    console.error('[lawyer-list]', err.message);
    return res.status(500).json({ success: false, message: 'Could not fetch lawyers.' });
  }
};
