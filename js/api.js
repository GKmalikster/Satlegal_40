/**
 * SatLegal API Client v3.0
 * Centralized API calls with auth token management
 */
const API = (() => {
  const BASE = '/api';

  const getToken = () => localStorage.getItem('sl_token');

  const headers = (includeAuth = true) => {
    const h = { 'Content-Type': 'application/json' };
    if (includeAuth) {
      const t = getToken();
      if (t) h['Authorization'] = `Bearer ${t}`;
    }
    return h;
  };

  const handle = async (res) => {
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || data.errors?.[0]?.msg || 'Request failed');
    return data;
  };

  const get = (url, auth = true) =>
    fetch(BASE + url, { headers: headers(auth) }).then(handle);

  const post = (url, body, auth = true) =>
    fetch(BASE + url, { method: 'POST', headers: headers(auth), body: JSON.stringify(body) }).then(handle);

  const put = (url, body, auth = true) =>
    fetch(BASE + url, { method: 'PUT', headers: headers(auth), body: JSON.stringify(body) }).then(handle);

  const postForm = (url, formData) => {
    const h = {};
    const t = getToken();
    if (t) h['Authorization'] = `Bearer ${t}`;
    return fetch(BASE + url, { method: 'POST', headers: h, body: formData }).then(handle);
  };

  return {
    // ── Auth ────────────────────────────────────────────────────────────────
    signup:         (d) => post('/auth/signup', d, false),
    login:          (d) => post('/auth/login', d, false),
    logout:         ()  => post('/auth/logout', {}),
    forgotPassword: (d) => post('/auth/forgot-password', d, false),
    resetPassword:  (d) => post('/auth/reset-password', d, false),
    getMe:          ()  => get('/auth/me'),

    // ── User ────────────────────────────────────────────────────────────────
    getProfile:       ()  => get('/user/profile'),
    updateProfile:    (d) => put('/user/profile', d),
    changePassword:   (d) => put('/user/change-password', d),
    getUserInquiries: (params = '') => get('/user/inquiries' + (params ? '?' + params : '')),
    getTransactions:  ()  => get('/user/transactions'),
    getDashboardStats:()  => get('/user/dashboard-stats'),

    // ── Inquiry ─────────────────────────────────────────────────────────────
    getContextualQuestions: (desc) => post('/inquiry/contextual-questions', { description: desc }, false),
    analyse:        (d) => post('/inquiry/analyse', d, false),
    createInquiry:  (d) => post('/inquiry/create', d),
    getInquiry:     (id) => get(`/inquiry/${id}`),
    selectLaws:     (id, d) => put(`/inquiry/${id}/select-laws`, d),
    saveAssessment: (id, d) => post(`/inquiry/${id}/assessment`, d),
    calculateScore: (id) => post(`/inquiry/${id}/calculate`, {}),
    uploadDocument: (id, fd) => postForm(`/inquiry/${id}/documents`, fd),
    requestLawyer:  (id, d) => post(`/inquiry/${id}/request-lawyer`, d),

    // ── Lawyer ──────────────────────────────────────────────────────────────
    getLawyerDashboard:  () => get('/lawyer/dashboard'),
    updateLawyerProfile: (d) => put('/lawyer/profile', d),
    getLeads:    (params = '') => get('/lawyer/leads' + (params ? '?' + params : '')),
    updateLead:  (id, d) => put(`/lawyer/lead/${id}`, d),

    // ── Admin ───────────────────────────────────────────────────────────────
    getAdminStats:       ()  => get('/admin/stats'),
    getAdminAnalytics:   (p) => get('/admin/analytics' + (p ? '?' + p : '')),
    getLawyers:          (p) => get('/admin/lawyers' + (p ? '?' + p : '')),
    getLawyerDetail:     (id) => get(`/admin/lawyer/${id}`),
    verifyLawyer:        (id, d) => put(`/admin/lawyers/${id}/verify`, d),
    onboardLawyer:       (d) => post('/admin/onboard-lawyer', d),
    getAdminUsers:       (p) => get('/admin/users' + (p ? '?' + p : '')),
    getAdminInquiries:   (p) => get('/admin/inquiries' + (p ? '?' + p : '')),
    exportUsers:         (p) => get('/admin/export/users' + (p ? '?' + p : '')),
    exportInquiries:     (p) => get('/admin/export/inquiries' + (p ? '?' + p : '')),
    exportAnalytics:     ()  => get('/admin/export/analytics'),

    // ── Analytics / Market Intelligence ────────────────────────────────────
    getAnalyticsReport:  (days) => get(`/analytics/report?days=${days||30}`),
    getSearchReport:     (days) => get(`/analytics/search-report?days=${days||30}`),

    /**
     * trackSearch – fire-and-forget, never throws
     * @param {string} query – user's raw input
     * @param {Array}  results – output of analyzeMultipleLaws()
     * @param {string} source – 'wizard' | 'legal_topics' | 'chatbot' | 'reference_page'
     */
    trackSearch: (query, results = [], source = 'wizard') => {
      try {
        const detectedLaws = results.map(r => r.caseType);
        const lawCategories = [...new Set(results.map(r => r.lawCategory).filter(Boolean))];
        const topConfidence = results.length > 0 ? results[0].confidence : 0;
        const sessionId = (function(){
          let id = sessionStorage.getItem('sl_sid');
          if (!id) { id = 'sid_' + Date.now() + '_' + Math.random().toString(36).slice(2,8); sessionStorage.setItem('sl_sid', id); }
          return id;
        })();
        post('/analytics/search', { query, detectedLaws, lawCategories, topConfidence, source, sessionId }, false)
          .catch(() => {}); // Silent fail
      } catch(e) { /* silent */ }
    }
  };
})();

window.API = API;
