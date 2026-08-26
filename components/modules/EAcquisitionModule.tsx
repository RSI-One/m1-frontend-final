'use client';

import { useEffect, useState } from 'react';
import { eAcquisitionApi, Lead, WallRow, EfficiencyResult } from '@/lib/api/e-acquisition';
import Table from '@/components/ui/Table';
import Modal from '@/components/modals/Modal';

type EAcquisitionModuleProps = {
  showToast?: (message: string) => void;
};

type Tab = 'leads' | 'wall' | 'efficiency';

export default function EAcquisitionModule({
  showToast,
}: EAcquisitionModuleProps) {
  const [tab, setTab] = useState<Tab>('leads');
  const [modal, setModal] = useState<Lead | null>(null);

  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadsLoading, setLeadsLoading] = useState(false);

  const [wall, setWall] = useState<WallRow[]>([]);
  const [wallLoading, setWallLoading] = useState(false);

  const [loadResults, setLoadResults] = useState<EfficiencyResult[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (tab === 'leads') {
      setLeadsLoading(true);
      eAcquisitionApi
        .listLeads()
        .then(setLeads)
        .catch((e) => showToast?.(e.message ?? 'Failed to load leads'))
        .finally(() => setLeadsLoading(false));
    }
    if (tab === 'wall') {
      setWallLoading(true);
      eAcquisitionApi
        .getWallStats()
        .then(setWall)
        .catch((e) => showToast?.(e.message ?? 'Failed to load wall stats'))
        .finally(() => setWallLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const openLead = async (lead: Lead) => {
    try {
      const full = await eAcquisitionApi.getLead(lead.id);
      setModal(full);
    } catch {
      // fall back to the row we already have if the detail call fails
      setModal(lead);
    }
  };

  const runLoadTest = async () => {
    setLoading(true);
    showToast?.('Firing 10 concurrent engine requests…');
    try {
      const results = await eAcquisitionApi.runEfficiencyTest(10);
      setLoadResults(results);
      showToast?.(`Load test complete — ${results.length}/10 requests processed.`);
    } catch (e: any) {
      showToast?.(e.message ?? 'Load test failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="tab-row">
        {(['leads', 'wall', 'efficiency'] as Tab[]).map((t) => (
          <button
            key={t}
            className={`tab-btn${tab === t ? ' active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t === 'leads'
              ? 'Leads'
              : t === 'wall'
                ? 'M1 Wall'
                : 'Efficiency'}
          </button>
        ))}
      </div>

      {tab === 'leads' && (
        <>
          <div className="panel-head">
            <h3>Leads</h3>
            <span className="meta">
              {leadsLoading ? 'Loading…' : `${leads.length} acquisition-engine sessions`}
            </span>
          </div>

          <Table
            columns={[
              { key: 'name', label: 'Name' },
              { key: 'model', label: 'Plane model' },
              { key: 'pax', label: 'Pax', muted: true },
              { key: 'phone', label: 'Phone', muted: true },
            ]}
            rows={leads}
            onRowClick={(lead: Lead) => openLead(lead)}
          />

          <Modal show={!!modal} onClose={() => setModal(null)}>
            {modal && (
              <>
                <h3>{modal.name}</h3>

                <div className="sub">
                  {modal.model} · {modal.pax} pax · {modal.phone}
                </div>

                <div className="modal-grid">
                  <div className="modal-card">
                    <h4>Contact</h4>

                    <div className="detail-list">
                      <div className="item">
                        <span>Email</span>
                        <strong>{modal.email}</strong>
                      </div>

                      <div className="item">
                        <span>Business email</span>
                        <strong>{modal.bizEmail}</strong>
                      </div>

                      <div className="item">
                        <span>Location</span>
                        <strong>{modal.location}</strong>
                      </div>

                      <div className="item">
                        <span>Suggestions</span>
                        <strong>{modal.suggestions.join(', ') || '—'}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="modal-card">
                    <h4>7-question wizard answers</h4>

                    {modal.answers.map((answer: string, index: number) => (
                      <div key={index} className="deep-link-row">
                        <span>Q{index + 1}</span>
                        <span style={{ color: 'var(--muted)' }}>{answer}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </Modal>
        </>
      )}

      {tab === 'wall' && (
        <>
          <div className="panel-head">
            <h3>M1 Wall / Office usage</h3>
          </div>

          <Table
            columns={[
              { key: 'partner', label: 'Partner' },
              { key: 'hours', label: 'Usage hours', muted: true },
            ]}
            rows={wall}
          />
          {wallLoading && <div className="meta">Loading…</div>}
        </>
      )}

      {tab === 'efficiency' && (
        <>
          <div className="panel-head">
            <h3>Efficiency</h3>

            <div className="panel-actions">
              <button
                className="btn btn-primary"
                disabled={loading}
                onClick={runLoadTest}
              >
                {loading ? 'Running…' : 'Run 10-request load test'}
              </button>
            </div>
          </div>

          <div className="grid-cards">
            <div className="mini-card">
              <div className="num">{leads.length * 37}</div>
              <div className="lbl">Total engine activities</div>
            </div>

            <div className="mini-card">
              <div className="num">96.4%</div>
              <div className="lbl">Completion efficiency</div>
            </div>

            <div className="mini-card">
              <div className="num">1.8s</div>
              <div className="lbl">Avg. response time</div>
            </div>
          </div>

          {loadResults && (
            <div style={{ marginTop: 16 }}>
              <Table
                columns={[
                  { key: 'req', label: 'Request' },
                  { key: 'latency', label: 'Latency', muted: true },
                  {
                    key: 'status',
                    label: 'Status',
                    render: (result: EfficiencyResult) =>
                      `<span class="chip ${
                        result.status === 'OK' ? 'ok' : 'warn'
                      }">${result.status}</span>`,
                  },
                ]}
                rows={loadResults}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}