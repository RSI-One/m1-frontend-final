'use client';
import { useState } from 'react';
import { leads, m1wall } from '@/lib/admin-data';
import Table from '@/components/ui/Table';
import Modal from '@/components/modals/Modal';

export default function EAcquisitionModule({ showToast }) {
  const [tab, setTab] = useState('leads');
  const [modal, setModal] = useState(null);
  const [loadResults, setLoadResults] = useState(null);
  const [loading, setLoading] = useState(false);

  return (
    <div>
      <div className="tab-row">
        {['leads', 'wall', 'efficiency'].map((t) => (
          <button key={t} className={`tab-btn${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
            {t === 'leads' ? 'Leads' : t === 'wall' ? 'M1 Wall' : 'Efficiency'}
          </button>
        ))}
      </div>

      {tab === 'leads' && (
        <>
          <div className="panel-head">
            <h3>Leads</h3>
            <span className="meta">{leads.length} acquisition-engine sessions</span>
          </div>
          <Table
            columns={[
              { key: 'name', label: 'Name' },
              { key: 'model', label: 'Plane model' },
              { key: 'pax', label: 'Pax', muted: true },
              { key: 'phone', label: 'Phone', muted: true },
            ]}
            rows={leads}
            onRowClick={(l) => setModal(l)}
          />
          <Modal show={!!modal} onClose={() => setModal(null)}>
            {modal && (
              <>
                <h3>{modal.name}</h3>
                <div className="sub">{modal.model} · {modal.pax} pax · {modal.phone}</div>
                <div className="modal-grid">
                  <div className="modal-card">
                    <h4>Contact</h4>
                    <div className="detail-list">
                      <div className="item"><span>Email</span><strong>{modal.email}</strong></div>
                      <div className="item"><span>Business email</span><strong>{modal.bizEmail}</strong></div>
                      <div className="item"><span>Location</span><strong>{modal.location}</strong></div>
                      <div className="item"><span>Suggestions</span><strong>{modal.suggestions.join(', ')}</strong></div>
                    </div>
                  </div>
                  <div className="modal-card">
                    <h4>7-question wizard answers</h4>
                    {modal.answers.map((a, i) => (
                      <div key={i} className="deep-link-row">
                        <span>Q{i + 1}</span>
                        <span style={{ color: 'var(--muted)' }}>{a}</span>
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
          <div className="panel-head"><h3>M1 Wall / Office usage</h3></div>
          <Table
            columns={[{ key: 'partner', label: 'Partner' }, { key: 'hours', label: 'Usage hours', muted: true }]}
            rows={m1wall}
          />
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
                onClick={() => {
                  setLoading(true);
                  showToast?.('Firing 10 concurrent engine requests…');
                  setTimeout(() => {
                    setLoading(false);
                    setLoadResults(
                      Array.from({ length: 10 }, (_, i) => ({
                        id: String(i),
                        req: `Request #${i + 1}`,
                        latency: `${(600 + Math.random() * 900).toFixed(0)}ms`,
                        status: Math.random() > 0.08 ? 'OK' : 'Retry',
                      }))
                    );
                    showToast?.('Load test complete — 10/10 requests processed.');
                  }, 1200);
                }}
              >
                {loading ? 'Running…' : 'Run 10-request load test'}
              </button>
            </div>
          </div>
          <div className="grid-cards">
            <div className="mini-card"><div className="num">{leads.length * 37}</div><div className="lbl">Total engine activities</div></div>
            <div className="mini-card"><div className="num">96.4%</div><div className="lbl">Completion efficiency</div></div>
            <div className="mini-card"><div className="num">1.8s</div><div className="lbl">Avg. response time</div></div>
          </div>
          {loadResults && (
            <div style={{ marginTop: 16 }}>
              <Table
                columns={[
                  { key: 'req', label: 'Request' },
                  { key: 'latency', label: 'Latency', muted: true },
                  {
                    key: 'status', label: 'Status',
                    render: (r) => `<span class="chip ${r.status === 'OK' ? 'ok' : 'warn'}">${r.status}</span>`
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