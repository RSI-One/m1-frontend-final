'use client';

import { useState, useEffect } from 'react';
import { authService } from '@/lib/admin-auth';
import Table from '@/components/ui/Table';
import Modal from '@/components/modals/Modal';

interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: string;
  status: string;
  admin_type?: string | null;
  is_master_admin: boolean;
  created_at: string;
}

function getApiBase(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL;
  if (envUrl) return envUrl.replace(/\/$/, '');
  if (typeof window !== 'undefined') return '/backend';
  return 'http://127.0.0.1:8000';
}

async function apiCall(path: string, options: RequestInit = {}) {
  const token = authService.getAccessToken();
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
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMaster, setIsMaster] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;

    async function resolveMasterAccess() {
      try {
        const currentAdmin = authService.getCurrentAdmin() ?? (await authService.loadCurrentAdmin());
        const masterFlag = Boolean(currentAdmin?.isMaster ?? authService.isMasterAdmin(currentAdmin));

        if (active) setIsMaster(masterFlag);
      } catch {
        if (active) setIsMaster(false);
      }
    }

    resolveMasterAccess();
    return () => {
      active = false;
    };
  }, []);

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteType, setInviteType] = useState('general');
  const [inviteBatchId, setInviteBatchId] = useState<string | null>(null);
  const [codeFromNewAdmin, setCodeFromNewAdmin] = useState('');
  const [codeFromMasterAdmin, setCodeFromMasterAdmin] = useState('');
  const [submittingInvite, setSubmittingInvite] = useState(false);

  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [targetAdmin, setTargetAdmin] = useState<AdminUser | null>(null);
  const [removeBatchId, setRemoveBatchId] = useState<string | null>(null);
  const [removeCode, setRemoveCode] = useState('');
  const [submittingRemove, setSubmittingRemove] = useState(false);

  async function loadAdmins() {
    try {
      setLoading(true);
      const data = await apiCall('/admin-portal/admins');
      setAdmins(Array.isArray(data) ? data : []);
    } catch (err: any) {
      showToast?.(err.message || 'Failed to load administrators');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!isMaster) return;
    loadAdmins();
  }, [isMaster]);

  async function handleInitiateInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    try {
      setSubmittingInvite(true);
      const res = await apiCall('/admin-portal/invite-admin', {
        method: 'POST',
        body: JSON.stringify({ target_email: inviteEmail.trim(), admin_type: inviteType }),
      });
      setInviteBatchId(res.batch_id);
      showToast?.('Verification codes sent! Enter both codes to confirm.');
    } catch (err: any) {
      showToast?.(err.message || 'Failed to initiate invitation');
    } finally {
      setSubmittingInvite(false);
    }
  }

  async function handleConfirmInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteBatchId || !codeFromNewAdmin || !codeFromMasterAdmin) return;
    try {
      setSubmittingInvite(true);
      await apiCall('/admin-portal/confirm-invite', {
        method: 'POST',
        body: JSON.stringify({
          batch_id: inviteBatchId,
          code_from_new_admin: codeFromNewAdmin.trim(),
          code_from_master_admin: codeFromMasterAdmin.trim(),
        }),
      });
      showToast?.('Administrator successfully added!');
      setShowInviteModal(false);
      setInviteEmail('');
      setInviteBatchId(null);
      setCodeFromNewAdmin('');
      setCodeFromMasterAdmin('');
      loadAdmins();
    } catch (err: any) {
      showToast?.(err.message || 'Failed to confirm invitation');
    } finally {
      setSubmittingInvite(false);
    }
  }

  async function handleInitiateRemove(admin: AdminUser) {
    if (admin.is_master_admin) {
      showToast?.('Cannot remove Master Admin.');
      return;
    }
    setTargetAdmin(admin);
    setShowRemoveModal(true);
    setRemoveBatchId(null);
    setRemoveCode('');
    try {
      setSubmittingRemove(true);
      const res = await apiCall('/admin-portal/remove-admin', {
        method: 'POST',
        body: JSON.stringify({ target_user_id: admin.id }),
      });
      setRemoveBatchId(res.batch_id);
      showToast?.('Verification code sent to Master Admin email.');
    } catch (err: any) {
      showToast?.(err.message || 'Failed to initiate admin removal');
      setShowRemoveModal(false);
    } finally {
      setSubmittingRemove(false);
    }
  }

  async function handleConfirmRemove(e: React.FormEvent) {
    e.preventDefault();
    if (!removeBatchId || !removeCode) return;
    try {
      setSubmittingRemove(true);
      await apiCall('/admin-portal/confirm-remove', {
        method: 'POST',
        body: JSON.stringify({
          batch_id: removeBatchId,
          code: removeCode.trim(),
        }),
      });
      showToast?.('Administrator successfully removed.');
      setShowRemoveModal(false);
      setTargetAdmin(null);
      setRemoveBatchId(null);
      setRemoveCode('');
      loadAdmins();
    } catch (err: any) {
      showToast?.(err.message || 'Failed to confirm admin removal');
    } finally {
      setSubmittingRemove(false);
    }
  }

  if (isMaster === null) {
    return (
      <div className="panel" style={{ padding: 24, textAlign: 'center', color: '#888' }}>
        <h3>Checking access…</h3>
        <p>Verifying Master Administrator permissions.</p>
      </div>
    );
  }

  if (!isMaster) {
    return (
      <div className="panel" style={{ padding: 24, textAlign: 'center', color: '#888' }}>
        <h3>Restricted Access</h3>
        <p>Only the Master Administrator has authority to view and manage administrative personnel.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '0 8px' }}>
      <div className="panel-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h3 style={{ margin: 0 }}>Administrator Management</h3>
          <span className="meta">{loading ? 'Loading…' : `${admins.length} active administrators`}</span>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setShowInviteModal(true);
            setInviteBatchId(null);
            setCodeFromNewAdmin('');
            setCodeFromMasterAdmin('');
          }}
        >
          + Invite Administrator
        </button>
      </div>

      <Table
        columns={[
          { key: 'username', label: 'Admin Name' },
          { key: 'email', label: 'Email', muted: true },
          { key: 'admin_type', label: 'Role / Scope' },
          { key: 'is_master_admin', label: 'Level' },
          { key: 'status', label: 'Status' },
          { key: 'actions', label: 'Actions' },
        ]}
        rows={admins.map((admin) => ({
          username: <strong>{admin.username}</strong>,
          email: admin.email,
          admin_type: (
            <span className="badge" style={{ textTransform: 'capitalize' }}>
              {admin.admin_type || 'General'} Admin
            </span>
          ),
          is_master_admin: admin.is_master_admin ? (
            <span className="badge badge-accent">Master Admin</span>
          ) : (
            <span className="badge">Sub-Admin</span>
          ),
          status: <span className="status-dot green">{admin.status}</span>,
          actions: admin.is_master_admin ? (
            <span style={{ color: '#666', fontSize: 12 }}>Protected</span>
          ) : (
            <button
              className="btn btn-ghost"
              style={{ color: '#ff4d4f', padding: '4px 8px', fontSize: 12 }}
              onClick={() => handleInitiateRemove(admin)}
            >
              Remove
            </button>
          ),
        }))}
      />

      {showInviteModal && (
        <Modal
          title={inviteBatchId ? 'Confirm Admin Invitation' : 'Invite New Administrator'}
          onClose={() => setShowInviteModal(false)}
        >
          {!inviteBatchId ? (
            <form onSubmit={handleInitiateInvite} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <p style={{ fontSize: 13, color: '#aaa', margin: 0 }}>
                Enter the email of the person you wish to appoint as administrator and assign their role type.
              </p>
              <div>
                <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Target Email</label>
                <input
                  type="email"
                  required
                  className="input"
                  style={{ width: '100%', padding: '8px 12px', background: '#111', border: '1px solid #333', color: '#fff', borderRadius: 4 }}
                  placeholder="admin@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Admin Type</label>
                <select
                  className="input"
                  style={{ width: '100%', padding: '8px 12px', background: '#111', border: '1px solid #333', color: '#fff', borderRadius: 4 }}
                  value={inviteType}
                  onChange={(e) => setInviteType(e.target.value)}
                >
                  <option value="general">General Admin</option>
                  <option value="customer_care">Customer Care Admin</option>
                  <option value="bd">Business Development Admin</option>
                  <option value="executive">Executive Admin</option>
                  <option value="tech">Tech Admin</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 10 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowInviteModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submittingInvite}>
                  {submittingInvite ? 'Sending Codes…' : 'Send Invite Codes'}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleConfirmInvite} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <p style={{ fontSize: 13, color: '#aaa', margin: 0 }}>
                Two security codes were dispatched: one to the new admin ({inviteEmail}), and one to your Master Admin email. Both are required for confirmation.
              </p>
              <div>
                <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Code from New Admin</label>
                <input
                  type="text"
                  required
                  className="input"
                  style={{ width: '100%', padding: '8px 12px', background: '#111', border: '1px solid #333', color: '#fff', borderRadius: 4 }}
                  placeholder="7-digit code"
                  value={codeFromNewAdmin}
                  onChange={(e) => setCodeFromNewAdmin(e.target.value)}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Code from Master Admin</label>
                <input
                  type="text"
                  required
                  className="input"
                  style={{ width: '100%', padding: '8px 12px', background: '#111', border: '1px solid #333', color: '#fff', borderRadius: 4 }}
                  placeholder="7-digit code"
                  value={codeFromMasterAdmin}
                  onChange={(e) => setCodeFromMasterAdmin(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 10 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowInviteModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submittingInvite}>
                  {submittingInvite ? 'Verifying…' : 'Confirm & Authorize Admin'}
                </button>
              </div>
            </form>
          )}
        </Modal>
      )}

      {showRemoveModal && targetAdmin && (
        <Modal
          title={`Remove Administrator (${targetAdmin.username})`}
          onClose={() => setShowRemoveModal(false)}
        >
          <form onSubmit={handleConfirmRemove} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <p style={{ fontSize: 13, color: '#aaa', margin: 0 }}>
              A confirmation verification code was sent to the Master Admin email to authorize revoking {targetAdmin.email}.
            </p>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Security Code</label>
              <input
                type="text"
                required
                className="input"
                style={{ width: '100%', padding: '8px 12px', background: '#111', border: '1px solid #333', color: '#fff', borderRadius: 4 }}
                placeholder="Enter 7-digit code from email"
                value={removeCode}
                onChange={(e) => setRemoveCode(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 10 }}>
              <button type="button" className="btn btn-ghost" onClick={() => setShowRemoveModal(false)}>
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ background: '#d32f2f', borderColor: '#d32f2f' }}
                disabled={submittingRemove || !removeBatchId}
              >
                {submittingRemove ? 'Revoking…' : 'Revoke Admin Privileges'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
