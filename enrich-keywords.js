#!/usr/bin/env node
/**
 * SatLegal Keyword Enrichment Tool
 *
 * Uses Claude to generate colloquial, Hindi/Hinglish, and plain-English
 * phrases that non-legal users would use — then suggests additions to laws-database.js
 *
 * Usage:
 *   ANTHROPIC_API_KEY=sk-ant-xxx node enrich-keywords.js
 *   ANTHROPIC_API_KEY=sk-ant-xxx node enrich-keywords.js --law "BNS"
 *   ANTHROPIC_API_KEY=sk-ant-xxx node enrich-keywords.js --all
 *   ANTHROPIC_API_KEY=sk-ant-xxx node enrich-keywords.js --test "my boss is torturing me"
 */

'use strict';
const https = require('https');
const DB    = require('./laws-database.js');

const args   = process.argv.slice(2);
const LAW    = args[args.indexOf('--law') + 1]  || null;
const ALL    = args.includes('--all');
const TEST   = args.includes('--test') ? args[args.indexOf('--test') + 1] : null;
const KEY    = process.env.ANTHROPIC_API_KEY;

if (!KEY) { console.error('Set ANTHROPIC_API_KEY env var first.\n  ANTHROPIC_API_KEY=sk-ant-xxx node enrich-keywords.js'); process.exit(1); }

// ── Claude caller ─────────────────────────────────────────────────────────────
function claude(prompt) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }]
    });
    const req = https.request({
      hostname: 'api.anthropic.com', path: '/v1/messages', method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': KEY,
        'anthropic-version': '2023-06-01',
        'Content-Length': Buffer.byteLength(body)
      }
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve(JSON.parse(d).content[0].text); }
        catch(e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(body); req.end();
  });
}

// ── Mode 1: Test a single query ───────────────────────────────────────────────
async function testQuery(query) {
  console.log(`\nClassifying: "${query}"\n`);
  const prompt = `You are an Indian legal classifier.

A person says: "${query}"

From this list of Indian law categories, which 1-3 apply? Return ONLY the matching names, one per line.

${DB.map(l => l.caseType).join('\n')}

Rules:
- Physical assault by neighbour/stranger/colleague → "Criminal – BNS (Assault / Hurt / Grievous Hurt)", NOT Domestic Violence
- Domestic Violence only if husband/wife/in-laws/live-in partner
- Logo/brand/tagline copied → Intellectual Property
- Phone snatched → BNS Theft/Robbery, not Cyber
- Hindi/Hinglish: classify by meaning`;

  const result = await claude(prompt);
  const lines = result.trim().split('\n').filter(Boolean);
  lines.forEach((l, i) => console.log(`  ${i + 1}. ${l}`));
  console.log('');
}

// ── Mode 2: Enrich a single law ───────────────────────────────────────────────
async function enrichLaw(law) {
  const prompt = `You are helping improve an Indian legal AI system's keyword database.

Law: "${law.caseType}"
Act: "${law.actName}"
Current keywords (sample): ${[...(law.keywords.exact||[]).slice(0,5), ...(law.keywords.strong||[]).slice(0,8)].join(', ')}

Generate 40 phrases that an ordinary Indian user — NOT a lawyer — might type when they have this legal problem.
Include:
1. Plain English, casual language ("my boss fired me for no reason", "they cheated me")
2. Common Hindi/Hinglish romanized phrases ("naukri se nikala", "paisa nahi diya", "mujhe mara")
3. Emotional/informal descriptions ("I'm being bullied at work", "they're harassing me")
4. Partial/incomplete descriptions ("manager problem", "landlord issue")
5. Common misspellings or shortcuts ("harasment", "harrasment", "compny cheated")

For each phrase, also classify it as: EXACT (very specific, 100% this law), STRONG (likely this law), or WEAK (possible this law)

Format each line as: EXACT|STRONG|WEAK: phrase

Return only the phrases, no explanation.`;

  console.log(`\n📋 Enriching: ${law.caseType}`);
  console.log('   Calling Claude Haiku...\n');

  const result = await claude(prompt);
  const lines = result.trim().split('\n').filter(l => l.includes(':'));

  const exact = [], strong = [], weak = [];
  lines.forEach(line => {
    const [tier, ...rest] = line.split(':');
    const phrase = rest.join(':').trim().toLowerCase().replace(/^["']|["']$/g, '');
    if (!phrase) return;
    if (tier.includes('EXACT'))  exact.push(phrase);
    else if (tier.includes('STRONG')) strong.push(phrase);
    else weak.push(phrase);
  });

  // Filter out phrases already in DB
  const existingExact  = new Set((law.keywords.exact  || []).map(k => k.toLowerCase()));
  const existingStrong = new Set((law.keywords.strong || []).map(k => k.toLowerCase()));
  const existingWeak   = new Set((law.keywords.weak   || []).map(k => k.toLowerCase()));

  const newExact  = exact.filter(p  => !existingExact.has(p)  && !existingStrong.has(p));
  const newStrong = strong.filter(p => !existingStrong.has(p) && !existingExact.has(p));
  const newWeak   = weak.filter(p   => !existingWeak.has(p)   && !existingStrong.has(p) && !existingExact.has(p));

  console.log(`  🟣 New EXACT  (${newExact.length}):`, newExact.map(p=>`'${p}'`).join(', ') || 'none');
  console.log(`  🔵 New STRONG (${newStrong.length}):`, newStrong.map(p=>`'${p}'`).join(', ') || 'none');
  console.log(`  ⚪ New WEAK   (${newWeak.length}):`, newWeak.map(p=>`'${p}'`).join(', ') || 'none');

  return { caseType: law.caseType, newExact, newStrong, newWeak };
}

// ── Mode 3: Enrich all laws ───────────────────────────────────────────────────
async function enrichAll() {
  const results = [];
  for (const law of DB) {
    const r = await enrichLaw(law);
    results.push(r);
    // Small delay to avoid rate limits
    await new Promise(r => setTimeout(r, 300));
  }

  // Print summary patch
  console.log('\n\n╔═══════════════════════════════════════╗');
  console.log('║   SUGGESTED KEYWORD ADDITIONS          ║');
  console.log('╚═══════════════════════════════════════╝\n');

  results.filter(r => r.newExact.length + r.newStrong.length + r.newWeak.length > 0)
    .forEach(r => {
      console.log(`\n// ${r.caseType}`);
      if (r.newExact.length)  console.log(`// ADD TO EXACT:\n${r.newExact.map(p=>`'${p}'`).join(',')}`);
      if (r.newStrong.length) console.log(`// ADD TO STRONG:\n${r.newStrong.map(p=>`'${p}'`).join(',')}`);
      if (r.newWeak.length)   console.log(`// ADD TO WEAK:\n${r.newWeak.map(p=>`'${p}'`).join(',')}`);
    });
}

// ── Entry point ───────────────────────────────────────────────────────────────
(async () => {
  if (TEST) {
    await testQuery(TEST);
    return;
  }

  if (ALL) {
    await enrichAll();
    return;
  }

  if (LAW) {
    const law = DB.find(l => l.caseType.toLowerCase().includes(LAW.toLowerCase()));
    if (!law) { console.error(`Law not found: ${LAW}`); process.exit(1); }
    await enrichLaw(law);
    return;
  }

  // Default: show menu
  console.log(`
╔══════════════════════════════════════════════════════╗
║       SatLegal Keyword Enrichment Tool               ║
╚══════════════════════════════════════════════════════╝

Test a query (see what Claude returns):
  node enrich-keywords.js --test "my boss is torturing me"
  node enrich-keywords.js --test "naukri se nikal diya mujhe"
  node enrich-keywords.js --test "landlord is harassing me"

Enrich a specific law (get colloquial phrase suggestions):
  node enrich-keywords.js --law "BNS"
  node enrich-keywords.js --law "Domestic"
  node enrich-keywords.js --law "Employment"
  node enrich-keywords.js --law "Trademark"

Enrich ALL laws (takes ~3 min, generates full patch):
  node enrich-keywords.js --all > suggestions.txt

Available laws in DB:
${DB.map((l, i) => `  ${(i+1).toString().padStart(2)}. ${l.caseType}`).join('\n')}
`);
})().catch(console.error);
