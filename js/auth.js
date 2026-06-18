/**
 * SatLegal Auth Helper
 * Handles token storage, user session, and auth guards
 */
const Auth = (() => {
  const TOKEN_KEY = 'sl_token';
  const USER_KEY  = 'sl_user';

  const setSession = (token, user) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  };

  const clearSession = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  const getToken = () => localStorage.getItem(TOKEN_KEY);

  const getUser = () => {
    try { return JSON.parse(localStorage.getItem(USER_KEY)); }
    catch { return null; }
  };

  const isLoggedIn = () => !!getToken();

  const getUserRole = () => getUser()?.role || null;

  // Redirect if not logged in
  const requireAuth = (redirectTo = '/auth/login.html') => {
    if (!isLoggedIn()) {
      window.location.href = redirectTo;
      return false;
    }
    return true;
  };

  // Redirect if wrong role
  const requireRole = (role, redirectTo = '/') => {
    if (!isLoggedIn()) { window.location.href = '/auth/login.html'; return false; }
    if (getUser()?.role !== role) { window.location.href = redirectTo; return false; }
    return true;
  };

  // Redirect if already logged in
  const redirectIfLoggedIn = () => {
    if (!isLoggedIn()) return;
    const role = getUserRole();
    if (role === 'lawyer') window.location.href = '/dashboard/lawyer-dashboard.html';
    else if (role === 'admin') window.location.href = '/dashboard/admin-dashboard.html';
    else window.location.href = '/dashboard/user-dashboard.html';
  };

  const logout = async () => {
    try { if (window.API) await API.logout(); } catch {}
    clearSession();
    window.location.href = '/';
  };

  // Update navbar based on login state
  const updateNavbar = () => {
    const user = getUser();
    const authLinks = document.getElementById('auth-links');
    if (!authLinks) return;

    if (user) {
      let dashUrl = '/dashboard/user-dashboard.html';
      if (user.role === 'lawyer') dashUrl = '/dashboard/lawyer-dashboard.html';
      if (user.role === 'admin')  dashUrl = '/dashboard/admin-dashboard.html';

      authLinks.innerHTML = `
        <a href="${dashUrl}" class="btn btn-outline btn-sm">My Dashboard</a>
        <div style="color:#aaa;font-size:13px;padding:0 8px">
          ${user.role === 'lawyer' ? '⚖️' : '👤'} ${user.name.split(' ')[0]}
        </div>
        <button onclick="Auth.logout()" class="btn btn-primary btn-sm">Logout</button>
      `;
    } else {
      authLinks.innerHTML = `
        <a href="/auth/login.html" class="btn btn-outline btn-sm">Login</a>
        <a href="/auth/signup.html" class="btn btn-primary btn-sm">Sign Up Free</a>
      `;
    }
  };

  return { setSession, clearSession, getToken, getUser, isLoggedIn, getUserRole,
           requireAuth, requireRole, redirectIfLoggedIn, logout, updateNavbar };
})();

// ── Toast Notifications ───────────────────────────────────────────────────────
const Toast = (() => {
  const show = (msg, type = 'success', duration = 4000) => {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }
    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    const toast = document.createElement('div');
    toast.className = `toast ${type === 'success' ? '' : type}`;
    toast.innerHTML = `<span class="toast-icon">${icons[type] || '✅'}</span><span class="toast-msg">${msg}</span>`;
    container.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateX(100%)'; toast.style.transition = '0.3s'; setTimeout(() => toast.remove(), 300); }, duration);
  };
  return { show, success: (m) => show(m, 'success'), error: (m) => show(m, 'error'), warning: (m) => show(m, 'warning'), info: (m) => show(m, 'info') };
})();

// ── Loading overlay ───────────────────────────────────────────────────────────
const Loader = {
  show: () => { const el = document.getElementById('loading-overlay'); if (el) el.classList.add('show'); },
  hide: () => { const el = document.getElementById('loading-overlay'); if (el) el.classList.remove('show'); }
};

// ── Format helpers ────────────────────────────────────────────────────────────
const fmt = {
  date:  (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—',
  time:  (d) => d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—',
  money: (n) => n ? `₹${n.toLocaleString('en-IN')}` : '₹0',
  status: (s) => {
    const map = {
      draft: '<span class="badge badge-warning">Draft</span>',
      analyzing: '<span class="badge badge-info">Analyzing</span>',
      assessed: '<span class="badge badge-success">Assessed</span>',
      lawyer_requested: '<span class="badge badge-primary">Lawyer Requested</span>',
      completed: '<span class="badge badge-dark">Completed</span>',
      new: '<span class="badge badge-new">New</span>',
      viewed: '<span class="badge badge-info">Viewed</span>',
      accepted: '<span class="badge badge-success">Accepted</span>',
      rejected: '<span class="badge badge-danger">Rejected</span>',
      pending: '<span class="badge badge-warning">Pending</span>',
      approved: '<span class="badge badge-success">Approved</span>',
      suspended: '<span class="badge badge-danger">Suspended</span>'
    };
    return map[s] || `<span class="badge badge-dark">${s}</span>`;
  },
  score: (n) => {
    const cls = n >= 70 ? 'high' : n >= 50 ? 'medium' : 'low';
    return `<div class="score-circle ${cls}"><span>${n}%</span><small>Score</small></div>`;
  }
};

window.Auth = Auth;
window.Toast = Toast;
window.Loader = Loader;
window.fmt = fmt;

// Auto-update navbar on load
document.addEventListener('DOMContentLoaded', () => Auth.updateNavbar());
