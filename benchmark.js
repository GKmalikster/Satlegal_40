#!/usr/bin/env node
/**
 * SatLegal Laws Classifier — Accuracy Benchmark (1000+ tests)
 *
 * Usage:
 *   node benchmark.js               → test keyword engine only (instant, offline)
 *   node benchmark.js --api         → test live /api/analyse on Vercel
 *   node benchmark.js --api --url https://your-url.vercel.app
 *   node benchmark.js --fail        → show only failures
 *   node benchmark.js --cat "Divorce"  → run only tests matching category tag
 *
 * Test format:
 *   { q: 'user query', expect: 'Part of caseType', note: 'optional note' }
 *   expect can be a string (partial match) or array (any of these must appear in top-3)
 *   Prefix query with 'N:' to test ABSENCE — that law must NOT appear in top-3
 */

'use strict';
const https = require('https');
const http  = require('http');

const args      = process.argv.slice(2);
const USE_API   = args.includes('--api');
const FAIL_ONLY = args.includes('--fail');
const urlIdx    = args.indexOf('--url');
const catIdx    = args.indexOf('--cat');
const API_URL   = urlIdx >= 0 ? args[urlIdx + 1] : 'https://satlegal-40.vercel.app';
const CAT_FILTER= catIdx >= 0 ? args[catIdx + 1].toLowerCase() : null;

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

// ─────────────────────────────────────────────────────────────────────────────
// TEST CASES  (1000+)
// tag: used with --cat filter
// ─────────────────────────────────────────────────────────────────────────────
const TESTS = [

  // ══════════════════════════════════════════════════════════════════
  // 1. DIVORCE (CONTESTED)
  // ══════════════════════════════════════════════════════════════════
  { q: 'i want to file for divorce from my wife',                          expect: 'Divorce', note: '[Divorce] standard contested' },
  { q: 'i want divorce from my husband he is cruel to me',                 expect: 'Divorce', note: '[Divorce] cruelty ground' },
  { q: 'my husband deserted me 3 years ago i want divorce',                expect: 'Divorce', note: '[Divorce] desertion ground' },
  { q: 'wife is committing adultery i want divorce',                       expect: 'Divorce', note: '[Divorce] adultery ground' },
  { q: 'husband is an alcoholic and abusive want to end marriage',         expect: 'Divorce', note: '[Divorce] alcoholism cruelty' },
  { q: 'i want to legally separate from my spouse',                        expect: 'Divorce', note: '[Divorce] separation intent' },
  { q: 'how to file divorce petition in family court',                     expect: 'Divorce', note: '[Divorce] procedural query' },
  { q: 'marriage breakdown completely want legal end to it',               expect: 'Divorce', note: '[Divorce] marriage breakdown' },
  { q: 'mujhe apni wife se talaq chahiye',                                 expect: 'Divorce', note: '[Divorce] Hinglish husband' },
  { q: 'pati se alag hona chahti hoon divorce chahiye',                    expect: 'Divorce', note: '[Divorce] Hinglish wife' },
  { q: 'husband mentally tortures me want to get out of marriage',         expect: 'Divorce', note: '[Divorce] mental cruelty' },
  { q: 'husband left home 4 years back no contact want divorce',           expect: 'Divorce', note: '[Divorce] long desertion' },
  { q: 'my wife refuses to stay with me and moved to her parents',         expect: 'Divorce', note: '[Divorce] wife deserted' },
  { q: 'contested divorce filing grounds cruelty desertion',               expect: 'Divorce', note: '[Divorce] legal terms' },
  { q: 'marriage is irretrievably broken want divorce decree',             expect: 'Divorce', note: '[Divorce] formal decree' },

  // ══════════════════════════════════════════════════════════════════
  // 2. MUTUAL CONSENT DIVORCE
  // ══════════════════════════════════════════════════════════════════
  { q: 'we both agree to divorce amicably',                                expect: 'Mutual Consent', note: '[MCD] amicable both agree' },
  { q: 'mutual consent divorce how to file jointly',                       expect: 'Mutual Consent', note: '[MCD] joint filing' },
  { q: 'we have settled custody and alimony and want divorce by consent',  expect: 'Mutual Consent', note: '[MCD] settlement done' },
  { q: 'friendly divorce both parties willing to separate',                expect: 'Mutual Consent', note: '[MCD] friendly divorce' },
  { q: 'both of us want to end marriage without fighting',                 expect: 'Mutual Consent', note: '[MCD] no fight' },
  { q: 'we agreed on divorce settlement need to file papers',              expect: 'Mutual Consent', note: '[MCD] papers filing' },
  { q: 'cooling period waiver for mutual divorce petition',                expect: 'Mutual Consent', note: '[MCD] cooling period' },
  { q: 'hum dono milkar divorce lena chahte hain',                        expect: 'Mutual Consent', note: '[MCD] Hinglish both agree' },
  { q: 'no dispute between us just want to legally separate together',     expect: 'Mutual Consent', note: '[MCD] no dispute' },
  { q: 'we have both signed divorce settlement agreement',                 expect: 'Mutual Consent', note: '[MCD] signed agreement' },

  // ══════════════════════════════════════════════════════════════════
  // 3. CHILD CUSTODY
  // ══════════════════════════════════════════════════════════════════
  { q: 'i want custody of my child after divorce',                         expect: 'Custody', note: '[Custody] post-divorce' },
  { q: 'husband took children away without my permission',                 expect: 'Custody', note: '[Custody] abduction by husband' },
  { q: 'wife is not allowing me to meet my kids',                          expect: 'Custody', note: '[Custody] visitation denied' },
  { q: 'grandparents want custody of orphaned grandchildren',              expect: 'Custody', note: '[Custody] grandparents' },
  { q: 'want to be appointed guardian of minor nephew',                    expect: 'Custody', note: '[Custody] guardianship' },
  { q: 'child custody visitation rights dispute',                          expect: 'Custody', note: '[Custody] visitation rights' },
  { q: 'my children are with my estranged wife and i cannot meet them',    expect: 'Custody', note: '[Custody] estranged wife' },
  { q: 'bachon ki custody chahiye mujhe',                                  expect: 'Custody', note: '[Custody] Hinglish' },
  { q: 'ex-wife took children to another city without court permission',   expect: 'Custody', note: '[Custody] relocation' },
  { q: 'father wants sole custody of daughter after separation',           expect: 'Custody', note: '[Custody] sole custody father' },
  { q: 'minor child welfare best interests custody dispute',               expect: 'Custody', note: '[Custody] welfare standard' },
  { q: 'joint custody arrangement not working want revision',              expect: 'Custody', note: '[Custody] revision' },

  // ══════════════════════════════════════════════════════════════════
  // 4. MAINTENANCE / ALIMONY
  // ══════════════════════════════════════════════════════════════════
  { q: 'husband not paying monthly maintenance after separation',          expect: 'Maintenance', note: '[Maint] not paying' },
  { q: 'i need alimony from my husband after divorce',                     expect: 'Maintenance', note: '[Maint] alimony claim' },
  { q: 'wife is claiming excessive alimony in divorce',                    expect: 'Maintenance', note: '[Maint] excessive alimony' },
  { q: 'how to apply for interim maintenance under section 125',           expect: 'Maintenance', note: '[Maint] sec 125' },
  { q: 'husband stopped paying maintenance order passed by court',         expect: 'Maintenance', note: '[Maint] violating order' },
  { q: 'i am unemployed wife needs to pay me maintenance',                 expect: 'Maintenance', note: '[Maint] husband claiming' },
  { q: 'maintenance for children not being paid by father',                expect: 'Maintenance', note: '[Maint] child maintenance' },
  { q: 'nafaqa nahi de raha mera pati',                                   expect: 'Maintenance', note: '[Maint] Hinglish' },
  { q: 'wife deserted me now claiming maintenance from me',                expect: 'Maintenance', note: '[Maint] deserted wife claim' },
  { q: 'permanent alimony quantum how to determine',                       expect: 'Maintenance', note: '[Maint] permanent alimony' },
  { q: 'monthly support payment stopped by husband need legal remedy',     expect: 'Maintenance', note: '[Maint] monthly support' },

  // ══════════════════════════════════════════════════════════════════
  // 5. DOMESTIC VIOLENCE
  // ══════════════════════════════════════════════════════════════════
  { q: 'my husband beats me regularly and threatens to kill me',           expect: 'Domestic', note: '[DV] beating threats' },
  { q: 'in-laws are mentally torturing me and demanding dowry',            expect: 'Domestic', note: '[DV] in-laws dowry torture' },
  { q: 'husband threw me out of the house late at night',                  expect: 'Domestic', note: '[DV] thrown out' },
  { q: 'i need a protection order against my abusive husband',             expect: 'Domestic', note: '[DV] protection order' },
  { q: 'husband controls all money refuses to give household expenses',    expect: 'Domestic', note: '[DV] economic violence' },
  { q: 'domestic violence complaint against husband and in-laws',          expect: 'Domestic', note: '[DV] complaint' },
  { q: 'live-in partner is abusing me physically and mentally',            expect: 'Domestic', note: '[DV] live-in abuse' },
  { q: 'pati ne mara mujhe kal raat',                                     expect: 'Domestic', note: '[DV] Hinglish beating' },
  { q: 'sasural wale tang karte hain dahej ke liye',                      expect: 'Domestic', note: '[DV] Hinglish in-laws dowry' },
  { q: 'my husband is hitting me when drunk',                              expect: 'Domestic', note: '[DV] casual drunk' },
  { q: 'husband threatens to take children if i complain to police',       expect: 'Domestic', note: '[DV] threats children' },
  { q: 'im scared of my husband he has a temper',                          expect: 'Domestic', note: '[DV] casual scared' },
  { q: 'husband maarta hai roz ghar se nikalane ki dhamki deta hai',      expect: 'Domestic', note: '[DV] Hinglish daily beating' },
  { q: 'emotional abuse by husband constant criticism humiliation',        expect: 'Domestic', note: '[DV] emotional abuse' },
  { q: 'husband is torturing me mentally i need immediate relief',         expect: 'Domestic', note: '[DV] mental torture' },
  { q: 'my in laws kicked me out of my own house',                         expect: 'Domestic', note: '[DV] kicked out' },

  // ══════════════════════════════════════════════════════════════════
  // 6. JUDICIAL SEPARATION / CONJUGAL RIGHTS
  // ══════════════════════════════════════════════════════════════════
  { q: 'want judicial separation from husband without divorce',            expect: 'Judicial Separation', note: '[JS] judicial sep' },
  { q: 'restitution of conjugal rights petition wife left home',          expect: 'Judicial Separation', note: '[JS] RCR petition' },
  { q: 'husband left matrimonial home without reason want him back',       expect: 'Judicial Separation', note: '[JS] husband left' },
  { q: 'spouse withdrawn from society without reasonable excuse',          expect: 'Judicial Separation', note: '[JS] withdrawn' },
  { q: 'wife refuses to come back to matrimonial home',                    expect: 'Judicial Separation', note: '[JS] wife refusing' },
  { q: 'separated but not divorced want legal recognition of separation',  expect: 'Judicial Separation', note: '[JS] separated' },
  { q: 'conjugal rights petition under hindu marriage act',                expect: 'Judicial Separation', note: '[JS] HMA petition' },

  // ══════════════════════════════════════════════════════════════════
  // 7. HINDU SUCCESSION / INHERITANCE
  // ══════════════════════════════════════════════════════════════════
  { q: 'father died without a will how to divide property',                expect: 'Hindu Succession', note: '[Inherit] intestate father' },
  { q: 'my brothers are not giving me my share of ancestral property',     expect: 'Hindu Succession', note: '[Inherit] brothers share' },
  { q: 'daughter claiming share in father property after death',           expect: 'Hindu Succession', note: '[Inherit] daughter share' },
  { q: 'joint family property dispute among siblings',                     expect: 'Hindu Succession', note: '[Inherit] siblings' },
  { q: 'ancestral land how to get my rightful share',                      expect: 'Hindu Succession', note: '[Inherit] ancestral land' },
  { q: 'father ki death ke baad property mein mera hissa chahiye',        expect: 'Hindu Succession', note: '[Inherit] Hinglish' },
  { q: 'coparcenary rights in joint family agricultural land',             expect: 'Hindu Succession', note: '[Inherit] coparcenary' },
  { q: 'mother died intestate property distribution among children',       expect: 'Hindu Succession', note: '[Inherit] intestate mother' },
  { q: 'step mother claiming all property of my late father',              expect: 'Hindu Succession', note: '[Inherit] stepmother' },
  { q: 'hindu succession act legal heirs who gets what share',             expect: 'Hindu Succession', note: '[Inherit] legal heirs' },
  { q: 'bhai mera zameen ka hissa nahi de raha baap ke jaane ke baad',   expect: 'Hindu Succession', note: '[Inherit] Hinglish brothers' },

  // ══════════════════════════════════════════════════════════════════
  // 8. WILL DISPUTE / PROBATE
  // ══════════════════════════════════════════════════════════════════
  { q: 'my father made a will but siblings are contesting it',             expect: 'Will Dispute', note: '[Will] contested will' },
  { q: 'the will of my grandfather appears to be forged',                  expect: 'Will Dispute', note: '[Will] forged will' },
  { q: 'probate of will how to get it from court',                         expect: 'Will Dispute', note: '[Will] probate' },
  { q: 'executor of will is not distributing estate to beneficiaries',     expect: 'Will Dispute', note: '[Will] executor dispute' },
  { q: 'suspicious will signed when person was very ill and not of sound mind', expect: 'Will Dispute', note: '[Will] unsound mind' },
  { q: 'want to challenge validity of my uncle will',                      expect: 'Will Dispute', note: '[Will] challenge validity' },
  { q: 'letter of administration for estate of person who died intestate', expect: ['Will Dispute','Succession'], note: '[Will] letters of admin' },
  { q: 'will was registered but we believe it is fraudulent',              expect: 'Will Dispute', note: '[Will] fraudulent registered' },
  { q: 'i was excluded from fathers will unjustly want to contest',       expect: 'Will Dispute', note: '[Will] excluded' },
  { q: 'bequest under will being denied by other legal heirs',             expect: 'Will Dispute', note: '[Will] bequest denied' },

  // ══════════════════════════════════════════════════════════════════
  // 9. WRONGFUL TERMINATION
  // ══════════════════════════════════════════════════════════════════
  { q: 'company fired me without any notice or reason',                    expect: 'Termination', note: '[WrongTerm] no notice' },
  { q: 'wrongful termination from job after 10 years service',             expect: 'Termination', note: '[WrongTerm] long service' },
  { q: 'terminated without following proper procedure need legal help',    expect: 'Termination', note: '[WrongTerm] no procedure' },
  { q: 'i was fired right after i complained about harassment',            expect: 'Termination', note: '[WrongTerm] retaliation' },
  { q: 'company retrenched me without retrenchment compensation',          expect: 'Termination', note: '[WrongTerm] retrenchment comp' },
  { q: 'laid off during maternity leave illegal dismissal',                expect: 'Termination', note: '[WrongTerm] maternity layoff' },
  { q: 'boss forced me to resign under pressure constructive dismissal',   expect: 'Termination', note: '[WrongTerm] forced resignation' },
  { q: 'naukri se nikala bina koi kaaran bataye',                         expect: 'Termination', note: '[WrongTerm] Hinglish' },
  { q: 'unfair dismissal from private company without charge sheet',       expect: 'Termination', note: '[WrongTerm] no charge sheet' },
  { q: 'terminated on pretext of poor performance actually retaliation',   expect: 'Termination', note: '[WrongTerm] pretext' },
  { q: 'company closed down department and fired everyone without pay',    expect: 'Termination', note: '[WrongTerm] closure' },
  { q: 'industrial dispute wrongful termination labour court',             expect: 'Termination', note: '[WrongTerm] labour court' },

  // ══════════════════════════════════════════════════════════════════
  // 10. SALARY DUES / PF / GRATUITY
  // ══════════════════════════════════════════════════════════════════
  { q: 'company has not paid my salary for last 3 months',                 expect: 'Salary', note: '[Salary] unpaid 3mo' },
  { q: 'employer not depositing PF contributions to my account',           expect: 'Salary', note: '[Salary] PF not deposited' },
  { q: 'i resigned but company is not paying my gratuity',                 expect: 'Salary', note: '[Salary] gratuity refused' },
  { q: 'overtime wages not paid despite working extra hours',              expect: 'Salary', note: '[Salary] overtime dues' },
  { q: 'provident fund balance not updated employer defaulting',           expect: 'Salary', note: '[Salary] PF default' },
  { q: 'bonus not paid despite company profits',                           expect: 'Salary', note: '[Salary] bonus denied' },
  { q: 'tds deducted from salary but not deposited with government',       expect: 'Salary', note: '[Salary] TDS not deposited' },
  { q: 'salary pending mera company pay nahi kar rahi',                   expect: 'Salary', note: '[Salary] Hinglish' },
  { q: 'esic contributions not paid by employer',                          expect: 'Salary', note: '[Salary] ESIC' },
  { q: 'full and final settlement not done after resignation',             expect: 'Salary', note: '[Salary] F&F settlement' },
  { q: 'wage theft employer paying less than agreed salary',               expect: 'Salary', note: '[Salary] wage theft' },

  // ══════════════════════════════════════════════════════════════════
  // 11. WORKPLACE HARASSMENT (POSH)
  // ══════════════════════════════════════════════════════════════════
  { q: 'my boss is sexually harassing me at workplace',                    expect: 'POSH', note: '[POSH] boss harassment' },
  { q: 'colleague made inappropriate sexual remarks and touching',         expect: 'POSH', note: '[POSH] colleague' },
  { q: 'i filed posh complaint but management is taking no action',        expect: 'POSH', note: '[POSH] no action' },
  { q: 'internal complaints committee not investigating my sexual harassment complaint', expect: 'POSH', note: '[POSH] ICC inaction' },
  { q: 'unwanted physical contact by senior at office',                    expect: 'POSH', note: '[POSH] unwanted contact' },
  { q: 'quid pro quo harassment boss asking sexual favours for promotion', expect: 'POSH', note: '[POSH] quid pro quo' },
  { q: 'hostile work environment due to sexual comments by team members',  expect: 'POSH', note: '[POSH] hostile environment' },
  { q: 'icc complaint under posh act against manager',                     expect: 'POSH', note: '[POSH] ICC formal' },
  { q: 'i was victimised after filing sexual harassment complaint',        expect: 'POSH', note: '[POSH] victimisation' },
  { q: 'office mein boss ne galat harkat ki posh complaint karni hai',    expect: 'POSH', note: '[POSH] Hinglish' },

  // ══════════════════════════════════════════════════════════════════
  // 12. SHOPS & ESTABLISHMENTS
  // ══════════════════════════════════════════════════════════════════
  { q: 'shop act registration not done employer refusing to register',     expect: 'Shops', note: '[S&E] registration' },
  { q: 'working more than 9 hours daily without overtime pay',             expect: 'Shops', note: '[S&E] working hours' },
  { q: 'weekly holiday not given by employer at shop',                     expect: 'Shops', note: '[S&E] weekly off' },
  { q: 'no appointment letter given at job by employer',                   expect: 'Shops', note: '[S&E] appointment letter' },
  { q: 'commercial establishment not following labour laws',               expect: 'Shops', note: '[S&E] commercial' },
  { q: 'shops and establishment act violation complaint',                  expect: 'Shops', note: '[S&E] formal violation' },

  // ══════════════════════════════════════════════════════════════════
  // 13. MGNREGA / LIVELIHOOD
  // ══════════════════════════════════════════════════════════════════
  { q: 'mgnrega wages not paid for work done last month',                  expect: 'MGNREGA', note: '[MGNA] wages not paid' },
  { q: 'job card not given under nrega scheme',                            expect: 'MGNREGA', note: '[MGNA] job card' },
  { q: 'work not given under mgnrega for 100 days',                        expect: 'MGNREGA', note: '[MGNA] work denied' },
  { q: 'minimum wages not paid for daily labour',                          expect: 'MGNREGA', note: '[MGNA] minimum wages' },
  { q: 'nrega ka paise nahi mila abhi tak',                               expect: 'MGNREGA', note: '[MGNA] Hinglish' },
  { q: 'right to livelihood violated government scheme denied',            expect: 'MGNREGA', note: '[MGNA] livelihood right' },

  // ══════════════════════════════════════════════════════════════════
  // 14. CYBER FRAUD / FINANCIAL CYBER CRIME
  // ══════════════════════════════════════════════════════════════════
  { q: 'someone hacked my bank account and transferred money out',         expect: 'Cyber', note: '[Cyber] bank hack' },
  { q: 'i received a fake upi payment link and lost 50000 rupees',         expect: 'Cyber', note: '[Cyber] UPI fraud' },
  { q: 'received a call from fake bank employee and gave otp lost money',  expect: 'Cyber', note: '[Cyber] OTP fraud' },
  { q: 'online fraud on olx bought phone paid money never received',       expect: 'Cyber', note: '[Cyber] OLX fraud' },
  { q: 'investment app turned out to be fraud lost lakhs',                 expect: 'Cyber', note: '[Cyber] investment app' },
  { q: 'phishing email clicked and bank account emptied',                  expect: 'Cyber', note: '[Cyber] phishing' },
  { q: 'someone did fraud using my debit card details',                    expect: 'Cyber', note: '[Cyber] card fraud' },
  { q: 'mera online account hack ho gaya paise gaye',                     expect: 'Cyber', note: '[Cyber] Hinglish' },
  { q: 'crypto investment fraud lost my savings to scammer',               expect: 'Cyber', note: '[Cyber] crypto scam' },
  { q: 'fake electricity bill link clicked and money deducted',            expect: 'Cyber', note: '[Cyber] fake bill link' },
  { q: 'job offer online paid registration fee they disappeared',          expect: 'Cyber', note: '[Cyber] job scam' },
  { q: 'romance scam online lost money to fake relationship',              expect: 'Cyber', note: '[Cyber] romance scam' },
  { q: 'account hacked someone took loan using my identity online',        expect: 'Cyber', note: '[Cyber] identity loan' },

  // ══════════════════════════════════════════════════════════════════
  // 15. CYBER HARASSMENT / CYBERSTALKING / DEFAMATION
  // ══════════════════════════════════════════════════════════════════
  { q: 'someone is posting my private intimate photos online without consent', expect: 'Cyber', note: '[CyberHarass] revenge porn' },
  { q: 'ex boyfriend is stalking me on instagram and sending threats',     expect: 'Cyber', note: '[CyberHarass] stalking' },
  { q: 'fake profile with my name and photos is spreading rumors',         expect: 'Cyber', note: '[CyberHarass] fake profile' },
  { q: 'being trolled and harassed on twitter constantly',                 expect: 'Cyber', note: '[CyberHarass] trolling' },
  { q: 'someone is defaming me on social media and whatsapp groups',       expect: 'Cyber', note: '[CyberHarass] defamation social' },
  { q: 'morphed photos of me circulated on whatsapp to harm reputation',   expect: 'Cyber', note: '[CyberHarass] morphed photos' },
  { q: 'cyberstalker following all my social media and sending threats',   expect: 'Cyber', note: '[CyberHarass] cyberstalker' },
  { q: 'online harassment by group targeting me daily',                    expect: 'Cyber', note: '[CyberHarass] group harassment' },
  { q: 'someone created fake facebook account with my identity',           expect: 'Cyber', note: '[CyberHarass] impersonation' },
  { q: 'threatening messages on whatsapp from unknown numbers',            expect: 'Cyber', note: '[CyberHarass] threats WA' },

  // ══════════════════════════════════════════════════════════════════
  // 16. DATA THEFT / HACKING / CORPORATE ESPIONAGE
  // ══════════════════════════════════════════════════════════════════
  { q: 'company database was hacked customer data stolen',                 expect: 'Data Theft', note: '[DataTheft] DB hack' },
  { q: 'ex employee took confidential business data when they left',       expect: 'Data Theft', note: '[DataTheft] ex employee' },
  { q: 'ransomware attack on our servers encrypted all files',             expect: 'Data Theft', note: '[DataTheft] ransomware' },
  { q: 'competitor accessed our trade secrets through hacking',            expect: 'Data Theft', note: '[DataTheft] corporate espionage' },
  { q: 'unauthorized access to company server by outsider',                expect: 'Data Theft', note: '[DataTheft] unauthorized access' },
  { q: 'employee installed malware on our systems to steal data',          expect: 'Data Theft', note: '[DataTheft] malware insider' },
  { q: 'data breach affecting thousands of customers',                     expect: 'Data Theft', note: '[DataTheft] breach scale' },

  // ══════════════════════════════════════════════════════════════════
  // 17. FRAUD / CHEATING (BNS)
  // ══════════════════════════════════════════════════════════════════
  { q: 'contractor took advance and disappeared without doing work',       expect: ['Fraud','Money Recovery'], note: '[Fraud] contractor' },
  { q: 'builder took my money but did not construct my house',             expect: 'Fraud', note: '[Fraud] builder money' },
  { q: 'business partner cheated me and took all the money',               expect: 'Fraud', note: '[Fraud] partner cheat' },
  { q: 'someone sold me fake gold jewellery as original',                  expect: 'Fraud', note: '[Fraud] fake gold' },
  { q: 'misrepresentation during sale i was deceived',                     expect: 'Fraud', note: '[Fraud] misrepresentation' },
  { q: 'took money promising return but never paid back',                  expect: 'Fraud', note: '[Fraud] money return' },
  { q: 'ponzi scheme fraud lost my life savings',                          expect: 'Fraud', note: '[Fraud] ponzi' },
  { q: 'maine usse paisa diya tha woh bhaag gaya',                        expect: 'Fraud', note: '[Fraud] Hinglish fled' },
  { q: 'sold me property that he did not own fraud',                       expect: 'Fraud', note: '[Fraud] fake property' },
  { q: 'false invoice and billing fraud by vendor',                        expect: 'Fraud', note: '[Fraud] invoice fraud' },
  { q: 'cheating and dishonest inducement to deliver property',            expect: 'Fraud', note: '[Fraud] legal definition' },

  // ══════════════════════════════════════════════════════════════════
  // 18. BNS ASSAULT / HURT / GRIEVOUS HURT
  // ══════════════════════════════════════════════════════════════════
  { q: 'my neighbour hit me and broke my arm',                             expect: 'BNS', note: '[Assault] neighbour broke arm' },
  { q: 'group of men attacked me with rods on the road',                   expect: 'BNS', note: '[Assault] gang attack' },
  { q: 'someone stabbed me near my house',                                 expect: 'BNS', note: '[Assault] stabbed' },
  { q: 'my boss punched me at the office',                                 expect: 'BNS', note: '[Assault] boss punched' },
  { q: 'acid attack on me by ex boyfriend',                                expect: 'BNS', note: '[Assault] acid' },
  { q: 'kidnapping for ransom my son was abducted',                        expect: 'BNS', note: '[Assault] kidnapping' },
  { q: 'men eve teasing my sister daily outside school',                   expect: 'BNS', note: '[Assault] eve teasing' },
  { q: 'my ex is stalking me on road and near home',                       expect: 'BNS', note: '[Assault] stalking' },
  { q: 'neighbour beat me with a stick on the street',                     expect: 'BNS', note: '[Assault] beat with stick' },
  { q: 'fracture caused by assault complaint against attacker',            expect: 'BNS', note: '[Assault] fracture' },
  { q: 'grievous hurt case neighbour threw stone broke leg',               expect: 'BNS', note: '[Assault] stone thrown' },
  { q: 'mujhe padosi ne mara aur meri naak toot gayi',                   expect: 'BNS', note: '[Assault] Hinglish' },
  { q: 'colleague attacked me in parking lot bodily injury',               expect: 'BNS', note: '[Assault] parking' },
  { q: 'physical assault by unknown persons on evening walk',              expect: 'BNS', note: '[Assault] unknown persons' },
  { q: 'mob lynching victim needs legal recourse',                         expect: 'BNS', note: '[Assault] mob lynching' },

  // ══════════════════════════════════════════════════════════════════
  // 19. BAIL / ANTICIPATORY BAIL (BNSS)
  // ══════════════════════════════════════════════════════════════════
  { q: 'i need anticipatory bail in a false cheating case filed against me', expect: ['Bail','BNSS'], note: '[Bail] anticipatory' },
  { q: 'my brother was arrested by police need to apply for bail',         expect: ['Bail','BNSS'], note: '[Bail] arrested brother' },
  { q: 'regular bail application after arrest in fraud case',              expect: ['Bail','BNSS'], note: '[Bail] regular bail' },
  { q: 'police custody remand extension challenged in court',              expect: ['Bail','BNSS'], note: '[Bail] remand' },
  { q: 'default bail after 60 days in jail without chargesheet',           expect: ['Bail','BNSS'], note: '[Bail] default bail' },
  { q: 'surety bond and bail conditions modification',                     expect: ['Bail','BNSS'], note: '[Bail] surety' },
  { q: 'anticipatory bail threatened with arrest false 498a case',        expect: ['Bail','BNSS'], note: '[Bail] 498A threat' },
  { q: 'mera beta jail mein hai bail chahiye',                            expect: ['Bail','BNSS'], note: '[Bail] Hinglish' },

  // ══════════════════════════════════════════════════════════════════
  // 20. TRANSFER OF PROPERTY / SALE DEED DISPUTE
  // ══════════════════════════════════════════════════════════════════
  { q: 'sale deed was registered fraudulently without my consent',         expect: 'Transfer of Property', note: '[PropTransfer] fraud' },
  { q: 'unregistered agreement to sell dispute with buyer',                expect: 'Transfer of Property', note: '[PropTransfer] unreg agreement' },
  { q: 'property transferred using fake power of attorney',                expect: 'Transfer of Property', note: '[PropTransfer] fake POA' },
  { q: 'dispute over gift deed executed by father before death',           expect: 'Transfer of Property', note: '[PropTransfer] gift deed' },
  { q: 'buyer not paying remaining sale consideration after taking possession', expect: 'Transfer of Property', note: '[PropTransfer] balance payment' },
  { q: 'i want to cancel a sale deed that was executed under coercion',    expect: 'Transfer of Property', note: '[PropTransfer] cancellation' },
  { q: 'property sold without my knowledge using my documents',            expect: 'Transfer of Property', note: '[PropTransfer] identity theft' },
  { q: 'title deed dispute who is real owner of property',                 expect: 'Transfer of Property', note: '[PropTransfer] title dispute' },

  // ══════════════════════════════════════════════════════════════════
  // 21. BOUNDARY DISPUTE / ENCROACHMENT
  // ══════════════════════════════════════════════════════════════════
  { q: 'neighbour built compound wall encroaching on my land',             expect: 'Boundary', note: '[Boundary] wall encroach' },
  { q: 'someone is encroaching on my agricultural land',                   expect: 'Boundary', note: '[Boundary] agri land' },
  { q: 'neighbour broke my boundary wall and extended his construction',   expect: 'Boundary', note: '[Boundary] broke wall' },
  { q: 'trespassing on my property needs to be stopped',                   expect: 'Boundary', note: '[Boundary] trespassing' },
  { q: 'illegal construction on my plot by neighbour',                     expect: 'Boundary', note: '[Boundary] illegal construction' },
  { q: 'padosi ne meri zameen par kabja kar liya',                        expect: 'Boundary', note: '[Boundary] Hinglish encroach' },
  { q: 'survey boundary dispute between neighbouring properties',          expect: 'Boundary', note: '[Boundary] survey' },
  { q: 'government land encroachment by private party nearby',             expect: 'Boundary', note: '[Boundary] govt land' },
  { q: 'neighbour is parking vehicles on my land without permission',      expect: 'Boundary', note: '[Boundary] parking encroach' },

  // ══════════════════════════════════════════════════════════════════
  // 22. RENT DISPUTE / TENANT EVICTION
  // ══════════════════════════════════════════════════════════════════
  { q: 'tenant is not paying rent since 6 months want to evict',           expect: 'Rent', note: '[Rent] no rent' },
  { q: 'tenant refusing to vacate after lease expired',                    expect: 'Rent', note: '[Rent] refusing vacate' },
  { q: 'landlord not returning security deposit after i moved out',        expect: 'Rent', note: '[Rent] deposit not returned' },
  { q: 'landlord harassing me to vacate flat before lease ends',           expect: 'Rent', note: '[Rent] early eviction harassment' },
  { q: 'landlord disconnected water and electricity to force me out',      expect: 'Rent', note: '[Rent] utilities cut' },
  { q: 'illegal eviction landlord locked my house while i was away',       expect: 'Rent', note: '[Rent] illegal lock out' },
  { q: 'rent agreement expired tenant became adverse possessor',           expect: 'Rent', note: '[Rent] adverse possession' },
  { q: 'makan malik deposit wapas nahi kar raha',                         expect: 'Rent', note: '[Rent] Hinglish deposit' },
  { q: 'tenant subletting without permission eviction needed',             expect: 'Rent', note: '[Rent] subletting' },
  { q: 'commercial tenant dispute lease renewal refused',                  expect: 'Rent', note: '[Rent] commercial' },
  { q: 'landlord increasing rent unlawfully beyond agreed terms',          expect: 'Rent', note: '[Rent] unlawful increase' },

  // ══════════════════════════════════════════════════════════════════
  // 23. RERA / BUILDER FRAUD
  // ══════════════════════════════════════════════════════════════════
  { q: 'builder not giving flat possession after 3 years of booking',      expect: 'RERA', note: '[RERA] possession delay' },
  { q: 'rera complaint against builder for construction delay',            expect: 'RERA', note: '[RERA] formal complaint' },
  { q: 'developer changed flat specifications without informing buyers',   expect: 'RERA', note: '[RERA] spec change' },
  { q: 'builder took money and project is stalled incomplete',             expect: 'RERA', note: '[RERA] stalled project' },
  { q: 'builder not registered under rera selling illegally',              expect: 'RERA', note: '[RERA] not registered' },
  { q: 'want refund from builder for flat not delivered on time',          expect: 'RERA', note: '[RERA] refund' },
  { q: 'builder fraud took crores apartment not even started',             expect: 'RERA', note: '[RERA] fraud not started' },
  { q: 'apartment quality very poor builder not fixing defects',           expect: 'RERA', note: '[RERA] defects' },
  { q: 'builder deducted penalty clause unfairly for cancellation',        expect: 'RERA', note: '[RERA] cancellation penalty' },

  // ══════════════════════════════════════════════════════════════════
  // 24. CONSUMER — PRODUCT DEFECT / SERVICE DEFICIENCY
  // ══════════════════════════════════════════════════════════════════
  { q: 'bought washing machine it stopped working within a month',         expect: 'Consumer', note: '[Consumer] washing machine' },
  { q: 'amazon delivered wrong product and refused to refund',             expect: 'Consumer', note: '[Consumer] ecommerce wrong product' },
  { q: 'new phone has manufacturing defect company refusing replacement',  expect: 'Consumer', note: '[Consumer] phone defect' },
  { q: 'air conditioner caught fire due to manufacturing defect',          expect: 'Consumer', note: '[Consumer] AC fire' },
  { q: 'service deficiency by courier company important documents lost',   expect: 'Consumer', note: '[Consumer] courier deficiency' },
  { q: 'telecom company charging for services not provided',               expect: 'Consumer', note: '[Consumer] telecom billing' },
  { q: 'hotel cheated me charged more than advertised price',              expect: 'Consumer', note: '[Consumer] hotel overcharge' },
  { q: 'consumer forum complaint online purchase fraud defective goods',   expect: 'Consumer', note: '[Consumer] consumer forum' },
  { q: 'unfair trade practice misleading advertisement product different', expect: 'Consumer', note: '[Consumer] misleading ad' },
  { q: 'refund denied by flipkart for product returned properly',          expect: 'Consumer', note: '[Consumer] ecommerce refund' },
  { q: 'gym membership cancelled but not refunding fees',                  expect: 'Consumer', note: '[Consumer] gym fees' },

  // ══════════════════════════════════════════════════════════════════
  // 25. MONEY RECOVERY / DEBT RECOVERY
  // ══════════════════════════════════════════════════════════════════
  { q: 'friend borrowed 5 lakhs and is not returning money',               expect: 'Money Recovery', note: '[MoneyRec] friend loan' },
  { q: 'business partner took money for investment not returning',         expect: 'Money Recovery', note: '[MoneyRec] partner money' },
  { q: 'i gave loan to relative on promissory note now refusing to pay',   expect: 'Money Recovery', note: '[MoneyRec] promissory note' },
  { q: 'money suit recovery of dues from defaulting debtor',               expect: 'Money Recovery', note: '[MoneyRec] formal suit' },
  { q: 'contractor took payment but work incomplete not returning money',  expect: 'Money Recovery', note: '[MoneyRec] contractor' },
  { q: 'paisa wapas nahi kar raha dost',                                  expect: 'Money Recovery', note: '[MoneyRec] Hinglish' },
  { q: 'recovery of money from dishonest business debtor',                 expect: 'Money Recovery', note: '[MoneyRec] dishonest debtor' },
  { q: 'rent arrears recovery from ex tenant',                             expect: ['Money Recovery','Rent'], note: '[MoneyRec] rent arrears' },

  // ══════════════════════════════════════════════════════════════════
  // 26. PARTITION SUIT
  // ══════════════════════════════════════════════════════════════════
  { q: 'i want to partition the joint family property and get my share',   expect: 'Partition', note: '[Partition] joint family' },
  { q: 'co-owner refusing to divide property need partition suit',         expect: 'Partition', note: '[Partition] co-owner' },
  { q: 'two brothers want to divide ancestral house and land',             expect: 'Partition', note: '[Partition] brothers' },
  { q: 'partition deed needed for inherited property among legal heirs',   expect: 'Partition', note: '[Partition] partition deed' },
  { q: 'share in jointly owned commercial property being denied',          expect: 'Partition', note: '[Partition] commercial' },
  { q: 'zameen ka batwara karna hai ghar mein',                           expect: 'Partition', note: '[Partition] Hinglish' },
  { q: 'co-heirs not agreeing for mutual partition need court order',      expect: 'Partition', note: '[Partition] co-heirs' },

  // ══════════════════════════════════════════════════════════════════
  // 27. MOTOR ACCIDENT CLAIMS
  // ══════════════════════════════════════════════════════════════════
  { q: 'a car hit me while crossing the road i am injured',                expect: 'Motor Accident', note: '[MACT] pedestrian hit' },
  { q: 'drunk driver crashed into my vehicle want compensation',           expect: 'Motor Accident', note: '[MACT] drunk driver' },
  { q: 'motor accident tribunal compensation claim for injury',            expect: 'Motor Accident', note: '[MACT] formal claim' },
  { q: 'my son died in a road accident want compensation from insurance',  expect: 'Motor Accident', note: '[MACT] death claim' },
  { q: 'bike accident victim claiming from third party insurance',         expect: 'Motor Accident', note: '[MACT] bike TP insurance' },
  { q: 'hit and run case driver fled after accident',                      expect: 'Motor Accident', note: '[MACT] hit and run' },
  { q: 'accident on highway truck rammed into my car injury and damage',   expect: 'Motor Accident', note: '[MACT] truck accident' },
  { q: 'mact claim permanent disability after road accident',              expect: 'Motor Accident', note: '[MACT] disability' },
  { q: 'road accident se meri permanent chot lag gayi muawaza chahiye',   expect: 'Motor Accident', note: '[MACT] Hinglish' },
  { q: 'school bus accident child injured seeking compensation',           expect: 'Motor Accident', note: '[MACT] school bus' },

  // ══════════════════════════════════════════════════════════════════
  // 28. CHEQUE BOUNCE
  // ══════════════════════════════════════════════════════════════════
  { q: 'cheque given to me bounced due to insufficient funds',             expect: 'Cheque', note: '[Cheque] insufficient funds' },
  { q: 'i received dishonoured cheque want to file case under 138',        expect: 'Cheque', note: '[Cheque] sec 138' },
  { q: 'cheque bounce complaint notice period demand letter',              expect: 'Cheque', note: '[Cheque] notice demand' },
  { q: 'business partner gave me 5 cheques all bounced',                   expect: 'Cheque', note: '[Cheque] multiple bounced' },
  { q: 'ni act section 138 case against cheque issuer',                    expect: 'Cheque', note: '[Cheque] NI act formal' },
  { q: 'cheque return memo from bank account closed',                      expect: 'Cheque', note: '[Cheque] account closed' },
  { q: 'cheque wapas aa gaya paisa nahi aaya mujhe',                      expect: 'Cheque', note: '[Cheque] Hinglish' },
  { q: 'post-dated cheque dishonoured want criminal action',               expect: 'Cheque', note: '[Cheque] post-dated' },

  // ══════════════════════════════════════════════════════════════════
  // 29. DOWRY / 498A
  // ══════════════════════════════════════════════════════════════════
  { q: 'in-laws demanding dowry and harassing my wife',                    expect: 'Dowry', note: '[Dowry] demanding' },
  { q: '498a case filed against husband and in-laws for dowry cruelty',   expect: 'Dowry', note: '[Dowry] 498a formal' },
  { q: 'dowry harassment bns section 85 complaint',                        expect: 'Dowry', note: '[Dowry] BNS 85' },
  { q: 'husband family demanding car and cash for marriage',               expect: 'Dowry', note: '[Dowry] demand car cash' },
  { q: 'false 498a case filed against me by wife want to fight it',        expect: 'Dowry', note: '[Dowry] false 498a' },
  { q: 'dahej ke liye tang kar rahe hain sasural wale',                   expect: 'Dowry', note: '[Dowry] Hinglish' },
  { q: 'in-laws cruelty and dowry prohibition act complaint',              expect: 'Dowry', note: '[Dowry] cruelty prohibition' },
  { q: 'husband and mother in law beating me for more dowry',              expect: 'Dowry', note: '[Dowry] beating for dowry' },

  // ══════════════════════════════════════════════════════════════════
  // 30. MUSLIM PERSONAL LAW
  // ══════════════════════════════════════════════════════════════════
  { q: 'husband gave triple talaq over whatsapp is it valid',              expect: 'Muslim', note: '[MPL] triple talaq WA' },
  { q: 'mehr amount not paid by husband after divorce',                    expect: 'Muslim', note: '[MPL] mehr not paid' },
  { q: 'want khul divorce from my husband in muslim law',                  expect: 'Muslim', note: '[MPL] khul' },
  { q: 'iddat period rights as divorced muslim woman',                     expect: 'Muslim', note: '[MPL] iddat' },
  { q: 'nikah was done now husband refusing maintenance nafaqa',           expect: 'Muslim', note: '[MPL] nafaqa maintenance' },
  { q: 'husband gave talaq over phone three times is it legal',            expect: 'Muslim', note: '[MPL] talaq over phone' },
  { q: 'mubarat mutual divorce under muslim personal law',                 expect: 'Muslim', note: '[MPL] mubarat' },
  { q: 'muslim woman maintenance rights after divorce quazi',              expect: 'Muslim', note: '[MPL] maintenance quazi' },

  // ══════════════════════════════════════════════════════════════════
  // 31. PIL / WRIT / FUNDAMENTAL RIGHTS
  // ══════════════════════════════════════════════════════════════════
  { q: 'government office is not giving me information i applied for',     expect: ['PIL','RTI','Writ'], note: '[PIL] RTI denial' },
  { q: 'i want to file rti to get government documents',                   expect: ['PIL','RTI','Writ'], note: '[PIL] RTI filing' },
  { q: 'file public interest litigation against government pollution',     expect: ['PIL','RTI','Writ'], note: '[PIL] pollution PIL' },
  { q: 'fundamental rights violated by state government action',           expect: ['PIL','RTI','Writ'], note: '[PIL] fundamental rights' },
  { q: 'article 226 writ petition high court for government inaction',     expect: ['PIL','RTI','Writ'], note: '[PIL] article 226' },
  { q: 'article 32 petition supreme court rights violation',               expect: ['PIL','RTI','Writ'], note: '[PIL] article 32' },
  { q: 'government denied information under rti act',                      expect: ['PIL','RTI','Writ'], note: '[PIL] RTI denied info' },
  { q: 'i want to file rti application to government office',              expect: ['PIL','RTI','Writ'], note: '[PIL] RTI application' },
  { q: 'government not providing information applied 3 months ago',        expect: ['PIL','RTI','Writ'], note: '[PIL] RTI 3 months' },
  { q: 'habeas corpus petition for illegally detained person',             expect: ['PIL','RTI','Writ'], note: '[PIL] habeas corpus' },
  { q: 'article 14 equality before law violation petition',                expect: ['PIL','RTI','Writ'], note: '[PIL] article 14' },
  { q: 'sarkari daftar ne information nahi di rti ka jawab nahi diya',   expect: ['PIL','RTI','Writ'], note: '[PIL] Hinglish RTI' },

  // ══════════════════════════════════════════════════════════════════
  // 32. POLICE EXCESS / HUMAN RIGHTS
  // ══════════════════════════════════════════════════════════════════
  { q: 'police beat me in custody without any charge',                     expect: 'Police', note: '[Police] custody beating' },
  { q: 'police not registering my fir for assault complaint',              expect: 'Police', note: '[Police] FIR not registered' },
  { q: 'wrongful arrest by police without warrant or reason',              expect: 'Police', note: '[Police] wrongful arrest' },
  { q: 'nhrc complaint for police brutality and human rights violation',   expect: 'Police', note: '[Police] NHRC' },
  { q: 'police torture in lockup no medical examination done',             expect: 'Police', note: '[Police] lockup torture' },
  { q: 'police refusing to take my complaint and threatening me',          expect: 'Police', note: '[Police] threat not complaining' },
  { q: 'false fir registered by police at enemy instigation',              expect: 'Police', note: '[Police] false FIR' },
  { q: 'illegal detention without arrest memo by police',                  expect: 'Police', note: '[Police] illegal detention' },
  { q: 'police ne bina wajah pakad liya aur maara',                      expect: 'Police', note: '[Police] Hinglish' },

  // ══════════════════════════════════════════════════════════════════
  // 33. CONTRACT BREACH / SPECIFIC PERFORMANCE
  // ══════════════════════════════════════════════════════════════════
  { q: 'other party breached our written contract want damages',           expect: 'Specific Performance', note: '[Contract] breach damages' },
  { q: 'specific performance suit for property purchase agreement',        expect: 'Specific Performance', note: '[Contract] specific perf property' },
  { q: 'oral agreement not honoured by other party',                       expect: 'Specific Performance', note: '[Contract] oral agreement' },
  { q: 'contract was not fulfilled supplier defaulted',                    expect: 'Specific Performance', note: '[Contract] supplier default' },
  { q: 'liquidated damages clause invoked for contract breach',            expect: 'Specific Performance', note: '[Contract] liquidated damages' },
  { q: 'force majeure clause invoked unfairly in contract',                expect: 'Specific Performance', note: '[Contract] force majeure' },
  { q: 'sale agreement for house party refusing to complete transaction',  expect: 'Specific Performance', note: '[Contract] sale agreement' },

  // ══════════════════════════════════════════════════════════════════
  // 34. MEDICAL NEGLIGENCE
  // ══════════════════════════════════════════════════════════════════
  { q: 'doctor operated on wrong site negligence claim',                   expect: 'Medical Negligence', note: '[MedNeg] wrong site surgery' },
  { q: 'hospital gave wrong medicine patient died',                        expect: 'Medical Negligence', note: '[MedNeg] wrong medicine death' },
  { q: 'missed diagnosis led to serious harm medical negligence',          expect: 'Medical Negligence', note: '[MedNeg] missed diagnosis' },
  { q: 'botched surgery left instruments inside patient',                  expect: 'Medical Negligence', note: '[MedNeg] instruments inside' },
  { q: 'hospital overcharged and did unnecessary procedures',              expect: 'Medical Negligence', note: '[MedNeg] overcharge unnecessary' },
  { q: 'doctor negligence during delivery baby suffered brain damage',     expect: 'Medical Negligence', note: '[MedNeg] delivery negligence' },
  { q: 'anaesthesia error during surgery caused permanent damage',         expect: 'Medical Negligence', note: '[MedNeg] anaesthesia' },
  { q: 'hospital refused emergency treatment patient died',                expect: 'Medical Negligence', note: '[MedNeg] refused treatment' },
  { q: 'doctor ne galat injection diya patient ki tabiyat bigdi',         expect: 'Medical Negligence', note: '[MedNeg] Hinglish' },

  // ══════════════════════════════════════════════════════════════════
  // 35. INSURANCE CLAIM DISPUTE
  // ══════════════════════════════════════════════════════════════════
  { q: 'health insurance company rejected my claim without reason',        expect: 'Insurance', note: '[Insur] health claim rejected' },
  { q: 'life insurance claim denied after policyholder death',             expect: 'Insurance', note: '[Insur] life claim denied' },
  { q: 'motor vehicle insurance not paying accident claim',                expect: 'Insurance', note: '[Insur] motor claim' },
  { q: 'mediclaim company says pre-existing condition clause',             expect: 'Insurance', note: '[Insur] pre-existing' },
  { q: 'fire insurance claim for factory undervalued by surveyor',         expect: 'Insurance', note: '[Insur] fire undervalued' },
  { q: 'insurance ombudsman complaint for claim rejection',                expect: 'Insurance', note: '[Insur] ombudsman' },
  { q: 'travel insurance claim for cancelled trip being denied',           expect: 'Insurance', note: '[Insur] travel claim' },
  { q: 'bima claim nahi de rahi company bahane bana rahi hai',            expect: 'Insurance', note: '[Insur] Hinglish' },

  // ══════════════════════════════════════════════════════════════════
  // 36. NRI ISSUES
  // ══════════════════════════════════════════════════════════════════
  { q: 'nri relatives grabbed my property while i was abroad',             expect: 'NRI', note: '[NRI] property grabbed' },
  { q: 'i am an nri want divorce from indian spouse',                      expect: 'NRI', note: '[NRI] divorce abroad' },
  { q: 'nri property dispute relatives sold my land without consent',      expect: 'NRI', note: '[NRI] land sold without consent' },
  { q: 'overseas citizen of india rights regarding property dispute',      expect: 'NRI', note: '[NRI] OCI rights' },
  { q: 'nri inheritance dispute property in india',                        expect: 'NRI', note: '[NRI] inheritance' },
  { q: 'nri husband has abandoned wife in india want maintenance',         expect: 'NRI', note: '[NRI] abandoned wife' },
  { q: 'power of attorney misused by family in india i am abroad',         expect: 'NRI', note: '[NRI] POA misused' },

  // ══════════════════════════════════════════════════════════════════
  // 37. INTELLECTUAL PROPERTY — TRADEMARK / COPYRIGHT / PATENT
  // ══════════════════════════════════════════════════════════════════
  { q: 'competitor copied my logo and brand name',                         expect: 'Trademark', note: '[IP] logo brand copy' },
  { q: 'my competition copied my logo and use my tag line',                expect: 'Trademark', note: '[IP] logo tagline' },
  { q: 'trademark infringement against company using my registered mark',  expect: 'Trademark', note: '[IP] trademark formal' },
  { q: 'someone pirated my software and selling it online',                expect: 'Trademark', note: '[IP] software piracy' },
  { q: 'copyright infringement my book content copied by another author',  expect: 'Trademark', note: '[IP] book copyright' },
  { q: 'patent infringement someone manufacturing my patented product',    expect: 'Trademark', note: '[IP] patent infringement' },
  { q: 'my company logo is being used by a competitor in same market',     expect: 'Trademark', note: '[IP] logo market competitor' },
  { q: 'counterfeit products being sold using my brand name',              expect: 'Trademark', note: '[IP] counterfeit' },
  { q: 'website scraped all my original content and republished',          expect: 'Trademark', note: '[IP] content scraped' },
  { q: 'someone is using my tagline in their advertising',                 expect: 'Trademark', note: '[IP] tagline in ads' },
  { q: 'competitor is selling my design as their own product',             expect: 'Trademark', note: '[IP] design stolen' },
  { q: 'mera logo copy kar liya competitor ne',                           expect: 'Trademark', note: '[IP] Hinglish' },

  // ══════════════════════════════════════════════════════════════════
  // 38. TAX — GST / INCOME TAX
  // ══════════════════════════════════════════════════════════════════
  { q: 'received income tax notice for assessment dispute want to appeal', expect: 'Tax', note: '[Tax] IT notice appeal' },
  { q: 'gst demand notice for alleged tax evasion',                        expect: 'Tax', note: '[Tax] GST demand' },
  { q: 'tds not refunded despite excess deduction from salary',            expect: 'Tax', note: '[Tax] TDS refund' },
  { q: 'income tax department attached my property want to challenge',     expect: 'Tax', note: '[Tax] IT attachment' },
  { q: 'gst registration cancellation appeal by tax authority',            expect: 'Tax', note: '[Tax] GST registration' },
  { q: 'tax demand order under income tax act 143 scrutiny',               expect: 'Tax', note: '[Tax] 143 scrutiny' },
  { q: 'gst notice for input tax credit reversal dispute',                 expect: 'Tax', note: '[Tax] ITC reversal' },
  { q: 'income tax search and seizure operations at my business premises', expect: 'Tax', note: '[Tax] search seizure' },

  // ══════════════════════════════════════════════════════════════════
  // 39. POCSO / CHILD PROTECTION
  // ══════════════════════════════════════════════════════════════════
  { q: 'my child was sexually abused by a neighbour',                      expect: 'POCSO', note: '[POCSO] child abuse neighbour' },
  { q: 'pocso complaint against school teacher who molested child',        expect: 'POCSO', note: '[POCSO] teacher' },
  { q: 'minor girl raped by relative need to file complaint',              expect: 'POCSO', note: '[POCSO] rape by relative' },
  { q: 'online grooming of minor child by predator',                       expect: 'POCSO', note: '[POCSO] online grooming' },
  { q: 'child sexual abuse images found on persons phone',                 expect: 'POCSO', note: '[POCSO] CSAM' },
  { q: 'mera bachcha school mein galat harkat ka shikar hua',             expect: 'POCSO', note: '[POCSO] Hinglish school' },
  { q: 'child molestation by family member complaint procedure',           expect: 'POCSO', note: '[POCSO] family member' },

  // ══════════════════════════════════════════════════════════════════
  // 40. GOVERNMENT SERVICE / CAT / SERVICE LAW
  // ══════════════════════════════════════════════════════════════════
  { q: 'government employee wrongful termination central administrative tribunal', expect: 'Government Service', note: '[CAT] wrongful term' },
  { q: 'promotion denied unfairly to government servant want cat petition', expect: 'Government Service', note: '[CAT] promotion denied' },
  { q: 'departmental inquiry against me without proper procedure',         expect: 'Government Service', note: '[CAT] dept inquiry' },
  { q: 'service matter pension dispute retired government employee',       expect: 'Government Service', note: '[CAT] pension dispute' },
  { q: 'cat tribunal petition for wrongful transfer order',                expect: 'Government Service', note: '[CAT] transfer order' },
  { q: 'state civil service employee discrimination in posting',           expect: 'Government Service', note: '[CAT] state civil service' },
  { q: 'central government employee seniority dispute',                    expect: 'Government Service', note: '[CAT] seniority' },

  // ══════════════════════════════════════════════════════════════════
  // 41. HOUSING SOCIETY / APARTMENT ASSOCIATION
  // ══════════════════════════════════════════════════════════════════
  { q: 'housing society refusing to give noc for flat sale',               expect: 'Housing Society', note: '[Society] NOC refused' },
  { q: 'apartment association charging excessive maintenance',              expect: 'Housing Society', note: '[Society] excessive maintenance' },
  { q: 'society committee acting illegally and misusing funds',            expect: 'Housing Society', note: '[Society] committee misuse' },
  { q: 'resident welfare association dispute over parking allocation',     expect: 'Housing Society', note: '[Society] parking' },
  { q: 'cooperative housing society share certificate not issued',         expect: 'Housing Society', note: '[Society] share certificate' },
  { q: 'society elections rigged want legal action',                       expect: 'Housing Society', note: '[Society] elections' },
  { q: 'society not providing accounts to flat owners demand',             expect: 'Housing Society', note: '[Society] accounts transparency' },

  // ══════════════════════════════════════════════════════════════════
  // 42. SARFAESI / BANKING RECOVERY / DRT
  // ══════════════════════════════════════════════════════════════════
  { q: 'bank issued sarfaesi notice for loan default want to challenge',   expect: 'SARFAESI', note: '[SARFAESI] notice challenge' },
  { q: 'drt case filed by bank for recovery of npa loan',                  expect: 'SARFAESI', note: '[SARFAESI] DRT case' },
  { q: 'bank auctioning my mortgaged property under sarfaesi',             expect: 'SARFAESI', note: '[SARFAESI] auction' },
  { q: 'bank took possession of my property for loan default',             expect: 'SARFAESI', note: '[SARFAESI] possession taken' },
  { q: 'non performing asset classification dispute with bank',            expect: 'SARFAESI', note: '[SARFAESI] NPA classification' },
  { q: 'challenge sarfaesi action in debt recovery tribunal',              expect: 'SARFAESI', note: '[SARFAESI] DRT challenge' },

  // ══════════════════════════════════════════════════════════════════
  // 43. EDUCATION — RTE / UNIVERSITY / DISABILITY
  // ══════════════════════════════════════════════════════════════════
  { q: 'private school refused rte quota admission to my child',           expect: 'Education', note: '[Edu] RTE refused' },
  { q: 'school charging capitation fee illegally for admission',           expect: 'Education', note: '[Edu] capitation fee' },
  { q: 'university not giving marksheet degree after course completion',   expect: 'Education', note: '[Edu] marksheet withheld' },
  { q: 'disability rights denied by school for special needs child',       expect: 'Education', note: '[Edu] disability rights' },
  { q: 'excessive school fees hike parents protesting',                    expect: 'Education', note: '[Edu] fee hike' },
  { q: 'college refused admission despite qualifying exam',                expect: 'Education', note: '[Edu] admission refused' },
  { q: 'university conducting unfair exam cancellation',                   expect: 'Education', note: '[Edu] exam cancelled' },
  { q: 'right to education 25 percent free seats private school',         expect: 'Education', note: '[Edu] RTE 25 percent' },

  // ══════════════════════════════════════════════════════════════════
  // 44. MSME — DELAYED PAYMENT
  // ══════════════════════════════════════════════════════════════════
  { q: 'large company not paying my msme invoice for 6 months',            expect: 'MSME', note: '[MSME] delayed payment' },
  { q: 'msme samadhan portal complaint for delayed payment',               expect: 'MSME', note: '[MSME] samadhan' },
  { q: 'buyer exceeding 45 days payment to msme supplier',                 expect: 'MSME', note: '[MSME] 45 days' },
  { q: 'msmed act facilitation council complaint',                         expect: 'MSME', note: '[MSME] facilitation council' },
  { q: 'partnership dues not paid by other partner in business',           expect: 'MSME', note: '[MSME] partnership dues' },
  { q: 'micro enterprise payment pending from government department',      expect: 'MSME', note: '[MSME] govt dept' },

  // ══════════════════════════════════════════════════════════════════
  // 45. SENIOR CITIZENS
  // ══════════════════════════════════════════════════════════════════
  { q: 'my son took my property and now refuses to take care of me',       expect: 'Senior Citizen', note: '[Senior] property taken' },
  { q: 'i am 70 years old children not paying maintenance',                expect: 'Senior Citizen', note: '[Senior] maintenance 70yo' },
  { q: 'elderly parent evicted by children from own home',                 expect: 'Senior Citizen', note: '[Senior] eviction' },
  { q: 'maintenance tribunal for neglected senior citizen',                expect: 'Senior Citizen', note: '[Senior] tribunal' },
  { q: 'old age neglect by adult children want legal remedy',              expect: 'Senior Citizen', note: '[Senior] neglect' },
  { q: 'mere bete ne ghar se nikal diya meri umar 75 saal hai',          expect: 'Senior Citizen', note: '[Senior] Hinglish' },
  { q: 'widowed mother not being maintained by sons legal remedy',         expect: 'Senior Citizen', note: '[Senior] widowed mother' },

  // ══════════════════════════════════════════════════════════════════
  // 46. ENVIRONMENT / NGT
  // ══════════════════════════════════════════════════════════════════
  { q: 'factory near my house releasing toxic smoke causing illness',      expect: 'Environment', note: '[NGT] toxic smoke factory' },
  { q: 'ngt petition against industrial pollution in river',               expect: 'Environment', note: '[NGT] river pollution' },
  { q: 'illegal quarry causing cracks in houses environmental violation',  expect: 'Environment', note: '[NGT] quarry' },
  { q: 'national green tribunal complaint for water pollution',            expect: 'Environment', note: '[NGT] water pollution' },
  { q: 'chemical plant effluents polluting groundwater want action',       expect: 'Environment', note: '[NGT] groundwater' },
  { q: 'noise pollution from nearby factory exceeding limits',             expect: 'Environment', note: '[NGT] noise pollution' },
  { q: 'illegal tree cutting environmental violation by builder',          expect: 'Environment', note: '[NGT] tree cutting' },

  // ══════════════════════════════════════════════════════════════════
  // 47. MUNICIPAL / BUILDING REGULATIONS
  // ══════════════════════════════════════════════════════════════════
  { q: 'municipality issued demolition notice for my building',            expect: 'Municipal', note: '[Municipal] demolition notice' },
  { q: 'bmc refusing to give building permission for legal construction',  expect: 'Municipal', note: '[Municipal] permission refused' },
  { q: 'municipality demolished my legal house without prior notice',      expect: 'Municipal', note: '[Municipal] demo without notice' },
  { q: 'panchayat is allowing illegal road encroachment by neighbour',     expect: 'Municipal', note: '[Municipal] panchayat' },
  { q: 'local body not issuing trade license without bribe',               expect: 'Municipal', note: '[Municipal] trade license' },
  { q: 'nagarpalika ne mera makaan giraya bina notice ke',                expect: 'Municipal', note: '[Municipal] Hinglish' },
  { q: 'building plan approval delayed despite complete application',      expect: 'Municipal', note: '[Municipal] plan approval delay' },

  // ══════════════════════════════════════════════════════════════════
  // 48. INSOLVENCY / IBC / NCLT
  // ══════════════════════════════════════════════════════════════════
  { q: 'company cannot pay creditors want to file insolvency under ibc',   expect: 'IBC', note: '[IBC] file insolvency' },
  { q: 'operational creditor filing insolvency petition under ibc',        expect: 'IBC', note: '[IBC] operational creditor' },
  { q: 'cirp resolution plan submitted to nclt for approval',              expect: 'IBC', note: '[IBC] CIRP resolution' },
  { q: 'financial creditor company owes me crores not paying nclt',        expect: 'IBC', note: '[IBC] financial creditor' },
  { q: 'liquidation proceedings against company under ibc',                expect: 'IBC', note: '[IBC] liquidation' },
  { q: 'personal insolvency proceedings against individual debtor',        expect: 'IBC', note: '[IBC] personal insolvency' },
  { q: 'personal guarantor bank filed insolvency against me',              expect: 'IBC', note: '[IBC] personal guarantor' },

  // ══════════════════════════════════════════════════════════════════
  // 49. CORRUPTION / BRIBERY
  // ══════════════════════════════════════════════════════════════════
  { q: 'government official demanding bribe to issue certificate',         expect: 'Corruption', note: '[Corrupt] certificate bribe' },
  { q: 'patwari demanding money to update land records',                   expect: 'Corruption', note: '[Corrupt] patwari bribe' },
  { q: 'prevention of corruption act complaint against public servant',    expect: 'Corruption', note: '[Corrupt] PCA formal' },
  { q: 'police officer demanding hafta from my shop',                      expect: 'Corruption', note: '[Corrupt] hafta police' },
  { q: 'government tender rigged through bribery and corruption',          expect: 'Corruption', note: '[Corrupt] tender rigging' },
  { q: 'anti-corruption bureau complaint for bribe demand',                expect: 'Corruption', note: '[Corrupt] ACB complaint' },
  { q: 'sarkari babu paisa maang raha hai kaam ke liye',                  expect: 'Corruption', note: '[Corrupt] Hinglish' },
  { q: 'cbi anti-corruption trap for bribe taking official',               expect: 'Corruption', note: '[Corrupt] CBI trap' },

  // ══════════════════════════════════════════════════════════════════
  // 50. DIGITAL PRIVACY / DPDP
  // ══════════════════════════════════════════════════════════════════
  { q: 'app is sharing my personal data with third parties without consent', expect: 'Digital Privacy', note: '[DPDP] app sharing data' },
  { q: 'my aadhaar data was misused to take a loan fraudulently',          expect: 'Digital Privacy', note: '[DPDP] aadhaar misuse loan' },
  { q: 'employer monitoring my personal device invading privacy',          expect: 'Digital Privacy', note: '[DPDP] employer monitoring' },
  { q: 'dpdp act complaint for personal data breach by company',           expect: 'Digital Privacy', note: '[DPDP] formal complaint' },
  { q: 'my personal data including bank details found on dark web',        expect: 'Digital Privacy', note: '[DPDP] dark web data' },
  { q: 'company collecting location data without my knowledge or consent', expect: 'Digital Privacy', note: '[DPDP] location data' },
  { q: 'data fiduciary not honouring my data erasure request',             expect: 'Digital Privacy', note: '[DPDP] erasure request' },

  // ══════════════════════════════════════════════════════════════════
  // 51. SPECIAL MARRIAGE ACT / INTER-RELIGION / COURT MARRIAGE
  // ══════════════════════════════════════════════════════════════════
  { q: 'we are from different religions want court marriage registration',  expect: 'Special Marriage', note: '[SMA] court marriage' },
  { q: 'special marriage act notice filed but families opposing',          expect: 'Special Marriage', note: '[SMA] families opposing' },
  { q: 'inter-faith marriage how to register it legally in india',         expect: 'Special Marriage', note: '[SMA] inter-faith' },
  { q: 'inter-caste marriage family threatening us want legal protection',  expect: 'Special Marriage', note: '[SMA] inter-caste protection' },
  { q: 'hum dono alag dharm ke hain court marriage karni hai',            expect: 'Special Marriage', note: '[SMA] Hinglish' },
  { q: 'marriage registration under special marriage act process',         expect: 'Special Marriage', note: '[SMA] registration process' },

  // ══════════════════════════════════════════════════════════════════
  // 52. ARBITRATION / ADR
  // ══════════════════════════════════════════════════════════════════
  { q: 'contract has arbitration clause want to invoke against breach',    expect: 'Arbitration', note: '[Arb] invoke clause' },
  { q: 'challenge arbitration award passed against me in court',           expect: 'Arbitration', note: '[Arb] challenge award' },
  { q: 'enforce arbitration award as court decree other party not complying', expect: 'Arbitration', note: '[Arb] enforcement' },
  { q: 'arbitration proceedings initiated seeking appointment of arbitrator', expect: 'Arbitration', note: '[Arb] appointment' },
  { q: 'mediation settlement agreement enforcement dispute',               expect: 'Arbitration', note: '[Arb] mediation' },
  { q: 'section 11 arbitration act appointment of arbitrator petition',    expect: 'Arbitration', note: '[Arb] sec 11' },

  // ══════════════════════════════════════════════════════════════════
  // 53. LAND ACQUISITION / GOVERNMENT ACQUISITION
  // ══════════════════════════════════════════════════════════════════
  { q: 'government acquiring my land for road project compensation dispute', expect: 'Land Acquisition', note: '[LandAcq] road project' },
  { q: 'compensation offered for land acquisition is too low challenging',  expect: 'Land Acquisition', note: '[LandAcq] low compensation' },
  { q: 'sarkar ne meri zameen le li highway ke liye muawaza kam diya',   expect: 'Land Acquisition', note: '[LandAcq] Hinglish' },
  { q: 'rfctlarr act acquisition notice objection filing',                 expect: 'Land Acquisition', note: '[LandAcq] RFCTLARR' },
  { q: 'land acquired years ago enhanced compensation claim',              expect: 'Land Acquisition', note: '[LandAcq] enhanced comp' },
  { q: 'acquisition for public purpose challenging urgency clause',        expect: 'Land Acquisition', note: '[LandAcq] urgency challenge' },

  // ══════════════════════════════════════════════════════════════════
  // 54. AGRICULTURE / CROP INSURANCE
  // ══════════════════════════════════════════════════════════════════
  { q: 'flood destroyed my crop insurance company refusing to pay',        expect: 'Agriculture', note: '[Agri] flood crop insurance' },
  { q: 'pmfby crop insurance claim partially rejected unfairly',           expect: 'Agriculture', note: '[Agri] PMFBY rejection' },
  { q: 'moneylender threatening to take my agricultural land mortgaged',   expect: 'Agriculture', note: '[Agri] moneylender land' },
  { q: 'agricultural land tenancy dispute with landlord',                  expect: 'Agriculture', note: '[Agri] tenancy dispute' },
  { q: 'pradhan mantri fasal bima yojana claim not settled',               expect: 'Agriculture', note: '[Agri] PMFBY full name' },
  { q: 'kisan meri fasal bima company nahi de rahi',                      expect: 'Agriculture', note: '[Agri] Hinglish' },

  // ══════════════════════════════════════════════════════════════════
  // 55. SC/ST ATROCITIES
  // ══════════════════════════════════════════════════════════════════
  { q: 'i was humiliated by supervisor on basis of my caste sc st',        expect: 'SC/ST', note: '[SCST] workplace humiliation' },
  { q: 'atrocity act complaint for caste based discrimination',            expect: 'SC/ST', note: '[SCST] atrocity act' },
  { q: 'police harassing our scheduled caste community without reason',    expect: 'SC/ST', note: '[SCST] police harassment' },
  { q: 'university professor discriminating against dalit student',        expect: 'SC/ST', note: '[SCST] dalit student' },
  { q: 'caste discrimination untouchability practiced in village',         expect: 'SC/ST', note: '[SCST] untouchability' },
  { q: 'poa act prevention of atrocities against scheduled tribe',         expect: 'SC/ST', note: '[SCST] POA formal' },
  { q: 'land grabbed from tribals by higher caste landlord',               expect: 'SC/ST', note: '[SCST] tribal land grabbed' },
  { q: 'mujhe jati ke naam se gaali di aur mara padosi ne',               expect: 'SC/ST', note: '[SCST] Hinglish caste abuse' },

  // ══════════════════════════════════════════════════════════════════
  // 56. EMPLOYMENT POSH / WORKPLACE SEXUAL HARASSMENT (detailed)
  // ══════════════════════════════════════════════════════════════════
  { q: 'fired after i complained about sexual harassment at office',       expect: 'POSH', note: '[POSH2] fired after complaint' },
  { q: 'local complaints committee complaint for unorganized sector posh', expect: 'POSH', note: '[POSH2] LCC unorganized' },
  { q: 'posh act internal committee not constituted by employer',          expect: 'POSH', note: '[POSH2] ICC not formed' },
  { q: 'third party customer sexually harassing employee',                 expect: 'POSH', note: '[POSH2] third party customer' },
  { q: 'sexual harassment during official tour by senior colleague',       expect: 'POSH', note: '[POSH2] official tour' },

  // ══════════════════════════════════════════════════════════════════
  // 57. MATERNITY BENEFITS
  // ══════════════════════════════════════════════════════════════════
  { q: 'company denied me maternity leave and threatened to terminate',    expect: 'Maternity', note: '[Mat] denied maternity leave' },
  { q: 'employer not paying maternity benefit during pregnancy leave',     expect: 'Maternity', note: '[Mat] benefit not paid' },
  { q: 'company fired me when i was 5 months pregnant',                   expect: ['Maternity','Termination'], note: '[Mat] fired pregnant' },
  { q: 'maternity benefit act 26 weeks not given only 12 weeks',          expect: 'Maternity', note: '[Mat] 26 weeks not given' },
  { q: 'no creche facility provided by employer maternity benefit violation', expect: 'Maternity', note: '[Mat] creche' },
  { q: 'pregnancy pe mujhe kaam se hata diya company ne',                 expect: 'Maternity', note: '[Mat] Hinglish' },

  // ══════════════════════════════════════════════════════════════════
  // 58. SUCCESSION / INHERITANCE / ESTATE
  // ══════════════════════════════════════════════════════════════════
  { q: 'four brothers want to divide fathers land through court equally',  expect: 'Succession', note: '[Succ] 4 brothers land' },
  { q: 'husband nominated mother for flat but wife is legal heir',         expect: 'Succession', note: '[Succ] nomination vs heir' },
  { q: 'legal heir certificate how to obtain for deceased estate',         expect: 'Succession', note: '[Succ] legal heir certificate' },
  { q: 'maa ki maut ke baad bhai sampatti nahi de raha',                 expect: 'Succession', note: '[Succ] Hinglish' },
  { q: 'ancestral jewellery and moveable assets distribution among heirs', expect: 'Succession', note: '[Succ] jewellery assets' },
  { q: 'succession certificate for recovering deceased person bank balance', expect: 'Succession', note: '[Succ] succession certificate' },

  // ══════════════════════════════════════════════════════════════════
  // 59. DEFAMATION
  // ══════════════════════════════════════════════════════════════════
  { q: 'someone posted false defamatory statements about me on facebook',  expect: 'Defamation', note: '[Defam] facebook' },
  { q: 'newspaper published false allegations about my business',          expect: 'Defamation', note: '[Defam] newspaper' },
  { q: 'neighbour is spreading false rumours about my character',          expect: 'Defamation', note: '[Defam] rumours' },
  { q: 'civil defamation suit for damages against newspaper',              expect: 'Defamation', note: '[Defam] civil suit' },
  { q: 'criminal defamation complaint under bns against someone',          expect: 'Defamation', note: '[Defam] criminal' },
  { q: 'company threatening defamation case against my honest review',     expect: 'Defamation', note: '[Defam] review threat' },
  { q: 'slander damage to professional reputation by colleague',           expect: 'Defamation', note: '[Defam] slander professional' },
  { q: 'meri izzat kharab ki usne jhooth bol kar',                       expect: 'Defamation', note: '[Defam] Hinglish' },

  // ══════════════════════════════════════════════════════════════════
  // 60. BAIL / HABEAS CORPUS (BNSS detailed)
  // ══════════════════════════════════════════════════════════════════
  { q: 'want to quash false fir filed against me high court',             expect: ['Bail','BNSS'], note: '[Bail2] quash FIR' },
  { q: 'arrested under ndps act for alleged drug possession need bail',   expect: ['Bail','BNSS'], note: '[Bail2] NDPS bail' },
  { q: 'relative taken by police no information about whereabouts',        expect: ['Bail','BNSS'], note: '[Bail2] whereabouts unknown' },
  { q: 'habeas corpus petition for unlawfully detained relative',          expect: ['PIL','BNSS','Bail'], note: '[Bail2] habeas corpus' },
  { q: 'in jail under false charges need urgent bail application',         expect: ['Bail','BNSS'], note: '[Bail2] urgent bail' },

  // ══════════════════════════════════════════════════════════════════
  // 61. CORPORATE — COMPANIES ACT / NCLT / SHAREHOLDERS
  // ══════════════════════════════════════════════════════════════════
  { q: 'minority shareholder being oppressed by majority directors',       expect: 'Corporate', note: '[Corp] oppression minority' },
  { q: 'director dispute over management of private limited company',      expect: 'Corporate', note: '[Corp] director dispute' },
  { q: 'company not sharing annual report with shareholders',              expect: 'Corporate', note: '[Corp] annual report' },
  { q: 'nclt petition for winding up defunct company',                     expect: 'Corporate', note: '[Corp] winding up' },
  { q: 'dividend not declared despite profits shareholder rights',         expect: 'Corporate', note: '[Corp] dividend' },
  { q: 'oppression and mismanagement petition nclt',                       expect: 'Corporate', note: '[Corp] O&M petition' },
  { q: 'shareholder agreement breach by co-founder',                       expect: 'Corporate', note: '[Corp] SHA breach' },

  // ══════════════════════════════════════════════════════════════════
  // 62. MENTAL HEALTHCARE ACT
  // ══════════════════════════════════════════════════════════════════
  { q: 'family wants to forcibly admit me to mental hospital against will', expect: 'Mental Healthcare', note: '[MH] forced admission' },
  { q: 'employer discriminating because of my depression diagnosis',       expect: 'Mental Healthcare', note: '[MH] employer discrimination' },
  { q: 'insurance company refusing mental health treatment coverage',      expect: 'Mental Healthcare', note: '[MH] insurance mental health' },
  { q: 'mental healthcare act rights of person with psychiatric condition', expect: 'Mental Healthcare', note: '[MH] rights formal' },
  { q: 'relatives got me admitted to mental hospital illegally',           expect: 'Mental Healthcare', note: '[MH] illegal admission' },

  // ══════════════════════════════════════════════════════════════════
  // 63. MTP / REPRODUCTIVE RIGHTS
  // ══════════════════════════════════════════════════════════════════
  { q: 'hospital refusing to perform legal abortion within 20 weeks',      expect: 'MTP', note: '[MTP] hospital refusing' },
  { q: 'want termination of pregnancy foetal abnormality 22 weeks',        expect: 'MTP', note: '[MTP] foetal abnormality' },
  { q: 'rape survivor wants abortion hospital refusing treatment',          expect: 'MTP', note: '[MTP] rape survivor' },
  { q: 'mtp act right to terminate pregnancy court permission needed',     expect: 'MTP', note: '[MTP] court permission' },
  { q: 'minor rape victim needs abortion parents seeking court order',     expect: 'MTP', note: '[MTP] minor victim' },

  // ══════════════════════════════════════════════════════════════════
  // 64. PMLA / MONEY LAUNDERING / ED
  // ══════════════════════════════════════════════════════════════════
  { q: 'enforcement directorate notice to me for money laundering',        expect: 'PMLA', note: '[PMLA] ED notice' },
  { q: 'ed attached my property claiming proceeds of crime under pmla',    expect: 'PMLA', note: '[PMLA] attachment' },
  { q: 'enforcement directorate froze my bank account pmla',               expect: 'PMLA', note: '[PMLA] account frozen' },
  { q: 'provisional attachment order challenged in pmla appellate tribunal', expect: 'PMLA', note: '[PMLA] appellate tribunal' },
  { q: 'ed summons under pmla how to respond',                             expect: 'PMLA', note: '[PMLA] summons response' },
  { q: 'money laundering investigation by financial intelligence unit',    expect: 'PMLA', note: '[PMLA] FIU investigation' },

  // ══════════════════════════════════════════════════════════════════
  // 65. FOOD SAFETY / FSSAI
  // ══════════════════════════════════════════════════════════════════
  { q: 'restaurant served food with cockroaches i got food poisoning',     expect: 'Food Safety', note: '[Food] cockroaches restaurant' },
  { q: 'packaged food contained foreign object plastic piece',             expect: 'Food Safety', note: '[Food] foreign object' },
  { q: 'supermarket sold me expired food that made me sick',               expect: 'Food Safety', note: '[Food] expired food' },
  { q: 'fssai complaint for adulterated spices in market',                 expect: 'Food Safety', note: '[Food] adulterated spices' },
  { q: 'food safety standards authority complaint restaurant hygiene',     expect: 'Food Safety', note: '[Food] FSSAI formal' },
  { q: 'milk adulterated with harmful chemicals sold in area',             expect: 'Food Safety', note: '[Food] milk adulteration' },

  // ══════════════════════════════════════════════════════════════════
  // 66. ELECTRICITY / UTILITY DISPUTE
  // ══════════════════════════════════════════════════════════════════
  { q: 'electricity board disconnected my supply without notice',          expect: 'Electricity', note: '[Elec] disconnection no notice' },
  { q: 'my electricity bill is 10 times higher than normal month',         expect: 'Electricity', note: '[Elec] bill 10x' },
  { q: 'power company refusing new connection to my house',                expect: 'Electricity', note: '[Elec] new connection refused' },
  { q: 'discom billing me for neighbours consumption wrong meter',         expect: 'Electricity', note: '[Elec] wrong meter billing' },
  { q: 'smart meter installed electricity bill increased massively',       expect: 'Electricity', note: '[Elec] smart meter high bill' },
  { q: 'electricity department changed my meter and billing went wrong',   expect: 'Electricity', note: '[Elec] meter changed' },
  { q: 'bijli ka bill bahut zyada aa raha hai galat lag raha hai',       expect: 'Electricity', note: '[Elec] Hinglish' },

  // ══════════════════════════════════════════════════════════════════
  // ABSENCE TESTS — these laws must NOT appear for these queries
  // ══════════════════════════════════════════════════════════════════
  { q: 'N: my neighbor hit me and broke my arm',                          expect: 'Domestic',           note: '[ABS] neighbour≠domestic violence' },
  { q: 'N: my phone was snatched on the road',                            expect: 'Cyber',              note: '[ABS] snatching≠cyber' },
  { q: 'N: my competition copied my logo and tagline',                    expect: 'Divorce',            note: '[ABS] IP≠divorce' },
  { q: 'N: my salary was not paid for 3 months',                         expect: 'RTI',                note: '[ABS] salary≠RTI' },
  { q: 'N: i want overtime pay from company',                             expect: 'RTI',                note: '[ABS] overtime≠RTI substring' },
  { q: 'N: builder not giving possession of flat',                        expect: 'Domestic',           note: '[ABS] RERA≠domestic' },
  { q: 'N: cheque bounced need to file case',                             expect: 'Divorce',            note: '[ABS] cheque≠divorce' },
  { q: 'N: neighbor built wall on my land',                               expect: 'Domestic',           note: '[ABS] boundary≠domestic' },
  { q: 'N: i want to file rti for government records',                    expect: 'Salary',             note: '[ABS] RTI≠salary' },
  { q: 'N: husband took my children without permission',                  expect: 'Boundary',           note: '[ABS] custody≠boundary' },
  { q: 'N: insurance company rejected my mediclaim',                      expect: 'Domestic',           note: '[ABS] insurance≠domestic' },
  { q: 'N: company data was hacked by employee',                          expect: 'Domestic',           note: '[ABS] hacking≠domestic' },
  { q: 'N: i want mutual consent divorce',                                expect: 'Criminal',           note: '[ABS] divorce≠criminal' },
  { q: 'N: mgnrega wages not paid to me',                                 expect: 'Cyber',              note: '[ABS] NREGA≠cyber' },
  { q: 'N: motor accident compensation claim',                            expect: 'Domestic',           note: '[ABS] MACT≠domestic' },
  { q: 'N: tenant not vacating my flat',                                  expect: 'Domestic',           note: '[ABS] rent≠domestic' },
  { q: 'N: gst notice from income tax department',                        expect: 'Domestic',           note: '[ABS] tax≠domestic' },
  { q: 'N: nri relatives grabbed my property abroad',                     expect: 'Cyber',              note: '[ABS] NRI property≠cyber' },
  { q: 'N: doctor operated on wrong site',                                expect: 'Domestic',           note: '[ABS] medical negligence≠domestic' },
  { q: 'N: my son took my property and ignores me i am old',              expect: 'Domestic',           note: '[ABS] senior citizen≠domestic' },

  // ══════════════════════════════════════════════════════════════════
  // EDGE CASES — incomplete / ambiguous / multi-law
  // ══════════════════════════════════════════════════════════════════
  { q: 'landlord problem',                                                 expect: 'Rent',               note: '[Edge] minimal query rent' },
  { q: 'boss problem at work',                                             expect: ['Employment','POSH'], note: '[Edge] vague boss problem' },
  { q: 'property dispute with family',                                     expect: ['Hindu Succession','Partition','Will'], note: '[Edge] vague family property' },
  { q: 'cheated by someone',                                               expect: ['Fraud','BNS'],       note: '[Edge] vague cheated' },
  { q: 'harassment at home',                                               expect: 'Domestic',            note: '[Edge] vague harassment home' },
  { q: 'money problem with company',                                       expect: ['Salary','Consumer','Money Recovery'], note: '[Edge] vague money company' },
  { q: 'my husband left me',                                               expect: 'Divorce',             note: '[Edge] vague husband left' },
  { q: 'accident happened on road',                                        expect: 'Motor Accident',      note: '[Edge] vague road accident' },
  { q: 'company is cheating me',                                           expect: ['Fraud','Consumer'],   note: '[Edge] company cheating vague' },
  { q: 'naukri chali gayi',                                               expect: 'Termination',          note: '[Edge] Hinglish job gone' },
  { q: 'builder ne dhoka diya',                                           expect: ['RERA','Fraud'],        note: '[Edge] Hinglish builder fraud' },
  { q: 'mera pehchaan chura li online',                                   expect: ['Cyber','Digital Privacy'], note: '[Edge] Hinglish identity theft' },
  { q: 'my boss is being mean to me and not paying salary',               expect: 'Salary',               note: '[Edge] colloquial mean boss + salary' },
  { q: 'sister in law spreading rumours about me on social media',        expect: ['Defamation','Cyber'],  note: '[Edge] defamation cyber' },
  { q: 'company asked me to resign or they will fire me',                  expect: 'Termination',          note: '[Edge] forced resignation' },
  { q: 'my neighbour is noisy and playing loud music',                    expect: 'Municipal',             note: '[Edge] noise neighbour' },
  { q: 'i got sick after eating at restaurant',                           expect: 'Food Safety',           note: '[Edge] food poisoning minimal' },

  // ══════════════════════════════════════════════════════════════════
  // HINGLISH / COLLOQUIAL BATCH — all categories
  // ══════════════════════════════════════════════════════════════════
  { q: 'pati ne ghar se nikal diya aur maar bhi raha hai',               expect: 'Domestic',             note: '[Hindi] DV thrown out beaten' },
  { q: 'sasural walon ne dahej maanga aur maar peet ki',                 expect: 'Dowry',                note: '[Hindi] in-laws dowry beating' },
  { q: 'bachche ki custody chahiye talaq ke baad',                       expect: 'Custody',              note: '[Hindi] custody after divorce' },
  { q: 'company ne 3 mahine se salary nahi di',                          expect: 'Salary',               note: '[Hindi] salary 3 months' },
  { q: 'online paisa gaya OTP deke fraud ho gaya',                      expect: 'Cyber',                note: '[Hindi] OTP fraud' },
  { q: 'padosi ne meri zameen par kabja kiya hai',                      expect: 'Boundary',             note: '[Hindi] boundary encroach' },
  { q: 'makan malik deposit nahi lota raha hai',                        expect: 'Rent',                 note: '[Hindi] deposit not returned' },
  { q: 'builder ne flat nahi diya teen saal ho gaye',                   expect: 'RERA',                 note: '[Hindi] RERA 3 years' },
  { q: 'baap ki maut ke baad bhai zameen nahi de raha',                 expect: ['Hindu Succession','Partition'], note: '[Hindi] brothers inheritance' },
  { q: 'police ne bina wajah pakad ke maara',                           expect: 'Police',               note: '[Hindi] police beating' },
  { q: 'cheque bounce ho gaya paisa nahi mila',                         expect: 'Cheque',               note: '[Hindi] cheque bounce' },
  { q: 'naukri se nikala bina notice ke',                               expect: 'Termination',          note: '[Hindi] fired no notice' },
  { q: 'gst ka notice aaya kya karna chahiye',                          expect: 'Tax',                  note: '[Hindi] GST notice' },
  { q: 'dost ne paise nahi diye wapas',                                 expect: 'Money Recovery',       note: '[Hindi] friend money not returned' },
  { q: 'accident mein chot lagi muawaza chahiye',                       expect: 'Motor Accident',       note: '[Hindi] accident compensation' },
  { q: 'hospital ne galat ilaj kiya meri tabiyat aur kharab hui',      expect: 'Medical Negligence',   note: '[Hindi] wrong treatment' },
  { q: 'bima company claim nahi de rahi bahane bana rahi',              expect: 'Insurance',            note: '[Hindi] insurance claim' },
  { q: 'mera logo copy kar liya competitor ne market mein',             expect: 'Trademark',            note: '[Hindi] logo copied competitor' },
  { q: 'sarkari babu bribe maang raha hai license ke liye',             expect: 'Corruption',           note: '[Hindi] bribe license' },
  { q: 'bijli walon ne connection kata bina bataye',                    expect: 'Electricity',          note: '[Hindi] electricity disconnection' },
  { q: 'factory ka dhuan aata hai ghar mein tang aa gaye hain',        expect: 'Environment',          note: '[Hindi] factory smoke' },
  { q: 'kirana dukan ki registration nahi ki malik ne',                 expect: 'Shops',                note: '[Hindi] shop not registered' },
  { q: 'aadhaar se kisi ne loan le liya meri bina permission ke',      expect: 'Digital Privacy',      note: '[Hindi] aadhaar loan fraud' },
  { q: 'mujhe promotion nahi diya sarkari naukri mein unfair hai',     expect: 'Government Service',   note: '[Hindi] govt promotion denied' },
  { q: 'msme ka invoice 8 mahine se nahi bhar raha bada company',      expect: 'MSME',                 note: '[Hindi] MSME invoice' },
  { q: 'mere bete ne ghar se nikaala meri umar 68 saal hai',           expect: 'Senior Citizen',       note: '[Hindi] elderly evicted' },
  { q: 'talaq de diya teen baar whatsapp pe',                          expect: 'Muslim',               note: '[Hindi] triple talaq WA' },
  { q: 'rti daala tha answer nahi aaya 60 din ho gaye',               expect: ['PIL','RTI'],          note: '[Hindi] RTI 60 days no reply' },
  { q: 'bacche ko school ne rte mein seat nahi di',                    expect: 'Education',            note: '[Hindi] RTE seat denied' },
];

// ── Runner ────────────────────────────────────────────────────────────────────
async function runAll() {
  const tests = CAT_FILTER
    ? TESTS.filter(t => (t.note || '').toLowerCase().includes(CAT_FILTER))
    : TESTS;

  const mode = USE_API ? `LIVE API (${API_URL})` : 'LOCAL keyword engine';
  console.log(`\n╔══════════════════════════════════════════════════════╗`);
  console.log(`║  SatLegal Accuracy Benchmark — ${mode.padEnd(20)} ║`);
  console.log(`║  Tests: ${String(tests.length).padEnd(43)}║`);
  console.log(`╚══════════════════════════════════════════════════════╝\n`);

  let passed = 0, failed = 0;
  const failures = [];

  for (const test of tests) {
    const absence = test.q.startsWith('N: ');
    const query   = absence ? test.q.slice(3) : test.q;

    const top3 = USE_API ? await callAPI(query) : keywordScore(query);
    const expectList = Array.isArray(test.expect) ? test.expect : [test.expect];

    let ok;
    if (absence) {
      ok = !top3.some(c => expectList.some(e => c.includes(e)));
    } else {
      ok = top3.some(c => expectList.some(e => c.includes(e)));
    }

    if (ok) {
      passed++;
      if (!FAIL_ONLY) {
        console.log(`  ✅ ${(absence?'ABSENT ':'')+(test.note||'').padEnd(45)} → ${top3[0] || 'NONE'}`);
      }
    } else {
      failed++;
      const label = `  ❌ ${(absence?'ABSENT ':'')+(test.note||'').padEnd(45)} → got: ${top3[0]||'NONE'} | expected${absence?' NOT ':' '}${expectList.join('/')}`;
      console.log(label);
      failures.push({ note: test.note, query, expected: expectList, got: top3, absence });
    }
  }

  const total = passed + failed;
  const pct   = ((passed / total) * 100).toFixed(1);
  const grade = pct >= 95 ? '🟢 EXCELLENT' : pct >= 85 ? '🟡 GOOD' : pct >= 70 ? '🟠 NEEDS WORK' : '🔴 CRITICAL';

  console.log(`\n${'─'.repeat(65)}`);
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
  console.log(`${'─'.repeat(65)}\n`);
}

runAll().catch(console.error);
