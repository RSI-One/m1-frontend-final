'use client';
import { useState } from 'react';
import { transactions } from '@/lib/admin-data';
import Modal from '@/components/modals/Modal';

function buildGraph(period) {
  const seeds = {
    weekly: [12, 18, 15, 22, 19, 26, 24],
    monthly: [80, 95, 88, 120, 110, 140, 132, 150, 145, 168, 160, 182],
    yearly: [420, 560, 610, 740, 890, 1020],
  };
  const labels = { weekly: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], monthly: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], yearly: ['2021', '2022', '2023', '2024', '2025', '2026'] };
  const values = seeds[period];
  const w = 640, h = 190, padL = 28, padB = 22, padT = 10, padR = 10;
  const max = Math.max(...values), min = Math.min(...values);
  const stepX = (w - padL - padR) / (values.length - 1);
  const pts = values.map((v, i) => [padL + i * stepX, padT + (1 - (v - min) / (max - min || 1)) * (h - padT - padB)]);
  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  return { pts, line, labels: labels[period] };
}

const colorMap = { green: 'rgba(61,213,152,.14)', pink: 'rgba(232,143,196,.14)', silver: 'rgba(255,255,255,.08)', red: 'rgba(255,92,92,.16)' };

export default function FinanceModule({ showToast }) {
  const [view, setView] = useState('overview');
  const [period, setPeriod] = useState('monthly');
  const [txModal, setTxModal] = useState(null);
  const [addModal, setAddModal] = useState(false);
  const [newTx, setNewTx] = useState({ type: '', platform: '', desc: '', to: '', from: '', amount: '' });
  const graph = buildGraph(period);

  if (view === 'history') {
    return (
      <div>
        <button className="btn btn-ghost" style={{ marginBottom: 16 }} onClick={() => setView('overview')}>← Overview</button>
        <div className="panel-head"><h3>Transaction History</h3></div>
        <div className="sheet-wrap">
          <table className="sheet">
            <thead><tr><th>Type</th><th>Platform</th><th>Description</th><th>Amount</th><th>Date</th></tr></thead>
            <tbody>
              {transactions.map((t, i) => (
                <tr key={t.id} style={{ background: colorMap[t.color] || '', cursor: 'pointer' }} onClick={() => setTxModal(t)}>
                  <td><strong>{t.type}</strong></td>
                  <td className="muted-cell">{t.platform}</td>
                  <td className="muted-cell">{t.desc}</td>
                  <td><strong>{t.amount}</strong></td>
                  <td className="muted-cell">{t.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Modal show={!!txModal} onClose={() => setTxModal(null)}>
          {txModal && (
            <>
              <h3>{txModal.type}</h3>
              <div className="sub">{txModal.desc}</div>
              <div className="modal-card"><h4>Details</h4>
                <div className="detail-list">
                  <div className="item"><span>From</span><strong>{txModal.from}</strong></div>
                  <div className="item"><span>To</span><strong>{txModal.to}</strong></div>
                  <div className="item"><span>Amount</span><strong>{txModal.amount}</strong></div>
                  <div className="item"><span>Date</span><strong>{txModal.date}</strong></div>
                  <div className="item"><span>Platform</span><strong>{txModal.platform}</strong></div>
                </div>
              </div>
            </>
          )}
        </Modal>
      </div>
    );
  }

  return (
    <div>
      <div className="panel-head">
        <h3>Finance</h3>
        <div className="panel-actions">
          <button className="btn btn-ghost" onClick={() => setView('history')}>History</button>
          <button className="btn btn-primary" onClick={() => setAddModal(true)}>+ Add transaction</button>
        </div>
      </div>

      <div className="graph-card" style={{ marginBottom: 18 }}>
        <div className="graph-head">
          <h3>Revenue</h3>
          <div className="period-toggle">
            {['weekly', 'monthly', 'yearly'].map((p) => (
              <button key={p} className={period === p ? 'active' : ''} onClick={() => setPeriod(p)}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <svg className="graph-svg" viewBox="0 0 640 190" preserveAspectRatio="none">
          <path d={graph.line} fill="none" stroke="#fff" strokeWidth="2" />
          {graph.pts.map((p, i) => <circle key={i} cx={p[0].toFixed(1)} cy={p[1].toFixed(1)} r="3" fill="#fff" />)}
        </svg>
      </div>

      <div className="grid-cards" style={{ marginBottom: 14 }}>
        <div className="mini-card"><div className="num">$284k</div><div className="lbl">Revenue (30d)</div></div>
        <div className="mini-card"><div className="num">$96k</div><div className="lbl">Expenses (30d)</div></div>
        <div className="mini-card"><div className="num">$41k</div><div className="lbl">Customer acquisition cost</div></div>
        <div className="mini-card"><div className="num">$188k</div><div className="lbl">Profit (30d)</div></div>
      </div>

      <div className="modal-card">
        <h4>Revenue split</h4>
        {[['Platform fees', '38%'], ['Featuring fees', '24%'], ['Verification fees', '16%'], ['Monthly retainer', '14%'], ['Partner registration', '8%']].map(([k, v]) => (
          <div key={k} className="deep-link-row"><span>{k}</span><span style={{ color: 'var(--muted)' }}>{v}</span></div>
        ))}
      </div>

      <Modal show={addModal} onClose={() => setAddModal(false)}>
        <h3>Add transaction</h3>
        {['type', 'platform', 'desc', 'to', 'from', 'amount'].map((field) => (
          <div key={field} className="field-row" style={{ marginBottom: 10 }}>
            <label style={{ textTransform: 'capitalize' }}>{field}</label>
            <input className="field-input" value={newTx[field]} onChange={(e) => setNewTx((f) => ({ ...f, [field]: e.target.value }))} placeholder={field === 'type' ? 'e.g. Featuring Fee' : field === 'amount' ? '$0.00' : ''} />
          </div>
        ))}
        <button className="btn btn-primary" onClick={() => {
          if (!newTx.type.trim()) { showToast?.('Transaction type is required.'); return; }
          transactions.unshift({ id: 't' + Date.now(), ...newTx, date: 'Today', color: 'silver' });
          setAddModal(false); setView('history'); showToast?.('Transaction recorded.');
        }}>Save transaction</button>
      </Modal>
    </div>
  );
}