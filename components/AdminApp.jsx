'use client';
import { useState, useEffect } from 'react';
import { authService, authorizationService } from '@/lib/admin-auth';
import { moduleDefs, ROLE_LABELS, ROLE_ROUTE_MAP } from '@/lib/admin-data';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import MasterDashboard from '@/components/MasterDashboard';
import RoleDashboard from '@/components/RoleDashboard';
import ModulePage from '@/components/ModulePage';
import AdminToast from '@/components/ui/AdminToast';

export default function AdminApp() {
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [currentModule, setCurrentModule] = useState(null);
  const [path, setPath] = useState('/admin/dashboard');
  const [toastMsg, setToastMsg] = useState('');
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const admin = authService.loadCurrentAdmin();
    if (admin) {
      setCurrentAdmin(admin);
      setPath(ROLE_ROUTE_MAP[admin.role] || '/admin/dashboard');
    }
  }, []);

  const showToastMsg = (msg) => {
    setToastMsg(msg);
    setShowToast(true);
  };

  const openModule = (id) => {
    if (id === 'admin_management') {
      if (!authService.isMasterAdmin()) {
        showToastMsg('Denied: Unauthorized access attempt');
        return;
      }
      setCurrentModule('admin_management');
      return;
    }
    const def = moduleDefs.find((m) => m.id === id);
    if (!def) {
      showToastMsg('Module not found.');
      return;
    }
    if (!authorizationService.canAccessModule(id)) {
      showToastMsg('403 Access Denied');
      return;
    }
    setCurrentModule(id);
  };

  const closeModule = () => {
    setCurrentModule(null);
  };

  if (!currentAdmin) return <div className="admin-root" style={{ color: '#fff' }}>Loading admin session...</div>;

  return (
    <div className="admin-root">
      <Navbar currentAdmin={currentAdmin} />

      <main className="admin-shell">
        <Sidebar
          currentAdmin={currentAdmin}
          path={path}
          currentModule={currentModule}
          onNavigate={(p) => { setPath(p); setCurrentModule(null); }}
          onOpenModule={openModule}
        />

        <div className="admin-content">
          <div className="admin-view active">
            {path === '/admin/dashboard' ? (
              <MasterDashboard
                currentAdmin={currentAdmin}
                onOpenModule={openModule}
                showToast={showToastMsg}
              />
            ) : (
              <RoleDashboard currentAdmin={currentAdmin} path={path} />
            )}
          </div>
        </div>

        {currentModule && (
          <ModulePage
            moduleId={currentModule}
            onClose={closeModule}
            showToast={showToastMsg}
          />
        )}
      </main>

      <AdminToast message={toastMsg} show={showToast} onClose={() => setShowToast(false)} />
    </div>
  );
}