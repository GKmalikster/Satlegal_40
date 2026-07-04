/**
 * POST /api/track
 * Receives analytics events from the SatLegal frontend and saves to MongoDB.
 * Fire-and-forget from index.html — never blocks the UI.
 *
 * Body (search event):
 *   { type: 'search', query, laws: [{name, conf}], sessionId, source }
 *
 * Body (lead event):
 *   { type: 'lead', stage, query, laws: [string], sessionId, email, name }
 */

const { connectDB, getModels } = require('./_db');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  // Always respond 200 immediately — this must never slow the user down
  res.status(200).json({ ok: true });

  try {
    const { type, query, laws = [], sessionId, source, stage, email, name } = req.body || {};
    if (!type) return;

    await connectDB();
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
  } catch (err) {
    // Log but don't crash — response already sent
    console.error('[track]', err.message);
  }
};
