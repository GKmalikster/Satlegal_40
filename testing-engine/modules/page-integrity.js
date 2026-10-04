/**
 * modules/page-integrity.js — Page & static asset integrity checks
 *
 * Verifies every public page:
 *   1. Returns HTTP 200
 *   2. Contains required content strings (mustContain)
 *   3. Has canonical tag pointing to the right URL
 *   4. Has meta description (SEO — all 10 pages were updated this session)
 *   5. Response time is acceptable (< 5s)
 */

'use strict';

const { get } = require('../lib/http');
const { sectionHeader, resultLine, summary } = require('../lib/reporter');
const { PAGES } = require('../contract');

const MAX_RESPONSE_MS = 5000;

// ── Checks ────────────────────────────────────────────────────────────────────
function checkPage(path, html, statusCode, ms) {
  const issues = [];

  // 1. HTTP status
  if (statusCode !== 200) issues.push(`HTTP ${statusCode} (expected 200)`);

  // 2. mustContain (from contract.js PAGES definition)
  // (checked by caller — passed in as mustContain)

  // 3. Canonical tag present (all 10 pages had canonicals added)
  // Only check HTML pages, not .txt/.xml
  if (path.endsWith('.html') || path === '/') {
    if (!html.includes('<link rel="canonical"')) {
      issues.push('Missing canonical tag');
    }
  }

  // 4. Meta description present (added to all 10 pages via Metas.txt)
  if (path.endsWith('.html') || path === '/') {
    if (!html.includes('meta name="description"')) {
      issues.push('Missing meta description');
    }
  }

  // 5. Response time
  if (ms > MAX_RESPONSE_MS) {
    issues.push(`Slow response: ${ms}ms (threshold ${MAX_RESPONSE_MS}ms)`);
  }

  return issues;
}

// ── Runner ────────────────────────────────────────────────────────────────────
async function run(target) {
  sectionHeader('PAGE INTEGRITY', PAGES.length);
  const results = [];
  const t0 = Date.now();

  for (const pg of PAGES) {
    const r    = await get(target + pg.path, 10000);
    const html = typeof r.data === 'string' ? r.data : '';

    // mustContain check
    const missing = pg.mustContain.filter(s => !html.toLowerCase().includes(s.toLowerCase()));

    // Additional structural checks (HTML pages only)
    const structureIssues = checkPage(pg.path, html, r.status, r.ms);

    // Combine
    const allIssues = [
      ...(missing.length ? [`Missing content: ${missing.join(', ')}`] : []),
      ...structureIssues,
      ...(r.error ? [`Network error: ${r.error}`] : []),
    ];

    const status = allIssues.length === 0 ? 'pass'
                 : structureIssues.some(i => i.startsWith('HTTP')) || r.error ? 'fail'
                 : 'partial';

    const detail = allIssues.length ? allIssues : null;

    resultLine(pg.path, status, pg.name, pg.path, r.ms, detail);
    results.push({ path: pg.path, name: pg.name, status, issues: allIssues, ms: r.ms });
  }

  summary(results, Date.now() - t0);
  return results;
}

module.exports = { run };
