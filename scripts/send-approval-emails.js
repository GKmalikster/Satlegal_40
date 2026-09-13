/**
 * SatLegal — One-time script: send welcome emails to already-approved lawyers
 *
 * Usage:
 *   MONGODB_URI=... RESEND_API_KEY=... node scripts/send-approval-emails.js          ← dry run (default)
 *   MONGODB_URI=... RESEND_API_KEY=... node scripts/send-approval-emails.js --send   ← actually send
 *
 * Set env vars in your terminal before running:
 *   export MONGODB_URI="mongodb+srv://..."
 *   export RESEND_API_KEY="re_..."
 */

'use strict';

const mongoose = require('mongoose');
const https    = require('https');

// ── Config ─────────────────────────────────────────────────────────────────────
const MONGODB_URI    = process.env.MONGODB_URI;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const DRY_RUN        = !process.argv.includes('--send');

// ── Validate env vars ──────────────────────────────────────────────────────────
if (!MONGODB_URI)    { console.error('❌  MONGODB_URI not set'); process.exit(1); }
if (!RESEND_API_KEY) { console.error('❌  RESEND_API_KEY not set'); process.exit(1); }

// ── Minimal LawyerProfile schema (only fields we need) ───────────────────────
const LawyerProfileSchema = new mongoose.Schema({
  fullName:         String,
  email:            String,
  practiceAreas:    [String],
  city:             String,
  state:            String,
  barCouncilId:     String,
  status:           String,
}, { collection: 'lawyerprofiles', timestamps: true });

// ── Build email HTML ──────────────────────────────────────────────────────────
function buildEmail(lawyer) {
  const firstName   = (lawyer.fullName || 'Lawyer').split(' ')[0];
  const practiceList = (lawyer.practiceAreas || []).slice(0, 3).join(', ') || 'your practice areas';
  const location    = [lawyer.city, lawyer.state].filter(Boolean).join(', ') || '—';

  return {
    from:    'SatLegal Support <support@satlegal.in>',
    to:      [lawyer.email],
    subject: '🎉 Congratulations! Your SatLegal lawyer profile is now live',
    html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1a1a1a">
      <div style="background:linear-gradient(135deg,#0d3d0d,#1a6b1a);padding:32px 28px;border-radius:10px 10px 0 0;text-align:center">
        <img src="https://satlegal.in/assets/logo.png" alt="SatLegal" style="height:48px;margin-bottom:12px" />
        <h1 style="color:#fff;font-size:22px;margin:0">Welcome to SatLegal, ${firstName}!</h1>
        <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px">Your lawyer profile has been verified and approved ✅</p>
      </div>
      <div style="background:#fff;padding:28px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 10px 10px">
        <p style="font-size:15px;line-height:1.6">Dear <strong>${firstName}</strong>,</p>
        <p style="font-size:14px;line-height:1.7;color:#374151">We are pleased to inform you that your SatLegal lawyer profile has been <strong style="color:#1a6b1a">approved and is now live</strong>. Clients seeking legal help in <em>${practiceList}</em> can now discover and connect with you through our platform.</p>

        <div style="background:#f0fbf0;border:1px solid #a8e8a4;border-radius:8px;padding:18px 20px;margin:20px 0">
          <p style="font-weight:700;color:#0d3d0d;margin:0 0 10px;font-size:14px">🚀 Your next steps:</p>
          <ol style="margin:0;padding-left:20px;font-size:14px;color:#374151;line-height:2">
            <li>Log in to your <a href="https://satlegal.in/lawyer/dashboard.html" style="color:#1a6b1a;font-weight:600">Lawyer Dashboard</a> to manage your profile</li>
            <li>Set your <strong>availability &amp; consultation slots</strong> so clients can book you</li>
            <li>Review incoming <strong>client leads</strong> matched to your specialisation</li>
            <li>Respond to leads promptly — faster responses earn higher placement</li>
          </ol>
        </div>

        <div style="background:#fff4e6;border:1px solid #ffcc99;border-radius:8px;padding:14px 18px;margin:16px 0;font-size:13px;color:#7a3800">
          <strong>📋 Your profile details on file:</strong><br/>
          Name: ${lawyer.fullName || '—'} &nbsp;|&nbsp; Location: ${location}<br/>
          Bar Council ID: ${lawyer.barCouncilId || 'On file'}
        </div>

        <p style="font-size:14px;color:#374151;line-height:1.7">If you have any questions or need help getting started, simply reply to this email or write to us at <a href="mailto:support@satlegal.in" style="color:#1a6b1a">support@satlegal.in</a>.</p>
        <p style="font-size:14px;color:#374151">We look forward to connecting you with clients who need your expertise.</p>

        <a href="https://satlegal.in/lawyer/dashboard.html" style="display:inline-block;margin-top:10px;background:#138808;color:#fff;border-radius:8px;padding:12px 24px;text-decoration:none;font-size:14px;font-weight:700">Go to My Dashboard →</a>

        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>
        <p style="font-size:12px;color:#9ca3af;margin:0">SatLegal · Legal information made accessible · <a href="https://satlegal.in" style="color:#9ca3af">satlegal.in</a><br/>This email was sent to ${lawyer.email} because your lawyer profile was approved on SatLegal.</p>
      </div>
    </div>`
  };
}

// ── Send via Resend (returns Promise<{ok, status, body}>) ─────────────────────
function sendEmail(payload) {
  return new Promise((resolve) => {
    const body = JSON.stringify(payload);
    const req  = https.request({
      hostname: 'api.resend.com',
      path:     '/emails',
      method:   'POST',
      headers:  {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type':  'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ ok: res.statusCode < 300, status: res.statusCode, body: data }));
    });
    req.on('error', e => resolve({ ok: false, status: 0, body: e.message }));
    req.write(body);
    req.end();
  });
}

// ── Sleep helper for rate-limiting ────────────────────────────────────────────
const sleep = ms => new Promise(r => setTimeout(r, ms));

// ── Main ──────────────────────────────────────────────────────────────────────
(async () => {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  SatLegal — Lawyer Approval Welcome Email Sender');
  console.log(`  Mode: ${DRY_RUN ? '🔍 DRY RUN (no emails sent)' : '🚀 LIVE SEND'}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Connect to MongoDB
  process.stdout.write('Connecting to MongoDB... ');
  await mongoose.connect(MONGODB_URI, { bufferCommands: false });
  console.log('✅');

  const LawyerProfile = mongoose.model('LawyerProfile', LawyerProfileSchema);

  // Fetch all approved lawyers
  const lawyers = await LawyerProfile.find({ status: 'approved' })
    .select('fullName email practiceAreas city state barCouncilId')
    .lean();

  if (!lawyers.length) {
    console.log('ℹ️  No approved lawyers found in the database.');
    await mongoose.disconnect();
    return;
  }

  console.log(`Found ${lawyers.length} approved lawyer(s):\n`);
  lawyers.forEach((l, i) => {
    console.log(`  ${i + 1}. ${l.fullName || '(no name)'} — ${l.email || '(no email)'}`);
    console.log(`     Practice: ${(l.practiceAreas || []).join(', ') || '—'}`);
    console.log(`     Location: ${[l.city, l.state].filter(Boolean).join(', ') || '—'}\n`);
  });

  const noEmail = lawyers.filter(l => !l.email);
  if (noEmail.length) {
    console.warn(`⚠️  ${noEmail.length} lawyer(s) have no email address and will be skipped.\n`);
  }

  const toSend = lawyers.filter(l => l.email);

  if (DRY_RUN) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`DRY RUN complete. ${toSend.length} email(s) ready to send.`);
    console.log('To send for real, run:');
    console.log('  MONGODB_URI=... RESEND_API_KEY=... node scripts/send-approval-emails.js --send\n');
    await mongoose.disconnect();
    return;
  }

  // ── Live send ──────────────────────────────────────────────────────────────
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Sending ${toSend.length} email(s)...\n`);

  let sent = 0, failed = 0;
  for (const lawyer of toSend) {
    process.stdout.write(`  → ${lawyer.fullName} (${lawyer.email})... `);
    const payload = buildEmail(lawyer);
    const result  = await sendEmail(payload);
    if (result.ok) {
      console.log('✅ sent');
      sent++;
    } else {
      console.log(`❌ FAILED (HTTP ${result.status}: ${result.body})`);
      failed++;
    }
    await sleep(300); // stay well within Resend rate limits
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Done. ✅ ${sent} sent  ❌ ${failed} failed`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  await mongoose.disconnect();
})();
