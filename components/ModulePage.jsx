'use client';

import { moduleDefs } from '@/lib/admin-data';
import DatabasesModule from '@/components/modules/DatabasesModule';
import EAcquisitionModule from '@/components/modules/EAcquisitionModule';
import DataFetchingModule from '@/components/modules/DataFetchingModule';
import ListingsModule from '@/components/modules/ListingsModule';
import FeaturingModule from '@/components/modules/FeaturingModule';
import AcquisitionModule from '@/components/modules/AcquisitionModule';
import FinanceModule from '@/components/modules/FinanceModule';
import ProblemsModule from '@/components/modules/ProblemsModule';
import AdminManagementModule from '@/components/modules/AdminManagementModule';
import AuditLogsModule from '@/components/modules/AuditLogsModule';

const moduleComponents = {
  databases: DatabasesModule,
  eacquisition: EAcquisitionModule,
  datafetching: DataFetchingModule,
  listings: ListingsModule,
  verifications: ListingsModule,
  featuring: FeaturingModule,
  acquisition: AcquisitionModule,
  finance: FinanceModule,
  problems: ProblemsModule,
  admin_management: AdminManagementModule,
  audit_logs: AuditLogsModule,
};

export default function ModulePage({ moduleId, onClose, showToast }) {
  const definition = moduleDefs.find((item) => item.id === moduleId)
    || (moduleId === 'admin_management' ? moduleDefs.find((item) => item.id === 'admin') : null);
  const Component = moduleComponents[moduleId];

  return (
    <section className="module-page open" aria-label={definition?.label || 'Admin module'}>
      <div className="module-topbar">
        <button className="module-back" type="button" onClick={onClose} aria-label="Close module">
          <span aria-hidden="true">←</span>
        </button>
        <h2>{definition?.label || 'Module'}</h2>
        <span className="sub">{definition?.desc || ''}</span>
      </div>
      <div className="module-body">
        {Component ? <Component showToast={showToast} /> : <div className="info-empty">Module not found.</div>}
      </div>
    </section>
  );
}