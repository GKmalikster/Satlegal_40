/**
 * SatLegal – AI Legal Chatbot Widget v1.0
 * Floating chat assistant powered by the SatLegal laws database
 * Provides instant legal guidance and handoff to the 5-step wizard
 */
(function() {
'use strict';

// ── Config ──────────────────────────────────────────────────────────────────
const BOT_NAME = 'SatLegal AI';
const BOT_AVATAR = '⚖️';
const TYPING_DELAY = 700; // ms

// ── Knowledge base – intent patterns ─────────────────────────────────────────
const INTENTS = [
  // Greetings
  { id:'greet', patterns: /^(hi|hello|hey|namaste|namaskar|helo|good morning|good afternoon|good evening|help me|i need help)/i,
    reply: () => `Namaste! 🙏 I'm the SatLegal AI assistant.\n\nI can help you understand **Indian laws**, find out which laws apply to your situation, and guide you through your legal rights – completely free.\n\n**What would you like help with today?**` },

  // Divorce
  { id:'divorce', patterns: /divorce|separation|talaq|matrimon|alimony|maintenance|spouse|husband.*left|wife.*left|mutually.*(divorce|separate)/i,
    reply: (msg) => `I can help with **matrimonial and family law** issues. Under Indian law:\n\n• **Contested Divorce** – Hindu Marriage Act Sec 13 (cruelty, adultery, desertion, etc.)\n• **Mutual Consent Divorce** – HMA Sec 13B (both agree, 1 year separation required)\n• **Maintenance / Alimony** – BNSS Sec 144 (formerly CrPC Sec 125)\n\n📋 You'll typically need your *marriage certificate*, *proof of cruelty or grounds*, and *proof of residence*.\n\nWould you like me to run a full analysis of your specific situation?` },

  // Custody
  { id:'custody', patterns: /child.*(custody|guardian|visit)|custody.*child|guardianship|minor.*child/i,
    reply: () => `**Child Custody** in India is governed by:\n\n• **Guardians & Wards Act, 1890** – applies to all religions\n• **Hindu Minority & Guardianship Act, 1956** – for Hindus\n\nCourts always decide custody based on the **welfare of the child** – not just the parents' wishes.\n\nKey factors: age of child (below 5 years often stays with mother), schooling, financial stability, parent's conduct.\n\n🔍 Want me to analyse your custody situation in detail?` },

  // Domestic violence
  { id:'dv', patterns: /domestic.violence|dv.act|abuse.*husband|abuse.*wife|beating|physical.*abuse|mental.*abuse|498a|cruelty.*marriage/i,
    reply: () => `**Domestic Violence** is addressed by:\n\n• **DV Act, 2005** – Protection orders, residence rights, monetary relief\n• **BNS 2023 Sec 85-86** (formerly IPC 498A) – Criminal cruelty by husband/family\n\n⚡ **You can get emergency protection:** Contact the Protection Officer in your district or call the Women Helpline **181**.\n\nDocuments needed: Medical records, photographs of injuries, WhatsApp messages, witnesses.\n\n❗ If you are in immediate danger, please call **112** (Emergency) or **181** (Women Helpline).` },

  // Property / land
  { id:'property', patterns: /property|land|inheritance|ancestral|succession|will|estate|rera|builder|flat|apartment|sale.deed|encroach|boundary/i,
    reply: () => `**Property & Succession laws** I can help with:\n\n• **Hindu Succession Act 1956** (amended 2005) – daughters have equal rights to ancestral property\n• **Transfer of Property Act, 1882** – sale deed disputes, encumbrances\n• **RERA 2016** – builder fraud, delayed possession\n• **Partition Act, 1893** – dividing joint family property\n• **Rent Control Acts** – tenant/landlord disputes\n\nWhich specific property issue are you facing?` },

  // Employment
  { id:'employment', patterns: /job|employ|salary|wages|fired|termination|pf|provident.fund|gratuity|maternity|posh|harassment.*work|sexual.harassment|notice.*period|retrench/i,
    reply: () => `**Employment law** issues I can help with:\n\n• **Wrongful Termination** – Industrial Disputes Act 1947\n• **Unpaid Salary / PF / Gratuity** – Payment of Wages Act, EPF Act, Gratuity Act\n• **Workplace Harassment (POSH)** – POSH Act 2013\n• **Notice Period disputes** – Employment contract + Labour Codes 2020\n\n💡 Key rule: After **5 years of service**, you are entitled to **gratuity** equal to 15 days' salary per year of service.\n\nWould you like a full analysis of your employment situation?` },

  // Cyber crime
  { id:'cyber', patterns: /cyber|online.fraud|upi.*fraud|internet.*fraud|hack|phishing|scam|stalking.*online|morphed|fake.*profile|data.theft|account.*hacked/i,
    reply: () => `**Cyber crimes** are covered by:\n\n• **IT Act 2000** (Sec 43, 66, 66C, 66D, 67) – hacking, identity theft, phishing\n• **BNS 2023** – online fraud, cheating, defamation\n\n🚨 **Immediate steps:**\n1. Report to **cyber.gov.in** (National Cybercrime Portal)\n2. Call **1930** (Cybercrime Helpline)\n3. File FIR at local police station\n4. Block/freeze bank accounts if financial fraud\n\nWould you like to know what documents to collect for a cyber crime case?` },

  // Criminal / FIR
  { id:'criminal', patterns: /fir|police.*complaint|criminal.*case|bns|assault|hurt|cheating|fraud.*criminal|bail|anticipatory.bail|arrested|arrest/i,
    reply: () => `**Criminal law** under the new **BNS & BNSS 2023** (which replaced the IPC and CrPC):\n\n• **Cheating / Fraud** – BNS Sec 316-318\n• **Assault / Hurt** – BNS Sec 115-118\n• **Bail Application** – BNSS Sec 480-483\n• **Anticipatory Bail** – BNSS Sec 484\n\n📋 To file an FIR, visit your local police station. If police refuse, you can file a **private complaint** before a Magistrate.\n\nNote: Under BNSS 2023, police must complete investigation within **60 days** for most offences.` },

  // Consumer
  { id:'consumer', patterns: /consumer|product.*defect|service.*deficiency|refund|cheated.*shop|defective.*product|consumer.*court|cdrc/i,
    reply: () => `**Consumer Protection Act, 2019** gives you strong rights:\n\n• File complaints at **District CDRC** (up to ₹1 crore claims)\n• No lawyer required for small claims\n• Can claim **product replacement, refund, and compensation**\n• 2-year limitation from cause of action\n\n🔑 You can now file online at **consumerhelpline.gov.in**\n\nKey documents: Purchase receipt, warranty card, complaint correspondence, photographs of defect.` },

  // Motor accident
  { id:'accident', patterns: /accident|mact|motor.*vehicle|car.*crash|road.*accident|hit.*run|injury.*road|death.*road|compensation.*accident/i,
    reply: () => `**Motor Accident Claims** under Motor Vehicles Act 1988 (Amended 2019):\n\n• File claim at **MACT (Motor Accident Claims Tribunal)** in the district\n• No fee for filing\n• Claim against **driver + vehicle owner + insurance company**\n• Compensation includes medical expenses, income loss, pain & suffering\n\n⏰ **File within 6 months** for best results (no strict limitation but early filing recommended).\n\nEven if you were partly at fault, you may still get partial compensation.` },

  // About SatLegal
  { id:'about', patterns: /what.*satlegal|about.*satlegal|who.*you|satlegal.*work|how.*work|what.*do|tell.*about/i,
    reply: () => `I'm the **SatLegal AI Assistant** 🇮🇳\n\nSatLegal is India's AI-powered legal analysis platform. We help you:\n\n✅ Understand which Indian laws apply to your situation\n✅ Get a **document checklist** before meeting a lawyer\n✅ See your preliminary **case readiness score**\n✅ Save ₹5,000–₹20,000 on initial consultations\n\n🔍 Our database covers **50+ Indian laws** including the new BNS & BNSS 2023.\n\nThe basic analysis is **100% free**. Want to start?` },

  // Lawyer / legal advice
  { id:'lawyer', patterns: /need.*lawyer|find.*lawyer|recommend.*lawyer|lawyer.*help|advocate|legal.*advice|consult/i,
    reply: () => `I can help you **prepare** before consulting a lawyer!\n\nHere's how SatLegal helps you get more from your legal consultation:\n\n1️⃣ **Run our free 5-step analysis** – know which laws apply\n2️⃣ **Get your document checklist** – arrive prepared\n3️⃣ **See your case readiness score** – negotiate from knowledge\n\n💡 Users who run a SatLegal analysis first typically save **₹10,000+** in initial consultation fees because they arrive prepared.\n\nWould you like me to start the analysis for you?` },

  // Analyze / start
  { id:'analyse', patterns: /analys|analyze|start|begin|check.*case|assess.*case|legal.*(help|analysis|check)|what.*(law|legal|right)/i,
    reply: () => `**Let's analyse your legal situation!** 🔍\n\nI can run a full 5-step analysis that will:\n• Identify applicable Indian laws\n• Ask targeted questions\n• Show your document checklist\n• Calculate case readiness score\n\nTo start, tell me: **What is your legal situation?** (describe it in a few sentences)\n\nOr click the button below to use the full interactive wizard:` ,
    showWizardBtn: true },

  // Thanks
  { id:'thanks', patterns: /thank|thanks|thank you|shukriya|dhanyavad|helpful|great/i,
    reply: () => `You're welcome! 🙏\n\nRemember: SatLegal gives you **legal information to help you understand your rights**. For formal legal advice and representation, please consult a qualified advocate.\n\nIs there anything else I can help you with today?` },

  // BNS / new laws
  { id:'bns', patterns: /bns|bnss|ipc|crpc|new.*(law|code)|bharatiya|nyaya.sanhita|nagarik/i,
    reply: () => `**India's New Laws (2023):**\n\n📖 **BNS 2023** (Bharatiya Nyaya Sanhita) **replaces the IPC**\n• New section numbers for all criminal offences\n• New offence of organised crime, terrorism\n• Stricter penalties for crimes against women & children\n\n📖 **BNSS 2023** (Bharatiya Nagarik Suraksha Sanhita) **replaces the CrPC**\n• New bail provisions (Sec 480-484)\n• 60-day investigation limit\n• Zero FIR allowed at any police station\n\n📖 **BSA 2023** (Bharatiya Sakshya Adhiniyam) **replaces the Indian Evidence Act**\n\nSatLegal covers all these new laws in our database.` },

  // Cheque bounce / NI Act
  { id:'cheque', patterns: /cheque.*(bounce|dishonor|return)|dishonour.*cheque|ni.act|negotiable.instrument|138/i,
    reply: () => `**Cheque Bounce / Dishonour** – NI Act Section 138:\n\n📋 **Process:**\n1. Bank returns cheque with "insufficient funds" memo\n2. Send **legal notice within 30 days** of dishonour\n3. Drawer has 15 days to pay after receiving notice\n4. If no payment, file complaint within **30 days** of expiry\n\n⚡ This is a **criminal offence** – punishment up to 2 years imprisonment + double the cheque amount.\n\nKey documents: Original cheque, bank return memo, legal notice copy, postal receipt, reply (if any).` }
];

// ── Intent matching ────────────────────────────────────────────────────────
function matchIntent(msg) {
  const m = msg.trim();
  for (const intent of INTENTS) {
    if (intent.patterns.test(m)) return intent;
  }
  return null;
}

// ── Fallback response ──────────────────────────────────────────────────────
function fallbackResponse(msg) {
  // Try law database keyword match if available
  if (window.LAWS_DATABASE) {
    const lower = msg.toLowerCase();
    const matched = window.LAWS_DATABASE.find(law => {
      const kw = law.keywords || {};
      return [...(kw.exact||[]), ...(kw.strong||[])].some(k => lower.includes(k.toLowerCase()));
    });
    if (matched) {
      return `Based on your message, **${matched.caseType}** may be relevant.\n\n📜 Applicable law: *${matched.actName}*\n\n**Key sections:** ${(matched.sections||[]).slice(0,3).join(' · ')}\n\n🔍 Would you like a full analysis of your situation?`;
    }
  }

  return `I understand you need legal help. Let me guide you:\n\n📌 **Common topics I can help with:**\n• Family & Divorce laws\n• Property & Succession\n• Employment & Labour rights\n• Cyber crimes & IT Act\n• Criminal law (BNS/BNSS 2023)\n• Consumer rights\n• Motor accident claims\n\n**Please describe your situation in more detail** – the more you share, the better I can guide you!\n\nOr click **"Analyse My Case"** for a full step-by-step analysis.`;
}

// ── Chat history ───────────────────────────────────────────────────────────
let chatHistory = [];
let isOpen = false;
let isTyping = false;
let sessionId = 'chat_' + Date.now();

// ── Create widget HTML ─────────────────────────────────────────────────────
function createWidget() {
  const div = document.createElement('div');
  div.id = 'sl-chatbot-root';
  div.innerHTML = `
    <style>
      #sl-chatbot-root * { box-sizing:border-box; }
      #sl-chat-bubble {
        position:fixed;bottom:28px;right:28px;z-index:9998;
        width:58px;height:58px;border-radius:50%;
        background:linear-gradient(135deg,var(--sf-600,#FF8800),var(--gr-600,#1A6B1A));
        box-shadow:0 4px 20px rgba(0,0,0,.25);
        cursor:pointer;display:flex;align-items:center;justify-content:center;
        font-size:26px;transition:transform .2s,box-shadow .2s;
        border:3px solid rgba(255,255,255,.85);
      }
      #sl-chat-bubble:hover { transform:scale(1.08);box-shadow:0 6px 28px rgba(0,0,0,.3); }
      #sl-chat-bubble .notif-dot {
        position:absolute;top:-2px;right:-2px;
        width:16px;height:16px;border-radius:50%;
        background:#FF3B30;border:2px solid #fff;
        display:flex;align-items:center;justify-content:center;
        font-size:9px;font-weight:700;color:#fff;
      }
      #sl-chat-window {
        position:fixed;bottom:100px;right:28px;z-index:9999;
        width:370px;max-height:580px;
        background:#fff;border-radius:16px;
        box-shadow:0 16px 60px rgba(0,0,0,.22);
        display:flex;flex-direction:column;overflow:hidden;
        transition:opacity .2s,transform .2s;
        transform:translateY(12px) scale(0.97);opacity:0;pointer-events:none;
        border:1px solid rgba(0,0,0,.06);
      }
      #sl-chat-window.open { transform:translateY(0) scale(1);opacity:1;pointer-events:all; }
      .sl-chat-header {
        background:linear-gradient(135deg,#E07000 0%,#FF9933 45%,#138808 100%);
        padding:14px 16px;display:flex;align-items:center;gap:12px;flex-shrink:0;
      }
      .sl-chat-header-avatar { width:38px;height:38px;border-radius:50%;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;font-size:20px;border:2px solid rgba(255,255,255,.5); }
      .sl-chat-header-info { flex:1; }
      .sl-chat-header-name { font-size:14px;font-weight:700;color:#fff;display:flex;align-items:center;gap:6px; }
      .sl-chat-header-status { font-size:11px;color:rgba(255,255,255,.8);display:flex;align-items:center;gap:5px; }
      .sl-online-dot { width:6px;height:6px;border-radius:50%;background:#4ADE80;display:inline-block; }
      .sl-header-actions { display:flex;gap:6px; }
      .sl-header-btn { background:rgba(255,255,255,.15);border:none;color:#fff;width:28px;height:28px;border-radius:6px;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;transition:background .15s; }
      .sl-header-btn:hover { background:rgba(255,255,255,.25); }

      /* Messages */
      .sl-messages { flex:1;overflow-y:auto;padding:16px 14px;display:flex;flex-direction:column;gap:12px;background:#F9F9F9; }
      .sl-messages::-webkit-scrollbar { width:4px; }
      .sl-messages::-webkit-scrollbar-track { background:transparent; }
      .sl-messages::-webkit-scrollbar-thumb { background:rgba(0,0,0,.12);border-radius:4px; }
      .sl-msg { display:flex;gap:8px;align-items:flex-end;max-width:92%; }
      .sl-msg.user { flex-direction:row-reverse;align-self:flex-end; }
      .sl-msg.bot { align-self:flex-start; }
      .sl-msg-avatar { width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#FF9933,#138808);display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0; }
      .sl-msg-bubble {
        padding:10px 13px;border-radius:12px;font-size:13px;line-height:1.65;
        max-width:100%;word-break:break-word;
      }
      .sl-msg.bot .sl-msg-bubble { background:#fff;color:#1A1A1A;border-radius:4px 12px 12px 12px;box-shadow:0 1px 4px rgba(0,0,0,.08);border:1px solid #EFEFEF; }
      .sl-msg.user .sl-msg-bubble { background:linear-gradient(135deg,#FF9933,#E07000);color:#fff;border-radius:12px 4px 12px 12px; }
      .sl-msg-time { font-size:10px;color:#bbb;margin-top:4px;text-align:right; }

      /* Typing indicator */
      .sl-typing { display:flex;align-items:center;gap:5px;padding:10px 14px;background:#fff;border-radius:4px 12px 12px 12px;box-shadow:0 1px 4px rgba(0,0,0,.08);border:1px solid #EFEFEF; }
      .sl-typing span { width:7px;height:7px;border-radius:50%;background:#ccc;animation:sl-bounce 1.2s ease-in-out infinite; }
      .sl-typing span:nth-child(2) { animation-delay:.2s; }
      .sl-typing span:nth-child(3) { animation-delay:.4s; }
      @keyframes sl-bounce { 0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px);background:#FF9933;} }

      /* Quick replies */
      .sl-quick-replies { display:flex;flex-wrap:wrap;gap:6px;padding:8px 14px 4px; }
      .sl-qr { padding:6px 12px;border-radius:20px;border:1.5px solid #FF9933;color:#E07000;font-size:12px;font-weight:600;cursor:pointer;background:#fff;transition:all .15s;font-family:inherit; }
      .sl-qr:hover { background:#FF9933;color:#fff; }

      /* Input area */
      .sl-input-area { padding:10px 12px;border-top:1px solid #EFEFEF;display:flex;gap:8px;align-items:flex-end;background:#fff;flex-shrink:0; }
      .sl-input { flex:1;border:1.5px solid #E5E7EB;border-radius:22px;padding:9px 14px;font-size:13px;font-family:inherit;resize:none;outline:none;max-height:80px;overflow-y:auto;line-height:1.4; }
      .sl-input:focus { border-color:#FF9933;box-shadow:0 0 0 3px rgba(255,153,51,.12); }
      .sl-send-btn { width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#FF8800,#138808);border:none;color:#fff;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:transform .15s; }
      .sl-send-btn:hover { transform:scale(1.08); }
      .sl-send-btn:disabled { opacity:.4;cursor:not-allowed;transform:none; }

      /* Wizard button */
      .sl-wizard-btn { display:inline-flex;align-items:center;gap:6px;padding:8px 16px;background:linear-gradient(135deg,#FF9933,#138808);color:#fff;border-radius:20px;font-size:12px;font-weight:700;text-decoration:none;margin-top:8px;cursor:pointer;transition:opacity .15s; }
      .sl-wizard-btn:hover { opacity:.88;text-decoration:none;color:#fff; }

      /* Disclaimer */
      .sl-disclaimer { font-size:10px;color:#bbb;text-align:center;padding:6px 12px 8px;background:#fff;border-top:1px solid #F0F0F0; }

      @media(max-width:440px) { #sl-chat-window { width:calc(100vw - 20px);right:10px;bottom:84px; } #sl-chat-bubble { right:16px;bottom:16px; } }
    </style>

    <!-- Bubble -->
    <div id="sl-chat-bubble" onclick="SLChat.toggle()" title="Chat with SatLegal AI">
      ⚖️
      <div class="notif-dot" id="sl-notif-dot">1</div>
    </div>

    <!-- Window -->
    <div id="sl-chat-window" role="dialog" aria-label="SatLegal AI Chat">
      <!-- Header -->
      <div class="sl-chat-header">
        <div class="sl-chat-header-avatar">⚖️</div>
        <div class="sl-chat-header-info">
          <div class="sl-chat-header-name">SatLegal AI <span style="font-size:10px;background:rgba(255,255,255,.2);padding:1px 7px;border-radius:8px">FREE</span></div>
          <div class="sl-chat-header-status"><span class="sl-online-dot"></span> Online · Legal guidance 24/7</div>
        </div>
        <div class="sl-header-actions">
          <button class="sl-header-btn" onclick="SLChat.clear()" title="Clear chat">🗑️</button>
          <button class="sl-header-btn" onclick="SLChat.close()" title="Close">✕</button>
        </div>
      </div>

      <!-- Messages -->
      <div class="sl-messages" id="sl-messages"></div>

      <!-- Quick replies -->
      <div class="sl-quick-replies" id="sl-quick-replies"></div>

      <!-- Input -->
      <div class="sl-input-area">
        <textarea class="sl-input" id="sl-input" placeholder="Ask about your legal situation…" rows="1"
          onkeydown="SLChat.handleKey(event)" oninput="SLChat.autoResize(this)"></textarea>
        <button class="sl-send-btn" id="sl-send-btn" onclick="SLChat.send()" title="Send">➤</button>
      </div>

      <!-- Disclaimer -->
      <div class="sl-disclaimer">⚠️ Legal information only – not legal advice. Consult a qualified advocate for formal advice.</div>
    </div>
  `;
  document.body.appendChild(div);
}

// ── Format markdown-lite ───────────────────────────────────────────────────
function formatMsg(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>');
}

// ── Append message ─────────────────────────────────────────────────────────
function appendMsg(text, role, showWizardBtn) {
  const container = document.getElementById('sl-messages');
  if (!container) return;

  const wrapper = document.createElement('div');
  wrapper.className = 'sl-msg ' + role;

  const now = new Date().toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' });

  if (role === 'bot') {
    wrapper.innerHTML = `
      <div class="sl-msg-avatar">⚖️</div>
      <div>
        <div class="sl-msg-bubble">${formatMsg(text)}
          ${showWizardBtn ? `<div><a class="sl-wizard-btn" href="/" onclick="SLChat.goToWizard(event)">🔍 Analyse My Case Free →</a></div>` : ''}
        </div>
        <div class="sl-msg-time">${now}</div>
      </div>`;
  } else {
    wrapper.innerHTML = `
      <div>
        <div class="sl-msg-bubble">${formatMsg(text)}</div>
        <div class="sl-msg-time">${now}</div>
      </div>
      <div class="sl-msg-avatar" style="background:linear-gradient(135deg,#138808,#0D3D0D)">👤</div>`;
  }

  container.appendChild(wrapper);
  container.scrollTop = container.scrollHeight;
}

// ── Typing indicator ───────────────────────────────────────────────────────
function showTyping() {
  const container = document.getElementById('sl-messages');
  if (!container) return;
  const el = document.createElement('div');
  el.className = 'sl-msg bot';
  el.id = 'sl-typing-indicator';
  el.innerHTML = `<div class="sl-msg-avatar">⚖️</div><div class="sl-typing"><span></span><span></span><span></span></div>`;
  container.appendChild(el);
  container.scrollTop = container.scrollHeight;
}

function hideTyping() {
  const el = document.getElementById('sl-typing-indicator');
  if (el) el.remove();
}

// ── Quick replies ──────────────────────────────────────────────────────────
const INITIAL_QR = [
  { label: '👨‍👩‍👧 Divorce / Separation', msg: 'I need help with divorce' },
  { label: '🏠 Property / Land', msg: 'I have a property dispute' },
  { label: '💼 Job / Employment', msg: 'I was wrongfully terminated' },
  { label: '💻 Cyber Fraud', msg: 'I am a victim of online fraud' },
  { label: '⚖️ Criminal / FIR', msg: 'I want to file an FIR' },
  { label: '🛒 Consumer Rights', msg: 'I want to file a consumer complaint' }
];

function renderQuickReplies(replies) {
  const c = document.getElementById('sl-quick-replies');
  if (!c) return;
  c.innerHTML = '';
  replies.forEach(qr => {
    const btn = document.createElement('button');
    btn.className = 'sl-qr';
    btn.textContent = qr.label;
    btn.onclick = () => {
      c.innerHTML = '';
      SLChat.sendMessage(qr.msg);
    };
    c.appendChild(btn);
  });
}

// ── Process message ────────────────────────────────────────────────────────
async function processMessage(msg) {
  if (isTyping) return;
  isTyping = true;

  const sendBtn = document.getElementById('sl-send-btn');
  if (sendBtn) sendBtn.disabled = true;

  // Add user message
  appendMsg(msg, 'user');
  chatHistory.push({ role:'user', content: msg });
  document.getElementById('sl-quick-replies').innerHTML = '';

  // Show typing
  showTyping();

  // Simulate thinking delay
  await new Promise(r => setTimeout(r, TYPING_DELAY + Math.random()*400));

  // Try backend AI first
  let botReply = null;
  let showWizardBtn = false;

  try {
    const token = localStorage.getItem('sl_token');
    if (token) {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type':'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({ message: msg, history: chatHistory.slice(-6) }),
        signal: AbortSignal.timeout(5000)
      });
      if (res.ok) {
        const data = await res.json();
        botReply = data.reply || data.message;
      }
    }
  } catch(e) { /* fallback to client-side */ }

  // Client-side fallback
  if (!botReply) {
    const intent = matchIntent(msg);
    if (intent) {
      botReply = intent.reply(msg);
      showWizardBtn = !!intent.showWizardBtn;
    } else {
      botReply = fallbackResponse(msg);
      showWizardBtn = true;
    }
  }

  hideTyping();
  appendMsg(botReply, 'bot', showWizardBtn);
  chatHistory.push({ role:'bot', content: botReply });

  // Show follow-up quick replies
  const followUp = [
    { label: '🔍 Analyse My Case', msg: 'I want to analyse my legal case' },
    { label: '❓ More Info', msg: 'Tell me more about this' },
    { label: '📞 Find a Lawyer', msg: 'I need to find a lawyer' }
  ];
  renderQuickReplies(followUp);

  isTyping = false;
  if (sendBtn) sendBtn.disabled = false;

  // Save to sessionStorage
  try { sessionStorage.setItem('sl_chat_' + sessionId, JSON.stringify(chatHistory)); } catch(e) {}
}

// ── Public API ─────────────────────────────────────────────────────────────
window.SLChat = {
  toggle() {
    isOpen ? this.close() : this.open();
  },
  open() {
    isOpen = true;
    document.getElementById('sl-chat-window').classList.add('open');
    document.getElementById('sl-notif-dot').style.display = 'none';
    setTimeout(() => { const inp = document.getElementById('sl-input'); if(inp) inp.focus(); }, 300);
  },
  close() {
    isOpen = false;
    document.getElementById('sl-chat-window').classList.remove('open');
  },
  clear() {
    chatHistory = [];
    document.getElementById('sl-messages').innerHTML = '';
    document.getElementById('sl-quick-replies').innerHTML = '';
    this.showWelcome();
  },
  send() {
    const inp = document.getElementById('sl-input');
    if (!inp) return;
    const msg = inp.value.trim();
    if (!msg || isTyping) return;
    inp.value = '';
    inp.style.height = '';
    processMessage(msg);
  },
  sendMessage(msg) {
    processMessage(msg);
  },
  handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this.send(); }
  },
  autoResize(el) {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 80) + 'px';
  },
  goToWizard(e) {
    e.preventDefault();
    this.close();
    if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
      const wiz = document.getElementById('wizard');
      if (wiz) wiz.scrollIntoView({ behavior:'smooth' });
    } else {
      window.location.href = '/?start=1';
    }
  },
  showWelcome() {
    appendMsg(`Namaste! 🙏 I'm the **SatLegal AI** assistant.\n\nI can help you understand Indian laws, find out which laws apply to your situation, and guide you to the right legal resources – all for free.\n\n**What legal matter can I help you with today?**`, 'bot');
    renderQuickReplies(INITIAL_QR);
  }
};

// ── Init on DOM ready ──────────────────────────────────────────────────────
function init() {
  if (document.getElementById('sl-chatbot-root')) return; // already mounted
  createWidget();

  // Welcome message after slight delay
  setTimeout(() => {
    window.SLChat.showWelcome();
    // Show notification dot after 4 seconds if chat hasn't been opened
    setTimeout(() => {
      if (!isOpen) {
        const dot = document.getElementById('sl-notif-dot');
        if (dot) dot.style.display = 'flex';
      }
    }, 4000);
  }, 800);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

})();
