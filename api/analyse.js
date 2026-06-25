// api/analyse.js — Vercel Serverless Function
// Deployed at: POST /api/analyse
// Replaces browser-side keyword classification with Claude Haiku AI
// Falls back gracefully if ANTHROPIC_API_KEY is not set
//
// Classification pipeline (when Claude is available):
//   Prompt 1 — extractStructure(): normalises raw/Hinglish input into structured fields
//   Prompt 2 — buildPrompt():      classifies using structure + original text
//   Fallback  — keywordFallback(): keyword scoring when Claude unavailable

// Wrap SDK require so a missing/broken package degrades to keyword fallback
let Anthropic = null;
try { Anthropic = require('@anthropic-ai/sdk'); }
catch(e) { console.warn('[analyse] @anthropic-ai/sdk unavailable:', e.message); }

const DB = require('../laws-database.js');

// Admin token verifier — enables debug mode in responses
let verifyAdminToken = () => false;
try { verifyAdminToken = require('./admin-login.js').verifyToken; }
catch(e) { /* admin-login not available */ }

// ── Build the valid caseType list once at cold-start ────────────────────────
const LAW_TYPES_TEXT = DB.map(l => l.caseType).join('\n');
const CONFIDENCE     = [90, 65, 50];  // 2nd/3rd are genuinely secondary — reflect that in UI

// ── In-process cache (persists across warm invocations on same instance) ─────
const cache   = new Map();
const TTL     = 2 * 60 * 60 * 1000; // 2 hours

function cacheGet(k) {
  const e = cache.get(k);
  if (!e || Date.now() - e.ts > TTL) { cache.delete(k); return null; }
  return e.v;
}
function cacheSet(k, v) {
  if (cache.size >= 300) cache.delete(cache.keys().next().value);
  cache.set(k, { v, ts: Date.now() });
}

// ── Prompt 1: Structure Extractor ────────────────────────────────────────────
// Normalises any layman/Hinglish input into structured fields.
// Short call (~120 tokens) — fast and cheap (Claude Haiku).
// Returns null silently on any failure; caller falls back to single-prompt path.
//
// Privacy note: extracts only legal-fact categories (harm type, relationship, context).
// No personal identifiers (names, phone numbers, addresses) are requested or stored.
async function extractStructure(client, rawInput) {
  try {
    const resp = await client.messages.create({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 120,
      messages:   [{ role: 'user', content:
`Extract key legal facts from this Indian legal problem. It may be in English, Hindi, or Hinglish. Return ONLY valid JSON, no explanation.

Problem: "${rawInput.slice(0, 300)}"

Return exactly this shape (choose the best-fitting value for each field):
{"what_happened":"core event in 5 words (translate to English if Hindi/Hinglish)","relationship":"employer-employee|buyer-seller|spouse|landlord-tenant|parent-child|doctor-patient|police-citizen|business-partner|stranger|other","harm_type":"termination|theft|fraud|assault|sexual-violence|death|deficiency|negligence|harassment|defamation|eviction|discrimination|data-breach|other","context":"workplace|consumer|criminal|family|property|digital|constitutional|medical|succession|other","perspective":"victim|accused|third-party"}`
      }]
    });
    const raw = resp.content[0].text.trim()
      .replace(/^```json?\n?/, '').replace(/\n?```$/, '');
    return JSON.parse(raw);
  } catch (e) {
    // Silent — single-prompt path takes over
    return null;
  }
}

// ── Prompt 2: Classifier ──────────────────────────────────────────────────────
// Accepts optional structure from Prompt 1 to anchor Claude's interpretation.
// When structure is available, ambiguous layman phrasing is resolved before
// Claude sees the law list — this is what prevents over-mapping.
function buildPrompt(input, structure) {
  const structuredCtx = structure
    ? `\nSTRUCTURED ANALYSIS (pre-extracted to resolve ambiguous phrasing — trust this):
- What happened  : ${structure.what_happened}
- Relationship   : ${structure.relationship}
- Harm type      : ${structure.harm_type}
- Context        : ${structure.context}
- Perspective    : ${structure.perspective || 'unknown'}
`
    : '';

  return `You are a precise Indian legal classifier. A person described their legal problem below.
Return ONLY the law categories that DIRECTLY apply. Most problems need exactly 1 law.
Only add a 2nd or 3rd if that law is independently necessary — not just tangentially related. Never pad.

PERSON'S PROBLEM:
"${input}"
${structuredCtx}
VALID LAW CATEGORIES (return ONLY names from this exact list, spelled exactly):
${LAW_TYPES_TEXT}

STRICT OVER-MAPPING RULES — each rule prevents a specific hallucination:
1. FIRED / TERMINATED / DISMISSED → "Employment – Wrongful Termination / Illegal Dismissal" ONLY. Never add PIL, BNS Fraud, Consumer, or any other law to a basic termination case.
2. SALARY / PF / GRATUITY unpaid → "Employment – Salary Dues / PF / Gratuity" ONLY.
3. PHYSICAL ASSAULT (stranger, neighbour, colleague) → "Criminal – BNS (Assault / Hurt / Grievous Hurt)" ONLY. Not Domestic Violence unless the attacker is a spouse or in-law.
4. THEFT / STOLEN / ROBBERY / SNATCHING → "Criminal – BNS (Theft / Robbery / Burglary / Dacoity)" ONLY. Not Cyber unless the theft was purely digital/financial.
5. CAR SERVICE / PRODUCT DEFECT / WARRANTY → "Consumer – Product Defect / Service Deficiency" ONLY.
6. PIL / WRIT → only when the person explicitly seeks a writ/petition OR it is a large-scale public issue. Do NOT add PIL to employment, criminal, or routine consumer cases.
7. BNS FRAUD / CHEATING → only when money was taken by active deception. Not for employment disputes. Not for civil defaults. Not for service complaints.
8. CONSUMER LAW → only when the person is a buyer/customer with a complaint against a seller or service provider.
9. DOMESTIC VIOLENCE → requires a domestic relationship: spouse, in-laws, live-in partner. Not for workplace or stranger conflicts.
10. When unsure between 1 vs 2 laws, return 1. A precise single answer beats a padded multi-answer.
11. DIVORCE / CHILD CUSTODY / MAINTENANCE / MARRIAGE → Family law ONLY. Never add BNS Fraud, PIL, Consumer, or any Criminal law to a family dispute unless there is an explicit separate criminal act (e.g. domestic violence, dowry demand). "Fighting for custody" is NOT fraud. "Seeking divorce" is NOT fraud.
12. TOKEN MONEY / ADVANCE PAID FOR PROPERTY / SELLER NOT VACATING / POSSESSION NOT GIVEN → "Property – Transfer of Property / Sale Deed Dispute" ONLY. Not Rent, not Cyber, not Employment. A seller who takes advance and refuses to hand over property is a sale agreement dispute, not a rent case.
13. PATIENT DIED / DIED ON OPERATION TABLE / DIED IN HOSPITAL / FAMILY BLAMING DOCTOR → "Criminal – Medical Negligence / Death by Negligence (BNS 106)" ONLY — regardless of whether the query is from VICTIM'S FAMILY or from the ACCUSED DOCTOR. NEVER succession, NEVER murder, NEVER consumer law alone for this scenario. Medical death ≠ succession.
14. RAPE / SEXUAL ASSAULT (adult victim, 18 or above) → "Criminal – Rape / Sexual Assault / Sexual Violence (BNS 64-70)" ONLY. NOT POCSO (that is for victims UNDER 18). NOT Domestic Violence alone unless there is an ongoing domestic relationship. NOT assault (assault is for non-sexual physical violence).
15. SUCCESSION / INHERITANCE / WILL / PROPERTY AFTER DEATH → "Property – Hindu Succession / Inheritance Dispute" or related succession law ONLY when the dispute is about WHO GETS THE PROPERTY after someone died naturally. NOT for medical negligence. NOT for murder. Do NOT add succession to any criminal, medical, or violent death case.
16. TRADEMARK / COPYRIGHT / PATENT / IP / LOGO COPIED / PLAGIARISM / COPIED APP / COPIED DESIGN → "Intellectual Property – Trademark / Copyright / Patent Dispute" ONLY. Not Cyber, not Consumer.
17. NRI / OCI / PERSON ABROAD / NON-RESIDENT INDIAN legal issue (property, marriage, divorce, family) → "NRI – Property / Family / Legal Issues (Non-Resident Indian)". Add a second family/property law only if the specific dispute is described.
18. CASTE DISCRIMINATION / SC ST ATROCITY / DALIT ATTACKED / UNTOUCHABILITY / MANUAL SCAVENGING → "Criminal – SC/ST Atrocities / Caste Discrimination" ONLY.
19. DATA BREACH / AADHAR MISUSED / PERSONAL DATA SHARED / DPDP ACT / PRIVACY VIOLATION (non-financial) → "Digital Privacy – DPDP Act / Data Breach / Aadhaar Misuse". Not Cyber (Cyber is for financial fraud, hacking, and online harassment).
20. MSME / DELAYED PAYMENT TO SUPPLIER / MSME SAMADHAN / PARTNERSHIP DUES UNPAID → "MSME – Delayed Payment / MSME Samadhan / Partnership Dues". Not Consumer, not Civil.
21. SENIOR CITIZEN MAINTENANCE / ELDERLY PARENT EVICTED BY CHILDREN / ABANDONED ELDERLY → "Senior Citizen – Maintenance / Protection / Eviction Prevention". Not DV, not Succession.
22. MATERNITY LEAVE DENIED / PREGNANCY RIGHTS AT WORK / MATERNITY BENEFIT ACT → "Employment – Maternity Benefits / Pregnancy Rights". Not Consumer.
23. ABORTION RIGHTS / MTP ACT / REPRODUCTIVE RIGHTS / FORCED PREGNANCY → "Civil – Medical Termination of Pregnancy (MTP) / Reproductive Rights". Not Consumer.
24. MGNREGA / RIGHT TO WORK SCHEME / JOB CARD DENIED / GOVERNMENT SCHEME BENEFIT DENIED → "Livelihood – MGNREGA / Right to Work / Government Schemes". Not Consumer, not PIL.
25. AGRICULTURAL DISPUTE / CROP INSURANCE / FARMING LOAN / LAND TENANCY / KISAN CREDIT → "Agriculture – Crop Insurance / Land Tenancy / Agricultural Disputes". Not Property, not Consumer.
26. SHOPS AND ESTABLISHMENTS / SHOP LICENSE / BUSINESS REGISTRATION / COMMERCIAL EMPLOYEE RIGHTS → "Shops & Establishments Act – Labour Compliance". Not Consumer, not Employment general.
27. ACCUSED PERSPECTIVE / FALSE CASE / WRONGLY ACCUSED / DEFENDING AGAINST / COMPLAINT FILED AGAINST ME → Classify to the UNDERLYING law being alleged. Example: "false rape case filed against me" → Rape law. "false dowry case" → Dowry. "false consumer complaint against my shop" → Consumer. The accused needs the same law as the victim.
28. MENTAL HEALTH / PSYCHIATRIC RIGHTS / FORCED ADMISSION TO MENTAL HOSPITAL / DISABILITY RIGHTS → "Civil – Mental Healthcare Act / Psychiatric Rights / Disability". Not Consumer, not Criminal.
29. INSOLVENCY / BANKRUPTCY / COMPANY WINDING UP / LIQUIDATION / PERSONAL GUARANTOR → "IBC – Insolvency / Bankruptcy / NCLT Proceedings". Not Corporate alone unless it is purely a shareholder/director dispute without insolvency.
30. ARBITRATION / MEDIATION / LOK ADALAT / SETTLEMENT NOT HONORED / AWARD NOT ENFORCED → "Civil – Arbitration / ADR / Enforcement of Award". Not Consumer, not PIL.
31. SARFAESI / BANK SEIZING PROPERTY / NPA / DRT CASE / SECURITISATION / BANK AUCTION OF PROPERTY → "Civil – SARFAESI / Banking Recovery / DRT". Not Property Transfer, not Consumer.
32. BOTH AGREE TO DIVORCE / MUTUAL CONSENT / WE BOTH WANT DIVORCE / AMICABLE SEPARATION → "Family – Mutual Consent Divorce" ONLY. Not contested divorce. Not succession.
33. CHILD VISITATION / NOT ALLOWED TO MEET MY CHILD / FATHER DENIED ACCESS / CUSTODY ORDER VIOLATION → "Family – Child Custody / Guardianship" ONLY. Not Domestic Violence unless there is separate abuse.
34. OLD AGE PENSION NOT RECEIVED / WIDOW PENSION / GOVERNMENT SCHEME BENEFIT DENIED TO INDIVIDUAL → "Livelihood – MGNREGA / Right to Work / Government Schemes". Not Consumer Forum.
35. MONEY OWED TO ME / LOAN NOT RETURNED / MONEY RECOVERY SUIT / PROMISSORY NOTE / FREELANCE UNPAID → "Civil – Money Recovery / Debt Recovery". Not Consumer (consumer is seller-buyer). Not Fraud unless deliberate deception was involved.
36. PARTITION OF PROPERTY AMONG FAMILY / JOINT PROPERTY / COURT PARTITION SUIT → "Civil – Partition Suit". Not Succession (succession is about who inherits; partition is about dividing what all co-owners already have).
37. FUNDAMENTAL RIGHTS VIOLATION BY GOVERNMENT / WRIT PETITION / MANDAMUS / CERTIORARI / RTI REJECTION → "Constitutional – PIL / Writ Petition / Fundamental Rights". Only for clear government action violations, not routine private disputes.
38. FORCED STERILISATION / SURROGACY DISPUTE / SURROGATE MOTHER / REPRODUCTIVE AUTONOMY / UNWANTED PREGNANCY RIGHTS → "Civil – Medical Termination of Pregnancy (MTP) / Reproductive Rights". NOT Rape (sterilisation is not rape). NOT Family (surrogacy is a separate civil right).
39. YOUTUBE VIDEO COPIED / REPOSTED WITHOUT CREDIT / CONTENT STOLEN ONLINE / PLAGIARISM / BOOK PLAGIARIZED / DESIGN PATENT → "Intellectual Property – Trademark / Copyright / Patent Dispute". NOT Cyber (this is an IP dispute, not hacking or fraud).
40. FREELANCE PAYMENT NOT RECEIVED / CLIENT NOT PAYING FEES / PROJECT PAYMENT DUE → "Civil – Money Recovery / Debt Recovery". NOT Employment (freelancers are not employees). NOT Consumer.
41. PM KISAN / KISAN YOJANA / AYUSHMAN BHARAT CARD / GOVERNMENT SCHEME BENEFIT DENIED → "Livelihood – MGNREGA / Right to Work / Government Schemes". NOT PIL unless seeking writ.
42. IRRIGATION WATER ACCESS / WATER RIGHTS FARMER / WATER DISPUTE BETWEEN FARMERS → "Agriculture – Crop Insurance / Land Tenancy / Agricultural Disputes". NOT Property, NOT PIL.
43. RIGHTS OF PERSONS WITH MENTAL ILLNESS / MENTAL ILLNESS RIGHT TO VOTE / MENTAL HEALTH RIGHTS / PERSON WITH MENTAL ILLNESS → "Civil – Mental Healthcare Act / Psychiatric Rights / Disability". NOT PIL unless seeking writ against state.
44. EX-BOYFRIEND / EX-GIRLFRIEND POSTING PRIVATE PHOTOS / INTIMATE IMAGES SHARED WITHOUT CONSENT / REVENGE PORN → "Cyber – Online Harassment / Cyberstalking / Defamation" ONLY. NOT Criminal BNS Assault.
45. HUSBAND NOT ALLOWING / NOT LETTING ME MEET / SEE MY CHILDREN AFTER DIVORCE → "Family – Child Custody / Guardianship" ONLY. This is about access/visitation. NOT Divorce, NOT Domestic Violence unless abuse is separately described.
46. CORRUPT POLICE OFFICER / COMPLAINT AGAINST CORRUPT POLICE / POLICE OFFICER DEMANDING BRIBE → "Criminal – Corruption / Bribery / Prevention of Corruption Act". NOT Police Excess (police excess is about brutality/illegal detention, not bribery).
47. BOMB THREAT / BOMB HOAX / HOAX CALL POLICE NOT ACTING → "Criminal – Police Excess / Human Rights Violation" (for police inaction) or "Criminal – BNS (Murder / Culpable Homicide)" for the threat itself.
48. FORCED RELIGIOUS CONVERSION / CONVERTING RELIGION UNDER COERCION / HIJAB BANNED / RELIGIOUS DISCRIMINATION → "Constitutional – PIL / Writ Petition / Fundamental Rights" (Art 25 religious freedom) + may add "Criminal – BNS (Assault)" if violence involved.
49. PASSPORT IMPOUNDED / PASSPORT SEIZED BY GOVERNMENT / PASSPORT CANCELLED / CHALLENGING PASSPORT REVOCATION → "Constitutional – PIL / Writ Petition / Fundamental Rights". This is an Art 21 / Art 19 issue, not Tax or Consumer.
50. HOSPITAL RECEIVED LEGAL NOTICE FOR NEGLIGENCE / DOCTOR RESPONDING TO NEGLIGENCE COMPLAINT / DEFEND MEDICAL NEGLIGENCE → "Criminal – Medical Negligence / Death by Negligence (BNS 106)". NOT Consumer alone.
51. WHATSAPP BADNAAMI / BADNAAMI ON SOCIAL MEDIA / DEFAMATION IN HINGLISH → "Civil/Criminal – Defamation / False Statements / Reputation Damage".
52. STAMP PAPER FOR AGREEMENT / NOTARIZED AGREEMENT / HOW TO MAKE AGREEMENT → "Civil – Specific Performance / Contract Breach" (Specific Relief Act / Contract Act).

BNS SUBCATEGORY SELECTION RULES — choose the most specific BNS category:
- Criminal – Medical Negligence / Death by Negligence (BNS 106): A PATIENT DIED during or after medical treatment. Doctor/hospital is accused OR is seeking legal advice. Keywords: died on operation table, died after surgery, patient died in hospital, family blaming doctor, accused of medical negligence, operation went wrong. → USE THIS for all hospital/medical deaths. This overrides the generic murder/death rule below.
- BNS (Murder / Culpable Homicide / Unnatural Death): Someone DIED outside medical context. Intentional killing, poisoning (non-medical), stabbing, shooting, strangulation, suspicious death at home/street. NOT for hospital deaths.
- Criminal – Rape / Sexual Assault (BNS 64-70): Non-consensual sexual act against an adult. Rape, gang rape, forced sex, marital rape, assault on promise of marriage.
- BNS (Fraud / Cheating): Money or property obtained by DECEPTION, false promises, misrepresentation. Investment scams, advance-fee fraud, business cheating, fake job offers.
- BNS (Assault / Hurt / Grievous Hurt): Physical violence, battery, causing bodily injury (NON-SEXUAL) — where the VICTIM IS ALIVE. Keywords: beat, hit, attacked, stabbed, broken bone, acid attack, threatened physically.
- BNS (Theft / Robbery / Burglary / Dacoity): Taking property WITHOUT consent by stealth or force. Chain snatching, house break-in, pickpocketing, armed robbery.
- DO NOT default all BNS matters to Theft/Robbery. A HOSPITAL DEATH is Medical Negligence (BNS 106). A SEXUAL ASSAULT is Rape (BNS 64-70). A NON-MEDICAL intentional killing is Murder. A financial scam is FRAUD. A non-sexual beating (victim alive) is ASSAULT. Only actual taking of goods is THEFT.

OUTPUT FORMAT:
Return ONLY category names, one per line. No numbering, no punctuation, no explanation.`;
}

// ── Keyword fallback (runs in browser too, available here server-side) ────────
//
// MATCHING STRATEGY — word boundaries:
//   All keywords are matched with \b word-boundary regex, not substring includes().
//   This prevents "cat" matching inside "vacated", "money" inside "testimony", etc.
//   Multi-word phrases (e.g. "token money") are matched as full phrases with boundaries
//   on the first and last word only, so word order is preserved.
//
//   kwRegex(k) compiles once per keyword and is cached for performance.
//
const _kwCache = new Map();
function kwRegex(k) {
  if (_kwCache.has(k)) return _kwCache.get(k);
  // Escape special regex chars, then wrap in word boundaries
  const escaped = k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`\\b${escaped}\\b`, 'i');
  _kwCache.set(k, re);
  return re;
}

function kwMatch(input, k) {
  return kwRegex(k).test(input);
}

// ── Keyword debug scorer (admin mode only) ───────────────────────────────────
// Returns full scoring breakdown for every law — used in the tester overlay.
function keywordDebugScore(description) {
  const input = description;
  return DB.map(l => {
    const hits  = { exact: [], strong: [], hinglish: [], casual: [], weak: [] };
    let score   = 0;
    const tiers = [
      { tier: 'exact',    pts: 50 },
      { tier: 'strong',   pts: 22 },
      { tier: 'hinglish', pts: 22 },
      { tier: 'casual',   pts: 22 },
      { tier: 'weak',     pts:  8 },
    ];
    for (const { tier, pts } of tiers) {
      for (const k of (l.keywords?.[tier] || [])) {
        if (kwMatch(input, k)) { score += pts; hits[tier].push(k); }
      }
    }
    return { caseType: l.caseType, score, hits };
  }).filter(x => x.score > 0).sort((a, b) => b.score - a.score).slice(0, 10);
}

function keywordFallback(description) {
  if (!DB || !DB.length) return [];
  const input = description; // keep original case; regex is case-insensitive
  const scored = DB.map(l => {
    let score = 0;
    (l.keywords?.exact    || []).forEach(k => { if (kwMatch(input, k)) score += 50; });
    (l.keywords?.strong   || []).forEach(k => { if (kwMatch(input, k)) score += 22; });
    (l.keywords?.hinglish || []).forEach(k => { if (kwMatch(input, k)) score += 22; });
    (l.keywords?.casual   || []).forEach(k => { if (kwMatch(input, k)) score += 22; });
    (l.keywords?.weak     || []).forEach(k => { if (kwMatch(input, k)) score +=  8; });
    return { law: l, score };
  }).filter(x => x.score > 0).sort((a, b) => b.score - a.score);

  const threshold = 20;
  const above     = scored.filter(x => x.score >= threshold);
  // CRITICAL: never return low-confidence noise. If nothing clears the threshold,
  // return empty array — caller must handle NONE gracefully (show "tell us more" UI).
  if (!above.length) return [];
  const results  = above.slice(0, 3);
  const maxScore = results[0]?.score || 1;

  return results.map(x => ({
    ...x.law,
    confidence: Math.min(97, Math.round((x.score / maxScore) * 90))
  }));
}

// ── Domain exclusion post-processor ──────────────────────────────────────────
//
// Rationale: Indian legal problems almost always live in one primary domain.
// When Claude returns results spanning incompatible domains (e.g. Family + Criminal),
// the secondary result is almost always a hallucination caused by incidental keyword
// overlap in the query. This filter strips it systematically.
//
// HOW IT WORKS:
//   1. Classify each returned law into a domain (family, criminal, consumer, etc.)
//   2. Identify the primary domain (the first/highest-confidence result)
//   3. Strip any result whose domain is in the primary domain's exclusion list
//   4. Exception: some domain pairs are genuinely co-occurring (e.g. DV + Criminal)
//
// WHEN TO BYPASS: Pass bypass=true for keyword fallback results — the keyword
// engine is more precise (word boundaries) and its domain mixing is intentional.

const DOMAIN_MAP = [
  // pattern on caseType → domain tag
  { re: /^Family/,                      domain: 'family'      },
  { re: /^Property/,                    domain: 'property'    },
  { re: /^Employment/,                  domain: 'employment'  },
  { re: /^Consumer/,                    domain: 'consumer'    },
  { re: /^Criminal|^Civil – Cheque/,    domain: 'criminal'    },
  { re: /^Constitutional|^PIL/,         domain: 'public'      },
  { re: /^Tax/,                         domain: 'tax'         },
  { re: /^Environment/,                 domain: 'environment' },
  { re: /^Cyber/,                       domain: 'cyber'       },
  { re: /^Civil/,                       domain: 'civil'       },
  { re: /^Education/,                   domain: 'education'   },
  { re: /^Corporate/,                   domain: 'corporate'   },
  { re: /^Motor/,                       domain: 'consumer'    }, // motor claims are consumer-adjacent
  { re: /^IP|^Intellectual/,            domain: 'civil'       },
  { re: /^NRI/,                         domain: 'nri'         },
];

// Which domain pairs are INCOMPATIBLE — secondary is stripped if primary owns it
// Read as: if primary domain is KEY, strip any result whose domain is in VALUE array.
// Omitting a pair means co-occurrence is allowed (e.g. criminal + property for fraud).
const DOMAIN_EXCLUSIONS = {
  family:      ['criminal', 'consumer', 'employment', 'tax', 'cyber', 'corporate'],
  consumer:    ['family', 'employment', 'criminal', 'tax', 'public'],
  employment:  ['family', 'consumer', 'criminal', 'tax', 'cyber'],
  tax:         ['family', 'consumer', 'criminal', 'employment', 'cyber'],
  education:   ['family', 'consumer', 'criminal', 'employment', 'tax', 'cyber'],
  environment: ['family', 'consumer', 'employment', 'tax', 'cyber'],
  criminal:    ['family', 'consumer', 'employment', 'tax', 'education', 'environment'],
};

// Known ALLOWED exceptions: pairs that genuinely co-occur.
// If result[0].domain + result[n].domain is in this set, don't strip.
const ALLOWED_PAIRS = new Set([
  'family|criminal',    // DV + criminal proceedings
  'criminal|family',
  'property|criminal',  // property fraud
  'criminal|property',
  'property|civil',     // possession + civil recovery
  'civil|property',
  'employment|public',  // service law + writ
  'public|employment',
  'criminal|public',    // bail + PIL/habeas
  'public|criminal',
  'cyber|criminal',     // cyber crime + BNS
  'criminal|cyber',
]);

function getDomain(law) {
  for (const { re, domain } of DOMAIN_MAP) {
    if (re.test(law.caseType)) return domain;
  }
  return 'other';
}

// Intra-domain exclusions: when primary is one of these caseTypes, strip these secondaries
// (handles cases where domain filter can't help because both are in the same domain)
const INTRA_EXCLUSIONS = {
  'Criminal – BNS (Murder / Culpable Homicide / Unnatural Death)': [
    'Criminal – BNS (Theft / Robbery / Burglary / Dacoity)',
    'Criminal – Police Excess / Human Rights Violation',
    'Criminal – BNS (Fraud / Cheating)',
    'Family – Domestic Violence',
    'Property – Hindu Succession / Inheritance Dispute',
    'Property – Will / Probate / Succession Certificate',
  ],
  'Criminal – Medical Negligence / Death by Negligence (BNS 106)': [
    'Property – Hindu Succession / Inheritance Dispute',
    'Property – Will / Probate / Succession Certificate',
    'Criminal – BNS (Murder / Culpable Homicide / Unnatural Death)',
    'Criminal – BNS (Theft / Robbery / Burglary / Dacoity)',
    'Family – Domestic Violence',
  ],
  'Criminal – Rape / Sexual Assault / Sexual Violence (BNS 64-70)': [
    'Criminal – BNS (Assault / Hurt / Grievous Hurt)',
    'Criminal – BNS (Theft / Robbery / Burglary / Dacoity)',
    'Family – Domestic Violence',
  ],
  'Criminal – BNS (Fraud / Cheating)': [
    'Criminal – BNS (Theft / Robbery / Burglary / Dacoity)',
    'Criminal – BNS (Assault / Hurt / Grievous Hurt)',
  ],
};

function applyDomainExclusion(laws) {
  if (!laws || laws.length <= 1) return laws;

  const primaryDomain = getDomain(laws[0]);
  const primaryConf   = laws[0].confidence ?? 70;
  const excluded      = DOMAIN_EXCLUSIONS[primaryDomain] || [];
  const intraBan      = INTRA_EXCLUSIONS[laws[0].caseType] || [];

  // Confidence-ratio filter: if top result is high-confidence (≥65%),
  // drop any secondary result below 30% of the top score (intra-domain noise).
  const confRatioFloor = primaryConf >= 65 ? primaryConf * 0.32 : 0;

  return laws.filter((law, i) => {
    if (i === 0) return true; // always keep primary

    // Intra-domain caseType exclusion (e.g. Murder strips Theft)
    if (intraBan.includes(law.caseType)) {
      console.log(`[intra-filter] stripped "${law.caseType}" — excluded when primary is "${laws[0].caseType}"`);
      return false;
    }

    // Confidence-ratio filter
    const lawConf = law.confidence ?? 55;
    if (confRatioFloor > 0 && lawConf < confRatioFloor) {
      console.log(`[conf-filter] stripped "${law.caseType}" (${lawConf}%) — below ${Math.round(confRatioFloor)}% floor`);
      return false;
    }

    // Cross-domain exclusion
    const d = getDomain(law);
    if (!excluded.includes(d)) return true;
    const pair = `${primaryDomain}|${d}`;
    if (ALLOWED_PAIRS.has(pair)) return true;
    console.log(`[domain-filter] stripped "${law.caseType}" (${d}) — incompatible with primary "${laws[0].caseType}" (${primaryDomain})`);
    return false;
  });
}

// ── Structured query logger ────────────────────────────────────────────────
// Emits one JSON line per request to Vercel function logs.
// Use `vercel logs --filter '[qlog]'` to stream just these lines.
// NOTE: only structural metadata is logged (law names, scores, pipeline path).
// The raw query is truncated to 200 chars. No personal identifiers are stored.
function qlog(query, source, laws, ms, extra) {
  try {
    const top = laws.slice(0, 3).map(l => ({
      law: l.caseType,
      score: l.score || l.confidence || null
    }));
    console.log(JSON.stringify({
      type:   '[qlog]',
      ts:     new Date().toISOString(),
      ms,
      source,
      q:      query.slice(0, 200),
      top,
      ...extra,
    }));
  } catch(e) { /* never let logging break the response */ }
}

// ── Handler ───────────────────────────────────────────────────────────────────
module.exports = async function handler(req, res) {
  // CORS – allow same-origin Vercel requests
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')   return res.status(405).json({ error: 'Method not allowed' });

  const { description, adminToken } = req.body || {};
  if (!description || description.trim().length < 5) {
    return res.status(400).json({ success: false, error: 'Description too short' });
  }

  // Admin debug mode — returns extra scoring info to the tester overlay
  const isAdmin = verifyAdminToken(adminToken || req.headers['x-admin-token'] || '');

  const clean = description.trim().toLowerCase().replace(/\s+/g, ' ');
  const t0    = Date.now();

  // ── Cache hit ──────────────────────────────────────────────────────────────
  const hit = cacheGet(clean);
  if (hit) {
    qlog(clean, 'cache', hit, Date.now() - t0);
    return res.json({ success: true, laws: hit, source: 'cache' });
  }

  // ── Claude classify ────────────────────────────────────────────────────────
  if (!process.env.ANTHROPIC_API_KEY || !Anthropic) {
    console.warn('[analyse] Claude unavailable — using keyword fallback');
    const laws = keywordFallback(description);
    qlog(clean, 'keywords', laws, Date.now() - t0);
    return res.json({ success: true, laws, source: 'keywords' });
  }

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    // ── Prompt 1: Extract structure (run in parallel-friendly position) ──────
    // Both calls use Haiku — total latency is P1 + P2 (sequential), not P1|P2,
    // because P2's prompt is built from P1's output.
    // Typical combined latency: ~600–900ms (vs ~400ms single-call).
    // Trade-off is accepted: accuracy improvement outweighs latency cost.
    const t1        = Date.now();
    const structure = await extractStructure(client, description);
    const extractMs = Date.now() - t1;

    if (structure) {
      console.log('[analyse] extracted:', JSON.stringify(structure), `(${extractMs}ms)`);
    } else {
      console.log('[analyse] extractor failed/skipped — using single-prompt path');
    }

    // ── Prompt 2: Classify using structure + original text ───────────────────
    const response = await client.messages.create({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 300,
      messages:   [{ role: 'user', content: buildPrompt(description, structure) }]
    });

    const lines = response.content[0].text
      .trim().split('\n')
      .map(l => l.trim()).filter(Boolean).slice(0, 3);

    const laws = lines.map((line, i) => {
      const law = DB.find(l =>
        l.caseType === line ||
        l.caseType.toLowerCase() === line.toLowerCase()
      );
      if (!law) { console.warn('[analyse] unknown caseType:', line); return null; }
      return { ...law, confidence: CONFIDENCE[i] ?? 55 };
    }).filter(Boolean);

    // Apply domain exclusion to strip cross-domain hallucinations from Claude output
    const filtered  = applyDomainExclusion(laws);

    // If Claude returned nothing recognisable (or all filtered), fall back
    const finalLaws = filtered.length ? filtered : keywordFallback(description);
    const source    = filtered.length
      ? (structure ? 'claude-2prompt' : 'claude-1prompt')
      : 'keywords-fallback';

    console.log('[analyse]', source, '→', finalLaws.map(l => l.caseType).join(' | '));
    qlog(clean, source, finalLaws, Date.now() - t0, { extractMs, structured: !!structure });
    cacheSet(clean, finalLaws);

    // Admin debug mode: include full scoring breakdown + pipeline trace
    const debug = isAdmin ? {
      structure,
      keywordScores:     keywordDebugScore(description),
      claudeRaw:         lines,
      domainFiltered:    laws.filter(l => !filtered.find(f => f.caseType === l.caseType)).map(l => l.caseType),
      primaryDomain:     laws.length ? getDomain(laws[0]) : null,
      extractMs,
    } : undefined;

    return res.json({ success: true, laws: finalLaws, source, ...(debug ? { debug } : {}) });

  } catch (err) {
    console.error('[analyse] Claude error:', err.message);
    const laws = keywordFallback(description);
    qlog(clean, 'keywords-error-fallback', laws, Date.now() - t0);

    const debug = isAdmin ? { keywordScores: keywordDebugScore(description), error: err.message } : undefined;
    return res.json({ success: true, laws, source: 'keywords-error-fallback', ...(debug ? { debug } : {}) });
  }
};
