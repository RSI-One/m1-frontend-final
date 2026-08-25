'use client';

import { useState, type ChangeEvent } from 'react';
import { deals } from '@/lib/admin-data';

const dealStages = [
  'Coordinated Meeting',
  'M1 Asset Verification',
  'Letter of Intent',
  'Escrow',
  'M1 Inspection',
  'Final Decision',
  'Transfer of Assets',
] as const;

type Deal = (typeof deals)[number];

type FormState = {
  meetTime: string;
  meetAgent: string;
  meetNotes: string;
  verNotes: string;
  verFile: string;
  loi: string;
  escrowReceipt: string;
  escrowStatus: string;
  escrowAmount: string | number;
  escrowRequest: string;
  inspReports: string | string[];
  inspSummary: string;
  decision: string;
  transfer: string;
};

type StageBodyProps = {
  deal: Deal;
  stageIdx: number;
  showToast?: (message: string) => void;
  onNext?: () => void;
  onUpdate?: () => void;
};

function StageBody({
  deal,
  stageIdx,
  showToast,
  onNext,
  onUpdate,
}: StageBodyProps) {
  const [form, setForm] = useState<FormState>({
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

  const update =
    (key: keyof FormState) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((current) => ({
        ...current,
        [key]: e.target.value,
      }));
    };

  const collect = (): void => {
    if (stageIdx === 0) {
      deal.meeting = {
        time: form.meetTime,
        agent: form.meetAgent,
        notes: form.meetNotes,
      };
    }

    if (stageIdx === 1) {
      deal.verification.notes = form.verNotes;

      if (form.verFile) {
        deal.verification.reports.push(form.verFile);
      }
    }

    if (stageIdx === 2) {
      deal.loi.file = form.loi;
    }

    if (stageIdx === 3) {
      deal.escrow = {
  receipt: form.escrowReceipt,
  status: form.escrowStatus,
  amount: String(form.escrowAmount),
  request: form.escrowRequest,
};
    }

    if (stageIdx === 4) {
      deal.inspection = {
        reports: String(form.inspReports),
        summary: form.inspSummary,
      };
    }

    if (stageIdx === 5) {
      deal.decision.status = form.decision;
    }

    if (stageIdx === 6) {
      deal.transfer.status = form.transfer;
    }
  };

  const fields: Record<number, Array<[string, keyof FormState]>> = {
    0: [
      ['Meeting time', 'meetTime'],
      ['M1 agent name', 'meetAgent'],
    ],
    1: [
      ['Verification notes', 'verNotes'],
      ['Verification report', 'verFile'],
    ],
    2: [['Letter of Intent file', 'loi']],
    3: [
      ['Receipt', 'escrowReceipt'],
      ['Status', 'escrowStatus'],
      ['Amount', 'escrowAmount'],
      ['Ongoing request', 'escrowRequest'],
    ],
    4: [
      ['Inspection reports', 'inspReports'],
      ['Inspection summary', 'inspSummary'],
    ],
    6: [['Transfer status', 'transfer']],
  };

  return (
    <div className="stage-card">
      {stageIdx === 5 ? (
        <div className="field-row">
          <label>Decision status</label>

          <select
            className="field-select"
            value={form.decision}
            onChange={(e) =>
              setForm((current) => ({
                ...current,
                decision: e.target.value,
              }))
            }
          >
            {['Sold', 'Processing', 'Issue', 'On Hold'].map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
        </div>
      ) : (
        (fields[stageIdx] || []).map(([label, key]) => (
          <div
            key={key}
            className="field-row"
            style={{ marginBottom: 10 }}
          >
            <label>{label}</label>

            {label.toLowerCase().includes('notes') ||
            label.toLowerCase().includes('summary') ||
            label.toLowerCase().includes('request') ? (
              <textarea
                className="field-textarea"
                value={String(form[key] ?? '')}
                onChange={update(key)}
              />
            ) : (
              <input
                className="field-input"
                value={String(form[key] ?? '')}
                onChange={update(key)}
              />
            )}
          </div>
        ))
      )}

      <div className="stage-actions">
        <button
          className="btn btn-ghost"
          onClick={() => {
            collect();
            showToast?.('Progress saved.');
            onNext?.();
          }}
        >
          Next Step
        </button>

        <button
          className="btn btn-primary"
          onClick={() => {
            collect();
            deal.stage = Math.max(deal.stage, stageIdx);
            showToast?.('Process updated.');
            onUpdate?.();
          }}
        >
          Update
        </button>

        {stageIdx === 5 && (
          <button
            className="btn btn-danger"
            onClick={() => {
              const reason = prompt('Reason for cancelling:');

              if (reason) {
                showToast?.(`Process cancelled: ${reason}`);
              }
            }}
          >
            Cancel Process
          </button>
        )}
      </div>
    </div>
  );
}

type AcquisitionModuleProps = {
  showToast?: (message: string) => void;
};

export default function AcquisitionModule({
  showToast,
}: AcquisitionModuleProps) {
  const [activeDealId, setActiveDealId] = useState<string | null>(null);

  const [activeStageMap, setActiveStageMap] = useState<
    Record<string, number>
  >({});

  const [, forceUpdate] = useState<number>(0);

  const deal = deals.find((d) => d.id === activeDealId);

  const activeStage = deal
    ? (activeStageMap[deal.id] ?? deal.stage)
    : 0;

  if (!activeDealId) {
    return (
      <div>
        <div className="panel-head">
          <h3>Acquisition / Deal Flow</h3>
          <span className="meta">
            {deals.length} active deals
          </span>
        </div>

        <div className="sheet-wrap">
          <table className="sheet">
            <thead>
              <tr>
                <th>Asset</th>
                <th>Buyer</th>
                <th>Seller</th>
                <th>Stage</th>
              </tr>
            </thead>

            <tbody>
              {deals.map((d) => (
                <tr
                  key={d.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setActiveDealId(d.id)}
                >
                  <td>
                    <strong>{d.asset}</strong>
                  </td>

                  <td className="muted-cell">{d.buyer}</td>

                  <td className="muted-cell">{d.seller}</td>

                  <td>
                    <span className="chip">
                      {d.stage + 1}/7 · {dealStages[d.stage]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (!deal) {
    return null;
  }

  return (
    <div>
      <button
        className="btn btn-ghost"
        style={{ marginBottom: 16 }}
        onClick={() => setActiveDealId(null)}
      >
        ← All Deals
      </button>

      <div className="panel-head">
        <h3>{deal.asset}</h3>

        <span className="meta">
          Buyer: {deal.buyer} · Seller: {deal.seller}
        </span>
      </div>

      <div className="pipeline">
        {dealStages.map((stage, index) => (
          <div
            key={index}
            className={`pipe-step${
              index < deal.stage ? ' done' : ''
            }${index === activeStage ? ' active' : ''}`}
            onClick={() =>
              setActiveStageMap((current) => ({
                ...current,
                [deal.id]: index,
              }))
            }
            style={{ cursor: 'pointer' }}
          >
            <div className="pipe-dot">
              {index < deal.stage ? '✓' : index + 1}
            </div>

            <span>{stage}</span>
          </div>
        ))}
      </div>

      <StageBody
        deal={deal}
        stageIdx={activeStage}
        showToast={showToast}
        onNext={() =>
          setActiveStageMap((current) => ({
            ...current,
            [deal.id]: Math.min(6, activeStage + 1),
          }))
        }
        onUpdate={() => forceUpdate((n) => n + 1)}
      />
    </div>
  );
}