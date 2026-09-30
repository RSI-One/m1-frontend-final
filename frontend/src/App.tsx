import { useEffect, useRef } from 'react'
import './dashboard.css'

// Import the dashboard logic as a raw string and execute it
// This approach preserves 100% of the original functionality
const DASHBOARD_HTML = `
  <!-- ============================================================
     NAVBAR
  ============================================================ -->
  <header class="navbar" id="adminNavbar">
    <div class="nav-brand">
      <div class="brand-mark">
        <img src="/m1-logo.jpeg" alt="M1 logo">
      </div>
      <div class="brand-copy"><strong>Marketplace</strong><span>Admin Console</span></div>
    </div>

    <div class="navbar-search">
      <div class="search-bar">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <circle cx="11" cy="11" r="7"></circle>
          <path d="M21 21l-4.35-4.35"></path>
        </svg>
        <input type="search" placeholder="" aria-label="Search listings">
      </div>
    </div>
    <div class="role-switch" id="currentAdminDisplay">
      <div class="auth-copy">
        <strong id="authName">Farah Idris</strong>
        <span id="authRole">Master Admin</span>
      </div>
    </div>

    <div class="nav-utility">
      <button class="icon-btn" id="notifBtn" title="Notifications" aria-label="Notifications">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
        <span class="dot"></span>
      </button>
      <button class="avatar-btn" id="profileBtn" title="Profile" aria-label="Profile"><img
          src="https://randomuser.me/api/portraits/men/54.jpg" alt="Admin" /></button>
    </div>
  </header>

  <!-- ============================================================
     SHELL: sidebar + dashboard home
  ============================================================ -->
  <div class="admin-shell">

    <aside class="admin-sidebar" id="adminSidebar"></aside>

    <main class="admin-main" id="adminMain">
      <div id="masterDashboardView">
        <section class="dash-hero reveal">
          <div>
            <h1 id="dashWelcomeTitle">Welcome back, Admin</h1>
            <p id="dashWelcomeSub">Here's what's happening across M1 Marketplace right now.</p>
          </div>
        </section>
        <section class="stat-row reveal" id="statRow"></section>
        <section class="ticker-card reveal">
          <button class="ticker-arrow" id="notifPrev" aria-label="Previous notification">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          <div class="ticker-head"><strong>Latest Notifications</strong><span>Real-time activity feed</span></div>
          <div class="ticker-body" id="tickerBody"></div>
          <span class="ticker-pos" id="tickerPos"></span>
          <button class="ticker-arrow" id="notifNext" aria-label="Next notification">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </section>
        <section class="graph-card reveal">
          <div class="graph-head">
            <h3>Total User Joins</h3>
            <div class="period-toggle" id="graphToggle">
              <button data-period="weekly">Weekly</button>
              <button data-period="monthly" class="active">Monthly</button>
              <button data-period="yearly">Yearly</button>
            </div>
          </div>
          <svg class="graph-svg" id="joinsGraph" viewBox="0 0 640 190" preserveAspectRatio="none"></svg>
        </section>
        <section class="dash-widget reveal" id="dashApprovalsWidget"></section>
      </div>
      <div id="roleDashboardView" class="hidden"></div>
      <div id="adminManagementView" class="hidden"></div>
      <div id="forbiddenView" class="forbidden-page hidden">
        <div class="forbidden-card glass">
          <span class="forbidden-code">403</span>
          <h2>Access Denied</h2>
          <p>You don't have permission to access this area.</p>
          <button class="btn btn-primary" id="forbiddenReturnBtn" type="button">Return to My Dashboard</button>
        </div>
      </div>
    </main>
  </div>

  <!-- footer removed -->
  <!-- ============================================================
    GENERIC MODULE FULL-WINDOW PAGE
  ============================================================ -->
  <div class="module-page" id="modulePage">
    <div class="module-topbar">
      <button class="module-back" id="moduleBackBtn" aria-label="Back to dashboard">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
      </button>
      <div id="breadcrumb" class="module-breadcrumb"><span>Admin</span></div>
      <h2 id="moduleTitle">Module</h2>
      <span class="sub" id="moduleSub"></span>
    </div>
    <div class="module-body" id="moduleBody"></div>
  </div>

  <div class="overlay" id="overlay"></div>
  <div class="modal glass" id="detailModal"></div>
  <div class="toast" id="toast"></div>
`

function App() {
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    // Load dashboard script dynamically
    const script = document.createElement('script')
    script.src = '/dashboard.js'
    script.async = false
    document.body.appendChild(script)

    return () => {
      // cleanup if needed
    }
  }, [])

  return (
    <div
      id="m1-dashboard-root"
      dangerouslySetInnerHTML={{ __html: DASHBOARD_HTML }}
    />
  )
}

export default App
