'use client';
import { useState } from 'react';
import { featuring } from '@/lib/admin-data';
import Table from '@/components/ui/Table';

export default function FeaturingModule({ showToast }) {
  const [tab, setTab] = useState('requests');
  const requests = featuring.filter((f) => f.status === 'Requested');
  const featured = featuring.filter((f) => f.status === 'Featured');

  return (
    <div>
      <div className="tab-row">
        {['requests', 'listed', 'analytics'].map((t) => (
          <button key={t} className={`tab-btn${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
            {t === 'requests' ? 'Requests' : t === 'listed' ? 'Featured Listings' : 'Analytics'}
          </button>
        ))}
      </div>

      {tab === 'analytics' ? (
        <div className="grid-cards">
          <div className="mini-card"><div className="num">{featuring.length}</div><div className="lbl">Total records</div></div>
          <div className="mini-card"><div className="num">{requests.length}</div><div className="lbl">Pending requests</div></div>
          <div className="mini-card"><div className="num">{featured.length}</div><div className="lbl">Featured listings</div></div>
          <div className="mini-card"><div className="num">4.1 days</div><div className="lbl">Avg. review time</div></div>
        </div>
      ) : (
        <>
          <div className="panel-head">
            <h3>{tab === 'requests' ? 'Requests' : 'Featured Listings'}</h3>
            <span className="meta">{(tab === 'requests' ? requests : featured).length} records</span>
          </div>
          <Table
            columns={[
              { key: 'name', label: 'Asset' },
              { key: 'owner', label: 'Owner', muted: true },
              { key: 'status', label: 'Status', render: (r) => `<span class="chip ${r.status === 'Featured' ? 'ok' : 'warn'}">${r.status}</span>` },
              { key: 'plan', label: 'Plan', muted: true },
            ]}
            rows={tab === 'requests' ? requests : featured}
            emptyText="Nothing here yet."
          />
        </>
      )}
    </div>
  );
}