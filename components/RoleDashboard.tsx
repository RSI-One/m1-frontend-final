'use client';
import { ROLE_DASHBOARDS, ROLE_LABELS } from '@/lib/admin-data';

type AdminUser = {
  name: string;
  role: keyof typeof ROLE_LABELS;
};

type RoleDashboardProps = {
  currentAdmin?: AdminUser | null;
  path?: string;
  masterPreview?: { name: string; role: keyof typeof ROLE_LABELS } | null;
  onExitPreview?: () => void;
};

export default function RoleDashboard({ currentAdmin, masterPreview, onExitPreview, path }: RoleDashboardProps) {
  if (!currentAdmin) return null;

  const roleKey = (masterPreview?.role || currentAdmin.role) as keyof typeof ROLE_LABELS;
  const cfg = ROLE_DASHBOARDS[roleKey];
  if (!cfg) return null;

  return (
    <div id="roleDashboardView">
      {masterPreview && (
        <div className="master-preview-banner reveal">
          <span>
            Master Admin preview — viewing <strong>{masterPreview.name}</strong> ·{' '}
            {ROLE_LABELS[roleKey]}
          </span>
          <button className="btn btn-ghost" type="button" onClick={onExitPreview}>
            Exit Preview
          </button>
        </div>
      )}

      <section className="role-dash-hero reveal">
        <div className="role-badge">
          <span />
          {ROLE_LABELS[roleKey]}
        </div>
        <h1>
          {masterPreview
            ? cfg.title
            : `Welcome back, ${currentAdmin.name.split(' ')[0]}`}
        </h1>
        <p>{cfg.subtitle}</p>
      </section>

      <section className="role-action-grid reveal">
        {cfg.cards.map((c) => (
          <div key={c.label} className="role-action-card">
            <strong>{c.label}</strong>
            <span>{c.desc}</span>
            <div className="metric">
              {typeof c.metric === 'function' ? c.metric() : c.metric}
            </div>
          </div>
        ))}
      </section>

      {!masterPreview && (
        <div className="role-scope-note reveal">
          This workspace is scoped exclusively to your{' '}
          <strong>{ROLE_LABELS[roleKey]}</strong> role.
        </div>
      )}
    </div>
  );
}
