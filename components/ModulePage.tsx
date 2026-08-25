'use client';

import type { ComponentType } from 'react';

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

type ModulePageProps = {
  moduleId: string;
  onClose?: () => void;
  showToast?: (msg: string) => void;
};

type ModuleComponentProps = {
  showToast?: (msg: string) => void;
};

/*
 * Some modules use `showAdminToast` while the module page
 * exposes the common `showToast` prop.
 *
 * These small wrappers normalize the prop name so every
 * module can be registered with the same component type.
 */

function DatabasesModuleAdapter({
  showToast,
}: ModuleComponentProps) {
  return <DatabasesModule showAdminToast={showToast} />;
}

function FeaturingModuleAdapter({
  showToast: showAdminToast,
}: ModuleComponentProps) {
  return <FeaturingModule showAdminToast={showAdminToast} />;
}

function FinanceModuleAdapter({
  showToast,
}: ModuleComponentProps) {
  return <FinanceModule showAdminToast={showToast} />;
}

const moduleComponents: Record<
  string,
  ComponentType<ModuleComponentProps>
> = {
  databases: DatabasesModuleAdapter,
  eacquisition: EAcquisitionModule,
  datafetching: DataFetchingModule,

  listings: ListingsModule,
  verifications: ListingsModule,

  featuring: FeaturingModuleAdapter,
  acquisition: AcquisitionModule,
  finance: FinanceModuleAdapter,
  problems: ProblemsModule,

  admin_management: AdminManagementModule,
  audit_logs: AuditLogsModule,
};

export default function ModulePage({
  moduleId,
  onClose,
  showToast,
}: ModulePageProps) {
  /*
   * admin_management can have a definition with id="admin"
   * in admin-data.ts, so support both IDs.
   */
  const definition =
    moduleDefs.find((item) => item.id === moduleId) ??
    (moduleId === 'admin_management'
      ? moduleDefs.find((item) => item.id === 'admin')
      : undefined);

  const Component = moduleComponents[moduleId];

  return (
    <section
      className="module-page open"
      aria-label={definition?.label ?? 'Admin module'}
    >
      {/* TOP BAR */}
      <div className="module-topbar">
        <button
          className="module-back"
          type="button"
          onClick={onClose}
          aria-label="Close module"
        >
          <span aria-hidden="true">←</span>
        </button>

        <div>
          <h2>{definition?.label ?? 'Module'}</h2>

          {definition?.desc && (
            <span className="sub">
              {definition.desc}
            </span>
          )}
        </div>
      </div>

      {/* MODULE CONTENT */}
      <div className="module-body">
        {Component ? (
          <Component showToast={showToast} />
        ) : (
          <div className="info-empty">
            <h3>Module not found</h3>
            <p>
              No module component is registered for:
            </p>
            <code>{moduleId}</code>
          </div>
        )}
      </div>
    </section>
  );
}