/**
 * modules/law-accuracy.js — Law classification accuracy tests
 *
 * Two modes:
 *   offline  → runs keyword engine directly from laws-database.js (no network, instant)
 *   live     → calls /api/analyse on the target URL (tests the full Claude pipeline)
 *
 * Uses the exact same keyword scoring as analyse.js keywordFallback().
 * Uses the exact same response parsing as benchmark.js callAPI().
 */

'use strict';

const path = require('path');
const { post } = require('../lib/http');
const { sectionHeader, resultLine, summary } = require('../lib/reporter');
const { ANALYSE, LAW_CASES } = require('../contract');

// ── Offline keyword engine (mirrors analyse.js keywordFallback exactly) ───────
function loadDB() {
  // Walk up from testing-engine/ to find laws-database.js
  const dbPath = path.join(__dirname, '../../laws-database.js');
  return require(dbPath);
}

function keywordScore(description) {
  const DB  = loadDB();
  const inp = description.toLowerCase();
  const scored = DB.map(l => {
    let score = 0;
    (l.keywords?.exact    || []).forEach(k => { if (inp.includes(k.toLowerCase())) score += 50; });
    (l.keywords?.strong   || []).forEach(k => { if (inp.includes(k.toLowerCase())) score += 22; });
    (l.keywords?.hinglish || []).forEach(k => { if (inp.includes(k.toLowerCase())) score += 22; });
    (l.keywords?.casual   || []).forEach(k => { if (inp.includes(k.toLowerCase())) score += 22; });
    (l.keywords?.partial  || []).forEach(k => { if (inp.includes(k.toLowerCase())) score += 12; });
    (l.keywords?.weak     || []).forEach(k => { if (inp.includes(k.toLowerCase())) score +=  8; });
    return { caseType: l.caseType, score };
  }).filter(x => x.score > 0).sort((a, b) => b.score - a.score);

  const above = scored.filter(x => x.score >= 20);
  return (above.length ? above : scored).slice(0, 3).map(x => x.caseType);
}

// ── Match logic (mirrors test-live.js exactly) ────────────────────────────────
function evaluate(detected, testCase) {
  const combined = detected.join(' | ').toLowerCase();
  const missingExpect  = testCase.expect.filter(e => !combined.includes(e.toLowerCase()));
  const wrongNotExpect = (testCase.notExpect || []).filter(ne => combined.includes(ne.toLowerCase()));
  const passed  = missingExpect.length === 0 && wrongNotExpect.length === 0;
  const partial = !passed && missingExpect.length < testCase.expect.length;
  return { passed, partial, missingExpect, wrongNotExpect };
}

// ── Run offline ────────────────────────────────────────────────────────────────
async function runOffline(cases = LAW_CASES) {
  sectionHeader('LAW ACCURACY — OFFLINE (keyword engine)', cases.length);
  const results = [];
  const t0 = Date.now();

  for (const tc of cases) {
    const start    = Date.now();
    const detected = keywordScore(tc.q);
    const timing   = Date.now() - start;
    const { passed, partial, missingExpect, wrongNotExpect } = evaluate(detected, tc);
    const status   = passed ? 'pass' : partial ? 'partial' : 'fail';

    const detail = status !== 'pass' ? [
      `Query:    ${tc.q}`,
      `Got:      ${detected.join(' | ') || '—'}`,
      ...(missingExpect.length  ? [`Missing:  ${missingExpect.join(', ')}`] : []),
      ...(wrongNotExpect.length ? [`Wrong:    ${wrongNotExpect.join(', ')}`] : []),
    ] : null;

    resultLine(tc.id, status, tc.tag, tc.q, timing, detail);
    results.push({ id: tc.id, tag: tc.tag, query: tc.q, detected, status, ms: timing, mode: 'offline' });
  }

  summary(results, Date.now() - t0);
  return results;
}

// ── Run live (calls real API) ──────────────────────────────────────────────────
async function runLive(target, cases = LAW_CASES, delayMs = 200) {
  sectionHeader('LAW ACCURACY — LIVE API (/api/analyse)', cases.length);
  const results = [];
  const t0 = Date.now();

  for (const tc of cases) {
    const body = ANALYSE.request(tc.q);          // {description: tc.q}
    const r    = await post(target + ANALYSE.path, body, 20000);

    // Parse response using contract-defined parser
    let detected = [];
    let errMsg   = null;

    if (r.error) {
      errMsg = r.error;
    } else if (!r.ok) {
      errMsg = `HTTP ${r.status}: ${r.data?.error || 'failed'}`;
    } else {
      detected = ANALYSE.parseLaws(r.data).map(l => l.caseType);
    }

    const { passed, partial, missingExpect, wrongNotExpect } = errMsg
      ? { passed: false, partial: false, missingExpect: tc.expect, wrongNotExpect: [] }
      : evaluate(detected, tc);

    const status = errMsg ? 'fail' : passed ? 'pass' : partial ? 'partial' : 'fail';

    const detail = status !== 'pass' ? [
      `Query:    ${tc.q}`,
      `Got:      ${detected.join(' | ') || errMsg || '—'}`,
      ...(missingExpect.length  ? [`Missing:  ${missingExpect.join(', ')}`] : []),
      ...(wrongNotExpect.length ? [`Wrong:    ${wrongNotExpect.join(', ')}`] : []),
    ] : null;

    resultLine(tc.id, status, tc.tag, tc.q, r.ms, detail);
    results.push({ id: tc.id, tag: tc.tag, query: tc.q, detected, status, ms: r.ms, source: r.data?.source, mode: 'live' });

    if (delayMs > 0) await new Promise(res => setTimeout(res, delayMs));
  }

  summary(results, Date.now() - t0);
  return results;
}

module.exports = { runOffline, runLive, keywordScore, evaluate };
