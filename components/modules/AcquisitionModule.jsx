'use client';
import { useState } from 'react';
import { deals } from '@/lib/admin-data';

const dealStages = ['Coordinated Meeting', 'M1 Asset Verification', 'Letter of Intent', 'Escrow', 'M1 Inspection', 'Final Decision', 'Transfer of Assets'];

function StageBody({ deal, stageIdx, showToast, onNext, onUpdate }) {
  const [form, setForm] = useState({
    meetTime: deal.meeting.time,
    meetAgent: deal.meeting.agent,
    meetNotes: deal.meeting.notes,
    verNotes: deal.verification.notes,
    verFile: '',
    loi: deal.loi.file,
    escrowReceipt: deal.escrow.receipt,
    escrowStatus: deal.escrow.status,
    escrowAmount: deal.escrow.amount,
    escrowRequest: deal.escrow.request,
    inspReports: deal.inspection.reports,
    inspSummary: deal.inspection.summary,
    decision: deal.decision.status,
    transfer: deal.transfer.status,
  });

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const collect = () => {
    if (stageIdx === 0) deal.meeting = { time: form.meetTime, agent: form.meetAgent, notes: form.meetNotes };
    if (stageIdx === 1) { deal.verification.notes = form.verNotes; if (form.verFile) deal.verification.reports.push(form.verFile); }
    if (stageIdx === 2) deal.loi.file = form.loi;
    if (stageIdx === 3) deal.escrow = { receipt: form.escrowReceipt, status: form.escrowStatus, amount: form.escrowAmount, request: form.escrowRequest };
    if (stageIdx === 4) deal.inspection = { reports: form.inspReports, summary: form.inspSummary };
    if (stageIdx === 5) deal.decision.status = form.decision;
    if (stageIdx === 6) deal.transfer.status = form.transfer;
  };

  const fields = {
    0: [['Meeting time', 'meetTime'], ['M1 agent name', 'meetAgent']],
    1: [['Verification notes', 'verNotes'], ['Verification report', 'verFile']],
    2: [['Letter of Intent file', 'loi']],
    3: [['Receipt', 'escrowReceipt'], ['Status', 'escrowStatus'], ['Amount', 'escrowAmount'], ['Ongoing request', 'escrowRequest']],
    4: [['Inspection reports', 'inspReports'], ['Inspection summary', 'inspSummary']],
    6: [['Transfer status', 'transfer']],
  };

  return (
    <div className="stage-card">
      {stageIdx === 5 ? (
        <div className="field-row">
          <label>Decision status</label>
          <select className="field-select" value={form.decision} onChange={update('decision')}>
            {['Sold', 'Processing', 'Issue', 'On Hold'].map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
      ) : (fields[stageIdx] || []).map(([label, key]) => (
        <div key={key} className="field-row" style={{ marginBottom: 10 }}>
          <label>{label}</label>
          {label.toLowerCase().includes('notes') || label.toLowerCase().includes('summary') || label.toLowerCase().includes('request') ? (
            <textarea className="field-textarea" value={form[key]} onChange={update(key)} />
          ) : (
            <input className="field-input" value={form[key]} onChange={update(key)} />
          )}
        </div>
      ))}
      <div className="stage-actions">
        <button className="btn btn-ghost" onClick={() => { collect(); showToast?.('Progress saved.'); onNext?.(); }}>Next Step</button>
        <button className="btn btn-primary" onClick={() => { collect(); deal.stage = Math.max(deal.stage, stageIdx); showToast?.('Process updated.'); onUpdate?.(); }}>Update</button>
        {stageIdx === 5 && (
          <button className="btn btn-danger" onClick={() => { const r = prompt('Reason for cancelling:'); if (r) showToast?.('Process cancelled: ' + r); }}>Cancel Process</button>
        )}
      </div>
    </div>
  );
}

export default function AcquisitionModule({ showToast }) {
  const [activeDealId, setActiveDealId] = useState(null);
  const [activeStageMap, setActiveStageMap] = useState({});
  const [, forceUpdate] = useState(0);

  const deal = deals.find((d) => d.id === activeDealId);
  const activeStage = deal ? (activeStageMap[deal.id] ?? deal.stage) : 0;

  if (!activeDealId) {
    return (
      <div>
        <div className="panel-head">
          <h3>Acquisition / Deal Flow</h3>
          <span className="meta">{deals.length} active deals</span>
        </div>
        <div className="sheet-wrap">
          <table className="sheet">
            <thead><tr><th>Asset</th><th>Buyer</th><th>Seller</th><th>Stage</th></tr></thead>
            <tbody>
              {deals.map((d) => (
                <tr key={d.id} style={{ cursor: 'pointer' }} onClick={() => setActiveDealId(d.id)}>
                  <td><strong>{d.asset}</strong></td>
                  <td className="muted-cell">{d.buyer}</td>
                  <td className="muted-cell">{d.seller}</td>
                  <td><span className="chip">{d.stage + 1}/7 · {dealStages[d.stage]}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button className="btn btn-ghost" style={{ marginBottom: 16 }} onClick={() => setActiveDealId(null)}>← All Deals</button>
      <div className="panel-head">
        <h3>{deal.asset}</h3>
        <span className="meta">Buyer: {deal.buyer} · Seller: {deal.seller}</span>
      </div>
      <div className="pipeline">
        {dealStages.map((s, i) => (
          <div
            key={i}
            className={`pipe-step${i < deal.stage ? ' done' : ''}${i === activeStage ? ' active' : ''}`}
            onClick={() => setActiveStageMap((m) => ({ ...m, [deal.id]: i }))}
            style={{ cursor: 'pointer' }}
          >
            <div className="pipe-dot">{i < deal.stage ? '✓' : i + 1}</div>
            <span>{s}</span>
          </div>
        ))}
      </div>
      <StageBody
        deal={deal}
        stageIdx={activeStage}
        showToast={showToast}
        onNext={() => setActiveStageMap((m) => ({ ...m, [deal.id]: Math.min(6, activeStage + 1) }))}
        onUpdate={() => forceUpdate((n) => n + 1)}
      />
    </div>
  );
}