// api/analyse.js — Vercel Serverless Function
// Deployed at: POST /api/analyse
// Replaces browser-side keyword classification with Claude Haiku AI
// Falls back gracefully if ANTHROPIC_API_KEY is not set

const Anthropic = require('@anthropic-ai/sdk');
const DB        = require('../laws-database.js');

// ── Build the valid caseType list once at cold-start ────────────────────────
const LAW_TYPES_TEXT = DB.map(l => l.caseType).join('\n');
const CONFIDENCE     = [88, 72, 58];

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

// ── Prompt ────────────────────────────────────────────────────────────────────
function buildPrompt(input) {
  return `You are an Indian legal classifier. A person has described their legal problem.
Identify the 1 to 3 most relevant law categories from the exact list below.

PERSON'S PROBLEM:
"${input}"

VALID LAW CATEGORIES (return ONLY names from this list, spelled exactly):
${LAW_TYPES_TEXT}

CLASSIFICATION RULES:
- Maximum 3 categories, minimum 1, ordered by relevance (most relevant first)
- Only include a category if it is genuinely relevant — do not pad
- Physical assault by neighbour, stranger, or colleague → "Criminal – BNS (Assault / Hurt / Grievous Hurt)", NOT Domestic Violence
- Domestic Violence requires a domestic relationship: husband, wife, in-laws, live-in partner
- Wall broken / property damage by neighbour → "Civil – Property / Boundary Dispute / Encroachment"
- Phone/mobile/chain snatched physically → "Criminal – BNS (Theft / Robbery / Snatching)", add Cyber only if digital fraud involved
- RTI filing or denial → "Constitutional – PIL / RTI / Writ / Fundamental Rights" only
- Acid attack → include "Criminal – BNS (Assault / Hurt / Grievous Hurt)" and "Criminal – POCSO / Child Sexual Abuse / Child Protection"
- Consumer complaints (product, e-commerce, washing machine, appliance) → "Consumer – Product Defect / Service Deficiency"
- Hindi or Hinglish inputs are valid — classify by meaning, not language
- Job termination / being fired → "Employment – Wrongful Termination / Illegal Dismissal"
- Unpaid salary, PF, gratuity → "Employment – Salary Dues / PF / Gratuity"
- Do NOT return cyber/data laws for purely physical incidents

OUTPUT FORMAT:
Return ONLY category names, one per line. No numbering, no punctuation, no explanation.`;
}

// ── Keyword fallback (runs in browser too, available here server-side) ────────
function keywordFallback(description) {
  if (!DB || !DB.length) return [];
  const input = description.toLowerCase();
  const scored = DB.map(l => {
    let score = 0;
    (l.keywords?.exact  || []).forEach(k => { if (input.includes(k.toLowerCase())) score += 50; });
    (l.keywords?.strong || []).forEach(k => { if (input.includes(k.toLowerCase())) score += 22; });
    (l.keywords?.weak   || []).forEach(k => { if (input.includes(k.toLowerCase())) score +=  8; });
    return { law: l, score };
  }).filter(x => x.score > 0).sort((a, b) => b.score - a.score);

  const threshold = 20;
  const above     = scored.filter(x => x.score >= threshold);
  const results   = (above.length ? above : scored.slice(0, 3)).slice(0, 3);
  const maxScore  = results[0]?.score || 1;

  return results.map(x => ({
    ...x.law,
    confidence: Math.min(97, Math.round((x.score / maxScore) * 90))
  }));
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

  // ── Cache hit ──────────────────────────────────────────────────────────────
  const hit = cacheGet(clean);
  if (hit) return res.json({ success: true, laws: hit, source: 'cache' });

  // ── Claude classify ────────────────────────────────────────────────────────
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn('[analyse] ANTHROPIC_API_KEY not set — using keyword fallback');
    const laws = keywordFallback(description);
    return res.json({ success: true, laws, source: 'keywords' });
  }

  try {
    const client   = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const response = await client.messages.create({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 300,
      messages:   [{ role: 'user', content: buildPrompt(description) }]
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
    const source    = laws.length ? 'claude' : 'keywords-fallback';

    console.log('[analyse]', source, '→', finalLaws.map(l => l.caseType).join(' | '));
    cacheSet(clean, finalLaws);
    return res.json({ success: true, laws: finalLaws, source });

  } catch (err) {
    console.error('[analyse] Claude error:', err.message);
    const laws = keywordFallback(description);
    return res.json({ success: true, laws, source: 'keywords-error-fallback' });
  }
};
