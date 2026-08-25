'use client';
import { useState } from 'react';
import {
  listings, approvals, users, notifications,
} from '@/lib/admin-data';
import StatCard from '@/components/ui/StatCard';

type MasterDashboardProps = {
  currentAdmin?: { name?: string } | null;
  onOpenModule?: (moduleId: string) => void;
  showToast?: (message: string) => void;
};

type GraphPeriod = 'weekly' | 'monthly' | 'yearly';

function graphData(period: GraphPeriod) {
  const seeds = {
    weekly: [12, 18, 15, 22, 19, 26, 24],
    monthly: [80, 95, 88, 120, 110, 140, 132, 150, 145, 168, 160, 182],
    yearly: [420, 560, 610, 740, 890, 1020],
  };
  const labels = {
    weekly: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    monthly: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    yearly: ['2021', '2022', '2023', '2024', '2025', '2026'],
  };
  return { values: seeds[period], labels: labels[period] };
}

function buildSvg(period: GraphPeriod) {
  const { values, labels } = graphData(period);
  const w = 640, h = 190, padL = 28, padB = 22, padT = 10, padR = 10;
  const max = Math.max(...values), min = Math.min(...values);
  const stepX = (w - padL - padR) / (values.length - 1);
  const pts = values.map((v, i) => {
    const x = padL + i * stepX;
    const y = padT + (1 - (v - min) / (max - min || 1)) * (h - padT - padB);
    return [x, y];
  });
  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L${pts[pts.length - 1][0].toFixed(1)},${h - padB} L${pts[0][0].toFixed(1)},${h - padB} Z`;
  return { pts, linePath, areaPath, labels, h, padB };
}

export default function MasterDashboard({ currentAdmin, onOpenModule, showToast }: MasterDashboardProps) {
  const [notifIndex, setNotifIndex] = useState(0);
  const [graphPeriod, setGraphPeriod] = useState<GraphPeriod>('monthly');
  const svgData = buildSvg(graphPeriod);

  const verifiedCount = listings.filter((l) => l.verificationStatus === 'Verified' && l.status !== 'Unpublished').length;
  const activeCount = listings.filter((l) => l.status === 'Active').length;
  const totalUsers = users.length + 42;

  const n = notifications[notifIndex];

  return (
    <div id="masterDashboardView">
      <section className="dash-hero reveal">
        <div>
          <h1>Welcome back, {currentAdmin?.name?.split(' ')[0] || 'Admin'}</h1>
          <p>Here&apos;s what&apos;s happening across M1 Marketplace right now.</p>
        </div>
      </section>

      <section className="stat-row reveal">
        <StatCard
          num={verifiedCount}
          lbl="Verified Listings"
          delta="Persisted in database"
          onClick={() => onOpenModule?.('verifications')}
        />
        <StatCard
          num={approvals.length}
          lbl="Pending Approvals"
          delta={`${approvals.length} awaiting verification`}
          onClick={() => onOpenModule?.('verifications')}
        />
        <StatCard
          num={activeCount}
          lbl="Active Listings"
          delta="+2 today"
          onClick={() => onOpenModule?.('verifications')}
        />
        <StatCard
          num={totalUsers}
          lbl="Platform Users"
          delta="+3.1% this week"
        />
      </section>

      {/* Notification Ticker */}
      <section className="ticker-card reveal">
        <button
          className="ticker-arrow"
          disabled={notifIndex === 0}
          onClick={() => setNotifIndex((i) => Math.max(0, i - 1))}
          aria-label="Previous notification"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div className="ticker-head">
          <strong>Latest Notifications</strong>
          <span>Real-time activity feed</span>
        </div>
        <div className="ticker-body">
          <span className="ticker-dot" />
          <span className="ticker-text">{n?.text}</span>
        </div>
        <span className="ticker-pos">{notifIndex + 1} / {notifications.length}</span>
        <button
          className="ticker-arrow"
          disabled={notifIndex === notifications.length - 1}
          onClick={() => setNotifIndex((i) => Math.min(notifications.length - 1, i + 1))}
          aria-label="Next notification"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </section>

      {/* Graph */}
      <section className="graph-card reveal">
        <div className="graph-head">
          <h3>Total User Joins</h3>
          <div className="period-toggle">
            {(['weekly', 'monthly', 'yearly'] as const).map((p) => (
              <button
                key={p}
                data-period={p}
                className={graphPeriod === p ? 'active' : ''}
                onClick={() => setGraphPeriod(p)}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <svg className="graph-svg" viewBox="0 0 640 190" preserveAspectRatio="none">
          <defs>
            <linearGradient id="joinsFade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={svgData.areaPath} fill="url(#joinsFade)" />
          <path d={svgData.linePath} fill="none" stroke="#ffffff" strokeWidth="2" />
          {svgData.pts.map((p, i) => (
            <circle key={i} cx={p[0].toFixed(1)} cy={p[1].toFixed(1)} r="3" fill="#fff" />
          ))}
          {svgData.pts.map((p, i) =>
            i % Math.ceil(svgData.pts.length / 8 || 1) === 0 ? (
              <text key={i} x={p[0].toFixed(1)} y={svgData.h - 6} className="graph-axis-lbl" textAnchor="middle">
                {svgData.labels[i]}
              </text>
            ) : null
          )}
        </svg>
      </section>

      {/* Approvals Widget */}
      <section className="dash-widget reveal">
        <div className="dash-widget-head">
          <div>
            <h3>Approvals Queue ({approvals.length})</h3>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
              Listings awaiting admin review &amp; verification declaration
            </div>
          </div>
          <button
            className="btn btn-ghost"
            style={{ fontSize: 11 }}
            onClick={() => onOpenModule?.('verifications')}
          >
            View Full Queue →
          </button>
        </div>
        {approvals.length === 0 ? (
          <div style={{ fontSize: '12.5px', color: 'var(--muted-2)', padding: '14px 0' }}>
            No listings currently waiting for admin verification.
          </div>
        ) : (
          <div className="dash-widget-list">
            {approvals.slice(0, 3).map((a) => (
              <div key={a.id} className="dash-widget-item">
                <div>
                  <strong>{a.name}</strong>{' '}
                  <span style={{ fontSize: '11.5px', color: 'var(--muted-2)' }}>({a.id})</span>
                  <div style={{ fontSize: '11.5px', color: 'var(--muted)', marginTop: 2 }}>
                    Lister: {a.owner} ({a.company || 'Private'}) • Ask: {a.ask} • {a.docs?.length || 25} Documents
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    className="btn btn-ghost"
                    style={{ padding: '6px 12px', fontSize: 11 }}
                    onClick={() => onOpenModule?.('verifications')}
                  >
                    Review
                  </button>
                  <button
                    className="btn btn-primary"
                    style={{ padding: '6px 12px', fontSize: 11, background: 'var(--success)', color: '#000', border: 'none' }}
                    onClick={() => showToast?.(`✓ ${a.name} declared verified`)}
                  >
                    Declare Verified
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
