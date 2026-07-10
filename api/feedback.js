/**
 * api/feedback.js — Passive user behaviour logger
 * Deployed at: POST /api/feedback
 *
 * Captures implicit signals that indicate wrong classification —
 * without asking the user anything. The user never sees this.
 *
 * Events logged:
 *   law_unchecked    → user removed a suggested law from their case (strongest wrong-result signal)
 *   law_rechecked    → user put a law back (weaker signal — curiosity or mistake)
 *   step_abandoned   → user clicked Back from the law-selection screen (nothing looked right)
 *   step_completed   → user clicked Next with N laws checked (which ones survived)
 *
 * All events are emitted as [flog] JSON lines to Vercel function logs.
 * Stream them with:  vercel logs --filter '[flog]'
 * Export a day:      vercel logs --since 24h --filter '[flog]' > feedback.jsonl
 * Then analyse with: node review-feedback.js feedback.jsonl
 *
 * Privacy: raw query is truncated to 200 chars. No names/emails/phones logged.
 */

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')   return res.status(405).end();
  if (JSON.stringify(req.body || {}).length > 10000) return res.status(413).json({ error: 'Payload too large' });

  try {
    const {
      event,        // 'law_unchecked' | 'law_rechecked' | 'step_abandoned' | 'step_completed'
      query,        // original user query (truncated server-side)
      law,          // caseType of the affected law (for uncheck/recheck events)
      shown,        // array of caseTypes shown to user (all results from analyse)
      kept,         // array of caseTypes still checked when user clicked Next
      source,       // 'claude-2prompt' | 'claude-1prompt' | 'keywords-fallback' | 'cache'
      sessionId,    // anonymous session ID from frontend (no PII)
    } = req.body || {};

    if (!event) return res.status(400).json({ error: 'event required' });

    const record = {
      type:      '[flog]',
      ts:        new Date().toISOString(),
      event,
      source:    source   || null,
      session:   sessionId || null,
      q:         query  ? String(query).slice(0, 200)  : null,
      law:       law    ? String(law).slice(0, 100)    : null,
      shown:     Array.isArray(shown) ? shown.slice(0, 5) : null,
      kept:      Array.isArray(kept)  ? kept.slice(0, 5)  : null,
      // Derived signals
      rejection_count: Array.isArray(shown) && Array.isArray(kept)
        ? shown.length - kept.length
        : null,
      all_rejected: Array.isArray(shown) && Array.isArray(kept) && kept.length === 0
        ? true : null,
    };

    console.log(JSON.stringify(record));
    return res.status(200).json({ ok: true });

  } catch (e) {
    // Never let logging break anything — silently swallow
    console.error('[feedback] error:', e.message);
    return res.status(200).json({ ok: true });
  }
};
