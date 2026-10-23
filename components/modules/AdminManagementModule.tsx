'use client';

import { useState, useEffect } from 'react';

function getApiBase(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL;
  if (envUrl) return envUrl.replace(/\/$/, '');
  if (typeof window !== 'undefined') return '/backend';
  return 'http://127.0.0.1:8000';
}

async function apiCall(path: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? (localStorage.getItem('m1_access_token') || localStorage.getItem('access_token')) : null;
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const base = getApiBase();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const url = base && cleanPath.startsWith(base) ? cleanPath : `${base}${cleanPath}`;

  const res = await fetch(url, { ...options, headers, credentials: 'include' });
  const raw = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(raw?.detail ?? raw?.message ?? `Request failed (${res.status})`);
  }
  return raw && typeof raw === 'object' && 'data' in raw && raw.data !== undefined ? raw.data : raw;
}

export default function AdminManagementModule({ showToast }: { showToast?: (msg: string) => void }) {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [admins, setadmins] = useState<any[]>([]);

  // Auth aur master-admin status check karne ke liye useEffect
  useEffect(() => {
    async function checkAuthAndFetch() {
      try {
        setIsLoadingAuth(true);
        // Apni auth API ya session check call yahan karein
        const res = await apiCall('/api/auth/me');
        if (res && (res.user || res.data)) {
          // Support both { user } and payload-shaped responses
          setCurrentUser(res.user ?? res.data ?? res);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsLoadingAuth(false);
      }
    }

    checkAuthAndFetch();
  }, []);

  // 1. Guard rendering until auth is fully loaded
  if (isLoadingAuth) {
    return (
      <div className="flex justify-center items-center p-8">
        <p className="text-gray-500 animate-pulse">Loading authorization...</p>
      </div>
    );
  }

  // 2. Master-admin detection check
  const isMasterAdmin = currentUser?.role === 'master-admin' || currentUser?.isMasterAdmin === true || currentUser?.isMaster === true;

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Admin Management</h2>

      {/* Agar master-admin nahi hai toh warning ya restriction dikhayein */}
      {!isMasterAdmin ? (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 text-yellow-700">
          <p>Access restricted. You need Master Admin privileges to view this table.</p>
        </div>
      ) : (
        /* 3. Guarded Admin Table Rendering */
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="py-2 px-4 text-left">Admin Name</th>
                <th className="py-2 px-4 text-left">Email</th>
                <th className="py-2 px-4 text-left">Role</th>
              </tr>
            </thead>
            <tbody>
              {admins.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-4 text-center text-gray-500">
                    No admins found.
                  </td>
                </tr>
              ) : (
                admins.map((admin, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-2 px-4">{admin.name || admin.username}</td>
                    <td className="py-2 px-4">{admin.email}</td>
                    <td className="py-2 px-4">{admin.role || admin.admin_type}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
