'use client';

import { useState } from 'react';
import {
  complaintsActive,
  complaintsSolved,
  supportLog,
} from '@/lib/admin-data';
import Table from '@/components/ui/Table';
import Modal from '@/components/modals/Modal';

type SupportForm = {
  name: string;
  contact: string;
  help: string;
};

export default function ProblemsModule({
  showToast,
}: {
  showToast?: (message: string) => void;
}) {
  const [tab, setTab] = useState<'active' | 'solved' | 'support'>('active');
  const [modal, setModal] = useState<any>(null);
  const [addModal, setAddModal] = useState(false);

  const [newSupport, setNewSupport] = useState<SupportForm>({
    name: '',
    contact: '',
    help: '',
  });

  const updateSupport = (key: keyof SupportForm, value: string) => {
    setNewSupport((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const saveSupport = () => {
    if (!newSupport.name.trim()) {
      showToast?.('Name is required.');
      return;
    }

    supportLog.unshift({
      id: `s${Date.now()}`,
      name: newSupport.name.trim(),
      contact: newSupport.contact.trim(),
      help: newSupport.help.trim(),
      date: 'Today',
    });

    setNewSupport({
      name: '',
      contact: '',
      help: '',
    });

    setAddModal(false);
    showToast?.('Support contact logged.');
  };

  const saveNotes = () => {
    if (!modal) return;

    setModal(null);
    showToast?.('Notes saved.');
  };

  return (
    <div>
      {/* Tabs */}
      <div className="tab-row">
        {(['active', 'solved', 'support'] as const).map((t) => (
          <button
            key={t}
            className={`tab-btn${tab === t ? ' active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t === 'active'
              ? 'Active'
              : t === 'solved'
                ? 'Solved'
                : 'Support'}
          </button>
        ))}
      </div>

      {/* ACTIVE REPORTS */}
      {tab === 'active' && (
        <>
          <div className="panel-head">
            <h3>Active reports</h3>
            <span className="meta">
              {complaintsActive.length} open
            </span>
          </div>

          <Table
            columns={[
              {
                key: 'subject',
                label: 'Subject',
              },
              {
                key: 'reporter',
                label: 'Reporter',
                muted: true,
              },
              {
                key: 'opened',
                label: 'Opened',
                muted: true,
              },
            ]}
            rows={complaintsActive}
            onRowClick={(complaint) => setModal(complaint)}
            emptyText="No active reports."
          />
        </>
      )}

      {/* SOLVED REPORTS */}
      {tab === 'solved' && (
        <>
          <div className="panel-head">
            <h3>Solved reports</h3>
            <span className="meta">
              {complaintsSolved.length} solved
            </span>
          </div>

          <Table
            columns={[
              {
                key: 'subject',
                label: 'Subject',
              },
              {
                key: 'reporter',
                label: 'Reporter',
                muted: true,
              },
              {
                key: 'opened',
                label: 'Opened',
                muted: true,
              },
            ]}
            rows={complaintsSolved}
            onRowClick={(complaint) => setModal(complaint)}
            emptyText="No solved reports."
          />
        </>
      )}

      {/* SUPPORT */}
      {tab === 'support' && (
        <>
          <div className="panel-head">
            <h3>Support log</h3>

            <div className="panel-actions">
              <button
                className="btn btn-primary"
                onClick={() => setAddModal(true)}
              >
                + New
              </button>
            </div>
          </div>

          <Table
            columns={[
              {
                key: 'name',
                label: 'Name',
              },
              {
                key: 'contact',
                label: 'Contact',
                muted: true,
              },
              {
                key: 'date',
                label: 'Date',
                muted: true,
              },
              {
                key: 'help',
                label: 'How we helped',
                muted: true,
              },
            ]}
            rows={supportLog}
            emptyText="No support contacts logged."
          />

          {/* ADD SUPPORT MODAL */}
          <Modal
            show={addModal}
            onClose={() => setAddModal(false)}
          >
            <h3>Log a support contact</h3>

            <div
              className="field-row"
              style={{ marginBottom: 10 }}
            >
              <label>Name</label>

              <input
                className="field-input"
                value={newSupport.name}
                onChange={(e) =>
                  updateSupport('name', e.target.value)
                }
                placeholder="Customer name"
              />
            </div>

            <div
              className="field-row"
              style={{ marginBottom: 10 }}
            >
              <label>Contact</label>

              <input
                className="field-input"
                value={newSupport.contact}
                onChange={(e) =>
                  updateSupport('contact', e.target.value)
                }
                placeholder="Email or phone"
              />
            </div>

            <div
              className="field-row"
              style={{ marginBottom: 14 }}
            >
              <label>How we helped</label>

              <textarea
                className="field-textarea"
                value={newSupport.help}
                onChange={(e) =>
                  updateSupport('help', e.target.value)
                }
                placeholder="Describe the support provided..."
              />
            </div>

            <div
              style={{
                display: 'flex',
                gap: 8,
                justifyContent: 'flex-end',
              }}
            >
              <button
                className="btn btn-ghost"
                onClick={() => setAddModal(false)}
              >
                Cancel
              </button>

              <button
                className="btn btn-primary"
                onClick={saveSupport}
              >
                Save
              </button>
            </div>
          </Modal>
        </>
      )}

      {/* COMPLAINT DETAIL MODAL */}
      <Modal
        show={!!modal}
        onClose={() => setModal(null)}
      >
        {modal && (
          <>
            <h3>{modal.subject}</h3>

            <div className="sub">
              Reported by {modal.reporter}
              {' · '}
              {modal.email}
              {' · '}
              {modal.opened}
            </div>

            <div
              className="field-row"
              style={{ marginTop: 14 }}
            >
              <label>Resolution notes</label>

              <textarea
                className="field-textarea"
                defaultValue={modal.notes || ''}
                onChange={(e) => {
                  modal.notes = e.target.value;
                }}
              />
            </div>

            <div
              style={{
                display: 'flex',
                gap: 8,
                justifyContent: 'flex-end',
                marginTop: 12,
              }}
            >
              <button
                className="btn btn-ghost"
                onClick={() => setModal(null)}
              >
                Cancel
              </button>

              <button
                className="btn btn-primary"
                onClick={saveNotes}
              >
                Save notes
              </button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}