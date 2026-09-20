#!/usr/bin/env node
/**
 * SatLegal Testing Engine – CLI Runner v1.0
 * Usage:
 *   node runner.js                        → run all tests against https://satlegal.in
 *   node runner.js --target http://localhost:3000
 *   node runner.js --suite law            → law accuracy only
 *   node runner.js --suite api            → API tests only
 *   node runner.js --suite ui             → page checks only
 *   node runner.js --suite reg            → regression only
 *   node runner.js --save-baseline        → save law results as baseline after running
 *   node runner.js --output report.json   → write JSON report to file
 */

const https = require('https');
const http  = require('http');
const fs    = require('fs');
const path  = require('path');

// ── Args ──────────────────────────────────────────────────────────────────────
const args    = process.argv.slice(2);
const arg     = (flag, def) => { const i=args.indexOf(flag); return i>=0&&args[i+1]?args[i+1]:def; };
const hasFlag = flag => args.includes(flag);

const TARGET       = arg('--target', 'https://satlegal.in');
const SUITE        = arg('--suite', 'all');
const OUTPUT_FILE  = arg('--output', null);
const SAVE_BASELINE= hasFlag('--save-baseline');
const BASELINE_PATH= path.join(__dirname, 'baseline.json');

// ── Colors ───────────────────────────────────────────────────────────────────
const C = {
  reset:'\x1b[0m', bold:'\x1b[1m', dim:'\x1b[2m',
  pass:'\x1b[32m', fail:'\x1b[31m', warn:'\x1b[33m',
  skip:'\x1b[90m', cyan:'\x1b[36m', white:'\x1b[37m',
};
const pass  = s => C.pass+s+C.reset;
const fail  = s => C.fail+s+C.reset;
const warn  = s => C.warn+s+C.reset;
const dim   = s => C.dim+s+C.reset;
const bold  = s => C.bold+s+C.reset;
const cyan  = s => C.cyan+s+C.reset;

// ── HTTP helper ───────────────────────────────────────────────────────────────
function request(method, url, body=null){
  return new Promise((resolve, reject) => {
    const u    = new URL(url);
    const mod  = u.protocol==='https:'?https:http;
    const data = body ? JSON.stringify(body) : null;
    const opts = {
      hostname: u.hostname, port: u.port||undefined,
      path: u.pathname+(u.search||''),
      method,
      headers: {
        'Content-Type':'application/json',
        'User-Agent':'SatLegal-TestRunner/1.0',
        ...(data ? {'Content-Length':Buffer.byteLength(data)} : {}),
      },
      timeout: 15000,
    };
    const t0 = Date.now();
    const req = mod.request(opts, res => {
      let raw='';
      res.on('data', d=>raw+=d);
      res.on('end', ()=>{
        let parsed=null;
        try{ parsed=JSON.parse(raw); }catch(e){ parsed=raw; }
        resolve({ status:res.statusCode, ok:res.statusCode<400, data:parsed, ms:Date.now()-t0 });
      });
    });
    req.on('error', reject);
    req.on('timeout', ()=>{ req.destroy(); reject(new Error('Timeout')); });
    if(data) req.write(data);
    req.end();
  });
}

// ── Test Suites ───────────────────────────────────────────────────────────────

const LAW_TESTS = [
  { id:'L01', query:'22 karat jewellery turned out to be 20 karat',           expected:'Consumer – Product Defect / Service Deficiency',                          tag:'Fix #90' },
  { id:'L02', query:'Jewellery purity fraud gold hallmark missing',            expected:'Consumer – Product Defect / Service Deficiency',                          tag:'Fix #90' },
  { id:'L03', query:'My refrigerator stopped working within 1 month',         expected:'Consumer – Product Defect / Service Deficiency',                          tag:'Consumer core' },
  { id:'L04', query:'Builder not giving flat possession after full payment',   expected:'Property – RERA / Builder Dispute',                                       tag:'RERA' },
  { id:'L05', query:'My car keeps breaking down after service center repair',  expected:'Consumer – Product Defect / Service Deficiency',                          tag:'Consumer vehicle' },
  { id:'L06', query:'My car window was smashed by neighbour',                  expected:'Criminal – BNS (Mischief / Property Damage / Vandalism)',                 tag:'Fix #91' },
  { id:'L07', query:'Someone transferred 45000 from my bank without permission', expected:'Cyber – Online Fraud / Financial Cyber Crime',                         tag:'Cyber fraud' },
  { id:'L08', query:'UPI fraud someone got my OTP and withdrew money',         expected:'Cyber – Online Fraud / Financial Cyber Crime',                            tag:'Cyber fraud' },
  { id:'L09', query:'My cheque bounced bank returned it',                      expected:'Criminal – Negotiable Instruments Act (Cheque Bounce / NI Act)',          tag:'Cheque bounce' },
  { id:'L10', query:'Police took bribe and refused to file my FIR',           expected:'Criminal – Police Excess / Human Rights Violation',                       tag:'Police excess' },
  { id:'L11', query:'Employer not paying salary for 3 months',                 expected:'Employment – Salary Dues / PF / Gratuity',                               tag:'Employment' },
  { id:'L12', query:'I was fired without any notice or reason',                expected:'Employment – Wrongful Termination / Illegal Dismissal',                   tag:'Employment' },
  { id:'L13', query:'Husband demanding dowry and harassing me at home',        expected:'Family – Dowry / 498A / Streedhan Recovery',                             tag:'Dowry' },
  { id:'L14', query:'I want to get divorced from my husband',                  expected:'Family – Divorce (Contested)',                                            tag:'Divorce' },
  { id:'L15', query:'What is triple talaq and what are my rights',            expected:'Family – Muslim Personal Law (Divorce / Mehr / Maintenance)',              tag:'Muslim law' },
  { id:'L16', query:'Tenant not vacating my property despite notice',          expected:'Property – Rent Dispute / Tenant Eviction',                              tag:'Property' },
  { id:'L17', query:'Property dispute with brother over ancestral land',       expected:'Civil – Partition Suit',                                                  tag:'Partition' },
  { id:'L18', query:'Patient died after surgery doctor was negligent',         expected:'Criminal – Medical Negligence / Death by Negligence (BNS 106)',           tag:'Medical neg.' },
  { id:'L19', query:'Received GST notice from income tax department',          expected:'Tax – GST / Income Tax / Tax Dispute',                                   tag:'Tax' },
  { id:'L20', query:'Mera criminal revision high court se bail cancel ho sakti hai', expected:'Criminal – BNSS (Bail / Anticipatory Bail / Criminal Procedure)',  tag:'Bail Hinglish' },
];

const API_TESTS = [
  { id:'A01', method:'POST', path:'/api/analyse', desc:'Valid legal query',       body:{description:'employer not paying salary'}, check: r=>r.ok&&r.data&&(r.data.laws||r.data.detectedLaws) },
  { id:'A02', method:'POST', path:'/api/analyse', desc:'Empty query (error)',     body:{description:''}, check: r=>!r.ok||(r.data&&r.data.error) },
  { id:'A03', method:'POST', path:'/api/analyse', desc:'Hinglish query',         body:{description:'mera cheque bounce ho gaya kya karu'}, check: r=>r.ok },
  { id:'A04', method:'POST', path:'/api/analyse', desc:'Long query (400 chars)', body:{description:'I have a situation where my employer has not been paying my salary for the past 3 months despite me sending multiple reminders. What legal options do I have under Indian labour law?'}, check: r=>r.ok },
  { id:'A05', method:'POST', path:'/api/track',   desc:'Analytics event',        body:{event:'page_view',page:'/',sessionId:'test-cli'}, check: r=>r.ok },
  { id:'A06', method:'GET',  path:'/api/lawyer/list', desc:'Lawyer list',        body:null, check: r=>r.status<500 },
  { id:'A07', method:'GET',  path:'/robots.txt',  desc:'robots.txt',             body:null, check: r=>r.ok },
  { id:'A08', method:'GET',  path:'/sitemap.xml', desc:'sitemap.xml',            body:null, check: r=>r.ok },
  { id:'A09', method:'GET',  path:'/googlecade4f9f2f6a0033.html', desc:'GSC verify file', body:null, check: r=>r.ok },
  { id:'A10', method:'GET',  path:'/',            desc:'Homepage',               body:null, check: r=>r.ok },
  { id:'A11', method:'POST', path:'/api/analyse', desc:'JSON injection (sec)',   body:{description:'{"$gt":""}; DROP TABLE; landlord dispute'}, check: r=>r.status!==500 },
  { id:'A12', method:'POST', path:'/api/analyse', desc:'XSS in query (sec)',     body:{description:'<script>alert(1)</script> landlord dispute'}, check: r=>r.ok },
];

const UI_TESTS = [
  { id:'U01', path:'/',                      name:'Homepage',          mustContain:['SatLegal','legal'] },
  { id:'U02', path:'/pricing.html',          name:'Pricing',           mustContain:['499','2,499'] },
  { id:'U03', path:'/faq.html',              name:'FAQ',               mustContain:['SatLegal'] },
  { id:'U04', path:'/how-it-works.html',     name:'How It Works',      mustContain:['step','legal'] },
  { id:'U05', path:'/contact.html',          name:'Contact',           mustContain:['contact','SatLegal'] },
  { id:'U06', path:'/about.html',            name:'About',             mustContain:['SatLegal','66'] },
  { id:'U07', path:'/laws-reference.html',   name:'Laws Reference',    mustContain:['Indian','law'] },
  { id:'U08', path:'/legal-topics.html',     name:'Legal Topics',      mustContain:['family','criminal'] },
  { id:'U09', path:'/auth/login.html',       name:'Login',             mustContain:['Login','password'] },
  { id:'U10', path:'/auth/signup.html',      name:'Signup',            mustContain:['Sign Up','password'] },
  { id:'U11', path:'/auth/lawyer-register.html', name:'Lawyer Reg',    mustContain:['lawyer','register'] },
  { id:'U12', path:'/terms-conditions.html', name:'Terms',             mustContain:['terms','SatLegal'] },
  { id:'U13', path:'/payment/qr.html',       name:'Payment/QR',        mustContain:['payment','UPI'] },
  { id:'U14', path:'/404.html',              name:'404 page',          mustContain:['404'] },
];

// ── Results store ─────────────────────────────────────────────────────────────
const results = { law:[], api:[], ui:[], reg:[] };

// ── Helpers ───────────────────────────────────────────────────────────────────
function statusIcon(s){ return s==='pass'?pass('✓'):s==='fail'?fail('✗'):s==='warn'?warn('⚠'):dim('○'); }
function bar(n, total, len=30){
  const filled = Math.round(n/total*len);
  return pass('█'.repeat(filled)) + dim('░'.repeat(len-filled));
}
function ms2s(ms){ return ms<1000?ms+'ms':(ms/1000).toFixed(1)+'s'; }

function printHeader(){
  console.log('\n'+bold('╔══════════════════════════════════════════════════════╗'));
  console.log(bold('║') + cyan('  SatLegal Testing Engine v1.0                       ') + bold('║'));
  console.log(bold('╚══════════════════════════════════════════════════════╝'));
  console.log(dim('  Target: ')+TARGET);
  console.log(dim('  Suite:  ')+SUITE);
  console.log(dim('  Time:   ')+new Date().toLocaleString('en-IN'));
  console.log('');
}

function printSectionHeader(title, count){
  console.log('\n'+bold('── '+title+' ('+count+' tests) ──────────────────────────────────'));
}

// ── Law accuracy runner ───────────────────────────────────────────────────────
async function runLawTests(){
  printSectionHeader('LAW ACCURACY TESTS', LAW_TESTS.length);
  let pass_=0, fail_=0, warn_=0;

  for(const t of LAW_TESTS){
    try {
      const r = await request('POST', TARGET+'/api/analyse', {description:t.query});
      const laws = r.data?.laws || r.data?.detectedLaws || [];
      const rawList = Array.isArray(laws) ? laws : [laws].filter(Boolean);
      // API returns objects {caseType, ...} — normalise to strings
      const detected = rawList.map(l => (l && typeof l==='object' ? l.caseType : l)).filter(Boolean);

      const expKeywords = t.expected.toLowerCase().split(/[–\-\/()]/g).map(s=>s.trim()).filter(s=>s.length>3);
      const matchScore  = detected.reduce((acc,l)=>{
        const lLow = (l||'').toLowerCase();
        return acc + expKeywords.filter(k=>lLow.includes(k)).length;
      }, 0);

      const passed  = matchScore >= 2;
      const partial = !passed && detected.length>0 && matchScore>=1;
      const status  = !r.ok?'fail':passed?'pass':partial?'warn':'fail';

      const icon = statusIcon(status);
      const tag  = dim(`[${t.tag}]`);
      const detStr = detected.slice(0,2).join(' · ')||'—';
      console.log(`  ${icon} ${t.id} ${tag} ${dim(t.query.substring(0,50)+'…')}`);
      if(status!=='pass') console.log(`      ${dim('Expected:')} ${t.expected.substring(0,60)}`);
      if(status!=='pass') console.log(`      ${dim('Got:     ')} ${detStr.substring(0,60)}`);
      console.log(`      ${dim('⏱')} ${ms2s(r.ms)}`);

      if(status==='pass') pass_++; else if(status==='warn') warn_++; else fail_++;
      results.law.push({ id:t.id, query:t.query, expected:t.expected, detected, status, ms:r.ms });

    } catch(e){
      fail_++;
      console.log(`  ${fail('✗')} ${t.id} ${fail('ERROR: '+e.message)}`);
      results.law.push({ id:t.id, query:t.query, expected:t.expected, detected:[], status:'fail', error:e.message });
    }
  }

  const total = LAW_TESTS.length;
  const pct = Math.round(pass_/total*100);
  console.log(`\n  ${bar(pass_, total)} ${pct}%  (${pass(pass_+' pass')} · ${warn(warn_+' partial')} · ${fail(fail_+' fail')})`);

  if(SAVE_BASELINE){
    const baseline = {};
    results.law.forEach(r=>{ baseline[r.id]=r.detected.join(', '); });
    fs.writeFileSync(BASELINE_PATH, JSON.stringify(baseline, null, 2));
    console.log('  '+pass('✓ Baseline saved → '+BASELINE_PATH));
  }
}

// ── API runner ────────────────────────────────────────────────────────────────
async function runApiTests(){
  printSectionHeader('API ENDPOINT TESTS', API_TESTS.length);
  let pass_=0, fail_=0;

  for(const t of API_TESTS){
    try {
      const r = await request(t.method, TARGET+t.path, t.body);
      const ok = t.check(r);
      const status = ok?'pass':'fail';
      if(ok) pass_++; else fail_++;
      const code = r.status<400?pass(r.status):fail(r.status);
      console.log(`  ${statusIcon(status)} ${t.id} ${dim(t.method.padEnd(5))} ${cyan(t.path.padEnd(25))} ${code} ${dim(ms2s(r.ms)+'  '+t.desc)}`);
      results.api.push({ id:t.id, method:t.method, path:t.path, desc:t.desc, status, statusCode:r.status, ms:r.ms });
    } catch(e){
      fail_++;
      console.log(`  ${fail('✗')} ${t.id} ${dim(t.method.padEnd(5))} ${cyan(t.path.padEnd(25))} ${fail('ERROR: '+e.message)}`);
      results.api.push({ id:t.id, method:t.method, path:t.path, desc:t.desc, status:'fail', error:e.message });
    }
  }

  console.log(`\n  ${pass_}/${API_TESTS.length} passed`);
}

// ── UI runner ─────────────────────────────────────────────────────────────────
async function runUiTests(){
  printSectionHeader('PAGE / UI CHECKS', UI_TESTS.length);
  let pass_=0, fail_=0, warn_=0;

  for(const t of UI_TESTS){
    try {
      const r = await request('GET', TARGET+t.path);
      const html = typeof r.data==='string'?r.data.toLowerCase():'';
      const missing = t.mustContain.filter(c=>!html.includes(c.toLowerCase()));
      const status = !r.ok?'fail':missing.length===0?'pass':'warn';
      if(status==='pass') pass_++; else if(status==='warn') warn_++; else fail_++;

      const missStr = missing.length ? warn('  missing: '+missing.join(', ')) : '';
      console.log(`  ${statusIcon(status)} ${t.id} ${dim(t.path.padEnd(32))} ${dim(t.name.padEnd(18))} ${dim(ms2s(r.ms))}${missStr}`);
      results.ui.push({ id:t.id, path:t.path, name:t.name, status, missing, ms:r.ms });
    } catch(e){
      fail_++;
      console.log(`  ${fail('✗')} ${t.id} ${dim(t.path.padEnd(32))} ${fail(e.message)}`);
      results.ui.push({ id:t.id, path:t.path, name:t.name, status:'fail', error:e.message });
    }
  }

  console.log(`\n  ${pass_}/${UI_TESTS.length} passed, ${warn_} with missing content`);
}

// ── Regression runner ─────────────────────────────────────────────────────────
async function runRegTests(){
  printSectionHeader('REGRESSION TESTS', 10);

  if(!fs.existsSync(BASELINE_PATH)){
    console.log('  '+warn('No baseline found at '+BASELINE_PATH));
    console.log('  '+dim('Run with --save-baseline to create one first.'));
    return;
  }

  const baseline = JSON.parse(fs.readFileSync(BASELINE_PATH,'utf8'));
  const regTests = LAW_TESTS.slice(0,10);
  let same_=0, changed_=0;

  for(const t of regTests){
    const base = baseline[t.id]||null;
    if(!base){ console.log(`  ${dim('○')} ${t.id} ${dim('No baseline — skip')}`); continue; }

    try {
      const r = await request('POST', TARGET+'/api/analyse', {description:t.query});
      const laws = r.data?.laws || r.data?.detectedLaws || [];
      const rawReg = Array.isArray(laws) ? laws : [];
      const current = rawReg.map(l => (l && typeof l==='object' ? l.caseType : l)).filter(Boolean).join(', ');
      const changed = current.toLowerCase().trim() !== base.toLowerCase().trim();

      if(changed){
        changed_++;
        console.log(`  ${warn('⚠')} ${t.id} ${warn('CHANGED')} ${dim(t.query.substring(0,45)+'…')}`);
        console.log(`      ${dim('Was: ')}${base.substring(0,70)}`);
        console.log(`      ${dim('Now: ')}${current.substring(0,70)}`);
        results.reg.push({ id:t.id, query:t.query, baseline:base, current, status:'warn' });
      } else {
        same_++;
        console.log(`  ${pass('✓')} ${t.id} ${dim('No change  '+t.query.substring(0,50)+'…')}`);
        results.reg.push({ id:t.id, query:t.query, baseline:base, current, status:'pass' });
      }
    } catch(e){
      console.log(`  ${fail('✗')} ${t.id} ${fail(e.message)}`);
      results.reg.push({ id:t.id, query:t.query, status:'fail', error:e.message });
    }
  }

  if(changed_===0) console.log(`\n  ${pass('✓ No regressions detected')} (${same_} tests stable)`);
  else console.log(`\n  ${warn(changed_+' changed')} · ${same_} stable`);
}

// ── Final summary ─────────────────────────────────────────────────────────────
function printSummary(elapsed){
  const all = [...results.law,...results.api,...results.ui,...results.reg];
  const pass_ = all.filter(r=>r.status==='pass').length;
  const fail_ = all.filter(r=>r.status==='fail').length;
  const warn_ = all.filter(r=>r.status==='warn').length;
  const total = all.length;
  const pct   = total ? Math.round(pass_/total*100) : 0;

  console.log('\n'+bold('══════════════════════════════════════════════════════'));
  console.log(bold('  RESULTS SUMMARY'));
  console.log(bold('══════════════════════════════════════════════════════'));
  console.log(`  ${bar(pass_,total,40)}`);
  console.log(`  ${pass(pass_+' passed')} · ${warn(warn_+' partial')} · ${fail(fail_+' failed')} · ${pct}% accuracy`);
  console.log(`  Total: ${total} tests · ${ms2s(elapsed)}`);
  console.log('');
}

// ── Write JSON output ─────────────────────────────────────────────────────────
function writeReport(elapsed){
  if(!OUTPUT_FILE) return;
  const all = [...results.law,...results.api,...results.ui,...results.reg];
  const report = {
    generated: new Date().toISOString(),
    target: TARGET, suite: SUITE, elapsed_ms: elapsed,
    summary: {
      total: all.length,
      pass: all.filter(r=>r.status==='pass').length,
      fail: all.filter(r=>r.status==='fail').length,
      partial: all.filter(r=>r.status==='warn').length,
    },
    law: results.law, api: results.api, ui: results.ui, reg: results.reg,
  };
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(report,null,2));
  console.log('  '+pass('✓ Report saved → '+OUTPUT_FILE));
}

// ── Main ──────────────────────────────────────────────────────────────────────
(async () => {
  printHeader();
  const t0 = Date.now();

  try {
    if(SUITE==='all'||SUITE==='law')  await runLawTests();
    if(SUITE==='all'||SUITE==='api')  await runApiTests();
    if(SUITE==='all'||SUITE==='ui')   await runUiTests();
    if(SUITE==='all'||SUITE==='reg')  await runRegTests();
  } catch(e){
    console.error(fail('\nFatal error: '+e.message));
    process.exit(1);
  }

  const elapsed = Date.now()-t0;
  printSummary(elapsed);
  writeReport(elapsed);
})();
