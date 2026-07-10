/**
 * SatLegal — Shared Navigation Manager
 * Handles: auth-aware nav links, My Account dropdown, admin visibility
 */
(function(){
  // Detect user session — checks both legacy sl_user and new auth modal sl_user_session
  function getUser(){
    try{
      const u=JSON.parse(localStorage.getItem('sl_user')||'{}');
      if(u.name) return u;
      // New auth modal flow stores session here
      const s=JSON.parse(localStorage.getItem('sl_user_session')||'{}');
      if(s.name) return s;
      return {};
    }catch(e){ return {}; }
  }
  function getToken(){
    return localStorage.getItem('sl_auth_token')||localStorage.getItem('sl_token')||'';
  }
  function isAdmin(){ try{ const u=getUser(); return u.role==='admin'; }catch(e){ return false; } }
  function isLoggedIn(){ return !!(getToken()||getUser().loggedIn) && !!getUser().name; }

  // Resolve relative path to auth pages (works from any depth)
  function authPath(p){
    // Count directory depth from current page
    const segs = location.pathname.replace(/\/[^/]*$/, '').split('/').filter(Boolean);
    const depth = segs.length;
    const rel = depth > 0 ? '../'.repeat(depth) : '';
    return rel + p;
  }

  function updateNav(){
    const loggedIn = isLoggedIn();
    const admin = isAdmin();
    const user = getUser();

    // ── Desktop nav actions ──────────────────────────────────────────────
    // Targets: .nav-actions, .sl-nav-actions — both class names used across pages
    const actionContainers = document.querySelectorAll(
      '.nav-actions, .sl-nav-actions, #navActions'
    );

    actionContainers.forEach(container => {
      // Build new HTML
      let html = '';

      // Admin link — only for admin users
      if(admin){
        html += `<a href="${authPath('dashboard/admin-dashboard.html')}" class="btn-nav-admin sl-btn-admin" title="Admin Console">⚙️ Admin</a>`;
      }

      if(loggedIn){
        // My Account dropdown
        html += `
          <div class="nav-acct-wrap" id="navAcctWrap">
            <button class="btn-nav-acct" id="navAcctBtn" onclick="toggleNavAcct(event)">
              👤 ${(user.name||'My Account').split(' ')[0]} ▾
            </button>
            <div class="nav-acct-menu" id="navAcctMenu">
              <a href="${authPath('dashboard/user-dashboard.html')}">📋 My Dashboard</a>
              <a href="${authPath('dashboard/user-dashboard.html')}#inquiries">📁 My Cases</a>
              <a href="${authPath('dashboard/user-dashboard.html')}#transactions">💳 Transactions</a>
              <a href="${authPath('dashboard/user-dashboard.html')}#profile">⚙️ Profile</a>
              <div class="nav-acct-divider"></div>
              <a href="#" onclick="slLogout();return false" style="color:#C0392B">🚪 Logout</a>
            </div>
          </div>`;
      } else {
        html += `<a href="${authPath('auth/login.html')}" class="btn-nav-login sl-btn-login">Login</a>`;
        html += `<a href="${authPath('auth/signup.html')}" class="btn-nav-signup sl-btn-signup">⚡ Sign Up Free</a>`;
      }

      container.innerHTML = html;
    });

    // ── Mobile menu ──────────────────────────────────────────────────────
    const mobLoginLinks = document.querySelectorAll('.mob-btn-login, .sl-mob-login');
    const mobSignupLinks = document.querySelectorAll('.mob-btn-signup, .sl-mob-signup');

    mobLoginLinks.forEach(el => {
      el.href = authPath('auth/login.html');
      el.textContent = '🔐 Login';
    });
    mobSignupLinks.forEach(el => {
      if(loggedIn){
        el.href = authPath('dashboard/user-dashboard.html');
        el.textContent = '📋 My Dashboard';
      } else {
        el.href = authPath('auth/signup.html');
      }
    });

    // ── Admin links in footer — hide if not admin ──────────────────────
    document.querySelectorAll('a[href*="admin-login"], a[href*="admin-dashboard"]').forEach(el => {
      if(!admin && el.closest('footer, .foot-links')){
        el.style.display = 'none';
      }
    });
  }

  // Logout
  window.slLogout = function(){
    localStorage.removeItem('sl_auth_token');
    localStorage.removeItem('sl_user');
    location.href = authPath('index.html');
  };

  // Account dropdown toggle
  window.toggleNavAcct = function(e){
    e.stopPropagation();
    const menu = document.getElementById('navAcctMenu');
    if(menu) menu.classList.toggle('open');
  };
  document.addEventListener('click', function(){
    const menu = document.getElementById('navAcctMenu');
    if(menu) menu.classList.remove('open');
  });

  // Run on DOM ready
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', updateNav);
  } else {
    updateNav();
  }
})();
