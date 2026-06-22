/**
 * analyze-keywords.js
 *
 * Keyword collision & overlap detector for SatLegal laws classifier.
 *
 * Finds:
 *   1. Weak keywords in Law A that also appear in Law B's strong/exact arrays
 *      → Law B will always outscore Law A when that keyword appears
 *   2. Strong keywords shared across many laws (too generic, add noise)
 *   3. Laws with highest total collision exposure (most likely to be beaten)
 *   4. Exact phrases that are substrings of each other (one dominates the other)
 *
 * Usage:
 *   node analyze-keywords.js              → full report
 *   node analyze-keywords.js --law Rent   → report for a specific law
 *   node analyze-keywords.js --top 20     → show top N collisions only
 */

const db = require('./laws-database.js');
// laws-database.js exports array directly as module.exports (LAWS_DATABASE)
const laws = Array.isArray(db) ? db : Object.values(db).filter(v => typeof v === 'object' && v !== null && v.caseType);

const args = process.argv.slice(2);
const filterLaw = args.includes('--law') ? args[args.indexOf('--law') + 1] : null;
const topN = args.includes('--top') ? parseInt(args[args.indexOf('--top') + 1]) : 999;

// ─── helpers ──────────────────────────────────────────────────────────────────

function lawName(law) {
  return law.caseType.replace('Family – ', '').replace('Civil – ', '')
    .replace('Criminal – ', '').replace('Employment – ', '')
    .replace('Environment – ', '').replace('Constitutional – ', '')
    .replace('Education – ', '').split(' /')[0].split(' +')[0].trim();
}

function normalize(kw) {
  return kw.toLowerCase().trim();
}

function getKeywords(law, tier) {
  const kws = law.keywords[tier];
  if (!kws) return [];
  return Array.isArray(kws) ? kws.map(normalize) : [];
}

// ─── build index ──────────────────────────────────────────────────────────────

const lawList = laws.map((law, idx) => ({
  idx,
  name: lawName(law),
  exact: getKeywords(law, 'exact'),
  strong: getKeywords(law, 'strong'),
  weak: getKeywords(law, 'weak'),
  hinglish: getKeywords(law, 'hinglish') || getKeywords(law, 'casual') || [],
}));

// Build reverse index: keyword → { law, tier, score }
// score: exact=50, strong=22, weak=8
const SCORES = { exact: 50, strong: 22, hinglish: 22, weak: 8 };

const kwIndex = {}; // kw → [{ lawName, tier, score }]

for (const law of lawList) {
  for (const tier of ['exact', 'strong', 'hinglish', 'weak']) {
    for (const kw of law[tier] || []) {
      const n = normalize(kw);
      if (!kwIndex[n]) kwIndex[n] = [];
      kwIndex[n].push({ lawName: law.name, tier, score: SCORES[tier] });
    }
  }
}

// ─── ANALYSIS 1: Weak keyword in Law A, present in Strong/Exact of Law B ─────
// When a user types Law A's weak keyword, Law B's strong/exact match fires first

const weakCollisions = []; // { weakLaw, strongLaw, keyword, lostPoints }

for (const lawA of lawList) {
  if (filterLaw && !lawA.name.toLowerCase().includes(filterLaw.toLowerCase())) continue;

  for (const kw of lawA.weak) {
    const matches = kwIndex[kw] || [];
    for (const m of matches) {
      if (m.lawName === lawA.name) continue;
      if (m.tier === 'strong' || m.tier === 'exact' || m.tier === 'hinglish') {
        weakCollisions.push({
          weakLaw: lawA.name,
          strongLaw: m.lawName,
          keyword: kw,
          tier: m.tier,
          lostPoints: m.score - SCORES.weak, // how many extra points the other law gets
        });
      }
    }
  }
}

// Sort by lost points descending
weakCollisions.sort((a, b) => b.lostPoints - a.lostPoints);

// ─── ANALYSIS 2: Strong keywords shared across 3+ laws ────────────────────────

const sharedStrong = Object.entries(kwIndex)
  .filter(([kw, entries]) => {
    const strongCount = entries.filter(e => e.tier === 'strong' || e.tier === 'exact').length;
    return strongCount >= 3;
  })
  .map(([kw, entries]) => ({
    keyword: kw,
    laws: entries.filter(e => e.tier === 'strong' || e.tier === 'exact').map(e => e.lawName),
    count: entries.filter(e => e.tier === 'strong' || e.tier === 'exact').length,
  }))
  .sort((a, b) => b.count - a.count)
  .slice(0, topN);

// ─── ANALYSIS 3: Laws with highest collision exposure ─────────────────────────

const exposureMap = {}; // lawName → total lost points

for (const c of weakCollisions) {
  exposureMap[c.weakLaw] = (exposureMap[c.weakLaw] || 0) + c.lostPoints;
}

const exposureRanking = Object.entries(exposureMap)
  .sort((a, b) => b[1] - a[1])
  .slice(0, topN);

// ─── ANALYSIS 4: Exact phrases that are substrings of each other ─────────────

const allExacts = lawList.flatMap(l => l.exact.map(e => ({ law: l.name, phrase: e })));
const substrMatches = [];

for (let i = 0; i < allExacts.length; i++) {
  for (let j = 0; j < allExacts.length; j++) {
    if (i === j) continue;
    if (allExacts[i].law === allExacts[j].law) continue;
    if (allExacts[j].phrase.includes(allExacts[i].phrase) && allExacts[i].phrase.length > 15) {
      substrMatches.push({
        short: allExacts[i].phrase,
        shortLaw: allExacts[i].law,
        long: allExacts[j].phrase,
        longLaw: allExacts[j].law,
      });
    }
  }
}

// ─── ANALYSIS 5: Duplicate keywords within the same law across tiers ──────────

const intraDupes = [];
for (const law of lawList) {
  const allKws = [
    ...law.exact.map(k => ({ k, tier: 'exact' })),
    ...law.strong.map(k => ({ k, tier: 'strong' })),
    ...(law.hinglish || []).map(k => ({ k, tier: 'hinglish' })),
    ...law.weak.map(k => ({ k, tier: 'weak' })),
  ];
  const seen = {};
  for (const { k, tier } of allKws) {
    if (seen[k]) {
      intraDupes.push({ law: law.name, kw: k, tiers: [seen[k], tier] });
    }
    seen[k] = tier;
  }
}

// ─── OUTPUT ───────────────────────────────────────────────────────────────────

const W = 80;
const hr = '─'.repeat(W);
const dhr = '═'.repeat(W);

function section(title) {
  console.log('\n' + dhr);
  console.log(`  ${title}`);
  console.log(dhr);
}

console.log('\n' + '█'.repeat(W));
console.log('  SatLegal Keyword Collision & Overlap Report');
console.log('  Laws loaded: ' + lawList.length + '  |  Total keywords indexed: ' + Object.keys(kwIndex).length);
console.log('█'.repeat(W));

// ── Report 1 ──────────────────────────────────────────────────────────────────
section('1. WEAK KEYWORDS IN LAW A THAT ARE STRONG/EXACT IN LAW B');
console.log('  These cause Law B to outscore Law A even when the user is asking about Law A.');
console.log('  Fix: remove keyword from Law A\'s weak array, or add discriminating exact phrases to Law A.\n');

const top1 = weakCollisions.slice(0, Math.min(topN, 50));
if (top1.length === 0) {
  console.log('  None found.');
} else {
  const grouped = {};
  for (const c of top1) {
    const key = `${c.weakLaw} → ${c.strongLaw}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push({ kw: c.keyword, tier: c.tier, lost: c.lostPoints });
  }
  let printed = 0;
  for (const [pair, items] of Object.entries(grouped)) {
    if (printed >= topN) break;
    const totalLost = items.reduce((s, i) => s + i.lost, 0);
    console.log(`  ${pair}   [exposure: ${totalLost}pts across ${items.length} kw(s)]`);
    for (const item of items.slice(0, 5)) {
      console.log(`    "${item.kw}"  →  ${item.tier}(+${item.lost}pts)`);
    }
    if (items.length > 5) console.log(`    ... and ${items.length - 5} more`);
    console.log();
    printed++;
  }
}

// ── Report 2 ──────────────────────────────────────────────────────────────────
section('2. STRONG/EXACT KEYWORDS SHARED ACROSS 3+ LAWS  (too generic — add noise)');
console.log('  These keywords add score to many laws simultaneously, reducing discrimination.\n');

if (sharedStrong.length === 0) {
  console.log('  None found.');
} else {
  for (const s of sharedStrong.slice(0, 30)) {
    const lawNames = s.laws.join(', ');
    console.log(`  "${s.keyword}"  →  ${s.count} laws: ${lawNames.slice(0, 100)}${lawNames.length > 100 ? '...' : ''}`);
  }
}

// ── Report 3 ──────────────────────────────────────────────────────────────────
section('3. LAWS RANKED BY TOTAL COLLISION EXPOSURE  (most vulnerable to being outscored)');
console.log('  High exposure = many of this law\'s weak keywords appear as strong in other laws.\n');

for (const [law, pts] of exposureRanking.slice(0, 20)) {
  const bar = '▓'.repeat(Math.min(40, Math.round(pts / 10)));
  console.log(`  ${law.padEnd(40)} ${String(pts).padStart(5)}pts  ${bar}`);
}

// ── Report 4 ──────────────────────────────────────────────────────────────────
section('4. EXACT PHRASES THAT ARE SUBSTRINGS OF EACH OTHER  (redundancy / dominance)');
console.log('  The shorter phrase always fires — longer one is never exclusively triggered.\n');

if (substrMatches.length === 0) {
  console.log('  None found.');
} else {
  for (const m of substrMatches.slice(0, 20)) {
    console.log(`  SHORT [${m.shortLaw}]: "${m.short}"`);
    console.log(`   LONG [${m.longLaw}]: "${m.long}"`);
    console.log();
  }
}

// ── Report 5 ──────────────────────────────────────────────────────────────────
section('5. DUPLICATE KEYWORDS WITHIN SAME LAW  (wasted slots)');
console.log('  Keyword appears in multiple tiers of the same law — redundant, wastes array space.\n');

if (intraDupes.length === 0) {
  console.log('  None found.');
} else {
  for (const d of intraDupes.slice(0, 30)) {
    console.log(`  [${d.law}]  "${d.kw}"  in: ${d.tiers.join(' + ')}`);
  }
}

// ── Summary ───────────────────────────────────────────────────────────────────
section('SUMMARY');
console.log(`  Weak-vs-Strong collisions found : ${weakCollisions.length}`);
console.log(`  Over-generic strong keywords    : ${sharedStrong.length}`);
console.log(`  Laws with collision exposure    : ${exposureRanking.length}`);
console.log(`  Exact phrase substring overlaps : ${substrMatches.length}`);
console.log(`  Intra-law duplicate keywords    : ${intraDupes.length}`);
console.log('\n  Top 3 most vulnerable laws:');
for (const [law, pts] of exposureRanking.slice(0, 3)) {
  console.log(`    • ${law}  (${pts}pts exposure)`);
}
console.log('\n' + hr);
