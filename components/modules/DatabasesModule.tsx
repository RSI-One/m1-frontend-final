'use client';

import { useState, useEffect, type ChangeEvent } from 'react';
import {
  databasesApi,
  type DbUser,
  type DbUserSummary,
  type DbPartner,
  type DbAsset,
  type DbInventoryItem,
  type DbOffMarketItem,
} from '@/lib/admin-databases-api';

import Table from '@/components/ui/Table';
import Modal from '@/components/modals/Modal';

type ModalState =
  | { type: 'user'; data: DbUser }
  | { type: 'partner'; data: DbPartner }
  | { type: 'asset'; data: DbAsset }
  | null;

type DatabaseSection = 'hub' | 'users' | 'partners' | 'assets' | 'inventory' | 'offmarket';

type DatabasesModuleProps = {
  showAdminToast?: (message: string) => void;
};

export default function DatabasesModule({ showAdminToast }: DatabasesModuleProps) {
  const [sub, setSub] = useState<DatabaseSection>('hub');
  const [search, setSearch] = useState<string>('');
  const [modal, setModal] = useState<ModalState>(null);

 
  const [users, setUsers] = useState<DbUser[]>([]);
  const [userSummary, setUserSummary] = useState<DbUserSummary | null>(null);
  const [partners, setPartners] = useState<DbPartner[]>([]);
  const [assetsDb, setAssetsDb] = useState<DbAsset[]>([]);
  const [inventory, setInventory] = useState<DbInventoryItem[]>([]);
  const [offMarket, setOffMarket] = useState<DbOffMarketItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // asset edit form (populated when the asset modal opens)
  const [assetForm, setAssetForm] = useState<Partial<DbAsset>>({});

  const hubItems: Array<{ key: DatabaseSection; label: string; desc: string }> = [
    { key: 'users', label: 'Users Database', desc: 'Every registered buyer & seller account.' },
    { key: 'partners', label: 'Partners Database', desc: 'Industry partners in the exclusive circle.' },
    { key: 'assets', label: 'Assets Database', desc: 'Every aircraft/yacht model, editable.' },
    { key: 'inventory', label: 'Inventory Database', desc: "Users' inventory records, read-only." },
    { key: 'offmarket', label: 'Off-Market Database', desc: 'Listings marked off-market.' },
  ];

  // fetch data for the active section (debounced on search)
  useEffect(() => {
    if (sub === 'hub') return;

    const handle = setTimeout(async () => {
      try {
        setLoading(true);
        if (sub === 'users') setUsers(await databasesApi.listUsers(search));
        if (sub === 'partners') setPartners(await databasesApi.listPartners(search));
        if (sub === 'assets') setAssetsDb(await databasesApi.listAssets(search));
        if (sub === 'inventory') setInventory(await databasesApi.listInventory());
        if (sub === 'offmarket') setOffMarket(await databasesApi.listOffMarket());
      } catch (err: any) {
        showAdminToast?.(err.message ?? 'Failed to load records.');
      } finally {
        setLoading(false);
      }
    }, search ? 300 : 0); // debounce only when typing a search term

    return () => clearTimeout(handle);
  }, [sub, search, showAdminToast]);

  // fetch full summary when a user modal opens
  useEffect(() => {
    if (modal?.type !== 'user') {
      setUserSummary(null);
      return;
    }
    (async () => {
      try {
        const summary = await databasesApi.getUserSummary(modal.data.id);
        setUserSummary(summary);
      } catch (err: any) {
        showAdminToast?.(err.message ?? 'Failed to load user summary.');
      }
    })();
  }, [modal, showAdminToast]);

  // seed the asset edit form when the asset modal opens
  useEffect(() => {
    if (modal?.type === 'asset') setAssetForm(modal.data);
  }, [modal]);

  if (sub === 'hub') {
    return (
      <div className="hub-grid">
        {hubItems.map((item) => (
          <button key={item.key} className="hub-block" onClick={() => setSub(item.key)}>
            <strong>{item.label}</strong>
            <span>{item.desc}</span>
          </button>
        ))}
      </div>
    );
  }

  const backBtn = (
    <button
      className="btn btn-ghost"
      style={{ marginBottom: 16 }}
      onClick={() => {
        setSub('hub');
        setSearch('');
      }}
    >
      ← All Databases
    </button>
  );

  if (sub === 'users') {
    return (
      <div>
        {backBtn}

        <div className="panel-head">
          <h3>Users Database</h3>
          <span className="meta">{loading ? 'Loading…' : `${users.length} records · read-only`}</span>
        </div>

        <div className="search-bar">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            placeholder="Search users…"
            value={search}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          />
        </div>

        <Table
          columns={[
            { key: 'name', label: 'Username' },
            { key: 'company', label: 'Company', muted: true },
            { key: 'email', label: 'Email', muted: true },
            { key: 'phone', label: 'Phone', muted: true },
          ]}
          rows={users}
          onRowClick={(user: DbUser) => setModal({ type: 'user', data: user })}
          emptyText="No users match your search."
        />

        <Modal show={!!modal} onClose={() => setModal(null)}>
          {modal?.type === 'user' && (
            <>
              <div className="profile-row">
                <img src={modal.data.pfp} alt={modal.data.name} />
                <div>
                  <h4>{modal.data.name}</h4>
                  <span>
                    {modal.data.company} · {modal.data.email} · {modal.data.phone}
                  </span>
                </div>
              </div>

              <div className="modal-grid">
                <div className="modal-card">
                  <h4>Listing summary</h4>

                  {!userSummary ? (
                    <p style={{ color: 'var(--muted-2)', fontSize: 12 }}>Loading…</p>
                  ) : (
                    <>
                      <div className="deep-link-row">
                        <span>All Listings — {userSummary.listings}</span>
                      </div>
                      <div className="deep-link-row">
                        <span>Active — {userSummary.active}</span>
                      </div>
                      <div className="deep-link-row">
                        <span>Featured — {userSummary.featured}</span>
                      </div>
                      <div className="deep-link-row">
                        <span>Verified — {userSummary.verified}</span>
                      </div>
                      <div className="deep-link-row">
                        <span>Acquisition Requests — {userSummary.acqRequests}</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="modal-card">
                  <h4>Restricted</h4>
                  <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>
                    Password and PIN review is available to authorized super admins only.
                  </p>
                  <button
                    className="btn btn-ghost"
                    style={{ marginTop: 10 }}
                    onClick={() => showAdminToast?.('Security audit transcript logged.')}
                  >
                    Review password / PIN
                  </button>
                </div>
              </div>
            </>
          )}
        </Modal>
      </div>
    );
  }

  if (sub === 'partners') {
    const handleAddPartner = async () => {
      const company = prompt('Company name:');
      if (!company) return;
      const email = prompt('Contact email:') ?? '';
      try {
        await databasesApi.addPartner({ company, email });
        showAdminToast?.('Partner invite sent.');
        setPartners(await databasesApi.listPartners(search));
      } catch (err: any) {
        showAdminToast?.(err.message ?? 'Failed to add partner.');
      }
    };

    return (
      <div>
        {backBtn}

        <div className="panel-head">
          <h3>Partners Database</h3>
          <div className="panel-actions">
            <button className="btn btn-primary" onClick={handleAddPartner}>
              + Add Partner
            </button>
          </div>
        </div>

        <Table
          columns={[
            { key: 'company', label: 'Company' },
            { key: 'location', label: 'Location', muted: true },
            { key: 'founder', label: 'Founder', muted: true },
            { key: 'email', label: 'Email', muted: true },
          ]}
          rows={partners}
          onRowClick={(partner: DbPartner) => setModal({ type: 'partner', data: partner })}
        />

        <Modal show={!!modal} onClose={() => setModal(null)}>
          {modal?.type === 'partner' && (
            <>
              <h3>{modal.data.company}</h3>
              <div className="sub">
                {modal.data.location} · {modal.data.website}
              </div>

              <div className="modal-grid">
                <div className="modal-card">
                  <h4>Company details</h4>
                  <div className="detail-list">
                    <div className="item">
                      <span>Founder</span>
                      <strong>{modal.data.founder}</strong>
                    </div>
                    <div className="item">
                      <span>Email</span>
                      <strong>{modal.data.email}</strong>
                    </div>
                    <div className="item">
                      <span>Phone</span>
                      <strong>{modal.data.phone}</strong>
                    </div>
                    <div className="item">
                      <span>Website</span>
                      <strong>{modal.data.website}</strong>
                    </div>
                  </div>
                </div>

                <div className="modal-card">
                  <h4>Team members</h4>
                  {modal.data.members?.length ? (
                    modal.data.members.map((member) => (
                      <div key={member.name} className="deep-link-row">
                        <span>
                          {member.name} · {member.number}
                        </span>
                        <span style={{ color: 'var(--muted-2)' }}>{member.email}</span>
                      </div>
                    ))
                  ) : (
                    <p style={{ color: 'var(--muted-2)', fontSize: 12 }}>No additional members listed.</p>
                  )}
                </div>
              </div>
            </>
          )}
        </Modal>
      </div>
    );
  }

  if (sub === 'assets') {
    const handleSaveAsset = async () => {
      if (modal?.type !== 'asset') return;
      try {
        await databasesApi.editAsset(modal.data.id, assetForm);
        setAssetsDb((current) =>
          current.map((a) => (a.id === modal.data.id ? { ...a, ...assetForm } as DbAsset : a))
        );
        setModal(null);
        showAdminToast?.('Asset record updated.');
      } catch (err: any) {
        showAdminToast?.(err.message ?? 'Failed to update asset.');
      }
    };

    return (
      <div>
        {backBtn}

        <div className="panel-head">
          <h3>Assets Database</h3>
          <div className="panel-actions">
            <button
              className="btn btn-primary"
              onClick={() =>
                showAdminToast?.('New assets are created through the seller listing flow.')
              }
            >
              + Add New
            </button>
          </div>
        </div>

        <Table
          columns={[
            { key: 'manufacturer', label: 'Manufacturer' },
            { key: 'model', label: 'Model' },
            { key: 'type', label: 'Jet Type', muted: true },
            { key: 'passengers', label: 'Passengers', muted: true },
          ]}
          rows={assetsDb}
          onRowClick={(asset: DbAsset) => setModal({ type: 'asset', data: asset })}
        />

        <Modal show={!!modal} onClose={() => setModal(null)}>
          {modal?.type === 'asset' && (
            <>
              <h3>
                {modal.data.manufacturer} {modal.data.model}
              </h3>
              <div className="sub">{modal.data.type} · Editable record</div>

              <div className="modal-grid">
                <div className="modal-card">
                  <h4>Edit details</h4>

                  <div className="field-row" style={{ marginBottom: 10 }}>
                    <label>Manufacturer</label>
                    <input
                      className="field-input"
                      value={assetForm.manufacturer ?? ''}
                      onChange={(e) => setAssetForm((f) => ({ ...f, manufacturer: e.target.value }))}
                    />
                  </div>

                  <div className="field-row" style={{ marginBottom: 10 }}>
                    <label>Model</label>
                    <input
                      className="field-input"
                      value={assetForm.model ?? ''}
                      onChange={(e) => setAssetForm((f) => ({ ...f, model: e.target.value }))}
                    />
                  </div>

                  <div className="field-row" style={{ marginBottom: 10 }}>
                    <label>Jet type</label>
                    <input
                      className="field-input"
                      value={assetForm.type ?? ''}
                      onChange={(e) => setAssetForm((f) => ({ ...f, type: e.target.value }))}
                    />
                  </div>

                  <div className="field-row" style={{ marginBottom: 10 }}>
                    <label>Passengers</label>
                    <input
                      className="field-input"
                      type="number"
                      value={assetForm.passengers ?? ''}
                      onChange={(e) =>
                        setAssetForm((f) => ({ ...f, passengers: Number(e.target.value) }))
                      }
                    />
                  </div>

                  <button className="btn btn-primary" onClick={handleSaveAsset}>
                    Save changes
                  </button>
                </div>

                <div className="modal-card">
                  <h4>Preview</h4>
                  <img
                    src={modal.data.image}
                    alt={modal.data.model}
                    style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 14 }}
                  />
                </div>
              </div>
            </>
          )}
        </Modal>
      </div>
    );
  }

  if (sub === 'inventory') {
    return (
      <div>
        {backBtn}
        <div className="panel-head">
          <h3>Inventory Database</h3>
          <span className="meta">{loading ? 'Loading…' : 'Read-only'}</span>
        </div>
        <Table
          columns={[
            { key: 'owner', label: 'Owner' },
            { key: 'asset', label: 'Asset' },
            { key: 'since', label: 'Since', muted: true },
            { key: 'status', label: 'Status', muted: true },
          ]}
          rows={inventory}
        />
      </div>
    );
  }

  if (sub === 'offmarket') {
    return (
      <div>
        {backBtn}
        <div className="panel-head">
          <h3>Off-Market Database</h3>
          <span className="meta">{loading ? 'Loading…' : `${offMarket.length} records`}</span>
        </div>
        <Table
          columns={[
            { key: 'name', label: 'Asset' },
            { key: 'owner', label: 'Owner' },
            { key: 'ask', label: 'Ask', muted: true },
            { key: 'status', label: 'Status', muted: true },
          ]}
          rows={offMarket}
        />
      </div>
    );
  }

  return null;
}