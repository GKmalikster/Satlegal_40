#!/usr/bin/env node
/**
 * SatLegal Testing Engine — runner.js v2.0
 *
 * Usage:
 *   node runner.js                          run all suites against https://satlegal.in
 *   node runner.js --target http://localhost:3000
 *   node runner.js --suite offline          law accuracy (no network, instant)
 *   node runner.js --suite law              law accuracy via live API
 *   node runner.js --suite api              API health checks
 *   node runner.js --suite pages            page integrity
 *   node runner.js --suite reg              regression vs saved baseline
 *   node runner.js --suite reg --save       save current results as new baseline
 *   node runner.js --output results.json    write full JSON report
 *   node runner.js --delay 500              ms between law test calls (default 200)
 *
 * Architecture:
 *   runner.js          — CLI entry point only; no business logic here
 *   contract.js        — API contract (request/response shapes from reading source)
 *   lib/http.js        — shared HTTP client
 *   lib/reporter.js    — shared terminal reporter
 *   modules/law-accuracy.js   — offline + live law classification tests
 *   modules/api-health.js     — endpoint health checks
 *   modules/page-integrity.js — page load + structural checks
 *   modules/regression.js     — baseline comparison
 */

'use strict';

const fs   = require('fs');
const path = require('path');

// ── Modules (each reads contract.js; none hardcode API shapes) ────────────────
const lawMod  = require('./modules/law-accuracy');
const apiMod  = require('./modules/api-health');
const pageMod = require('./modules/page-integrity');
const regMod  = require('./modules/regression');
const R       = require('./lib/reporter');

// ── Args ──────────────────────────────────────────────────────────────────────
const args    = process.argv.slice(2);
const arg     = (f, d) => { const i = args.indexOf(f); return i >= 0 && args[i + 1] ? args[i + 1] : d; };
const hasFlag = f => args.includes(f);

const TARGET  = arg('--target', 'https://satlegal.in');
const SUITE   = arg('--suite',  'all');
const OUTPUT  = arg('--output', null);
const DELAY   = parseInt(arg('--delay', '200'), 10);
const SAVE    = hasFlag('--save');

// ── Header ────────────────────────────────────────────────────────────────────
function printHeader() {
  console.log('\n' + R.bold('╔══════════════════════════════════════════════════════╗'));
  console.log(R.bold('║') + R.cyan('  SatLegal Testing Engine v2.0                       ') + R.bold('║'));
  console.log(R.bold('╚══════════════════════════════════════════════════════╝'));
  console.log(R.dim('  Target : ') + TARGET);
  console.log(R.dim('  Suite  : ') + SUITE);
  console.log(R.dim('  Time   : ') + new Date().toLocaleString('en-IN'));
}

// ── Final summary across all modules ─────────────────────────────────────────
function printGlobalSummary(all, elapsed) {
  const pass_    = all.filter(r => r.status === 'pass').length;
  const fail_    = all.filter(r => r.status === 'fail').length;
  const partial_ = all.filter(r => r.status === 'partial').length;
  const total    = all.length;
  const pct      = total ? Math.round((pass_ / total) * 100) : 0;

  console.log('\n' + R.bold('══════════════════════════════════════════════════════'));
  console.log(R.bold('  OVERALL'));
  console.log(R.bold('══════════════════════════════════════════════════════'));
  console.log(`  ${R.bar(pass_, total)}`);
  console.log(`  ${R.pass(pass_ + ' pass')}  ${R.warn(partial_ + ' partial')}  ${R.fail(fail_ + ' fail')}  ${R.bold(pct + '%')}`);
  console.log(`  ${R.dim(total + ' tests · ' + R.ms(elapsed))}\n`);
}

// ── Write JSON report ─────────────────────────────────────────────────────────
function writeReport(allResults, elapsed) {
  if (!OUTPUT) return;
  const report = {
    generated: new Date().toISOString(),
    target: TARGET, suite: SUITE, elapsed_ms: elapsed,
    summary: {
      total:   allResults.length,
      pass:    allResults.filter(r => r.status === 'pass').length,
      fail:    allResults.filter(r => r.status === 'fail').length,
      partial: allResults.filter(r => r.status === 'partial').length,
    },
    results: allResults,
  };
  const outPath = path.isAbsolute(OUTPUT) ? OUTPUT : path.join(__dirname, OUTPUT);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
  console.log('  ' + R.pass('✓ Report → ' + outPath));
}

// ── Main ──────────────────────────────────────────────────────────────────────
(async () => {
  printHeader();
  const t0  = Date.now();
  let all   = [];

  try {
    // Offline (keyword engine only — no network)
    if (SUITE === 'all' || SUITE === 'offline') {
      const r = await lawMod.runOffline();
      all = all.concat(r);
    }

    // Live law accuracy (calls /api/analyse)
    if (SUITE === 'law') {
      const r = await lawMod.runLive(TARGET, undefined, DELAY);
      all = all.concat(r);
    }

    // API health
    if (SUITE === 'all' || SUITE === 'api') {
      const r = await apiMod.run(TARGET);
      all = all.concat(r);
    }

    // Page integrity
    if (SUITE === 'all' || SUITE === 'pages') {
      const r = await pageMod.run(TARGET);
      all = all.concat(r);
    }

    // Regression
    if (SUITE === 'reg') {
      if (SAVE) {
        await regMod.runSave(TARGET);
      } else {
        const r = await regMod.run(TARGET);
        all = all.concat(r.filter(r => r.status !== 'skip'));
      }
    }

  } catch (err) {
    console.error(R.fail('\nFatal: ' + err.message));
    process.exit(1);
  }

  const elapsed = Date.now() - t0;
  if (all.length > 0) printGlobalSummary(all, elapsed);
  writeReport(all, elapsed);
})();
