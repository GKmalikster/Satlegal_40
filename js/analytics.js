/**
 * SatLegal Analytics Tracker v1.0
 * Tracks usage patterns, law queries, and workflow drop-offs
 * Works 100% client-side with localStorage, optionally syncs to backend
 */
(function() {
  const STORE_KEY = 'sl_analytics';
  const MAX_EVENTS = 1000;

  function getStore() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY) || '{"events":[]}'); }
    catch(e) { return { events: [] }; }
  }

  function saveStore(store) {
    try {
      if (store.events.length > MAX_EVENTS) {
        store.events = store.events.slice(-MAX_EVENTS);
      }
      localStorage.setItem(STORE_KEY, JSON.stringify(store));
    } catch(e) {}
  }

  function pushEvent(type, data) {
    const store = getStore();
    const event = {
      type,
      data,
      ts: new Date().toISOString(),
      page: window.location.pathname,
      sessionId: getSessionId()
    };
    store.events.push(event);
    saveStore(store);
    // Silently try to sync to backend
    try {
      const token = localStorage.getItem('sl_token');
      fetch('/api/analytics/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': 'Bearer ' + token } : {}) },
        body: JSON.stringify(event)
      }).catch(() => {});
    } catch(e) {}
  }

  function getSessionId() {
    let sid = sessionStorage.getItem('sl_sid');
    if (!sid) { sid = 'S' + Date.now() + Math.random().toString(36).slice(2,6); sessionStorage.setItem('sl_sid', sid); }
    return sid;
  }

  // ── Auto page view ──────────────────────────────────────────────────────
  pushEvent('page_view', { title: document.title });

  // ── Public API ──────────────────────────────────────────────────────────
  window.Analytics = {
    trackLawQuery: function(lawName, confidence, description) {
      pushEvent('law_query', { lawName, confidence, descSnippet: (description || '').substring(0, 80) });
    },
    trackStepComplete: function(stepNum) {
      pushEvent('step_complete', { step: stepNum });
    },
    trackStepAbandon: function(stepNum, description) {
      pushEvent('step_abandon', { step: stepNum, descSnippet: (description || '').substring(0, 80) });
    },
    trackUnmatched: function(description) {
      pushEvent('unmatched_query', { query: (description || '').substring(0, 120) });
    },
    getReport: function() {
      const store = getStore();
      const events = store.events || [];

      // Top laws
      const lawCounts = {};
      events.filter(e => e.type === 'law_query').forEach(e => {
        const n = e.data.lawName || 'Unknown';
        lawCounts[n] = (lawCounts[n] || 0) + 1;
      });
      const topLaws = Object.entries(lawCounts)
        .sort((a,b) => b[1]-a[1])
        .map(([name, count]) => ({ name, count }));

      // Funnel
      const stepCounts = {1:0,2:0,3:0,4:0,5:0};
      events.filter(e => e.type === 'step_complete').forEach(e => {
        if (stepCounts[e.data.step] !== undefined) stepCounts[e.data.step]++;
      });
      const funnel = [1,2,3,4,5].map(s => ({ step: s, label: ['Describe','Questions','Laws','Documents','Report'][s-1], count: stepCounts[s] }));

      // Unmatched queries
      const unmatched = events.filter(e => e.type === 'unmatched_query')
        .slice(-50).reverse()
        .map(e => ({ query: e.data.query, timestamp: e.ts }));

      // Daily active users (last 14 days)
      const dayMap = {};
      const sessMap = {};
      events.forEach(e => {
        const day = e.ts ? e.ts.substring(0,10) : 'unknown';
        if (!dayMap[day]) dayMap[day] = new Set();
        dayMap[day].add(e.sessionId);
      });
      const last14 = [];
      for (let i = 13; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        const key = d.toISOString().substring(0,10);
        last14.push({ date: key, count: dayMap[key] ? dayMap[key].size : 0 });
      }

      // Totals
      const sessions = new Set(events.map(e => e.sessionId)).size;
      const queries = events.filter(e => e.type === 'law_query').length;
      const unmatchedCount = events.filter(e => e.type === 'unmatched_query').length;

      return { topLaws, funnel, unmatched, dailyUsers: last14, totals: { queries, unmatched: unmatchedCount, sessions, totalEvents: events.length } };
    },
    clearData: function() {
      localStorage.removeItem(STORE_KEY);
    }
  };
})();
