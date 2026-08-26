'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService, authorizationService } from '@/lib/admin-auth';
import { moduleDefs, ROLE_ROUTE_MAP } from '@/lib/admin-data';

import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import MasterDashboard from '@/components/MasterDashboard';
import RoleDashboard from '@/components/RoleDashboard';
import ModulePage from '@/components/ModulePage';
import Toast from '@/components/ui/AdminToast';

export default function AdminPage() {
  const router = useRouter();

  const [currentAdmin, setCurrentAdmin] = useState<any>(null);
  // NEW: distinguishes "still checking session" from "checked, not logged in"
  const [checkingSession, setCheckingSession] = useState<boolean>(true);
  const [currentModule, setCurrentModule] = useState<string | null>(null);
  const [path, setPath] = useState<string>('/admin/dashboard');
  const [toastMsg, setToastMsg] = useState<string>('');
  const [showToast, setShowToast] = useState<boolean>(false);

  useEffect(() => {
    // NEW: async, hits the real backend (silent refresh -> /auth/me ->
    // /admin-portal/admins) instead of reading a hardcoded local list.
    (async () => {
      const admin = await authService.loadCurrentAdmin();

      if (admin) {
        setCurrentAdmin(admin);
        setPath(
          ROLE_ROUTE_MAP[admin.role as keyof typeof ROLE_ROUTE_MAP] ||
            '/admin/dashboard'
        );
      } else {
        // no valid session — send them to the admin login screen
        router.replace('/admin/login');
      }

      setCheckingSession(false);
    })();
  }, [router]);

  const showToastMsg = (msg: string): void => {
    setToastMsg(msg);
    setShowToast(true);
  };

  const openModule = (id: string): void => {
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

  const closeModule = (): void => {
    setCurrentModule(null);
  };

  // NEW: while we're checking for a session, show a loading state
  // instead of nothing / instead of assuming logged-out.
  if (checkingSession) {
    return (
      <div style={{ color: '#fff' }}>
        Loading admin session...
      </div>
    );
  }

  // If checking finished and there's still no admin, we've already
  // redirected to /admin/login — render nothing while that happens.
  if (!currentAdmin) {
    return null;
  }

  return (
    <>
      <Navbar currentAdmin={currentAdmin} />

      <main className="admin-shell">
        <Sidebar
          currentAdmin={currentAdmin}
          path={path}
          currentModule={currentModule}
          onNavigate={(p: string) => {
            setPath(p);
            setCurrentModule(null);
          }}
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
              <RoleDashboard
                currentAdmin={currentAdmin}
                path={path}
              />
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

      <Toast
        message={toastMsg}
        show={showToast}
        onClose={() => setShowToast(false)}
      />
    </>
  );
}