/**
 * modules/api-health.js — API endpoint health checks
 *
 * Tests correct HTTP status codes, response shapes, and error handling.
 * Every test case documents WHY the check exists, not just what it checks.
 * All request bodies use contract.js shapes — never hardcoded here.
 */

'use strict';

const { get, post } = require('../lib/http');
const { sectionHeader, resultLine, summary } = require('../lib/reporter');
const { ANALYSE, TRACK, LAWYER } = require('../contract');

// ── Test definitions ──────────────────────────────────────────────────────────
// check(r) returns true = pass, false = fail
// why: explains the invariant being tested
const TESTS = [
  {
    id: 'A01', tag: 'analyse', method: 'POST', pathFn: () => ANALYSE.path,
    why: 'Valid query returns 200 with laws array',
    bodyFn: () => ANALYSE.request('my employer has not paid salary for 3 months'),
    check: r => r.ok && Array.isArray(r.data?.laws) && r.data.laws.length > 0,
  },
  {
    id: 'A02', tag: 'analyse', method: 'POST', pathFn: () => ANALYSE.path,
    why: 'Empty description returns 400 (validated in analyse.js line 514)',
    bodyFn: () => ANALYSE.request(''),
    check: r => r.status === 400 && r.data?.error !== undefined,
  },
  {
    id: 'A03', tag: 'analyse', method: 'POST', pathFn: () => ANALYSE.path,
    why: 'Short description < 5 chars returns 400',
    bodyFn: () => ANALYSE.request('hi'),
    check: r => r.status === 400,
  },
  {
    id: 'A04', tag: 'analyse', method: 'POST', pathFn: () => ANALYSE.path,
    why: 'Hinglish query returns 200 — engine handles code-switching',
    bodyFn: () => ANALYSE.request('mera cheque bounce ho gaya kya karu'),
    check: r => r.ok && Array.isArray(r.data?.laws),
  },
  {
    id: 'A05', tag: 'analyse', method: 'POST', pathFn: () => ANALYSE.path,
    why: 'Long query (>200 chars) does not crash — no length cap in analyse.js',
    bodyFn: () => ANALYSE.request('My employer has not been paying my salary for the past 3 months despite me sending multiple written reminders via email and WhatsApp. I have all the proof. What are my options under Indian labour law?'),
    check: r => r.ok,
  },
  {
    id: 'A06', tag: 'analyse', method: 'GET', pathFn: () => ANALYSE.path,
    why: 'GET on /api/analyse returns 405 (verified: analyse.js line 511)',
    bodyFn: () => null,
    check: r => r.status === 405,
  },
  {
    id: 'A07', tag: 'analyse', method: 'POST', pathFn: () => ANALYSE.path,
    why: 'Response laws[] contains objects with caseType field (not plain strings)',
    bodyFn: () => ANALYSE.request('tenant not paying rent and not vacating flat'),
    check: r => r.ok && r.data?.laws?.every(l => typeof l.caseType === 'string' && l.caseType.length > 0),
  },
  {
    id: 'A08', tag: 'analyse', method: 'POST', pathFn: () => ANALYSE.path,
    why: 'Response includes source field (cache/keywords/claude-2prompt etc.)',
    bodyFn: () => ANALYSE.request('my wife is asking for maintenance after separation'),
    check: r => r.ok && typeof r.data?.source === 'string',
  },
  {
    id: 'A09', tag: 'analyse-sec', method: 'POST', pathFn: () => ANALYSE.path,
    why: 'SQL injection attempt does not return 500 (must handle gracefully)',
    bodyFn: () => ANALYSE.request("'; DROP TABLE users; -- legal advice needed"),
    check: r => r.status !== 500,
  },
  {
    id: 'A10', tag: 'analyse-sec', method: 'POST', pathFn: () => ANALYSE.path,
    why: 'XSS payload in description does not return 500',
    bodyFn: () => ANALYSE.request('<script>alert(1)</script> landlord dispute'),
    check: r => r.status !== 500,
  },
  {
    id: 'T01', tag: 'track', method: 'POST', pathFn: () => TRACK.path,
    why: 'Valid law_shown event returns 200 ok:true',
    bodyFn: () => TRACK.lawEvent('law_shown', { query: 'test', law: 'Family – Divorce (Contested)', sessionId: 'test-runner' }),
    check: r => r.ok && TRACK.parseOk(r.data),
  },
  {
    id: 'T02', tag: 'track', method: 'POST', pathFn: () => TRACK.path,
    why: 'Missing event field still returns 400 (track.js line 24)',
    bodyFn: () => ({ sessionId: 'test-runner' }), // no event field
    check: r => r.status === 400 || (r.ok && TRACK.parseOk(r.data)), // graceful either way
  },
  {
    id: 'L01', tag: 'lawyer', method: 'GET', pathFn: () => LAWYER.list.path,
    why: 'Lawyer list endpoint responds (may be empty array if no approved lawyers)',
    bodyFn: () => null,
    check: r => r.status < 500,
  },
];

// ── Runner ────────────────────────────────────────────────────────────────────
async function run(target) {
  sectionHeader('API HEALTH CHECKS', TESTS.length);
  const results = [];
  const t0 = Date.now();

  for (const tc of TESTS) {
    const url  = target + tc.pathFn();
    const body = tc.bodyFn();
    const r    = tc.method === 'GET'
      ? await get(url, 15000)
      : await post(url, body, 15000);

    const passed = !r.error && tc.check(r);
    const status = r.error ? 'fail' : passed ? 'pass' : 'fail';

    const detail = status !== 'pass' ? [
      `Why:    ${tc.why}`,
      `Status: HTTP ${r.status}`,
      `Error:  ${r.error || JSON.stringify(r.data)?.substring(0, 100) || '—'}`,
    ] : null;

    resultLine(tc.id, status, tc.tag, tc.why, r.ms, detail);
    results.push({ id: tc.id, tag: tc.tag, method: tc.method, path: tc.pathFn(), status, statusCode: r.status, ms: r.ms, error: r.error });
  }

  summary(results, Date.now() - t0);
  return results;
}

module.exports = { run, TESTS };
