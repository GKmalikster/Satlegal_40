/**
 * modules/regression.js — Law classification regression detection
 *
 * Saves a baseline of law accuracy results (caseTypes returned per query).
 * On subsequent runs, flags any query where the returned laws changed.
 *
 * This catches silent regressions when analyse.js, laws-database.js,
 * or the Claude prompt is modified.
 *
 * Baseline is stored as JSON: { queryId: "caseType1 | caseType2", ... }
 *
 * Usage:
 *   runSave(target)  → run live tests and save result as new baseline
 *   run(target)      → run live tests and compare against saved baseline
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const { post }                    = require('../lib/http');
const { sectionHeader, resultLine, summary, warn, pass, dim } = require('../lib/reporter');
const { ANALYSE, LAW_CASES }      = require('../contract');

const BASELINE_PATH = path.join(__dirname, '../baseline.json');

// ── Helpers ───────────────────────────────────────────────────────────────────
function loadBaseline() {
  if (!fs.existsSync(BASELINE_PATH)) return null;
  try { return JSON.parse(fs.readFileSync(BASELINE_PATH, 'utf8')); }
  catch (_) { return null; }
}

function saveBaseline(data) {
  fs.writeFileSync(BASELINE_PATH, JSON.stringify(data, null, 2));
}

async function fetchResult(target, tc) {
  const r = await post(target + ANALYSE.path, ANALYSE.request(tc.q), 20000);
  if (!r.ok || r.error) return null;
  return ANALYSE.parseLaws(r.data).map(l => l.caseType).join(' | ');
}

// ── Save baseline ─────────────────────────────────────────────────────────────
async function runSave(target, cases = LAW_CASES) {
  console.log('\n' + dim('Saving regression baseline...'));
  const baseline = {};
  let saved = 0;

  for (const tc of cases) {
    const result = await fetchResult(target, tc);
    if (result !== null) {
      baseline[tc.id] = result;
      saved++;
      console.log('  ' + dim(`${tc.id} → ${result.substring(0, 70)}`));
    } else {
      console.log('  ' + warn(`${tc.id} → FAILED (skipped)`));
    }
    await new Promise(r => setTimeout(r, 200));
  }

  saveBaseline(baseline);
  console.log('\n  ' + pass(`✓ Baseline saved (${saved}/${cases.length} cases) → ${BASELINE_PATH}`));
  return baseline;
}

// ── Compare against baseline ──────────────────────────────────────────────────
async function run(target, cases = LAW_CASES) {
  sectionHeader('REGRESSION DETECTION', cases.length);
  const t0       = Date.now();
  const baseline = loadBaseline();
  const results  = [];

  if (!baseline) {
    console.log('  ' + warn('No baseline found.'));
    console.log('  ' + dim(`Run: node runner.js --suite reg --save   to create one`));
    console.log('  ' + dim(`Baseline path: ${BASELINE_PATH}`));
    return [];
  }

  for (const tc of cases) {
    const base = baseline[tc.id];
    if (!base) {
      resultLine(tc.id, 'skip', tc.tag, tc.q, 0, [`No baseline entry for ${tc.id}`]);
      results.push({ id: tc.id, status: 'skip' });
      continue;
    }

    const t1     = Date.now();
    const current = await fetchResult(target, tc);
    const ms_    = Date.now() - t1;

    if (current === null) {
      resultLine(tc.id, 'fail', tc.tag, tc.q, ms_, ['API error — could not fetch result']);
      results.push({ id: tc.id, query: tc.q, status: 'fail', ms: ms_ });
      continue;
    }

    const changed = current.toLowerCase().trim() !== base.toLowerCase().trim();
    const status  = changed ? 'partial' : 'pass';

    const detail = changed ? [
      `Was: ${base.substring(0, 80)}`,
      `Now: ${current.substring(0, 80)}`,
    ] : null;

    resultLine(tc.id, status, tc.tag, tc.q, ms_, detail);
    results.push({ id: tc.id, query: tc.q, baseline: base, current, status, ms: ms_ });

    await new Promise(r => setTimeout(r, 200));
  }

  const changed = results.filter(r => r.status === 'partial').length;
  const stable  = results.filter(r => r.status === 'pass').length;

  if (changed === 0) {
    console.log('\n  ' + pass(`✓ No regressions (${stable} queries stable)`));
  } else {
    console.log('\n  ' + warn(`${changed} changed · ${stable} stable`));
    console.log('  ' + dim('Review changes above. If intentional, re-save baseline.'));
  }

  summary(results.filter(r => r.status !== 'skip'), Date.now() - t0);
  return results;
}

module.exports = { run, runSave, loadBaseline, BASELINE_PATH };
