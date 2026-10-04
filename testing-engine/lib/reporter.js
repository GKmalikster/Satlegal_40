/**
 * lib/reporter.js — Shared terminal reporter for all test modules
 *
 * Consistent output format: icon  ID  tag  result  timing
 */

'use strict';

// ANSI
const C = {
  reset: '\x1b[0m', bold: '\x1b[1m', dim: '\x1b[2m',
  green: '\x1b[32m', red: '\x1b[31m', yellow: '\x1b[33m',
  cyan: '\x1b[36m', grey: '\x1b[90m',
};

const icon = {
  pass:    C.green  + '✓' + C.reset,
  fail:    C.red    + '✗' + C.reset,
  partial: C.yellow + '~' + C.reset,
  skip:    C.grey   + '○' + C.reset,
};

function pass(s)  { return C.green  + s + C.reset; }
function fail(s)  { return C.red    + s + C.reset; }
function warn(s)  { return C.yellow + s + C.reset; }
function dim(s)   { return C.dim    + s + C.reset; }
function bold(s)  { return C.bold   + s + C.reset; }
function cyan(s)  { return C.cyan   + s + C.reset; }

function ms(n) { return n < 1000 ? n + 'ms' : (n / 1000).toFixed(1) + 's'; }

function bar(passed, total, len = 35) {
  const filled = total > 0 ? Math.round((passed / total) * len) : 0;
  return C.green + '█'.repeat(filled) + C.reset + C.dim + '░'.repeat(len - filled) + C.reset;
}

function sectionHeader(title, count) {
  console.log('\n' + bold(`── ${title} (${count} tests) `) + dim('─'.repeat(Math.max(0, 50 - title.length))));
}

function resultLine(id, status, tag, description, timing, detail = null) {
  const ic = icon[status] || icon.skip;
  const tagStr = dim(`[${tag}]`);
  const timeStr = dim(ms(timing));
  console.log(`  ${ic} ${id.padEnd(4)} ${tagStr.padEnd(20)} ${dim(description.substring(0, 48).padEnd(50))} ${timeStr}`);
  if (detail) {
    detail.forEach(line => console.log('      ' + dim(line)));
  }
}

function summary(results, elapsed) {
  const pass_    = results.filter(r => r.status === 'pass').length;
  const fail_    = results.filter(r => r.status === 'fail').length;
  const partial_ = results.filter(r => r.status === 'partial').length;
  const total    = results.length;
  const pct      = total ? Math.round((pass_ / total) * 100) : 0;

  console.log('\n' + bold('─'.repeat(52)));
  console.log(`  ${bar(pass_, total)}`);
  console.log(`  ${pass(pass_ + ' pass')}  ${warn(partial_ + ' partial')}  ${fail(fail_ + ' fail')}  ${bold(pct + '%')}`);
  console.log(`  ${dim(total + ' tests · ' + ms(elapsed))}`);
  console.log('');
}

module.exports = { pass, fail, warn, dim, bold, cyan, ms, bar, icon, sectionHeader, resultLine, summary };
