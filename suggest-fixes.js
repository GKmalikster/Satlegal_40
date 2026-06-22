/**
 * suggest-fixes.js — AI-powered fix suggester
 *
 * Reads rejection data from feedback logs, sends the worst offenders to Claude,
 * and gets back specific code changes to apply to laws-database.js or api/analyse.js.
 *
 * Usage:
 *   node suggest-fixes.js feedback.jsonl
 *   node suggest-fixes.js feedback.jsonl --top 5     (analyse top 5 rejected laws, default 3)
 *   node suggest-fixes.js feedback.jsonl --apply      (write changes to laws-database.js directly)
 *
 * Requires:  ANTHROPIC_API_KEY env variable
 *   export ANTHROPIC_API_KEY=sk-ant-...
 *
 * Output:
 *   For each rejected law: the root cause + the exact keyword / rule change to make.
 *   With --apply: patches laws-database.js automatically (you still git diff before pushing).
 */

require('dotenv').config({ path: '.env.local' });

const fs   = require('fs');
const path = require('path');

// ── Args ─────────────────────────────────────────────────────────────────────
const args    = process.argv.slice(2);
const logFile = args.find(a => !a.startsWith('--'));
const topN    = args.includes('--top')   ? parseInt(args[args.indexOf('--top') + 1]) : 3;
const doApply = args.includes('--apply');

if (!logFile) {
  console.log('Usage: node suggest-fixes.js <feedback.jsonl> [--top N] [--apply]');
  console.log('\nExport logs first:');
  console.log('  vercel logs --since 168h --filter \'[flog]\' > feedback.jsonl');
  process.exit(0);
}

if (!process.env.ANTHROPIC_API_KEY) {
  console.error('ERROR: ANTHROPIC_API_KEY not set.');
  console.error('Run:  export ANTHROPIC_API_KEY=sk-ant-...');
  process.exit(1);
}

// ── Parse feedback log ────────────────────────────────────────────────────────
const lines  = fs.readFileSync(logFile, 'utf8').split('\n').filter(Boolean);
const events = [];

for (const line of lines) {
  try {
    const jsonStart = line.indexOf('{');
    if (jsonStart < 0) continue;
    const obj = JSON.parse(line.slice(jsonStart));
    if (obj.type === '[flog]') events.push(obj);
  } catch(e) {}
}

if (!events.length) {
  console.log('No [flog] events found. Check the file and export command.');
  process.exit(0);
}

// ── Aggregate: which law rejected most + which queries triggered it ──────────
const rejections = {}; // law → [{ query, shown }]

for (const e of events) {
  if (e.event === 'law_unchecked' && e.law && e.q) {
    if (!rejections[e.law]) rejections[e.law] = [];
    rejections[e.law].push({ query: e.q, shown: e.shown || [] });
  }
}

const ranked = Object.entries(rejections)
  .sort((a, b) => b[1].length - a[1].length)
  .slice(0, topN);

if (!ranked.length) {
  console.log('No law_unchecked events found. Collect more feedback first.');
  process.exit(0);
}

// ── Load current law keywords for context ─────────────────────────────────────
const DB = require('./laws-database.js');

function getLawKeywords(caseType) {
  const law = DB.find(l => l.caseType === caseType);
  if (!law) return null;
  return {
    exact:    (law.keywords?.exact    || []).slice(0, 10),
    strong:   (law.keywords?.strong   || []).slice(0, 15),
    weak:     (law.keywords?.weak     || []).slice(0, 10),
  };
}

// ── Claude API call ───────────────────────────────────────────────────────────
const Anthropic = require('@anthropic-ai/sdk');
const client    = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function getSuggestion(rejectedLaw, queries, allLawNames) {
  const kws = getLawKeywords(rejectedLaw);
  const kwBlock = kws
    ? `Current keywords for "${rejectedLaw}":
  exact  (50pts): ${kws.exact.join(', ') || 'none'}
  strong (22pts): ${kws.strong.join(', ') || 'none'}
  weak    (8pts): ${kws.weak.join(', ') || 'none'}`
    : `"${rejectedLaw}" not found in laws-database.js`;

  const queryBlock = queries.slice(0, 8).map((r, i) =>
    `  ${i+1}. "${r.query}"  [shown alongside: ${r.shown.filter(l=>l!==rejectedLaw).join(' | ') || 'only this law'}]`
  ).join('\n');

  const prompt = `You are a keyword engineer for an Indian legal classification system (SatLegal).

A law called "${rejectedLaw}" keeps being returned by the AI classifier for the following user queries, but users are UNCHECKING it — meaning it is WRONG for these cases.

QUERIES WHERE USERS REJECTED THIS LAW:
${queryBlock}

${kwBlock}

Your job: diagnose WHY this law is being wrongly returned, and give the EXACT fix.

Think about:
1. Which keywords in the law's strong/exact list match these queries incorrectly?
2. Which specific words in these queries are triggering false matches?
3. Should those keywords be removed, made more specific, or moved to a lower tier?
4. Is there a Claude prompt rule that should be added to prevent this law in this context?

Respond in this exact JSON format (no markdown, no explanation outside the JSON):
{
  "root_cause": "1-2 sentence diagnosis of why the wrong match happens",
  "keyword_fixes": [
    {
      "action": "remove | demote | make_specific",
      "keyword": "the exact keyword string",
      "from_tier": "strong | exact | weak",
      "to_tier": "weak | null",
      "reason": "brief reason"
    }
  ],
  "exact_phrases_to_add": [
    "exact phrase that correctly identifies this law (not the wrong-match queries)"
  ],
  "prompt_rule": "If a Claude prompt rule would help, write it here. Otherwise null.",
  "confidence": "high | medium | low"
}`;

  const response = await client.messages.create({
    model:      'claude-opus-4-8',   // Use Opus for fix quality — this runs once a week, not per request
    max_tokens: 1000,
    messages:   [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].text.trim()
    .replace(/^```json?\n?/, '').replace(/\n?```$/, '');
  return JSON.parse(text);
}

// ── Apply suggestions to laws-database.js ────────────────────────────────────
function applyKeywordFix(fix, caseType) {
  let content = fs.readFileSync('./laws-database.js', 'utf8');
  const law   = DB.find(l => l.caseType === caseType);
  if (!law) return false;

  let changed = false;

  for (const kf of (fix.keyword_fixes || [])) {
    if (kf.action === 'remove' || kf.action === 'demote') {
      // Remove keyword from its current tier
      const tier   = kf.from_tier;
      const kw     = kf.keyword;
      const before = content;
      // Replace "'keyword'," or "'keyword'" in the tier context
      content = content.replace(
        new RegExp(`'${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}'\\s*,?\\s*`, 'g'),
        (match, offset) => {
          // Only remove if it's near the law's caseType (rough heuristic: within 3000 chars)
          const chunk = content.substring(Math.max(0, offset - 3000), offset);
          if (!chunk.includes(caseType)) return match;
          changed = true;
          console.log(`    Removed '${kw}' from ${tier}`);
          return '';
        }
      );
    }
  }

  // Add exact phrases
  for (const phrase of (fix.exact_phrases_to_add || [])) {
    // Find the exact array for this law and append
    const lawIdx = content.indexOf(`"${caseType}"`);
    if (lawIdx < 0) continue;
    const exactIdx = content.indexOf("exact:", lawIdx);
    if (exactIdx < 0 || exactIdx > lawIdx + 5000) continue;
    const arrStart = content.indexOf('[', exactIdx);
    if (arrStart < 0) continue;
    const insertPoint = arrStart + 1;
    content = content.slice(0, insertPoint) + `'${phrase}',` + content.slice(insertPoint);
    console.log(`    Added exact phrase: '${phrase}'`);
    changed = true;
  }

  if (changed) fs.writeFileSync('./laws-database.js', content, 'utf8');
  return changed;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const W   = 80;
  const sep = '─'.repeat(W);

  console.log('\n' + '█'.repeat(W));
  console.log('  SatLegal Fix Suggester — powered by Claude Opus');
  console.log(`  Analysing top ${ranked.length} rejected laws from ${events.length} feedback events`);
  console.log('█'.repeat(W) + '\n');

  const allLawNames = DB.map(l => l.caseType);
  const suggestions = [];

  for (const [law, queries] of ranked) {
    console.log(`\n${sep}`);
    console.log(`❌  "${law}"  — rejected ${queries.length} time(s)`);
    console.log(`    Sample queries:`);
    queries.slice(0, 4).forEach(r => console.log(`      • "${r.query.slice(0, 80)}"`));
    console.log(`\n    Asking Claude to diagnose...`);

    try {
      const fix = await getSuggestion(law, queries, allLawNames);
      suggestions.push({ law, queries, fix });

      console.log(`\n  ROOT CAUSE: ${fix.root_cause}`);
      console.log(`  CONFIDENCE: ${fix.confidence}`);

      if (fix.keyword_fixes?.length) {
        console.log('\n  KEYWORD CHANGES:');
        fix.keyword_fixes.forEach(kf => {
          const action = kf.action === 'remove' ? 'Remove' : kf.action === 'demote' ? 'Demote' : 'Make specific';
          const target = kf.to_tier ? `→ move to ${kf.to_tier}` : '→ delete entirely';
          console.log(`    ${action} '${kf.keyword}' (from ${kf.from_tier}) ${target}`);
          console.log(`    Reason: ${kf.reason}`);
        });
      }

      if (fix.exact_phrases_to_add?.length) {
        console.log('\n  ADD THESE EXACT PHRASES to laws-database.js:');
        fix.exact_phrases_to_add.forEach(p => console.log(`    '${p}'`));
      }

      if (fix.prompt_rule) {
        console.log('\n  ADD THIS RULE to api/analyse.js buildPrompt():');
        console.log(`    "${fix.prompt_rule}"`);
      }

      if (doApply) {
        console.log('\n  Applying keyword changes...');
        const applied = applyKeywordFix(fix, law);
        console.log(applied ? '  ✅ Changes written to laws-database.js' : '  ⚠ No automatic changes made (review manually)');
      }

    } catch (e) {
      console.log(`  ⚠ Claude error: ${e.message}`);
    }

    // Rate limit: pause between calls
    await new Promise(r => setTimeout(r, 1000));
  }

  // ── Summary ────────────────────────────────────────────────────────────────
  console.log('\n' + '═'.repeat(W));
  console.log('  NEXT STEPS\n');
  if (doApply) {
    console.log('  1. git diff laws-database.js        ← review what changed');
    console.log('  2. node benchmark.js                ← must still be 992/992');
    console.log('  3. git add laws-database.js api/analyse.js');
    console.log('  4. git commit -m "fix: [describe what you fixed]"');
    console.log('  5. git push                         ← deploys to Vercel');
    console.log('  6. node test-live.js                ← confirm fix on live site');
    console.log('  7. Add the fixed query to benchmark.js so it never regresses');
  } else {
    console.log('  1. Review suggestions above');
    console.log('  2. Manually apply keyword changes to laws-database.js');
    console.log('     OR re-run with --apply to let this script patch the file:');
    console.log(`       node suggest-fixes.js ${logFile} --apply`);
    console.log('  3. node benchmark.js                ← verify 992/992');
    console.log('  4. git push');
  }
  console.log('\n' + sep);

  // Save suggestions as JSON for dashboard ingestion
  const outFile = 'suggested-fixes.json';
  fs.writeFileSync(outFile, JSON.stringify(suggestions, null, 2));
  console.log(`\n  Suggestions saved to ${outFile} (can be loaded in feedback dashboard)`);
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
