'use client';

import { useState, useEffect, type ChangeEvent } from 'react';
import { acquisitionsApi, type AcquisitionListItem } from '@/lib/admin-acquisitions-api';

const dealStages = [
  'Coordinated Meeting',
  'M1 Asset Verification',
  'Letter of Intent',
  'Escrow',
  'M1 Inspection',
  'Final Decision',
  'Transfer of Assets',
] as const;

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

const emptyForm: FormState = {
  meetTime: '',
  meetAgent: '',
  meetNotes: '',
  verNotes: '',
  verFile: '',
  loi: '',
  escrowReceipt: '',
  escrowStatus: '',
  escrowAmount: '',
  escrowRequest: '',
  inspReports: '',
  inspSummary: '',
  decision: 'Processing',
  transfer: '',
};

type StageBodyProps = {
  stageIdx: number;
  initialData: Record<string, any>;
  loading: boolean;
  showToast?: (message: string) => void;
  onSaveNextStep: (data: FormState) => void;
  onPublishUpdate: (data: FormState) => void;
  onCancel: (reason: string) => void;
};

function StageBody({
  stageIdx,
  initialData,
  loading,
  showToast,
  onSaveNextStep,
  onPublishUpdate,
  onCancel,
}: StageBodyProps) {
  // Merge whatever the backend returned for this stage into the form.
  // The stage endpoints store an arbitrary `data` object, so field
  // names here must match what saveNextStep/publishUpdate send below.
  const [form, setForm] = useState<FormState>({ ...emptyForm, ...initialData });

  useEffect(() => {
    setForm({ ...emptyForm, ...initialData });
  }, [initialData]);

  const update =
    (key: keyof FormState) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((current) => ({
        ...current,
        [key]: e.target.value,
      }));
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
          <div key={key} className="field-row" style={{ marginBottom: 10 }}>
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
        <button className="btn btn-ghost" disabled={loading} onClick={() => onSaveNextStep(form)}>
          Next Step
        </button>

        <button className="btn btn-primary" disabled={loading} onClick={() => onPublishUpdate(form)}>
          Update
        </button>

        {stageIdx === 5 && (
          <button
            className="btn btn-danger"
            disabled={loading}
            onClick={() => {
              const reason = prompt('Reason for cancelling:');
              if (reason) onCancel(reason);
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

export default function AcquisitionModule({ showToast }: AcquisitionModuleProps) {
  const [deals, setDeals] = useState<AcquisitionListItem[]>([]);
  const [listLoading, setListLoading] = useState<boolean>(true);

  const [activeDealId, setActiveDealId] = useState<string | null>(null);
  const [activeStageMap, setActiveStageMap] = useState<Record<string, number>>({});
  const [stageData, setStageData] = useState<Record<string, any>>({});
  const [stageLoading, setStageLoading] = useState<boolean>(false);

  const deal = deals.find((d) => d.id === activeDealId);
  const activeStage = deal ? (activeStageMap[deal.id] ?? deal.stage ?? 0) : 0;

  // Load the deal list from the backend on mount.
  useEffect(() => {
    (async () => {
      try {
        setListLoading(true);
        const results = await acquisitionsApi.list();
        setDeals(results);
      } catch (err: any) {
        showToast?.(err.message ?? 'Failed to load acquisitions.');
      } finally {
        setListLoading(false);
      }
    })();
  }, [showToast]);

  // When a deal is opened (or the active stage changes), fetch that
  // stage's saved data so the form isn't empty.
  useEffect(() => {
    if (!activeDealId) return;

    (async () => {
      try {
        setStageLoading(true);
        const data =
          activeStage === 0
            ? await acquisitionsApi.getMeetings(activeDealId).catch(() => ({}))
            : await acquisitionsApi.getStage(activeDealId, activeStage).catch(() => ({}));
        setStageData(data ?? {});
      } catch (err: any) {
        showToast?.(err.message ?? 'Failed to load stage data.');
        setStageData({});
      } finally {
        setStageLoading(false);
      }
    })();
  }, [activeDealId, activeStage, showToast]);

  const handleSaveNextStep = async (form: FormState) => {
    if (!deal) return;
    try {
      setStageLoading(true);
      if (activeStage === 0) {
        await acquisitionsApi.addMeeting(deal.id, {
          meeting_time: form.meetTime,
          m1_agent_name: form.meetAgent,
          notes: form.meetNotes,
        });
      } else {
        await acquisitionsApi.saveNextStep(deal.id, activeStage, form);
      }
      showToast?.('Progress saved.');
      setActiveStageMap((current) => ({
        ...current,
        [deal.id]: Math.min(6, activeStage + 1),
      }));
    } catch (err: any) {
      showToast?.(err.message ?? 'Failed to save progress.');
    } finally {
      setStageLoading(false);
    }
  };

  const handlePublishUpdate = async (form: FormState) => {
    if (!deal) return;
    try {
      setStageLoading(true);
      await acquisitionsApi.publishUpdate(deal.id, activeStage, form);
      showToast?.('Process updated.');
      // reflect the advanced stage locally without a full refetch
      setDeals((current) =>
        current.map((d) =>
          d.id === deal.id ? { ...d, stage: Math.max(d.stage ?? 0, activeStage) } : d
        )
      );
    } catch (err: any) {
      showToast?.(err.message ?? 'Failed to update process.');
    } finally {
      setStageLoading(false);
    }
  };

  const handleCancel = async (reason: string) => {
    if (!deal) return;
    try {
      setStageLoading(true);
      await acquisitionsApi.cancel(deal.id, reason);
      showToast?.(`Process cancelled: ${reason}`);
      setDeals((current) =>
        current.map((d) => (d.id === deal.id ? { ...d, status: 'cancelled' } : d))
      );
    } catch (err: any) {
      showToast?.(err.message ?? 'Failed to cancel process.');
    } finally {
      setStageLoading(false);
    }
  };

  if (!activeDealId) {
    return (
      <div>
        <div className="panel-head">
          <h3>Acquisition / Deal Flow</h3>
          <span className="meta">
            {listLoading ? 'Loading…' : `${deals.length} active deals`}
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
                <tr key={d.id} style={{ cursor: 'pointer' }} onClick={() => setActiveDealId(d.id)}>
                  <td>
                    <strong>{d.asset ?? '—'}</strong>
                  </td>
                  <td className="muted-cell">{d.buyer ?? '—'}</td>
                  <td className="muted-cell">{d.seller ?? '—'}</td>
                  <td>
                    <span className="chip">
                      {(d.stage ?? 0) + 1}/7 · {dealStages[d.stage ?? 0]}
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
      <button className="btn btn-ghost" style={{ marginBottom: 16 }} onClick={() => setActiveDealId(null)}>
        ← All Deals
      </button>

      <div className="panel-head">
        <h3>{deal.asset ?? 'Untitled asset'}</h3>
        <span className="meta">
          Buyer: {deal.buyer ?? '—'} · Seller: {deal.seller ?? '—'}
        </span>
      </div>

      <div className="pipeline">
        {dealStages.map((stage, index) => (
          <div
            key={index}
            className={`pipe-step${index < (deal.stage ?? 0) ? ' done' : ''}${
              index === activeStage ? ' active' : ''
            }`}
            onClick={() =>
              setActiveStageMap((current) => ({
                ...current,
                [deal.id]: index,
              }))
            }
            style={{ cursor: 'pointer' }}
          >
            <div className="pipe-dot">{index < (deal.stage ?? 0) ? '✓' : index + 1}</div>
            <span>{stage}</span>
          </div>
        ))}
      </div>

      <StageBody
        stageIdx={activeStage}
        initialData={stageData}
        loading={stageLoading}
        showToast={showToast}
        onSaveNextStep={handleSaveNextStep}
        onPublishUpdate={handlePublishUpdate}
        onCancel={handleCancel}
      />
    </div>
  );
}