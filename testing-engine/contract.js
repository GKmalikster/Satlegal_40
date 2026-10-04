/**
 * contract.js — SatLegal API Contract (ground truth)
 *
 * Derived by reading the actual source files, not by assumption:
 *   api/analyse.js  line 513 → req body field is `description` (not `query`)
 *   api/analyse.js  line 568 → laws[] contains objects from laws-database.js
 *   laws-database.js         → law object keys: caseType, lawCategory, actName,
 *                              keywords, sections, documents, probingQuestions,
 *                              contextualQuestions, limitation, urgency, multiLawCompatible
 *   api/analyse.js  line 600 → response: { success, laws, source, debug? }
 *   api/track.js    line 24  → req body field `event` (required), sessionId optional
 *
 * UPDATE THIS FILE whenever analyse.js or laws-database.js changes.
 * All test modules import from here — never hardcode API shapes in test files.
 */

'use strict';

// ── /api/analyse ─────────────────────────────────────────────────────────────
const ANALYSE = {
  path:   '/api/analyse',
  method: 'POST',

  // Correct request body shape (verified from analyse.js line 513)
  request: (description, opts = {}) => ({
    description,                      // required, min 5 chars
    ...(opts.adminToken ? { adminToken: opts.adminToken } : {}),
  }),

  // Response shape (verified from analyse.js lines 528/536/600)
  // laws[] = array of law objects. Each object has at minimum: caseType (string)
  parseLaws: (data) => {
    const raw = data?.laws || [];
    return raw.map(l => ({
      caseType:   l.caseType   || '',
      lawCategory:l.lawCategory|| '',
      actName:    l.actName    || '',
      confidence: l.confidence ?? null,
      source:     data.source  || 'unknown',
    }));
  },

  // Source values (verified from analyse.js line 583)
  sources: ['cache', 'keywords', 'claude-2prompt', 'claude-1prompt', 'keywords-error-fallback'],

  // Error responses
  errors: {
    400: 'Description too short',   // description missing or < 5 chars
    405: 'Method not allowed',      // non-POST
  },
};

// ── /api/track ────────────────────────────────────────────────────────────────
const TRACK = {
  path:   '/api/track',
  method: 'POST',

  // Two event types (verified from track.js lines 23/46)
  lawEvent: (event, opts = {}) => ({
    event,                          // required
    query:     opts.query     || undefined,
    law:       opts.law       || undefined,
    shown:     opts.shown     || undefined,
    kept:      opts.kept      || undefined,
    source:    opts.source    || undefined,
    sessionId: opts.sessionId || 'test-session',
  }),

  inquiryEvent: (type, opts = {}) => ({
    type,
    query:     opts.query  || undefined,
    laws:      opts.laws   || [],
    sessionId: opts.sessionId || 'test-session',
  }),

  // Response (verified from track.js line 35)
  parseOk: (data) => data?.ok === true,
};

// ── /api/lawyer/list ─────────────────────────────────────────────────────────
const LAWYER = {
  list:  { path: '/api/lawyer/list',  method: 'GET'  },
  match: { path: '/api/lawyer/match', method: 'POST' },
};

// ── Static pages (verified by checking file system) ──────────────────────────
const PAGES = [
  { path: '/',                          name: 'Homepage',      mustContain: ['SatLegal', 'legal'] },
  { path: '/pricing.html',              name: 'Pricing',       mustContain: ['499', '2,499'] },
  { path: '/faq.html',                  name: 'FAQ',           mustContain: ['SatLegal'] },
  { path: '/how-it-works.html',         name: 'How It Works',  mustContain: ['step', 'legal'] },
  { path: '/contact.html',              name: 'Contact',       mustContain: ['contact', 'SatLegal'] },
  { path: '/about.html',                name: 'About',         mustContain: ['SatLegal'] },
  { path: '/laws-reference.html',       name: 'Laws Ref',      mustContain: ['Indian', 'law'] },
  { path: '/legal-topics.html',         name: 'Legal Topics',  mustContain: ['family', 'criminal'] },
  { path: '/auth/login.html',           name: 'Login',         mustContain: ['Login', 'password'] },
  { path: '/auth/signup.html',          name: 'Signup',        mustContain: ['Sign', 'password'] },
  { path: '/auth/lawyer-register.html', name: 'Lawyer Reg',    mustContain: ['lawyer', 'register'] },
  { path: '/terms-conditions.html',     name: 'Terms',         mustContain: ['Terms', 'SatLegal'] },
  { path: '/payment/qr.html',           name: 'Payment/QR',    mustContain: ['payment', 'UPI'] },
  { path: '/404.html',                  name: '404 Page',      mustContain: ['404'] },
  { path: '/robots.txt',                name: 'robots.txt',    mustContain: ['User-agent'] },
  { path: '/sitemap.xml',               name: 'sitemap.xml',   mustContain: ['<url>'] },
  { path: '/googlecade4f9f2f6a0033.html', name: 'GSC verify', mustContain: ['google-site-verification'] },
];

// ── Law accuracy test cases ───────────────────────────────────────────────────
// Derived from test-live.js (which was built correctly against the real API).
// Format: { id, q, expect[], notExpect[], tag }
// expect/notExpect match as substrings of caseType (case-insensitive)
const LAW_CASES = [
  // ── Fixes from today (high priority regression guards) ────────────────────
  { id:'L01', tag:'Fix#90', q:'22 karat jewellery turned out to be 20 karat',
    expect:['Consumer'], notExpect:['Dowry','Domestic','Family'] },
  { id:'L02', tag:'Fix#90', q:'Jewellery purity fraud gold hallmark missing',
    expect:['Consumer'], notExpect:['Dowry','Domestic'] },
  { id:'L06', tag:'Fix#91', q:'My car window was smashed by neighbour',
    expect:['Mischief'], notExpect:['Fraud','Cyber'] },
  { id:'L07', tag:'Fix#92', q:'Shopkeeper is harassing me after I complained about product',
    expect:['Consumer'], notExpect:['Cyber','Online'] },

  // ── Employment ────────────────────────────────────────────────────────────
  { id:'E01', tag:'Employment', q:'company has not paid my salary for 3 months',
    expect:['Salary'], notExpect:['Fraud','Criminal'] },
  { id:'E02', tag:'Employment', q:'employer is not depositing my PF for the last year',
    expect:['Salary'], notExpect:['Fraud'] },
  { id:'E03', tag:'Employment', q:'my boss fired me without notice',
    expect:['Wrongful'], notExpect:['Fraud','Consumer'] },

  // ── Family ────────────────────────────────────────────────────────────────
  { id:'F01', tag:'Divorce', q:'i want to file for divorce from my wife',
    expect:['Divorce'], notExpect:['Dowry','Domestic'] },
  { id:'F02', tag:'Dowry', q:'husband demanding dowry and harassing me at home',
    expect:['Dowry'], notExpect:['Consumer','Cyber'] },
  { id:'F03', tag:'Domestic', q:'husband beats me regularly i am scared',
    expect:['Domestic'], notExpect:['Dowry','Consumer'] },

  // ── Consumer ─────────────────────────────────────────────────────────────
  { id:'C01', tag:'Consumer', q:'my refrigerator stopped working within 1 month of purchase',
    expect:['Consumer'], notExpect:['Criminal','Employment'] },
  { id:'C02', tag:'Consumer', q:'builder not giving flat possession after full payment',
    expect:['RERA','Builder'], notExpect:['Consumer','Criminal'] },

  // ── Cyber ─────────────────────────────────────────────────────────────────
  { id:'Y01', tag:'Cyber', q:'someone transferred 45000 from my bank account without my permission',
    expect:['Cyber','Fraud'], notExpect:['Consumer','Family'] },
  { id:'Y02', tag:'Cyber', q:'received fake whatsapp message asking for otp and money was deducted',
    expect:['Cyber'], notExpect:['Consumer','Family'] },

  // ── Criminal ─────────────────────────────────────────────────────────────
  { id:'K01', tag:'Cheque', q:'my cheque bounced bank returned it',
    expect:['Cheque','Negotiable'], notExpect:['Fraud','Consumer'] },
  { id:'K02', tag:'Theft', q:'my car got stolen from parking lot',
    expect:['Theft'], notExpect:['Consumer','Fraud'] },

  // ── Property ─────────────────────────────────────────────────────────────
  { id:'P01', tag:'Property', q:'tenant not vacating my flat despite giving notice',
    expect:['Rent','Tenant','Eviction'], notExpect:['Consumer','Criminal'] },
  { id:'P02', tag:'Property', q:'paid token money for house but seller is not registering it',
    expect:['Transfer'], notExpect:['Rent','Consumer','Cyber'] },

  // ── Hinglish ──────────────────────────────────────────────────────────────
  { id:'H01', tag:'Hinglish', q:'mera cheque bounce ho gaya kya karu',
    expect:['Cheque','Negotiable'], notExpect:['Fraud'] },
  { id:'H02', tag:'Hinglish', q:'mera criminal revision high court se bail cancel ho sakti hai',
    expect:['Bail','Criminal','BNSS'], notExpect:['Consumer'] },
];

// ── All 72 caseTypes (verified from laws-database.js) ────────────────────────
// Used to validate that API responses only return known caseTypes.
// Run: node -e "const DB=require('./laws-database.js'); DB.forEach(l=>console.log(l.caseType))"
const KNOWN_CASE_TYPES = null; // loaded lazily in modules that need it

module.exports = { ANALYSE, TRACK, LAWYER, PAGES, LAW_CASES, KNOWN_CASE_TYPES };
