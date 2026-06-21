#!/usr/bin/env node
/**
 * SatLegal Laws Classifier — Accuracy Benchmark
 *
 * Usage:
 *   node benchmark.js               → test keyword engine only (instant, offline)
 *   node benchmark.js --api         → test live /api/analyse on Vercel
 *   node benchmark.js --api --url https://your-url.vercel.app
 *   node benchmark.js --fail        → show only failures
 *
 * Test format:
 *   { q: 'user query', expect: 'Part of caseType', note: 'optional note' }
 *   expect can be a string (partial match) or array (any of these must appear in top-3)
 *   Prefix query with 'N:' to test ABSENCE — that law must NOT appear
 */

'use strict';
const https = require('https');
const http  = require('http');

// ── Args ──────────────────────────────────────────────────────────────────────
const args      = process.argv.slice(2);
const USE_API   = args.includes('--api');
const FAIL_ONLY = args.includes('--fail');
const urlIdx    = args.indexOf('--url');
const API_URL   = urlIdx >= 0 ? args[urlIdx + 1] : 'https://satlegal-40.vercel.app';

// ── Local keyword engine ──────────────────────────────────────────────────────
const DB = require('./laws-database.js');

function keywordScore(input) {
  const inp = input.toLowerCase();
  const scored = DB.map(l => {
    let score = 0;
    (l.keywords?.exact    || []).forEach(k => { if (inp.includes(k.toLowerCase())) score += 50; });
    (l.keywords?.strong   || []).forEach(k => { if (inp.includes(k.toLowerCase())) score += 22; });
    (l.keywords?.hinglish || []).forEach(k => { if (inp.includes(k.toLowerCase())) score += 22; });
    (l.keywords?.casual   || []).forEach(k => { if (inp.includes(k.toLowerCase())) score += 22; });
    (l.keywords?.weak     || []).forEach(k => { if (inp.includes(k.toLowerCase())) score +=  8; });
    return { caseType: l.caseType, score };
  }).filter(x => x.score > 0).sort((a, b) => b.score - a.score);

  const above = scored.filter(x => x.score >= 20);
  return (above.length ? above : scored).slice(0, 3).map(x => x.caseType);
}

// ── Live API call ─────────────────────────────────────────────────────────────
function callAPI(description) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ description });
    const parsed = new URL(API_URL + '/api/analyse');
    const lib = parsed.protocol === 'https:' ? https : http;
    const req = lib.request({
      hostname: parsed.hostname, port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
      path: parsed.pathname, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
    }, res => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.laws ? json.laws.slice(0, 3).map(l => l.caseType) : []);
        } catch(e) { resolve([]); }
      });
    });
    req.on('error', () => resolve([]));
    req.setTimeout(12000, () => { req.destroy(); resolve([]); });
    req.write(body);
    req.end();
  });
}

// ── TEST CASES ────────────────────────────────────────────────────────────────
// Format: { q, expect (string or array), note }
// Prefix q with 'N:' → ABSENCE test (that law must NOT be in top-3)
const TESTS = [

  // ── CRIMINAL / BNS ──────────────────────────────────────────────────────────
  { q: 'my neighbor hit me and broke my arm',            expect: 'BNS',             note: 'physical assault' },
  { q: 'a group of men attacked me on the road',         expect: 'BNS',             note: 'gang assault' },
  { q: 'someone stabbed me near my house',               expect: 'BNS',             note: 'stabbing' },
  { q: 'my boss punched me at the office',               expect: 'BNS',             note: 'workplace assault' },
  { q: 'my neighbor threw acid on me',                   expect: ['BNS','POCSO'],   note: 'acid attack' },
  { q: 'someone kidnapped my son and asking for ransom', expect: 'BNS',             note: 'kidnapping' },
  { q: 'men are eve teasing my daughter daily',          expect: 'BNS',             note: 'eve teasing' },
  { q: 'my ex boyfriend is stalking me',                 expect: 'BNS',             note: 'stalking' },

  // ── PROPERTY / BOUNDARY ─────────────────────────────────────────────────────
  { q: 'neighbor broke my boundary wall',                expect: 'Boundary',        note: 'boundary encroachment' },
  { q: 'someone is encroaching on my land',              expect: 'Boundary',        note: 'land encroachment' },
  { q: 'my tenant is not vacating my flat',              expect: 'Rent',            note: 'tenant eviction' },
  { q: 'builder took money but did not give possession', expect: 'RERA',            note: 'builder default' },

  // ── IP / TRADEMARK ──────────────────────────────────────────────────────────
  { q: 'my competition copied my logo and tag line',     expect: 'Trademark',       note: 'logo/tagline copy' },
  { q: 'competitor is using my brand name',              expect: 'Trademark',       note: 'brand name copy' },
  { q: 'someone pirated my software',                    expect: 'Trademark',       note: 'software piracy' },
  { q: 'someone is selling counterfeit versions of my product', expect: 'Trademark', note: 'counterfeit goods' },

  // ── EMPLOYMENT ──────────────────────────────────────────────────────────────
  { q: 'my employer fired me without notice or reason',  expect: 'Termination',     note: 'wrongful termination' },
  { q: 'company has not paid my salary for 3 months',   expect: 'Salary',          note: 'unpaid salary' },
  { q: 'my manager is harassing me at workplace',        expect: 'POSH',            note: 'workplace harassment' },
  { q: 'company not depositing my PF',                   expect: 'Salary',          note: 'PF dues' },

  // ── FAMILY / DOMESTIC ───────────────────────────────────────────────────────
  { q: 'my husband beats me and threatens to throw me out', expect: 'Domestic',     note: 'domestic violence' },
  { q: 'i want to file for divorce from my wife',        expect: 'Divorce',         note: 'divorce' },
  { q: 'my wife took my children without my permission', expect: 'Custody',         note: 'child custody' },
  { q: 'mother in law is demanding dowry',               expect: 'Dowry',           note: 'dowry harassment' },

  // ── CYBER / DIGITAL ─────────────────────────────────────────────────────────
  { q: 'someone hacked my bank account and transferred money', expect: 'Cyber',     note: 'cyber fraud' },
  { q: 'i received a fake UPI payment link and lost money',    expect: 'Cyber',     note: 'UPI fraud' },
  { q: 'someone is posting my private photos online',          expect: 'Cyber',     note: 'revenge porn / cyber' },

  // ── CONSUMER ────────────────────────────────────────────────────────────────
  { q: 'i bought a washing machine that stopped working', expect: 'Consumer',       note: 'product defect' },
  { q: 'amazon delivered wrong product and refused refund', expect: 'Consumer',     note: 'e-commerce refund' },
  { q: 'hospital charged me wrongly and gave wrong treatment', expect: 'Consumer',  note: 'medical negligence/consumer' },

  // ── FINANCIAL ───────────────────────────────────────────────────────────────
  { q: 'person gave me a cheque which bounced',          expect: 'Cheque',          note: 'cheque bounce' },
  { q: 'bank is charging hidden fees on my loan',        expect: 'Banking',         note: 'banking complaint' },
  { q: 'company cheated me in a ponzi scheme investment', expect: ['Cyber','Banking','PMLA','BNS','Fraud'], note: 'investment fraud' },

  // ── MOTOR ACCIDENT ──────────────────────────────────────────────────────────
  { q: 'a car hit me while i was crossing the road',     expect: 'Motor Accident',  note: 'road accident' },
  { q: 'drunk driver crashed into my vehicle',           expect: 'Motor Accident',  note: 'drunk driving accident' },

  // ── RTI ─────────────────────────────────────────────────────────────────────
  { q: 'government office is not giving me information i applied for', expect: ['PIL','RTI','Writ'], note: 'RTI denial' },
  { q: 'i want to file RTI to get government records',   expect: ['PIL','RTI','Writ'], note: 'RTI filing' },

  // ── ABSENCE TESTS (these laws should NOT appear) ─────────────────────────────
  { q: 'N: my neighbor hit me',                          expect: 'Domestic',        note: 'neighbor≠domestic violence' },
  { q: 'N: my phone was snatched on the road',           expect: 'Cyber',           note: 'snatching≠cyber' },
  { q: 'N: my competition copied my logo',               expect: 'Divorce',         note: 'IP case≠divorce' },
  { q: 'N: my salary was not paid',                      expect: 'RTI',             note: 'salary≠RTI' },
  { q: 'N: i want overtime pay',                         expect: 'RTI',             note: 'overtime≠RTI (substring)' },
];

// ── Runner ────────────────────────────────────────────────────────────────────
async function runAll() {
  const mode = USE_API ? `LIVE API (${API_URL})` : 'LOCAL keyword engine';
  console.log(`\n╔══════════════════════════════════════════════════════╗`);
  console.log(`║  SatLegal Accuracy Benchmark — ${mode.padEnd(20)} ║`);
  console.log(`╚══════════════════════════════════════════════════════╝\n`);

  let passed = 0, failed = 0;
  const failures = [];

  for (const test of TESTS) {
    const absence = test.q.startsWith('N: ');
    const query   = absence ? test.q.slice(3) : test.q;

    const top3 = USE_API ? await callAPI(query) : keywordScore(query);
    const expectList = Array.isArray(test.expect) ? test.expect : [test.expect];

    let ok;
    if (absence) {
      // PASS if none of the expected strings appear in top-3
      ok = !top3.some(c => expectList.some(e => c.includes(e)));
    } else {
      // PASS if at least one expected string appears in top-3
      ok = top3.some(c => expectList.some(e => c.includes(e)));
    }

    if (ok) {
      passed++;
      if (!FAIL_ONLY) {
        console.log(`  ✅ ${(absence?'ABSENT ':'')+ test.note.padEnd(35)} → ${top3[0] || 'NONE'}`);
      }
    } else {
      failed++;
      const label = `  ❌ ${(absence?'ABSENT ':'')+ test.note.padEnd(35)} → got: ${top3[0]||'NONE'} | expected${absence?' NOT ':' '}${expectList.join('/')}`;
      console.log(label);
      failures.push({ note: test.note, query, expected: expectList, got: top3, absence });
    }
  }

  const total   = passed + failed;
  const pct     = ((passed / total) * 100).toFixed(1);
  const grade   = pct >= 95 ? '🟢 EXCELLENT' : pct >= 85 ? '🟡 GOOD' : pct >= 70 ? '🟠 NEEDS WORK' : '🔴 CRITICAL';

  console.log(`\n${'─'.repeat(60)}`);
  console.log(`  Result:  ${passed}/${total} passed  (${pct}%)  ${grade}`);
  if (failed > 0) {
    console.log(`\n  Failed tests:`);
    failures.forEach(f => {
      console.log(`    • [${f.note}]`);
      console.log(`      Query:    "${f.query}"`);
      console.log(`      Expected: ${f.absence?'NOT ':''}${f.expected.join(' or ')}`);
      console.log(`      Got:      ${f.got.join(' | ') || 'NONE'}`);
    });
  }
  console.log(`${'─'.repeat(60)}\n`);
}

runAll().catch(console.error);
