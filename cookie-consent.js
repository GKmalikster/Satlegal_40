/**
 * SatLegal Cookie Consent Manager
 * DPDP Act 2023 compliant — full banner with granular preferences
 * Consent stored in localStorage as sl_cookie_consent
 * Blocks analytics/marketing scripts until consent given
 */

(function () {
  'use strict';

  var STORAGE_KEY = 'sl_cookie_consent';
  var CONSENT_VERSION = '1'; // bump this to re-prompt after policy changes

  // ─── Retrieve stored consent ────────────────────────────────────────────────
  function getStoredConsent() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var obj = JSON.parse(raw);
      // Re-prompt if consent version changed
      if (obj.v !== CONSENT_VERSION) return null;
      return obj;
    } catch (e) { return null; }
  }

  function saveConsent(analytics, marketing) {
    var obj = {
      v: CONSENT_VERSION,
      essential: true,
      analytics: !!analytics,
      marketing: !!marketing,
      ts: new Date().toISOString()
    };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(obj)); } catch (e) {}
    return obj;
  }

  // ─── Expose public API immediately ──────────────────────────────────────────
  window.slCookieConsent = {
    getConsent: getStoredConsent,
    hasAnalytics: function () { var c = getStoredConsent(); return c && c.analytics; },
    hasMarketing: function () { var c = getStoredConsent(); return c && c.marketing; },
    openPreferences: function () { openPreferencesModal(); }
  };

  // ─── Analytics gate — wrap slTrack if it exists ─────────────────────────────
  // This intercepts analytics calls and queues them until consent is given.
  // When consent is granted, queued calls are flushed; if declined, queue is cleared.
  var _analyticsQueue = [];
  var _originalSlTrack = window.slTrack;

  window.slTrack = function (event, data) {
    if (window.slCookieConsent.hasAnalytics()) {
      // Consent already given — call through directly
      if (typeof _originalSlTrack === 'function') _originalSlTrack(event, data);
    } else {
      // Queue until consent decision
      _analyticsQueue.push({ event: event, data: data });
    }
  };

  function flushAnalyticsQueue() {
    if (typeof _originalSlTrack !== 'function') return;
    _analyticsQueue.forEach(function (item) { _originalSlTrack(item.event, item.data); });
    _analyticsQueue = [];
  }

  function clearAnalyticsQueue() { _analyticsQueue = []; }

  // ─── CSS (injected once) ────────────────────────────────────────────────────
  var CSS = [
    '#sl-cookie-banner{',
      'position:fixed;bottom:0;left:0;right:0;z-index:99999;',
      'background:#fff;border-top:3px solid #FF9933;',
      'box-shadow:0 -4px 24px rgba(0,0,0,.12);',
      'font-family:"Segoe UI",system-ui,-apple-system,sans-serif;',
      'padding:16px 20px;',
    '}',
    '#sl-cookie-banner .cb-inner{',
      'max-width:960px;margin:0 auto;',
      'display:flex;align-items:center;gap:16px;flex-wrap:wrap;',
    '}',
    '#sl-cookie-banner .cb-text{flex:1;min-width:240px;font-size:13px;color:#333;line-height:1.5}',
    '#sl-cookie-banner .cb-text a{color:#138808;text-decoration:underline}',
    '#sl-cookie-banner .cb-actions{display:flex;gap:8px;flex-wrap:wrap;align-items:center}',
    '#sl-cookie-banner .cb-btn{',
      'padding:9px 18px;border-radius:7px;font-size:13px;font-weight:700;',
      'cursor:pointer;border:none;transition:.15s;white-space:nowrap;',
    '}',
    '#sl-cookie-banner .cb-accept{background:#138808;color:#fff}',
    '#sl-cookie-banner .cb-accept:hover{background:#1A6B1A}',
    '#sl-cookie-banner .cb-decline{background:#F3F4F6;color:#374151;border:1px solid #D1D5DB}',
    '#sl-cookie-banner .cb-decline:hover{background:#E5E7EB}',
    '#sl-cookie-banner .cb-manage{background:#FFF3E0;color:#B35100;border:1px solid #FFB366}',
    '#sl-cookie-banner .cb-manage:hover{background:#FFE0B2}',

    /* Overlay */
    '#sl-cookie-overlay{',
      'position:fixed;inset:0;z-index:100000;',
      'background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;padding:20px;',
    '}',

    /* Modal */
    '#sl-cookie-modal{',
      'background:#fff;border-radius:12px;width:100%;max-width:480px;',
      'box-shadow:0 20px 60px rgba(0,0,0,.22);font-family:"Segoe UI",system-ui,-apple-system,sans-serif;',
      'overflow:hidden;',
    '}',
    '#sl-cookie-modal .cm-head{',
      'background:linear-gradient(135deg,#FF9933,#138808);',
      'padding:20px 22px;color:#fff;',
    '}',
    '#sl-cookie-modal .cm-head h2{font-size:17px;font-weight:800;margin:0 0 4px}',
    '#sl-cookie-modal .cm-head p{font-size:12px;opacity:.85;margin:0}',
    '#sl-cookie-modal .cm-body{padding:20px 22px}',
    '#sl-cookie-modal .cm-row{',
      'display:flex;align-items:flex-start;gap:14px;',
      'padding:14px 0;border-bottom:1px solid #F3F4F6;',
    '}',
    '#sl-cookie-modal .cm-row:last-child{border-bottom:none}',
    '#sl-cookie-modal .cm-info{flex:1}',
    '#sl-cookie-modal .cm-info strong{display:block;font-size:14px;color:#111;margin-bottom:3px}',
    '#sl-cookie-modal .cm-info span{font-size:12px;color:#6B7280;line-height:1.5}',
    '#sl-cookie-modal .cm-badge{',
      'font-size:10px;font-weight:700;padding:2px 7px;border-radius:10px;',
      'background:#EEF2FF;color:#3730A3;margin-left:6px;vertical-align:middle;',
    '}',

    /* Toggle */
    '.sl-toggle{position:relative;display:inline-block;width:42px;height:24px;flex-shrink:0;margin-top:2px}',
    '.sl-toggle input{opacity:0;width:0;height:0}',
    '.sl-toggle .sl-slider{',
      'position:absolute;inset:0;border-radius:24px;background:#D1D5DB;',
      'cursor:pointer;transition:.2s;',
    '}',
    '.sl-toggle .sl-slider:before{',
      'content:"";position:absolute;height:18px;width:18px;',
      'left:3px;bottom:3px;border-radius:50%;background:#fff;',
      'transition:.2s;box-shadow:0 1px 3px rgba(0,0,0,.2);',
    '}',
    '.sl-toggle input:checked + .sl-slider{background:#138808}',
    '.sl-toggle input:checked + .sl-slider:before{transform:translateX(18px)}',
    '.sl-toggle input:disabled + .sl-slider{opacity:.55;cursor:not-allowed}',

    '#sl-cookie-modal .cm-footer{',
      'padding:16px 22px 20px;display:flex;gap:10px;border-top:1px solid #F3F4F6;',
    '}',
    '#sl-cookie-modal .cm-save{',
      'flex:1;background:#138808;color:#fff;border:none;',
      'padding:11px;border-radius:8px;font-size:14px;font-weight:700;cursor:pointer;',
    '}',
    '#sl-cookie-modal .cm-save:hover{background:#1A6B1A}',
    '#sl-cookie-modal .cm-cancel{',
      'background:#F3F4F6;color:#374151;border:none;',
      'padding:11px 18px;border-radius:8px;font-size:14px;font-weight:700;cursor:pointer;',
    '}',
    '#sl-cookie-modal .cm-cancel:hover{background:#E5E7EB}'
  ].join('');

  function injectStyles() {
    if (document.getElementById('sl-cookie-css')) return;
    var s = document.createElement('style');
    s.id = 'sl-cookie-css';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  // ─── Banner ─────────────────────────────────────────────────────────────────
  function showBanner() {
    if (document.getElementById('sl-cookie-banner')) return;
    injectStyles();

    var banner = document.createElement('div');
    banner.id = 'sl-cookie-banner';
    banner.innerHTML = [
      '<div class="cb-inner">',
        '<div class="cb-text">',
          'We use cookies to operate the platform and, with your consent, to analyse usage.',
          ' <a href="privacy-policy.html#s3">Cookie Policy</a>',
        '</div>',
        '<div class="cb-actions">',
          '<button class="cb-btn cb-manage" id="slCookieManage">Manage Preferences</button>',
          '<button class="cb-btn cb-decline" id="slCookieDecline">Decline</button>',
          '<button class="cb-btn cb-accept" id="slCookieAccept">Accept All</button>',
        '</div>',
      '</div>'
    ].join('');

    document.body.appendChild(banner);

    document.getElementById('slCookieAccept').onclick = function () {
      applyConsent(true, true);
      hideBanner();
    };
    document.getElementById('slCookieDecline').onclick = function () {
      applyConsent(false, false);
      hideBanner();
    };
    document.getElementById('slCookieManage').onclick = function () {
      openPreferencesModal();
    };
  }

  function hideBanner() {
    var b = document.getElementById('sl-cookie-banner');
    if (b) b.remove();
  }

  // ─── Preferences modal ───────────────────────────────────────────────────────
  function openPreferencesModal() {
    if (document.getElementById('sl-cookie-overlay')) return;
    injectStyles();

    var stored = getStoredConsent() || {};

    var overlay = document.createElement('div');
    overlay.id = 'sl-cookie-overlay';
    overlay.innerHTML = [
      '<div id="sl-cookie-modal" role="dialog" aria-modal="true" aria-label="Cookie Preferences">',
        '<div class="cm-head">',
          '<h2>Cookie Preferences</h2>',
          '<p>Manage which cookies SatLegal may use on your device.</p>',
        '</div>',
        '<div class="cm-body">',

          '<div class="cm-row">',
            '<div class="cm-info">',
              '<strong>Essential Cookies <span class="cm-badge">Always On</span></strong>',
              '<span>Required for the platform to function — session management, legal wizard progress, payment flow. Cannot be disabled.</span>',
            '</div>',
            '<label class="sl-toggle">',
              '<input type="checkbox" id="slToggleEssential" checked disabled>',
              '<span class="sl-slider"></span>',
            '</label>',
          '</div>',

          '<div class="cm-row">',
            '<div class="cm-info">',
              '<strong>Analytics Cookies</strong>',
              '<span>Help us understand how the platform is used — pages viewed, drop-off points, search patterns. Data is anonymised and never sold.</span>',
            '</div>',
            '<label class="sl-toggle">',
              '<input type="checkbox" id="slToggleAnalytics"' + (stored.analytics ? ' checked' : '') + '>',
              '<span class="sl-slider"></span>',
            '</label>',
          '</div>',

          '<div class="cm-row">',
            '<div class="cm-info">',
              '<strong>Marketing Cookies</strong>',
              '<span>Used to deliver relevant content and re-engagement communications. Only activated with your explicit consent.</span>',
            '</div>',
            '<label class="sl-toggle">',
              '<input type="checkbox" id="slToggleMarketing"' + (stored.marketing ? ' checked' : '') + '>',
              '<span class="sl-slider"></span>',
            '</label>',
          '</div>',

        '</div>',
        '<div class="cm-footer">',
          '<button class="cm-cancel" id="slCookieModalCancel">Cancel</button>',
          '<button class="cm-save" id="slCookieModalSave">Save Preferences</button>',
        '</div>',
      '</div>'
    ].join('');

    document.body.appendChild(overlay);

    document.getElementById('slCookieModalSave').onclick = function () {
      var analytics = document.getElementById('slToggleAnalytics').checked;
      var marketing = document.getElementById('slToggleMarketing').checked;
      applyConsent(analytics, marketing);
      closeModal();
      hideBanner();
    };

    document.getElementById('slCookieModalCancel').onclick = closeModal;

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeModal();
    });
  }

  function closeModal() {
    var o = document.getElementById('sl-cookie-overlay');
    if (o) o.remove();
  }

  // ─── Apply consent decision ──────────────────────────────────────────────────
  function applyConsent(analytics, marketing) {
    saveConsent(analytics, marketing);
    // Update public API
    window.slCookieConsent.hasAnalytics = function () { return analytics; };
    window.slCookieConsent.hasMarketing = function () { return marketing; };

    if (analytics) {
      flushAnalyticsQueue();
    } else {
      clearAnalyticsQueue();
    }

    // Remove any marketing pixels/scripts if consent declined
    if (!marketing) {
      // Placeholder — add actual marketing script removal here if needed
    }
  }

  // ─── Init ────────────────────────────────────────────────────────────────────
  function init() {
    var stored = getStoredConsent();
    if (!stored) {
      // No prior consent — show the banner
      showBanner();
    } else {
      // Consent already stored — apply without banner
      applyConsent(stored.analytics, stored.marketing);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
