'use client';
import { useState } from 'react';
import { complaintsActive, complaintsSolved, supportLog } from '@/lib/admin-data';
import Table from '@/components/ui/Table';
import Modal from '@/components/modals/Modal';

export default function ProblemsModule({ showToast }) {
  const [tab, setTab] = useState('active');
  const [modal, setModal] = useState(null);
  const [addModal, setAddModal] = useState(false);
  const [newSupport, setNewSupport] = useState({ name: '', contact: '', help: '' });

  return (
    <div>
      <div className="tab-row">
        {['active', 'solved', 'support'].map((t) => (
          <button key={t} className={`tab-btn${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
            {t === 'active' ? 'Active' : t === 'solved' ? 'Solved' : 'Support'}
          </button>
        ))}
      </div>

      {tab === 'active' && (
        <>
          <div className="panel-head"><h3>Active reports</h3><span className="meta">{complaintsActive.length} open</span></div>
          <Table
            columns={[{ key: 'subject', label: 'Subject' }, { key: 'reporter', label: 'Reporter', muted: true }, { key: 'opened', label: 'Opened', muted: true }]}
            rows={complaintsActive}
            onRowClick={(c) => setModal(c)}
          />
        </>
      )}

      {tab === 'solved' && (
        <>
          <div className="panel-head"><h3>Solved reports</h3></div>
          <Table
            columns={[{ key: 'subject', label: 'Subject' }, { key: 'reporter', label: 'Reporter', muted: true }, { key: 'opened', label: 'Opened', muted: true }]}
            rows={complaintsSolved}
            onRowClick={(c) => setModal(c)}
          />
        </>
      )}

      {tab === 'support' && (
        <>
          <div className="panel-head">
            <h3>Support log</h3>
            <div className="panel-actions"><button className="btn btn-primary" onClick={() => setAddModal(true)}>+ New</button></div>
          </div>
          <Table
            columns={[{ key: 'name', label: 'Name' }, { key: 'contact', label: 'Contact', muted: true }, { key: 'date', label: 'Date', muted: true }, { key: 'help', label: 'How we helped', muted: true }]}
            rows={supportLog}
          />
          <Modal show={addModal} onClose={() => setAddModal(false)}>
            <h3>Log a support contact</h3>
            <div className="field-row" style={{ marginBottom: 10 }}><label>Name</label><input className="field-input" value={newSupport.name} onChange={(e) => setNewSupport((f) => ({ ...f, name: e.target.value }))} /></div>
            <div className="field-row" style={{ marginBottom: 10 }}><label>Contact</label><input className="field-input" value={newSupport.contact} onChange={(e) => setNewSupport((f) => ({ ...f, contact: e.target.value }))} /></div>
            <div className="field-row" style={{ marginBottom: 14 }}><label>How we helped</label><textarea className="field-textarea" value={newSupport.help} onChange={(e) => setNewSupport((f) => ({ ...f, help: e.target.value }))} /></div>
            <button className="btn btn-primary" onClick={() => {
              if (!newSupport.name.trim()) { showToast?.('Name is required.'); return; }
              supportLog.unshift({ id: 's' + Date.now(), ...newSupport, date: 'Today' });
              setAddModal(false); setNewSupport({ name: '', contact: '', help: '' }); showToast?.('Support contact logged.');
            }}>Save</button>
          </Modal>
        </>
      )}

      <Modal show={!!modal} onClose={() => setModal(null)}>
        {modal && (
          <>
            <h3>{modal.subject}</h3>
            <div className="sub">Reported by {modal.reporter} · {modal.email} · {modal.opened}</div>
            <div className="field-row" style={{ marginTop: 14 }}>
              <label>Resolution notes</label>
              <textarea className="field-textarea" defaultValue={modal.notes} onChange={(e) => { modal.notes = e.target.value; }} />
            </div>
            <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={() => { setModal(null); showToast?.('Notes saved.'); }}>Save notes</button>
          </>
        )}
      </Modal>
    </div>
  );
}