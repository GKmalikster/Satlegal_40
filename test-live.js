/**
 * test-live.js — Live Claude API tester for SatLegal
 *
 * Tests the DEPLOYED Vercel endpoint (not local keyword fallback).
 * This is the only way to test the actual Claude classification path.
 *
 * Usage:
 *   node test-live.js                          → test against production
 *   node test-live.js --url http://localhost:3000  → test against local dev server
 *   node test-live.js --delay 500              → slow down between calls (ms)
 *   node test-live.js --filter divorce         → run only tests matching label
 *
 * Each test case:
 *   q         — the raw query the user types
 *   expect    — string(s) that must appear in ANY returned law's caseType
 *   notExpect — string(s) that must NOT appear in any returned law's caseType
 *   label     — short name for reporting
 *
 * PASS = all expect strings found AND no notExpect strings found.
 */

const https = require('https');
const http  = require('http');

const args     = process.argv.slice(2);
const BASE_URL = args.includes('--url')    ? args[args.indexOf('--url') + 1]    : 'https://satlegal-40.vercel.app';
const DELAY_MS = args.includes('--delay')  ? parseInt(args[args.indexOf('--delay') + 1]) : 300;
const FILTER   = args.includes('--filter') ? args[args.indexOf('--filter') + 1].toLowerCase() : null;

// ── Test cases ────────────────────────────────────────────────────────────────
// Curated from real user reports + known edge cases.
// expect/notExpect match as substrings of caseType (case-insensitive).

const TESTS = [
  // ── Previously failing cases (confirmed broken then fixed) ─────────────────
  {
    label: 'fired no notice',
    q:     'my boss fired me without notice',
    expect:    ['Wrongful'],
    notExpect: ['Fraud', 'PIL', 'Consumer'],
  },
  {
    label: 'car stolen theater',
    q:     'my car got stolen from movie theater',
    expect:    ['Theft'],
    notExpect: ['Consumer', 'PIL'],
  },
  {
    label: 'car service trouble',
    q:     'My car service is troublesome and it keeps stopping, service station keeps making me go around',
    expect:    ['Consumer'],
    notExpect: ['Employment', 'Criminal', 'PIL'],
  },
  {
    label: 'divorce + custody',
    q:     'I want divorce, my husband is fighting for child custody',
    expect:    ['Divorce'],
    notExpect: ['Fraud', 'Criminal – BNS', 'Employment', 'Consumer'],
  },
  {
    label: 'token money house',
    q:     'I paid token money for a house, but previous owner has not vacated house beyond date',
    expect:    ['Transfer'],
    notExpect: ['Rent', 'Government', 'Cyber'],
  },

  // ── Employment ─────────────────────────────────────────────────────────────
  {
    label: 'salary unpaid 3 months',
    q:     'company has not paid my salary for 3 months',
    expect:    ['Salary'],
    notExpect: ['Fraud', 'PIL', 'Criminal'],
  },
  {
    label: 'PF not deposited',
    q:     'employer is not depositing my PF for the last year',
    expect:    ['Salary'],
    notExpect: ['Fraud', 'PIL'],
  },
  {
    label: 'POSH workplace harassment',
    q:     'my manager is sexually harassing me at the office and HR is not acting',
    expect:    ['POSH'],
    notExpect: ['Criminal – BNS', 'PIL', 'Consumer'],
  },

  // ── Family ─────────────────────────────────────────────────────────────────
  {
    label: 'domestic violence husband',
    q:     'my husband is beating me and not giving maintenance',
    expect:    ['Domestic Violence'],
    notExpect: ['Consumer', 'Employment', 'Tax'],
  },
  {
    label: 'child custody battle',
    q:     'ex-wife took my children to another city without court permission',
    expect:    ['Custody'],
    notExpect: ['Fraud', 'PIL', 'Consumer'],
  },
  {
    label: 'maintenance not paid',
    q:     'my ex-husband is not paying court-ordered alimony',
    expect:    ['Maintenance'],
    notExpect: ['Fraud', 'Criminal', 'Consumer'],
  },

  // ── Property ───────────────────────────────────────────────────────────────
  {
    label: 'tenant not paying rent',
    q:     'my tenant has not paid rent for 4 months and is refusing to vacate',
    expect:    ['Rent'],
    notExpect: ['Employment', 'Government', 'Cyber'],
  },
  {
    label: 'RERA builder delay',
    q:     'builder has not given possession of my flat after 3 years of booking',
    expect:    ['RERA'],
    notExpect: ['Consumer – Product', 'Employment', 'Criminal'],
  },
  {
    label: 'property fraud forged deed',
    q:     'someone has forged my signature and transferred my property in their name',
    expect:    ['Transfer'],
    notExpect: ['Employment', 'Consumer', 'Tax'],
  },

  // ── Consumer ───────────────────────────────────────────────────────────────
  {
    label: 'faulty product refund',
    q:     'I bought a washing machine which stopped working in a month, company refusing refund',
    expect:    ['Consumer'],
    notExpect: ['Fraud', 'PIL', 'Employment'],
  },
  {
    label: 'insurance claim rejected',
    q:     'health insurance company rejected my claim saying pre-existing condition',
    expect:    ['Insurance'],
    notExpect: ['Employment', 'Criminal', 'Tax'],
  },

  // ── Criminal ───────────────────────────────────────────────────────────────
  {
    label: 'physical assault neighbour',
    q:     'my neighbour physically attacked me and broke my hand',
    expect:    ['BNS', 'Assault'],
    notExpect: ['Domestic Violence', 'Consumer', 'Employment'],
  },
  {
    label: 'cheque bounce',
    q:     'a cheque given to me by my business partner has bounced twice',
    expect:    ['Cheque'],
    notExpect: ['Fraud', 'Employment', 'Tax'],
  },
  {
    label: 'online fraud money lost',
    q:     'I received a call from someone pretending to be from my bank and they transferred Rs 50000 from my account',
    expect:    ['Cyber', 'Fraud'],
    notExpect: ['Employment', 'Family', 'Tax'],
  },
  {
    label: 'bail criminal case',
    q:     'I have been arrested and need anticipatory bail in a criminal case',
    expect:    ['Bail', 'BNSS'],
    notExpect: ['Consumer', 'Employment', 'Family'],
  },

  // ── Medical / Consumer ─────────────────────────────────────────────────────
  {
    label: 'medical negligence surgery',
    q:     'doctor left a surgical instrument inside my body after operation',
    expect:    ['Medical'],
    notExpect: ['Consumer – Product', 'Employment', 'Fraud'],
  },

  // ── Hinglish / Colloquial ──────────────────────────────────────────────────
  {
    label: 'Hinglish fired',
    q:     'boss ne mujhe bina kisi karan ke naukri se nikaala',
    expect:    ['Wrongful'],
    notExpect: ['Fraud', 'PIL'],
  },
  {
    label: 'Hinglish theft',
    q:     'mera phone chori ho gaya bazaar mein',
    expect:    ['Theft'],
    notExpect: ['Consumer', 'PIL'],
  },
  {
    label: 'Hinglish divorce',
    q:     'mujhe talaq chahiye, pati bahut maar-pitai karta hai',
    expect:    ['Divorce', 'Domestic'],
    notExpect: ['Employment', 'Consumer'],
  },
];

// ── HTTP helper ───────────────────────────────────────────────────────────────
function post(url, body) {
  return new Promise((resolve, reject) => {
    const payload  = JSON.stringify(body);
    const parsed   = new URL(url);
    const lib      = parsed.protocol === 'https:' ? https : http;
    const options  = {
      hostname: parsed.hostname,
      port:     parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
      path:     parsed.pathname,
      method:   'POST',
      headers:  { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) },
    };
    const req = lib.request(options, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch(e) { reject(new Error('Bad JSON: ' + data.slice(0, 100))); }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function match(laws, terms) {
  if (!terms || !terms.length) return true;
  const combined = laws.map(l => l.caseType).join(' | ').toLowerCase();
  return [].concat(terms).some(t => combined.includes(t.toLowerCase()));
}

function matchNot(laws, terms) {
  if (!terms || !terms.length) return true;
  const combined = laws.map(l => l.caseType).join(' | ').toLowerCase();
  return [].concat(terms).every(t => !combined.includes(t.toLowerCase()));
}

// ── Runner ────────────────────────────────────────────────────────────────────
async function run() {
  const endpoint = BASE_URL.replace(/\/$/, '') + '/api/analyse';
  const W        = 80;

  console.log('\n' + '█'.repeat(W));
  console.log('  SatLegal Live Claude API Tester');
  console.log('  Endpoint : ' + endpoint);
  console.log('  Tests    : ' + TESTS.length + (FILTER ? ' (filtered: ' + FILTER + ')' : ''));
  console.log('█'.repeat(W) + '\n');

  const tests  = FILTER ? TESTS.filter(t => t.label.toLowerCase().includes(FILTER)) : TESTS;
  let passed   = 0, failed = 0;
  const failures = [];

  for (const t of tests) {
    let laws = [], source = '?', error = null;

    try {
      const res = await post(endpoint, { description: t.q });
      laws   = res.laws   || [];
      source = res.source || '?';
    } catch (e) {
      error = e.message;
    }

    const expectOk  = !error && match(laws, t.expect);
    const notExpOk  = !error && matchNot(laws, t.notExpect);
    const ok        = expectOk && notExpOk;

    const icon    = ok ? '✅' : '❌';
    const lawStr  = error ? `ERROR: ${error}` : laws.map(l => `${l.caseType} (${l.confidence}%)`).join(' | ') || 'NONE';
    const srcTag  = `[${source}]`;

    console.log(`${icon} ${t.label.padEnd(28)} ${srcTag.padEnd(18)} ${lawStr.slice(0, 80)}`);

    if (!ok) {
      failures.push({ label: t.label, q: t.q, got: lawStr, expect: t.expect, notExpect: t.notExpect, error });
    }

    ok ? passed++ : failed++;
    if (DELAY_MS > 0) await sleep(DELAY_MS);
  }

  // Summary
  console.log('\n' + '─'.repeat(W));
  console.log(`  Result: ${passed}/${tests.length} passed  (${((passed/tests.length)*100).toFixed(1)}%)  ${failed === 0 ? '🟢 ALL PASS' : '🔴 FAILURES'}`);
  console.log('─'.repeat(W));

  if (failures.length) {
    console.log('\n  FAILURES:\n');
    for (const f of failures) {
      console.log(`  ❌ ${f.label}`);
      console.log(`     Query     : "${f.q}"`);
      console.log(`     Got       : ${f.got}`);
      if (f.expect)    console.log(`     Expected  : must include → ${[].concat(f.expect).join(', ')}`);
      if (f.notExpect) console.log(`     Excluded  : must not include → ${[].concat(f.notExpect).join(', ')}`);
      console.log();
    }
  }

  console.log('\n  Tip: "source" column shows which path handled each query:');
  console.log('    claude-2prompt   → two-prompt pipeline (best accuracy)');
  console.log('    claude-1prompt   → single-prompt (extractor failed)');
  console.log('    cache            → served from in-memory cache');
  console.log('    keywords-fallback → Claude failed, keyword engine used\n');
}

run().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
