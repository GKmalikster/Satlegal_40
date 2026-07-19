const mongoose = require('mongoose');

// ═══════════════════════════════════════════════════════════════
// USER MODEL
// ═══════════════════════════════════════════════════════════════

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  role: { type: String, enum: ['user', 'lawyer', 'admin'], default: 'user' },
  gender: { type: String, enum: ['male', 'female', 'other', 'prefer_not_to_say'], default: 'prefer_not_to_say' },
  state: { type: String, default: '' },
  city: { type: String, default: '' },
  userType: { type: String, enum: ['individual', 'business', 'ngo', 'student', 'other'], default: 'individual' },
  status: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' },
  isVerified: { type: Boolean, default: false },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  createdAt: { type: Date, default: Date.now },
  lastLogin: Date,
  profileCompleted: { type: Boolean, default: false }
});

// ═══════════════════════════════════════════════════════════════
// LAWYER PROFILE MODEL (enhanced with segmentation fields)
// ═══════════════════════════════════════════════════════════════

const LawyerProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },

  // ── Personal & Firm ──────────────────────────────────────────
  firmName: { type: String, default: '' },
  firmType: { type: String, enum: ['solo', 'firm'], default: 'solo' },
  bio: { type: String, default: '' },
  profilePhoto: { type: String, default: '' },
  linkedinUrl: { type: String, default: '' },
  websiteUrl: { type: String, default: '' },

  // ── Bar Council Details ──────────────────────────────────────
  barCouncilNumber: { type: String, required: true, unique: true },
  barCouncilState: { type: String, required: true },
  yearsOfExperience: { type: Number, required: true },

  // ── Primary Location (from first office — kept for backward compat & indexing) ─
  city: { type: String, required: true },
  district: { type: String, default: '' },
  state: { type: String, required: true },
  highCourtJurisdiction: { type: String, default: '' },

  // ── Office Locations (multi-office support) ──────────────────
  offices: [{
    city:      { type: String, required: true },
    district:  { type: String, default: '' },
    state:     { type: String, required: true },
    address:   { type: String, default: '' },
    isPrimary: { type: Boolean, default: false }
  }],

  // ── Legal Expertise ──────────────────────────────────────────
  primarySpecialization: {
    type: String,
    required: true,
    enum: [
      'Civil Litigation',
      'Criminal Litigation',
      'Real Estate Law',
      'Labour & Employment Law',
      'Family Law',
      'Estate, Succession and Trust Law',
      'Cyber Crime Law',
      'Intellectual Property Law',
      'Consumer Dispute Law',
      'Data and Privacy Law'
    ]
  },
  specializations: [{ type: String }],       // Sub-specializations

  // Courts practicing in (checkboxes)
  courtsOfPractice: [{
    type: String,
    enum: [
      'District Court',
      'State High Court',
      'Supreme Court of India',
      'NCDRC / State Consumer Forum',
      'NCLT / NCLAT',
      'Income Tax Appellate Tribunal',
      'Labour Court / Industrial Tribunal',
      'Armed Forces Tribunal',
      'Revenue / Taluk Court'
    ]
  }],

  // ── Practice Type ─────────────────────────────────────────────
  practiceType: {
    type: String,
    enum: ['litigation', 'transactional', 'both'],
    default: 'both'
  },

  // ── Client Types ──────────────────────────────────────────────
  clientTypes: [{
    type: String,
    enum: ['Individuals', 'Startups / MSMEs', 'Corporates', 'NGOs / Trusts']
  }],

  // ── Languages ─────────────────────────────────────────────────
  languagesSpoken: [{ type: String }],  // replaces old 'languages' array; checkbox-driven

  // ── Fee Structure ─────────────────────────────────────────────
  feeStructure: {
    consultationFee: { type: Number, default: 0 },
    hourlyRate:      { type: Number, default: 0 },
    caseFilingFee:   { type: Number, default: 0 },
    minimumFee:      { type: Number, default: 0 },
    currency:        { type: String, default: 'INR' }
  },

  // ── Availability ──────────────────────────────────────────────
  availability: {
    days:  [String],      // ['Monday', 'Tuesday', ...]
    hours: { type: String, default: '10 AM – 6 PM' }
  },

  // ── Weekly schedule (30-min booking slots) ────────────────────
  weeklySchedule: [{
    day:       { type: String, enum: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'] },
    startTime: { type: String, default: '10:00' },  // 'HH:MM' 24h
    endTime:   { type: String, default: '18:00' },
    isActive:  { type: Boolean, default: true }
  }],
  blockedDates: [{ type: Date }],  // vacation / holiday dates

  // ── Verification & Status ─────────────────────────────────────
  status: { type: String, enum: ['pending_review', 'approved', 'rejected', 'suspended'], default: 'pending_review' },
  isVerified: { type: Boolean, default: false },
  verificationDocuments: [{
    docType: { type: String },
    url: String,
    uploadedAt: Date
  }],
  rejectionReason: { type: String, default: '' },

  // ── Stats ─────────────────────────────────────────────────────
  stats: {
    totalLeads:     { type: Number, default: 0 },
    acceptedLeads:  { type: Number, default: 0 },
    completedCases: { type: Number, default: 0 },
    rating:         { type: Number, default: 0 },
    totalReviews:   { type: Number, default: 0 }
  },

  // ── Bank Details (for payouts) ────────────────────────────────
  bankDetails: {
    accountNumber:       String,
    ifscCode:            String,
    accountHolderName:   String,
    bankName:            String
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// ═══════════════════════════════════════════════════════════════
// CASE INQUIRY MODEL
// ═══════════════════════════════════════════════════════════════

const CaseInquirySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  inquiryId: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  applicableLaws: [{
    caseType:     { type: String, required: true },
    lawCategory:  String,
    confidence:   { type: Number, required: true },
    lawSections:  [String],
    actName:      String,
    priority:     { type: Number, default: 1 }
  }],
  selectedLaws: [{ type: String }],
  assessments: [{
    caseType: String,
    questions: [{
      question: String,
      answer: String,
      answeredAt: Date
    }],
    completedAt: Date
  }],
  documents: [{
    caseType:     String,
    documentName: String,
    isUploaded:   { type: Boolean, default: false },
    uploadedFile: String,
    uploadedAt:   Date
  }],
  probabilityScores: [{
    caseType: String,
    overallScore: Number,
    components: {
      evidence:      Number,
      legalStrength: Number,
      procedural:    Number,
      precedent:     Number
    },
    calculatedAt: Date
  }],
  status: {
    type: String,
    enum: ['draft', 'analyzing', 'assessed', 'lawyer_requested', 'no_match', 'abandoned', 'completed', 'archived'],
    default: 'draft'
  },
  lawyerRequested:   { type: Boolean, default: false },
  requestedLawyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'LawyerProfile' },
  requestedAt:       Date,
  // Matching metadata
  matchedCount:      { type: Number, default: 0 },   // how many lawyer leads were created
  matchType:         { type: String, enum: ['exact', 'soft', 'none'], default: 'none' },
  notifyEmail:       { type: String, default: '' },   // captured when user wants to be notified
  createdAt:         { type: Date, default: Date.now },
  updatedAt:         { type: Date, default: Date.now }
});

// ═══════════════════════════════════════════════════════════════
// LAWYER LEAD MODEL
// ═══════════════════════════════════════════════════════════════

const LawyerLeadSchema = new mongoose.Schema({
  leadId:    { type: String, required: true, unique: true },
  lawyerId:  { type: mongoose.Schema.Types.ObjectId, ref: 'LawyerProfile', required: true },
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  inquiryId: { type: mongoose.Schema.Types.ObjectId, ref: 'CaseInquiry', required: true },
  caseTypes: [String],
  description: String,
  urgency: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  userName:    String,
  userEmail:   String,
  userPhone:   String,
  userMessage: String,
  status: {
    type: String,
    enum: ['new', 'viewed', 'accepted', 'rejected', 'completed', 'cancelled'],
    default: 'new'
  },
  viewedAt:    Date,
  respondedAt: Date,
  lawyerNotes: String,
  quotedFee: {
    amount:      Number,
    description: String,
    currency:    { type: String, default: 'INR' }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// ═══════════════════════════════════════════════════════════════
// APPOINTMENT / BOOKING MODEL
// ═══════════════════════════════════════════════════════════════

const AppointmentSchema = new mongoose.Schema({
  appointmentId: { type: String, required: true, unique: true },
  lawyerId:      { type: mongoose.Schema.Types.ObjectId, ref: 'LawyerProfile', required: true },
  inquiryId:     { type: mongoose.Schema.Types.ObjectId, ref: 'CaseInquiry', default: null },
  userId:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  userName:      { type: String, required: true },
  userEmail:     { type: String, required: true },
  userPhone:     { type: String, default: '' },
  slotDate:      { type: Date, required: true },     // date of appointment (UTC midnight)
  slotTime:      { type: String, required: true },   // '10:00', '10:30', etc.
  duration:      { type: Number, default: 30 },      // minutes
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no_show'],
    default: 'pending'
  },
  caseType:    { type: String, default: '' },
  userNotes:   { type: String, default: '' },
  lawyerNotes: { type: String, default: '' },
  meetingLink: { type: String, default: '' },
  createdAt:   { type: Date, default: Date.now },
  updatedAt:   { type: Date, default: Date.now }
});

// ═══════════════════════════════════════════════════════════════
// ANALYTICS EVENT MODEL
// ═══════════════════════════════════════════════════════════════

const AnalyticsEventSchema = new mongoose.Schema({
  type: {
    type: String, required: true,
    enum: ['law_query','step_complete','step_abandon','unmatched_query','page_view','chat_query']
  },
  data:      { type: mongoose.Schema.Types.Mixed },
  sessionId: String,
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  page:      String,
  ip:        String,
  userAgent: String,
  ts:        { type: Date, default: Date.now }
});

// ═══════════════════════════════════════════════════════════════
// SEARCH QUERY MODEL
// ═══════════════════════════════════════════════════════════════

const SearchQuerySchema = new mongoose.Schema({
  query:         { type: String, required: true, trim: true },
  detectedLaws:  [{ type: String }],
  lawCategories: [{ type: String }],
  topConfidence: { type: Number, default: 0 },
  source:        { type: String, enum: ['wizard','legal_topics','chatbot','reference_page'], default: 'wizard' },
  userId:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  sessionId:     { type: String, default: 'anon' },
  state:         { type: String, default: '' },
  userAgent:     { type: String, default: '' },
  ip:            { type: String, default: '' },
  ts:            { type: Date, default: Date.now }
});

// ── Indexes ──────────────────────────────────────────────────────────────────
UserSchema.index({ email: 1 });
LawyerProfileSchema.index({ userId: 1, status: 1 });
LawyerProfileSchema.index({ city: 1, state: 1, status: 1 });
LawyerProfileSchema.index({ primarySpecialization: 1, status: 1 });
LawyerProfileSchema.index({ specializations: 1, status: 1 });
LawyerProfileSchema.index({ district: 1, state: 1 });
CaseInquirySchema.index({ userId: 1, status: 1, createdAt: -1 });
LawyerLeadSchema.index({ lawyerId: 1, status: 1, createdAt: -1 });
AppointmentSchema.index({ lawyerId: 1, slotDate: 1 });
AppointmentSchema.index({ userId: 1, createdAt: -1 });
AnalyticsEventSchema.index({ ts: -1 });
AnalyticsEventSchema.index({ type: 1 });
SearchQuerySchema.index({ ts: -1 });
SearchQuerySchema.index({ detectedLaws: 1 });

// ── Export (safe pattern — avoids OverwriteModelError on warm Lambda restarts) ──
module.exports = {
  User:           mongoose.models.User           || mongoose.model('User', UserSchema),
  LawyerProfile:  mongoose.models.LawyerProfile  || mongoose.model('LawyerProfile', LawyerProfileSchema),
  CaseInquiry:    mongoose.models.CaseInquiry    || mongoose.model('CaseInquiry', CaseInquirySchema),
  LawyerLead:     mongoose.models.LawyerLead     || mongoose.model('LawyerLead', LawyerLeadSchema),
  Appointment:    mongoose.models.Appointment    || mongoose.model('Appointment', AppointmentSchema),
  AnalyticsEvent: mongoose.models.AnalyticsEvent || mongoose.model('AnalyticsEvent', AnalyticsEventSchema),
  SearchQuery:    mongoose.models.SearchQuery    || mongoose.model('SearchQuery', SearchQuerySchema)
};
