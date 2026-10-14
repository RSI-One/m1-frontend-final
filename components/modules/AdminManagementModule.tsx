'use client';

import React, { useState, useEffect } from 'react';

async function apiCall(path: string, options: RequestInit = {}) {
  const res = await fetch(path, options);
  if (!res.ok) throw new Error('API call failed');
  return res.json();
}

export default function AdminManagementModule({ showToast }: { showToast?: (msg: string) => void }) {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [admins, setAdmins] = useState<any[]>([]);

  // Fetch current user and check authentication/roles on mount
  useEffect(() => {
    async function checkAuthAndFetch() {
      try {
        setIsLoadingAuth(true);
        const res = await apiCall('/api/auth/me'); 
        if (res && res.user) {
          setCurrentUser(res.user);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        if (showToast) showToast("Failed to verify authentication");
      } finally {
        setIsLoadingAuth(false);
      }
    }
    checkAuthAndFetch();
  }, []);

  // 1. Guard rendering until auth is fully loaded
  if (isLoadingAuth) {
    return (
      <div className="flex justify-center items-center p-12">
        <p className="text-gray-500 animate-pulse font-medium">Checking permissions...</p>
      </div>
    );
  }

  // 2. Master-admin detection check
  const isMasterAdmin = currentUser?.role === 'master-admin' || currentUser?.isMasterAdmin === true;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Admin Management</h2>

      {/* 3. Restrict access if not a master admin */}
      {!isMasterAdmin ? (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 text-yellow-700 rounded shadow-sm">
          <p className="font-semibold">Access Restricted</p>
          <p className="text-sm">You need Master Admin privileges to view and manage this table.</p>
        </div>
      ) : (
        /* 4. Guarded Admin Table Rendering */
        <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin Name</th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {admins.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-gray-500 text-sm">
                      No admins found.
                    </td>
                  </tr>
                ) : (
                  admins.map((admin, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-900">{admin.name}</td>
                      <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-500">{admin.email}</td>
                      <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-500">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {admin.role}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}