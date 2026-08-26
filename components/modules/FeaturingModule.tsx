'use client';

import { useEffect, useState } from 'react';
import {
  getFeaturingRequests,
  getFeaturedListings,
  getFeaturingAnalytics,
  type FeaturingItem,
  type FeaturingAnalytics,
} from '@/lib/api/featuring';
import Table from '@/components/ui/Table';

type Tab = 'requests' | 'listed' | 'analytics';

type FeaturingModuleProps = {
  showAdminToast?: (message: string) => void;
};

export default function FeaturingModule({
  showAdminToast,
}: FeaturingModuleProps) {
  const [tab, setTab] = useState<Tab>('requests');
  const [requests, setRequests] = useState<FeaturingItem[]>([]);
  const [featured, setFeatured] = useState<FeaturingItem[]>([]);
  const [analytics, setAnalytics] = useState<FeaturingAnalytics | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        if (tab === 'requests') {
          const res = await getFeaturingRequests();
          if (!cancelled) setRequests(res.results ?? []);
        } else if (tab === 'listed') {
          const res = await getFeaturedListings();
          if (!cancelled) setFeatured(res.results ?? []);
        } else {
          const res = await getFeaturingAnalytics();
          if (!cancelled) setAnalytics(res);
        }
      } catch (err) {
        if (!cancelled) {
          setError('Failed to load featuring data.');
          showAdminToast?.('Failed to load featuring data.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [tab, showAdminToast]);

  const tableRows = tab === 'requests' ? requests : featured;

  return (
    <div>
      <div className="tab-row">
        {(['requests', 'listed', 'analytics'] as Tab[]).map((t) => (
          <button
            key={t}
            className={`tab-btn${tab === t ? ' active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t === 'requests'
              ? 'Requests'
              : t === 'listed'
                ? 'Featured Listings'
                : 'Analytics'}
          </button>
        ))}
      </div>

      {loading && <div className="meta">Loading…</div>}
      {error && <div className="chip warn">{error}</div>}

      {!loading && tab === 'analytics' ? (
        <div className="grid-cards">
          <div className="mini-card">
            <div className="num">{analytics?.total_records ?? '—'}</div>
            <div className="lbl">Total records</div>
          </div>

          <div className="mini-card">
            <div className="num">{analytics?.pending_requests ?? '—'}</div>
            <div className="lbl">Pending requests</div>
          </div>

          <div className="mini-card">
            <div className="num">{analytics?.featured_listings ?? '—'}</div>
            <div className="lbl">Featured listings</div>
          </div>

          <div className="mini-card">
            <div className="num">
              {analytics?.avg_review_days != null
                ? `${analytics.avg_review_days} days`
                : '—'}
            </div>
            <div className="lbl">Avg. review time</div>
          </div>
        </div>
      ) : !loading ? (
        <>
          <div className="panel-head">
            <h3>{tab === 'requests' ? 'Requests' : 'Featured Listings'}</h3>
            <span className="meta">{tableRows.length} records</span>
          </div>

          <Table
            columns={[
              { key: 'name', label: 'Asset' },
              { key: 'owner', label: 'Owner', muted: true },
              {
                key: 'status',
                label: 'Status',
                render: (item: FeaturingItem) =>
                  `<span class="chip ${
                    item.status === 'Featured' ? 'ok' : 'warn'
                  }">${item.status}</span>`,
              },
              { key: 'plan', label: 'Plan', muted: true },
            ]}
            rows={tableRows}
            emptyText="Nothing here yet."
          />
        </>
      ) : null}
    </div>
  );
}