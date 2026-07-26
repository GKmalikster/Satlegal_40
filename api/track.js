/**
 * POST /api/track   — analytics events → MongoDB
 * POST /api/feedback — passive UX feedback logger (merged here to stay under 12-function limit)
 *
 * Body (search event):   { type: 'search', query, laws, sessionId, source }
 * Body (lead event):     { type: 'lead', stage, query, laws, sessionId, email, name }
 * Body (feedback event): { event, query, law, shown, kept, source, sessionId }
 */

const { connectDB, getModels } = require('./_db');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();
  if (JSON.stringify(req.body || {}).length > 10000) return res.status(413).json({ error: 'Payload too large' });

  // ── POST /api/feedback — passive behaviour logger (fire-and-forget log only) ─
  const reqPath = (req.url || '').split('?')[0];
  if (reqPath === '/api/feedback') {
    try {
      const { event, query, law, shown, kept, source, sessionId } = req.body || {};
      if (!event) return res.status(400).json({ error: 'event required' });
      console.log(JSON.stringify({
        type: '[flog]', ts: new Date().toISOString(), event,
        source: source || null, session: sessionId || null,
        q:     query ? String(query).slice(0, 200)  : null,
        law:   law   ? String(law).slice(0, 100)    : null,
        shown: Array.isArray(shown) ? shown.slice(0, 5) : null,
        kept:  Array.isArray(kept)  ? kept.slice(0, 5)  : null,
        rejection_count: Array.isArray(shown) && Array.isArray(kept) ? shown.length - kept.length : null,
        all_rejected:    Array.isArray(shown) && Array.isArray(kept) && kept.length === 0 ? true : null,
      }));
      return res.status(200).json({ ok: true });
    } catch (e) {
      console.error('[feedback]', e.message);
      return res.status(200).json({ ok: true });
    }
  }

  // ── Save to MongoDB BEFORE responding ─────────────────────────────────────────
  // Vercel freezes/terminates Lambda after res.end() — any await after the response
  // is silently dropped. We save first (with a 4s timeout guard), then respond.
  try {
    const { type, query, laws = [], sessionId, source, stage, email, name } = req.body || {};
    if (!type) return res.status(200).json({ ok: true });

    await Promise.race([
      connectDB(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('db_timeout')), 4000))
    ]);
    const { SearchQuery, AnalyticsEvent } = getModels();

    if (type === 'search' && query) {
      const detectedLaws    = laws.map(l => l.name || l).filter(Boolean);
      const lawCategories   = [...new Set(detectedLaws.map(n => n.split(/[–-]/)[0].trim()).filter(Boolean))];
      const topConfidence   = laws.length > 0 ? Math.max(...laws.map(l => l.conf || 0)) : 0;

      await SearchQuery.create({
        query:         String(query).substring(0, 300),
        detectedLaws,
        lawCategories,
        topConfidence,
        source:        source || 'wizard',
        sessionId:     sessionId || 'anon',
        userAgent:     (req.headers['user-agent'] || '').substring(0, 200),
        ip:            req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || '',
        ts:            new Date()
      });
    }

    if (type === 'lead' && stage) {
      await AnalyticsEvent.create({
        event:     'lead_' + stage,
        sessionId: sessionId || 'anon',
        query:     String(query || '').substring(0, 300),
        data:      { laws, email: email ? String(email).substring(0, 100) : undefined, name },
        ts:        new Date()
      });
    }

    // ── Unmapped form submission — user submitted callback request for coverage gap ──
    if (type === 'unmapped_form') {
      const { name: nm, phone, detail, answers } = req.body || {};
      await AnalyticsEvent.create({
        event:     'unmapped_form',
        sessionId: sessionId || 'anon',
        query:     String(query || '').substring(0, 300),
        data: {
          name:   nm  ? String(nm).substring(0, 100)     : undefined,
          phone:  phone ? String(phone).substring(0, 20)  : undefined,
          email:  email ? String(email).substring(0, 100) : undefined,
          detail: detail ? String(detail).substring(0, 600) : undefined,
          answers: answers || {}
        },
        ts: new Date()
      });
    }
  } catch (err) {
    console.error('[track]', err.message);
  }

  // Respond after all saves complete (or after timeout/error — never leave client hanging)
  return res.status(200).json({ ok: true });
};
