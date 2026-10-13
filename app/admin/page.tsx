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
    let isMounted = true;
    (async () => {
      const admin = await authService.loadCurrentAdmin();
      if (!isMounted) return;

      if (admin) {
        setCurrentAdmin(admin);
        setPath(
          ROLE_ROUTE_MAP[admin.role as keyof typeof ROLE_ROUTE_MAP] ||
            '/admin/dashboard'
        );
      } else {
        router.replace('/admin/login');
      }

      setCheckingSession(false);
    })();

    return () => {
      isMounted = false;
    };
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
      <div className="admin-root min-h-screen flex items-center justify-center bg-[#07080c] text-white">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              border: '3px solid rgba(255,255,255,0.15)',
              borderTopColor: '#cda45e',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }}
          />
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          <div style={{ fontSize: '14px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#a9b2be' }}>
            Loading admin session...
          </div>
        </div>
      </div>
    );
  }

  // If checking finished and there's still no admin, we've already
  // redirected to /admin/login — render nothing while that happens.
  if (!currentAdmin) {
    return null;
  }

  return (
    <div className="admin-root min-h-screen">
      <Navbar
        currentAdmin={currentAdmin}
        onNotifClick={() => showToastMsg('Notifications: No unread notifications')}
        onProfileClick={() => showToastMsg(`Logged in as ${currentAdmin.name} (${currentAdmin.role})`)}
      />

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
    </div>
  );
}