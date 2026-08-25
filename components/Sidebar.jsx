'use client';
import { moduleDefs, ROLE_LABELS, ROLE_DASHBOARDS, ROLE_ROUTE_MAP, approvals } from '@/lib/admin-data';
import { authService } from '@/lib/admin-auth';

export default function Sidebar({ currentAdmin, path, currentModule, onNavigate, onOpenModule }) {
  if (!currentAdmin) return null;

  const allowedModules = moduleDefs.filter(
    (m) => authService.canAccessModule(m.id, currentAdmin) && m.id !== 'admin'
  );
  const isMaster = authService.isMasterAdmin(currentAdmin);
  const route = ROLE_ROUTE_MAP[currentAdmin.role];
  const cfg = ROLE_DASHBOARDS[currentAdmin.role];

  return (
    <aside className="admin-sidebar" id="adminSidebar">
      <div className="sidebar-label">
        {isMaster ? 'Master Workspace' : `${ROLE_LABELS[currentAdmin.role] || 'Admin'} Workspace`}
      </div>

      {!isMaster && route && cfg && (
        <button
          className={`nav-block${path === route && !currentModule ? ' active' : ''}`}
          onClick={() => onNavigate(route)}
          type="button"
        >
          <div className="nb-copy">
            <strong>{cfg.title || ROLE_LABELS[currentAdmin.role]}</strong>
            <span>{cfg.subtitle || ''}</span>
          </div>
        </button>
      )}

      {allowedModules.length > 0 && (
        <>
          <div className="sidebar-label" style={{ marginTop: 10 }}>Allowed Modules</div>
          {allowedModules.map((m) => {
            const isPending = m.id === 'verifications' && approvals.length > 0;
            const badgeText = isPending ? `${approvals.length} Pending` : m.badge;
            return (
              <button
                key={m.id}
                className={`nav-block${currentModule === m.id ? ' active' : ''}`}
                onClick={() => onOpenModule(m.id)}
                type="button"
              >
                <div className="nb-copy">
                  <strong>{m.label}</strong>
                  <span>{m.desc}</span>
                </div>
                {badgeText && (
                  <span
                    className="nb-badge"
                    style={isPending ? { background: 'var(--warn)', color: '#000' } : {}}
                  >
                    {badgeText}
                  </span>
                )}
              </button>
            );
          })}
        </>
      )}

      {isMaster && (
        <>
          <div className="sidebar-label" style={{ marginTop: 10 }}>Administration (Master Only)</div>
          <button
            className={`nav-block${path === '/admin/dashboard' && !currentModule ? ' active' : ''}`}
            onClick={() => onNavigate('/admin/dashboard')}
            type="button"
          >
            <div className="nb-copy">
              <strong>Master Dashboard</strong>
              <span>Platform overview &amp; analytics</span>
            </div>
          </button>
          <button
            className={`nav-block${currentModule === 'admin_management' ? ' active' : ''}`}
            onClick={() => onOpenModule('admin_management')}
            type="button"
          >
            <div className="nb-copy">
              <strong>Admin Management</strong>
              <span>Manage admins &amp; role dashboards</span>
            </div>
          </button>
          <button
            className={`nav-block${currentModule === 'audit_logs' ? ' active' : ''}`}
            onClick={() => onOpenModule('audit_logs')}
            type="button"
          >
            <div className="nb-copy">
              <strong>Audit Logs</strong>
              <span>Admin activity and security events</span>
            </div>
          </button>
        </>
      )}
    </aside>
  );
}