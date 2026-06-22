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
`Extract key legal facts from this problem. Return ONLY valid JSON, no explanation.

Problem: "${rawInput.slice(0, 300)}"

Return exactly this shape (choose the best-fitting value for each field):
{"what_happened":"core event in 5 words","relationship":"employer-employee|buyer-seller|spouse|landlord-tenant|stranger|other","harm_type":"termination|theft|fraud|assault|deficiency|negligence|harassment|other","context":"workplace|consumer|criminal|family|property|digital|public"}`
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

OUTPUT FORMAT:
Return ONLY category names, one per line. No numbering, no punctuation, no explanation.`;
}

// ── Keyword fallback (runs in browser too, available here server-side) ────────
function keywordFallback(description) {
  if (!DB || !DB.length) return [];
  const input = description.toLowerCase();
  const scored = DB.map(l => {
    let score = 0;
    (l.keywords?.exact    || []).forEach(k => { if (input.includes(k.toLowerCase())) score += 50; });
    (l.keywords?.strong   || []).forEach(k => { if (input.includes(k.toLowerCase())) score += 22; });
    (l.keywords?.hinglish || []).forEach(k => { if (input.includes(k.toLowerCase())) score += 22; });
    (l.keywords?.casual   || []).forEach(k => { if (input.includes(k.toLowerCase())) score += 22; });
    (l.keywords?.weak     || []).forEach(k => { if (input.includes(k.toLowerCase())) score +=  8; });
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

  const { description } = req.body || {};
  if (!description || description.trim().length < 5) {
    return res.status(400).json({ success: false, error: 'Description too short' });
  }

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

    // If Claude returned nothing recognisable, fall back
    const finalLaws = laws.length ? laws : keywordFallback(description);
    const source    = laws.length
      ? (structure ? 'claude-2prompt' : 'claude-1prompt')
      : 'keywords-fallback';

    console.log('[analyse]', source, '→', finalLaws.map(l => l.caseType).join(' | '));
    qlog(clean, source, finalLaws, Date.now() - t0, { extractMs, structured: !!structure });
    cacheSet(clean, finalLaws);
    return res.json({ success: true, laws: finalLaws, source });

  } catch (err) {
    console.error('[analyse] Claude error:', err.message);
    const laws = keywordFallback(description);
    qlog(clean, 'keywords-error-fallback', laws, Date.now() - t0);
    return res.json({ success: true, laws, source: 'keywords-error-fallback' });
  }
};
