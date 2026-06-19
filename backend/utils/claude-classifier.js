'use strict';

/**
 * claude-classifier.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Replaces the keyword-scoring engine with a Claude API call (Haiku model).
 *
 * HOW IT WORKS
 *  1. User input arrives at POST /api/inquiry/analyse
 *  2. claudeClassify(input) is called — checks cache first
 *  3. On cache miss, sends prompt to Claude Haiku (~400–600ms)
 *  4. Claude returns 1–3 exact caseType strings from the law list
 *  5. We map them back to full law objects with confidence scores
 *  6. On any error or timeout → falls back to keyword engine silently
 *
 * CACHING
 *  In-memory Map keyed by normalised input (lowercase, trimmed, collapsed spaces).
 *  Max 500 entries; oldest evicted when full.  TTL = 2 hours.
 *
 * ENV VARS REQUIRED
 *  ANTHROPIC_API_KEY  — your Anthropic API key
 *  CLASSIFIER_TIMEOUT — optional, ms before fallback kicks in (default 8000)
 */

const Anthropic = require('@anthropic-ai/sdk');
const DB        = require('../laws-database');

// ── One-time setup ────────────────────────────────────────────────────────────
const CACHE_TTL     = 2 * 60 * 60 * 1000; // 2 hours
const CACHE_MAX     = 500;
const TIMEOUT_MS    = parseInt(process.env.CLASSIFIER_TIMEOUT || '8000', 10);

// Build the exact list of valid caseType strings once at startup
const LAW_TYPES     = DB.map(l => l.caseType);
const LAW_LIST_TEXT = LAW_TYPES.join('\n');

// Confidence tiers by rank
const CONFIDENCE    = [88, 74, 60];

// Simple FIFO cache
const cache = new Map();

function cacheGet(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL) { cache.delete(key); return null; }
  return entry.value;
}

function cacheSet(key, value) {
  if (cache.size >= CACHE_MAX) {
    // Evict oldest entry
    cache.delete(cache.keys().next().value);
  }
  cache.set(key, { value, ts: Date.now() });
}

// ── Prompt ────────────────────────────────────────────────────────────────────
function buildPrompt(userInput) {
  return `You are an Indian legal classifier. A person has described their legal problem below.
Your task is to identify the 1 to 3 most relevant law categories from the provided list.

PERSON'S PROBLEM:
"${userInput}"

VALID LAW CATEGORIES (return ONLY names from this exact list, spelled exactly):
${LAW_LIST_TEXT}

CLASSIFICATION RULES:
- Return a maximum of 3 categories, minimum 1, ordered by relevance (most relevant first)
- Only include a category if it is genuinely relevant — do not pad with loosely related laws
- Physical assault by a neighbour, stranger, or colleague → "Criminal – BNS (Assault / Hurt / Grievous Hurt)", NOT Domestic Violence
- Domestic Violence requires a domestic relationship: husband, wife, in-laws, live-in partner
- Phone/mobile/chain snatched or stolen in person → "Criminal – BNS (Theft / Robbery / Snatching)", add Cyber only if hacking or digital fraud is involved
- RTI filing or denial → "Constitutional – PIL / RTI / Writ / Fundamental Rights" only, NOT employment or salary laws
- Acid attack → include both "Criminal – BNS (Assault / Hurt / Grievous Hurt)" and "Criminal – POCSO / Child Sexual Abuse / Child Protection"
- Property encroachment or boundary dispute → "Civil – Property / Boundary Dispute / Encroachment", NOT criminal
- Consumer complaints (defective product, service failure, e-commerce refund) → "Consumer – Product Defect / Service Deficiency"
- Hindi or Hinglish inputs are valid — classify based on meaning, not language
- If the problem is about job loss, termination, or being fired → "Employment – Wrongful Termination / Illegal Dismissal"
- Salary unpaid, PF not deposited, gratuity withheld → "Employment – Salary Dues / PF / Gratuity"

OUTPUT FORMAT:
Return ONLY the category names, one per line, nothing else. No numbering, no explanation, no punctuation.`;
}

// ── Main classifier function ──────────────────────────────────────────────────
async function claudeClassify(userInput) {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY not set');
  }

  // Normalise for cache key
  const cacheKey = userInput.trim().toLowerCase().replace(/\s+/g, ' ');
  const cached   = cacheGet(cacheKey);
  if (cached) {
    console.log('[classifier] cache hit for:', cacheKey.substring(0, 60));
    return cached;
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  // Race the API call against a timeout
  const apiCall = client.messages.create({
    model:      'claude-haiku-4-5-20251001',
    max_tokens: 300,
    messages:   [{ role: 'user', content: buildPrompt(userInput) }]
  });

  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`Classifier timeout after ${TIMEOUT_MS}ms`)), TIMEOUT_MS)
  );

  const response = await Promise.race([apiCall, timeout]);
  const text     = response.content[0].text.trim();

  // Parse response — each non-empty line should be a valid caseType
  const lines = text
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean)
    .slice(0, 3); // safety cap

  const results = lines
    .map((line, i) => {
      // Exact match first
      let law = DB.find(l => l.caseType === line);
      // Fuzzy fallback: case-insensitive match (handles minor capitalisation drift)
      if (!law) law = DB.find(l => l.caseType.toLowerCase() === line.toLowerCase());
      if (!law) {
        console.warn('[classifier] unrecognised caseType returned by Claude:', line);
        return null;
      }
      return { ...law, confidence: CONFIDENCE[i] ?? 55 };
    })
    .filter(Boolean);

  if (results.length > 0) {
    console.log('[classifier] Claude result:', results.map(r => `${r.caseType} (${r.confidence}%)`).join(', '));
    cacheSet(cacheKey, results);
  }

  return results;
}

// ── Cache stats (useful for monitoring) ──────────────────────────────────────
function cacheStats() {
  return { size: cache.size, max: CACHE_MAX, ttlHours: CACHE_TTL / 3600000 };
}

module.exports = { claudeClassify, cacheStats };
