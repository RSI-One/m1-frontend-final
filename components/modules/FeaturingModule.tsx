'use client';

import { useState } from 'react';
import { featuring } from '@/lib/admin-data';
import Table from '@/components/ui/Table';

type FeaturingItem = (typeof featuring)[number];

type Tab = 'requests' | 'listed' | 'analytics';

type FeaturingModuleProps = {
  showAdminToast?: (message: string) => void;
};

export default function FeaturingModule({
  showAdminToast,
}: FeaturingModuleProps) {
  const [tab, setTab] = useState<Tab>('requests');

  const requests = featuring.filter(
    (item: FeaturingItem) => item.status === 'Requested'
  );

  const featured = featuring.filter(
    (item: FeaturingItem) => item.status === 'Featured'
  );

  const tableRows =
    tab === 'requests' ? requests : featured;

  return (
    <div>
      <div className="tab-row">
        {(['requests', 'listed', 'analytics'] as Tab[]).map(
          (t) => (
            <button
              key={t}
              className={`tab-btn${
                tab === t ? ' active' : ''
              }`}
              onClick={() => setTab(t)}
            >
              {t === 'requests'
                ? 'Requests'
                : t === 'listed'
                  ? 'Featured Listings'
                  : 'Analytics'}
            </button>
          )
        )}
      </div>

      {tab === 'analytics' ? (
        <div className="grid-cards">
          <div className="mini-card">
            <div className="num">
              {featuring.length}
            </div>
            <div className="lbl">Total records</div>
          </div>

          <div className="mini-card">
            <div className="num">
              {requests.length}
            </div>
            <div className="lbl">Pending requests</div>
          </div>

          <div className="mini-card">
            <div className="num">
              {featured.length}
            </div>
            <div className="lbl">
              Featured listings
            </div>
          </div>

          <div className="mini-card">
            <div className="num">4.1 days</div>
            <div className="lbl">
              Avg. review time
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="panel-head">
            <h3>
              {tab === 'requests'
                ? 'Requests'
                : 'Featured Listings'}
            </h3>

            <span className="meta">
              {tableRows.length} records
            </span>
          </div>

          <Table
            columns={[
              {
                key: 'name',
                label: 'Asset',
              },
              {
                key: 'owner',
                label: 'Owner',
                muted: true,
              },
              {
                key: 'status',
                label: 'Status',
                render: (item: FeaturingItem) =>
                  `<span class="chip ${
                    item.status === 'Featured'
                      ? 'ok'
                      : 'warn'
                  }">${item.status}</span>`,
              },
              {
                key: 'plan',
                label: 'Plan',
                muted: true,
              },
            ]}
            rows={tableRows}
            emptyText="Nothing here yet."
          />
        </>
      )}
    </div>
  );
}