/**
 * review-feedback.js — Weekly feedback log analyser
 *
 * Reads exported Vercel logs and tells you:
 *   1. Which laws users most often uncheck (wrong results)
 *   2. Which queries had all laws rejected (complete miss)
 *   3. Which queries caused abandonment (user went Back)
 *   4. Law rejection rate (unchecked / shown)
 *
 * HOW TO EXPORT LOGS:
 *   vercel logs --since 168h --filter '[flog]' > feedback.jsonl
 *   (168h = last 7 days)
 *
 * USAGE:
 *   node review-feedback.js feedback.jsonl
 *   node review-feedback.js feedback.jsonl --top 20
 *   node review-feedback.js feedback.jsonl --source claude-2prompt
 *
 * OUTPUT:
 *   A prioritised list of queries + laws to fix, ready for copy-paste into laws-database.js
 */

const fs   = require('fs');
const path = require('path');

const args      = process.argv.slice(2);
const logFile   = args.find(a => !a.startsWith('--'));
const topN      = args.includes('--top')    ? parseInt(args[args.indexOf('--top') + 1])    : 15;
const srcFilter = args.includes('--source') ? args[args.indexOf('--source') + 1].toLowerCase() : null;

if (!logFile) {
  console.log('Usage: node review-feedback.js <feedback.jsonl> [--top N] [--source claude-2prompt]');
  console.log('\nExport logs first:');
  console.log('  vercel logs --since 168h --filter \'[flog]\' > feedback.jsonl');
  process.exit(0);
}

// ── Parse log file ─────────────────────────────────────────────────────────
const lines = fs.readFileSync(logFile, 'utf8').split('\n').filter(Boolean);

const events = [];
for (const line of lines) {
  try {
    // Vercel log lines have a prefix before the JSON — find the first '{'
    const jsonStart = line.indexOf('{');
    if (jsonStart < 0) continue;
    const parsed = JSON.parse(line.slice(jsonStart));
    if (parsed.type !== '[flog]') continue;
    if (srcFilter && parsed.source && !parsed.source.toLowerCase().includes(srcFilter)) continue;
    events.push(parsed);
  } catch (e) { /* skip malformed lines */ }
}

if (!events.length) {
  console.log('No [flog] events found in file. Check export command and file path.');
  process.exit(0);
}

// ── Aggregate ──────────────────────────────────────────────────────────────
const uncheckedCount = {};   // law → count of times unchecked
const shownCount     = {};   // law → count of times shown
const allRejected    = [];   // { q, shown } where user rejected everything
const abandoned      = [];   // { q, shown } where user clicked Back
const queryRejections= {};   // q → { shown, unchecked[] }

for (const e of events) {
  if (e.event === 'law_unchecked') {
    const law = e.law || 'Unknown';
    uncheckedCount[law] = (uncheckedCount[law] || 0) + 1;

    // Track per-query
    const q = e.q || '(no query)';
    if (!queryRejections[q]) queryRejections[q] = { shown: e.shown || [], unchecked: [] };
    queryRejections[q].unchecked.push(law);
  }

  if (e.event === 'step_completed') {
    // Count how many times each law was shown
    (e.shown || []).forEach(law => { shownCount[law] = (shownCount[law] || 0) + 1; });
    // All-rejected: user kept nothing
    if (e.all_rejected || (Array.isArray(e.kept) && e.kept.length === 0)) {
      allRejected.push({ q: e.q || '(no query)', shown: e.shown || [], source: e.source });
    }
  }

  if (e.event === 'step_abandoned') {
    abandoned.push({ q: e.q || '(no query)', shown: e.shown || [], source: e.source });
  }
}

// ── Rejection rate per law ────────────────────────────────────────────────
const lawStats = Object.keys({ ...uncheckedCount, ...shownCount }).map(law => ({
  law,
  shown:     shownCount[law]     || 0,
  unchecked: uncheckedCount[law] || 0,
  rate:      shownCount[law]
    ? Math.round((uncheckedCount[law] || 0) / shownCount[law] * 100)
    : 0,
})).sort((a, b) => b.unchecked - a.unchecked);

// ── Print ──────────────────────────────────────────────────────────────────
const W = 80;
const hr  = '─'.repeat(W);
const dhr = '═'.repeat(W);

function section(t) { console.log('\n' + dhr + `\n  ${t}\n` + dhr); }

console.log('\n' + '█'.repeat(W));
console.log('  SatLegal Feedback Review');
console.log('  Events parsed: ' + events.length + (srcFilter ? `  [filtered: ${srcFilter}]` : ''));
console.log('  Period: ' + (events[0]?.ts||'?').slice(0,10) + ' → ' + (events[events.length-1]?.ts||'?').slice(0,10));
console.log('█'.repeat(W));

// ── Report 1: Most unchecked laws ────────────────────────────────────────
section('1. MOST FREQUENTLY UNCHECKED LAWS  (fix these first)');
console.log('  Law name → times unchecked / times shown = rejection rate\n');
if (!lawStats.length) {
  console.log('  No uncheck events recorded yet.');
} else {
  lawStats.slice(0, topN).forEach(s => {
    const bar   = '▓'.repeat(Math.min(20, Math.round(s.rate / 5)));
    const flag  = s.rate >= 50 ? ' ⚠ HIGH' : s.rate >= 25 ? ' ↑ medium' : '';
    console.log(`  ${s.law.slice(0,55).padEnd(56)} ${String(s.unchecked).padStart(3)}/${String(s.shown).padStart(3)}  ${String(s.rate).padStart(3)}%  ${bar}${flag}`);
  });
}

// ── Report 2: Queries where user unchecked something ─────────────────────
section('2. QUERIES WITH REJECTIONS  (add these as exact phrases or new rules)');
console.log('  Each row: user query → law they removed\n');
const rejectedQueries = Object.entries(queryRejections)
  .filter(([,v]) => v.unchecked.length > 0)
  .sort((a, b) => b[1].unchecked.length - a[1].unchecked.length)
  .slice(0, topN);

if (!rejectedQueries.length) {
  console.log('  None recorded yet.');
} else {
  rejectedQueries.forEach(([q, v]) => {
    console.log(`  Q: "${q.slice(0, 90)}"`);
    v.unchecked.forEach(law => console.log(`     REMOVED: ${law}`));
    console.log();
  });
}

// ── Report 3: Complete misses ─────────────────────────────────────────────
section('3. COMPLETE MISSES  (user rejected ALL suggested laws)');
console.log('  These queries need new laws or major keyword additions.\n');
if (!allRejected.length) {
  console.log('  None recorded — good sign!');
} else {
  allRejected.slice(0, topN).forEach(r => {
    console.log(`  Q:     "${r.q.slice(0, 90)}"`);
    console.log(`  Shown: ${(r.shown||[]).join(' | ')}`);
    console.log(`  Source: ${r.source || '?'}`);
    console.log();
  });
}

// ── Report 4: Abandonments ────────────────────────────────────────────────
section('4. ABANDONMENTS  (user clicked Back from law screen)');
console.log('  User saw laws and went back — likely nothing looked right.\n');
if (!abandoned.length) {
  console.log('  None recorded.');
} else {
  abandoned.slice(0, topN).forEach(r => {
    console.log(`  Q:     "${r.q.slice(0, 90)}"`);
    console.log(`  Shown: ${(r.shown||[]).join(' | ')}`);
    console.log();
  });
}

// ── Summary + action list ─────────────────────────────────────────────────
section('SUMMARY & PRIORITY ACTION LIST');
console.log(`  Total feedback events : ${events.length}`);
console.log(`  Rejection events      : ${Object.values(uncheckedCount).reduce((a,b)=>a+b,0)}`);
console.log(`  Complete misses       : ${allRejected.length}`);
console.log(`  Abandonments          : ${abandoned.length}`);
console.log('\n  Suggested fixes (by priority):');

const highPriority = lawStats.filter(s => s.rate >= 40 && s.shown >= 3);
if (!highPriority.length) {
  console.log('  No high-priority laws to fix yet — keep collecting data.');
} else {
  highPriority.slice(0, 5).forEach((s, i) => {
    console.log(`  ${i+1}. "${s.law}" — rejected ${s.rate}% of the time (${s.unchecked}/${s.shown})`);
    console.log(`     → Find the queries in Report 2 above and add exact phrases to laws-database.js`);
    console.log(`     → Or add a Rule to api/analyse.js buildPrompt() to prevent this law being returned in this context`);
  });
}

console.log('\n  WORKFLOW:');
console.log('  1. Take top query from Report 2');
console.log('  2. Run: node test-live.js --filter "<keyword from query>"');
console.log('  3. Fix in laws-database.js or api/analyse.js');
console.log('  4. Run: node benchmark.js  → verify 992/992');
console.log('  5. git push → run test-live.js again\n');
console.log(hr);
