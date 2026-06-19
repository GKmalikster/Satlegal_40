const express  = require('express');
const router   = express.Router();
const { body, validationResult } = require('express-validator');
const { CaseInquiry, Transaction, LawyerProfile, LawyerLead } = require('../models');
const { protect } = require('../middleware/auth');
const upload   = require('../middleware/upload');
const { analyseLaws, calculateScore } = require('../utils/calculator');
const { generateInquiryId, generateTransactionId, generateLeadId } = require('../utils/generator');
const { sendEmail, emailTemplates } = require('../utils/email');
const LAWS_DB  = require('../laws-database');
const { getContextualQuestions } = require('../laws-database');
const { claudeClassify }         = require('../utils/claude-classifier');

// ── Get contextual questions BEFORE law mapping (public) ─────────────────────
// POST /api/inquiry/contextual-questions
router.post('/contextual-questions', [
  body('description').trim().isLength({ min: 10 }).withMessage('Please provide at least 10 characters.')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  const { description } = req.body;
  const result = getContextualQuestions(description);
  res.json({ success: true, ...result });
});

// ── Analyse case description (public – no login required) ────────────────────
// POST /api/inquiry/analyse
//
// Primary path : Claude Haiku classifier  (~400–700 ms, high accuracy)
// Fallback path: keyword scoring engine   (instant, used if Claude fails/times out)
// Response shape is identical either way — frontend is unaware of which ran.
router.post('/analyse', [
  body('description').trim().isLength({ min: 20 }).withMessage('Please provide more details (at least 20 characters).')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  const { description, contextualAnswers } = req.body;
  let   applicableLaws = [];
  let   classifiedBy   = 'claude';

  try {
    applicableLaws = await claudeClassify(description);
  } catch (err) {
    // Claude unavailable / timed out / API key missing → silent fallback
    console.warn('[classifier] fallback to keyword engine:', err.message);
    applicableLaws = analyseLaws(description, contextualAnswers || {});
    classifiedBy   = 'keywords';
  }

  // If Claude returned empty (very generic input), fall back to keyword engine
  if (applicableLaws.length === 0 && classifiedBy === 'claude') {
    console.warn('[classifier] Claude returned empty — trying keyword engine');
    applicableLaws = analyseLaws(description, contextualAnswers || {});
    classifiedBy   = 'keywords-secondary';
  }

  if (applicableLaws.length === 0) {
    return res.json({
      success: true,
      applicableLaws: [],
      message: 'We could not identify a specific law for your situation. Please provide more details or contact us directly.'
    });
  }

  res.json({ success: true, applicableLaws, description });
});

// All routes below require login
router.use(protect);

// ── Create / Save Inquiry ─────────────────────────────────────────────────────
// POST /api/inquiry/create
router.post('/create', [
  body('description').trim().isLength({ min: 20 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  try {
    const { description, applicableLaws } = req.body;
    const detectedLaws = applicableLaws || analyseLaws(description);

    const inquiry = await CaseInquiry.create({
      userId: req.user._id,
      inquiryId: generateInquiryId(),
      description,
      applicableLaws: detectedLaws,
      status: 'analyzing'
    });

    await Transaction.create({
      transactionId: generateTransactionId(),
      userId: req.user._id,
      type: 'inquiry_created',
      inquiryId: inquiry._id,
      description: `New inquiry created: ${inquiry.inquiryId}`,
      metadata: { inquiryId: inquiry.inquiryId }
    });

    res.status(201).json({ success: true, message: 'Inquiry saved.', inquiry });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── Get single inquiry ────────────────────────────────────────────────────────
// GET /api/inquiry/:id
router.get('/:id', async (req, res) => {
  try {
    const inquiry = await CaseInquiry.findOne({
      $or: [{ _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }, { inquiryId: req.params.id }],
      userId: req.user._id
    });
    if (!inquiry) return res.status(404).json({ success: false, message: 'Inquiry not found.' });

    // Attach full law data
    const enriched = inquiry.toObject();
    enriched.applicableLaws = enriched.applicableLaws.map(al => {
      const fullLaw = LAWS_DB.find(l => l.caseType === al.caseType);
      return { ...al, probingQuestions: fullLaw?.probingQuestions || [], documents: fullLaw?.documents || [] };
    });

    res.json({ success: true, inquiry: enriched });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── Select Laws ────────────────────────────────────────────────────────────────
// PUT /api/inquiry/:id/select-laws
router.put('/:id/select-laws', [
  body('selectedLaws').isArray({ min: 1 }).withMessage('Select at least one law.')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  try {
    const inquiry = await CaseInquiry.findOne({ inquiryId: req.params.id, userId: req.user._id });
    if (!inquiry) return res.status(404).json({ success: false, message: 'Inquiry not found.' });

    inquiry.selectedLaws = req.body.selectedLaws;
    inquiry.status       = 'analyzing';

    // Pre-populate document checklist for selected laws
    const docs = [];
    req.body.selectedLaws.forEach(caseType => {
      const law = LAWS_DB.find(l => l.caseType === caseType);
      if (law) {
        law.documents.forEach(d => {
          docs.push({ caseType, documentName: d.name, isUploaded: false });
        });
      }
    });
    inquiry.documents = docs;

    await inquiry.save();
    res.json({ success: true, message: 'Laws selected.', inquiry });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── Save Assessment Answers ────────────────────────────────────────────────────
// POST /api/inquiry/:id/assessment
router.post('/:id/assessment', [
  body('caseType').notEmpty(),
  body('answers').isArray({ min: 1 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  try {
    const { caseType, answers } = req.body;
    const inquiry = await CaseInquiry.findOne({ inquiryId: req.params.id, userId: req.user._id });
    if (!inquiry) return res.status(404).json({ success: false, message: 'Inquiry not found.' });

    // Upsert assessment
    const idx = inquiry.assessments.findIndex(a => a.caseType === caseType);
    const assessment = {
      caseType,
      questions: answers.map(a => ({
        question: a.question,
        answer: a.answer,
        answeredAt: new Date()
      })),
      completedAt: new Date()
    };

    if (idx >= 0) inquiry.assessments[idx] = assessment;
    else inquiry.assessments.push(assessment);

    inquiry.status = 'assessed';
    await inquiry.save();

    await Transaction.create({
      transactionId: generateTransactionId(),
      userId: req.user._id,
      type: 'assessment_completed',
      inquiryId: inquiry._id,
      description: `Assessment completed for: ${caseType}`,
      metadata: { caseType }
    });

    res.json({ success: true, message: 'Assessment saved.', assessment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── Upload Document ────────────────────────────────────────────────────────────
// POST /api/inquiry/:id/documents
router.post('/:id/documents', upload.single('document'), async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded.' });

  try {
    const { caseType, documentName } = req.body;
    const inquiry = await CaseInquiry.findOne({ inquiryId: req.params.id, userId: req.user._id });
    if (!inquiry) return res.status(404).json({ success: false, message: 'Inquiry not found.' });

    const docIdx = inquiry.documents.findIndex(
      d => d.caseType === caseType && d.documentName === documentName
    );

    const docData = {
      caseType,
      documentName,
      isUploaded: true,
      uploadedFile: req.file.filename,
      uploadedAt: new Date()
    };

    if (docIdx >= 0) inquiry.documents[docIdx] = docData;
    else inquiry.documents.push(docData);

    await inquiry.save();

    await Transaction.create({
      transactionId: generateTransactionId(),
      userId: req.user._id,
      type: 'document_uploaded',
      inquiryId: inquiry._id,
      description: `Document uploaded: ${documentName}`,
      metadata: { documentName, caseType }
    });

    res.json({ success: true, message: 'Document uploaded.', document: docData });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── Calculate Probability Score ────────────────────────────────────────────────
// POST /api/inquiry/:id/calculate
router.post('/:id/calculate', async (req, res) => {
  try {
    const inquiry = await CaseInquiry.findOne({ inquiryId: req.params.id, userId: req.user._id });
    if (!inquiry) return res.status(404).json({ success: false, message: 'Inquiry not found.' });

    const scores = [];
    (inquiry.selectedLaws || []).forEach(caseType => {
      const assessment = inquiry.assessments.find(a => a.caseType === caseType);
      const documents  = inquiry.documents.filter(d => d.caseType === caseType);
      const answers    = assessment ? assessment.questions : [];
      const result     = calculateScore(caseType, answers, documents);
      if (result) {
        scores.push({ caseType, ...result, calculatedAt: new Date() });
      }
    });

    inquiry.probabilityScores = scores;
    inquiry.status = 'assessed';
    await inquiry.save();

    res.json({ success: true, message: 'Scores calculated.', probabilityScores: scores });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── Request Lawyer Connection ──────────────────────────────────────────────────
// POST /api/inquiry/:id/request-lawyer
router.post('/:id/request-lawyer', [
  body('message').optional().trim()
], async (req, res) => {
  try {
    const inquiry = await CaseInquiry.findOne({ inquiryId: req.params.id, userId: req.user._id });
    if (!inquiry) return res.status(404).json({ success: false, message: 'Inquiry not found.' });
    if (inquiry.lawyerRequested) return res.status(400).json({ success: false, message: 'Lawyer already requested for this inquiry.' });

    // Find matching lawyers based on selected law types
    const selectedLaws = inquiry.selectedLaws || [];
    const lawyers = await LawyerProfile.find({
      status: 'approved',
      specializations: { $in: selectedLaws }
    }).populate('userId', 'name email phone').limit(5);

    // Create a lead for each matching lawyer
    const leads = [];
    for (const lawyer of lawyers) {
      const lead = await LawyerLead.create({
        leadId: generateLeadId(),
        lawyerId: lawyer._id,
        userId: req.user._id,
        inquiryId: inquiry._id,
        caseTypes: selectedLaws,
        description: inquiry.description.substring(0, 300),
        urgency: 'medium',
        userName: req.user.name,
        userEmail: req.user.email,
        userPhone: req.user.phone,
        userMessage: req.body.message || ''
      });
      leads.push(lead);

      // Update lawyer stats
      await LawyerProfile.findByIdAndUpdate(lawyer._id, { $inc: { 'stats.totalLeads': 1 } });

      // Email lawyer
      if (lawyer.userId && lawyer.userId.email) {
        await sendEmail({
          to: lawyer.userId.email,
          ...emailTemplates.lawyerLeadNotification(lawyer.userId.name, lead)
        });
      }
    }

    inquiry.lawyerRequested = true;
    inquiry.requestedAt     = new Date();
    inquiry.status          = 'lawyer_requested';
    await inquiry.save();

    await Transaction.create({
      transactionId: generateTransactionId(),
      userId: req.user._id,
      type: 'lawyer_contacted',
      inquiryId: inquiry._id,
      description: `Lawyer connection requested – ${leads.length} lawyers notified`,
      metadata: { leadIds: leads.map(l => l.leadId) }
    });

    res.json({
      success: true,
      message: `Your case has been sent to ${leads.length} matching lawyer(s). They will contact you shortly.`,
      leadsCreated: leads.length
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
