'use client';

import { useState, useEffect } from 'react';
import { apiGet, ApiError } from '@/lib/api/client';
import Table from '@/components/ui/Table';

interface AuditLogItem {
  id: string;
  actor_admin_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  note: string | null;
  created_at: string | null;
}

export default function AuditLogsModule({ showToast }: { showToast?: (msg: string) => void }) {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadLogs() {
    try {
      setLoading(true);
      setError(null);
      const res = await apiGet<AuditLogItem[]>('/admin-portal/audit-logs?limit=50&offset=0');
      setLogs(Array.isArray(res) ? res : []);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to load audit logs';
      setError(msg);
      showToast?.(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLogs();
  }, []);

  return (
    <div style={{ padding: '0 8px' }}>
      <div className="panel-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h3 style={{ margin: 0 }}>System Audit Logs</h3>
          <span className="meta">{loading ? 'Loading…' : `${logs.length} logged administrative events`}</span>
        </div>
        <button className="btn btn-ghost" onClick={loadLogs} disabled={loading}>
          Refresh
        </button>
      </div>

      {error && <div className="chip warn" style={{ marginBottom: 16 }}>{error}</div>}

      <Table
        columns={[
          { key: 'action', label: 'Action / Event' },
          { key: 'entity_type', label: 'Entity Type' },
          { key: 'entity_id', label: 'Entity ID', muted: true },
          { key: 'actor_admin_id', label: 'Actor Admin', muted: true },
          { key: 'note', label: 'Details / Note' },
          { key: 'created_at', label: 'Timestamp' },
        ]}
        rows={logs.map((log) => ({
          action: <strong>{log.action}</strong>,
          entity_type: <span className="badge">{log.entity_type}</span>,
          entity_id: log.entity_id ? log.entity_id.slice(0, 8) : '—',
          actor_admin_id: log.actor_admin_id ? log.actor_admin_id.slice(0, 8) : 'System',
          note: log.note || '—',
          created_at: log.created_at ? new Date(log.created_at).toLocaleString() : '—',
        }))}
        emptyText="No audit logs recorded yet."
      />
    </div>
  );
}
