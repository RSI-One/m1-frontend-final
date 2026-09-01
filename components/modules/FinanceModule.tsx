'use client';

import { useEffect, useState } from 'react';
import {
  getFinanceAnalytics,
  getFinanceHistory,
  addFinanceTransaction,
  type Period,
  type FinanceTransaction,
  type FinanceAnalytics,
  type FinanceTransactionType,
} from '@/lib/api/finance';
import Modal from '@/components/modals/Modal';

type NewTransaction = {
  type: FinanceTransactionType | '';
  platform: string;
  desc: string;
  to: string;
  from: string;
  amount: string;
};

type FinanceModuleProps = {
  showAdminToast?: (message: string) => void;
};

type GraphData = {
  pts: Array<[number, number]>;
  line: string;
  labels: string[];
};

function buildGraph(values: number[], labels: string[]): GraphData {
  const w = 640;
  const h = 190;
  const padL = 28;
  const padB = 22;
  const padT = 10;
  const padR = 10;

  if (values.length === 0) {
    return { pts: [], line: '', labels };
  }

  const max = Math.max(...values);
  const min = Math.min(...values);

  const stepX = (w - padL - padR) / (Math.max(values.length - 1, 1));

  const pts: Array<[number, number]> = values.map((value, index) => [
    padL + index * stepX,
    padT + (1 - (value - min) / (max - min || 1)) * (h - padT - padB),
  ]);

  const line = pts
    .map(
      (point, index) =>
        `${index === 0 ? 'M' : 'L'}${point[0].toFixed(1)},${point[1].toFixed(
          1
        )}`
    )
    .join(' ');

  return { pts, line, labels };
}

function colorForType(type: FinanceTransactionType): string {
  if (type.startsWith('revenue_')) return 'rgba(61,213,152,.14)'; // green
  if (type === 'refund') return 'rgba(232,143,196,.14)'; // pink
  if (type === 'expense') return 'rgba(255,92,92,.16)'; // red
  return 'rgba(255,255,255,.08)'; // silver (cac, escrow)
}

const revenueSplitLabels: Record<string, string> = {
  revenue_platform_fee: 'Platform fees',
  revenue_featuring_fee: 'Featuring fees',
  revenue_verification_fee: 'Verification fees',
  revenue_monthly_retainer: 'Monthly retainer',
  revenue_partner_registration_fee: 'Partner registration',
};

const transactionFields: Array<keyof NewTransaction> = [
  'type',
  'platform',
  'desc',
  'to',
  'from',
  'amount',
];

export default function FinanceModule({
  showAdminToast,
}: FinanceModuleProps) {
  const [view, setView] = useState<'overview' | 'history'>('overview');
  const [period, setPeriod] = useState<Period>('monthly');

  const [analytics, setAnalytics] = useState<FinanceAnalytics | null>(null);
  const [transactions, setTransactions] = useState<FinanceTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [txModal, setTxModal] = useState<FinanceTransaction | null>(null);
  const [addModal, setAddModal] = useState<boolean>(false);
  const [saving, setSaving] = useState(false);

  const [newTx, setNewTx] = useState<NewTransaction>({
    type: '',
    platform: '',
    desc: '',
    to: '',
    from: '',
    amount: '',
  });

  useEffect(() => {
    let cancelled = false;

    async function loadOverview() {
      setLoading(true);
      setError(null);
      try {
        const res = await getFinanceAnalytics(period);
        if (!cancelled) setAnalytics(res);
      } catch {
        if (!cancelled) {
          setError('Failed to load finance analytics.');
          showAdminToast?.('Failed to load finance analytics.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (view === 'overview') loadOverview();
    return () => {
      cancelled = true;
    };
  }, [view, period, showAdminToast]);

  useEffect(() => {
    let cancelled = false;

    async function loadHistory() {
      setLoading(true);
      setError(null);
      try {
        const res = await getFinanceHistory();
        if (!cancelled) setTransactions(res.results ?? []);
      } catch {
        if (!cancelled) {
          setError('Failed to load transaction history.');
          showAdminToast?.('Failed to load transaction history.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (view === 'history') loadHistory();
    return () => {
      cancelled = true;
    };
  }, [view, showAdminToast]);

  async function handleSaveTransaction() {
    if (!newTx.type) {
      showAdminToast?.('Transaction type is required.');
      return;
    }

    const amountNum = parseFloat(newTx.amount.replace(/[^0-9.-]/g, ''));
    if (Number.isNaN(amountNum)) {
      showAdminToast?.('Enter a valid amount.');
      return;
    }

    setSaving(true);
    try {
      await addFinanceTransaction({
        transaction_type: newTx.type,
        amount: amountNum,
        transaction_date: new Date().toISOString(),
        platform: newTx.platform || undefined,
        description: newTx.desc || undefined,
        counterparty_to: newTx.to || undefined,
        counterparty_from: newTx.from || undefined,
      });

      setAddModal(false);
      setNewTx({ type: '', platform: '', desc: '', to: '', from: '', amount: '' });
      setView('history');
      showAdminToast?.('Transaction recorded.');
    } catch {
      showAdminToast?.('Failed to save transaction.');
    } finally {
      setSaving(false);
    }
  }

  if (view === 'history') {
    return (
      <div>
        <button
          className="btn btn-ghost"
          style={{ marginBottom: 16 }}
          onClick={() => setView('overview')}
        >
          ← Overview
        </button>

        <div className="panel-head">
          <h3>Transaction History</h3>
        </div>

        {loading && <div className="meta">Loading…</div>}
        {error && <div className="chip warn">{error}</div>}

        <div className="sheet-wrap">
          <table className="sheet">
            <thead>
              <tr>
                <th>Type</th>
                <th>Platform</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>
              {transactions.map((transaction) => (
                <tr
                  key={transaction.id}
                  style={{
                    background: colorForType(transaction.transaction_type),
                    cursor: 'pointer',
                  }}
                  onClick={() => setTxModal(transaction)}
                >
                  <td>
                    <strong>{transaction.transaction_type}</strong>
                  </td>

                  <td className="muted-cell">
                    {transaction.platform ?? '—'}
                  </td>

                  <td className="muted-cell">
                    {transaction.description ?? '—'}
                  </td>

                  <td>
                    <strong>
                      ${transaction.amount.toLocaleString()}
                    </strong>
                  </td>

                  <td className="muted-cell">
                    {new Date(transaction.transaction_date).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Modal show={!!txModal} onClose={() => setTxModal(null)}>
          {txModal && (
            <>
              <h3>{txModal.transaction_type}</h3>

              <div className="sub">{txModal.description ?? '—'}</div>

              <div className="modal-card">
                <h4>Details</h4>

                <div className="detail-list">
                  <div className="item">
                    <span>From</span>
                    <strong>{txModal.counterparty_from ?? '—'}</strong>
                  </div>

                  <div className="item">
                    <span>To</span>
                    <strong>{txModal.counterparty_to ?? '—'}</strong>
                  </div>

                  <div className="item">
                    <span>Amount</span>
                    <strong>${txModal.amount.toLocaleString()}</strong>
                  </div>

                  <div className="item">
                    <span>Date</span>
                    <strong>
                      {new Date(txModal.transaction_date).toLocaleString()}
                    </strong>
                  </div>

                  <div className="item">
                    <span>Platform</span>
                    <strong>{txModal.platform ?? '—'}</strong>
                  </div>
                </div>
              </div>
            </>
          )}
        </Modal>
      </div>
    );
  }

  const graph = buildGraph(
    analytics?.revenue_series ?? [],
    analytics?.revenue_labels ?? []
  );

  return (
    <div>
      <div className="panel-head">
        <h3>Finance</h3>

        <div className="panel-actions">
          <button className="btn btn-ghost" onClick={() => setView('history')}>
            History
          </button>

          <button className="btn btn-primary" onClick={() => setAddModal(true)}>
            + Add transaction
          </button>
        </div>
      </div>

      {loading && <div className="meta">Loading…</div>}
      {error && <div className="chip warn">{error}</div>}

      <div className="graph-card" style={{ marginBottom: 18 }}>
        <div className="graph-head">
          <h3>Revenue</h3>

          <div className="period-toggle">
            {(['weekly', 'monthly', 'yearly'] as Period[]).map((p) => (
              <button
                key={p}
                className={period === p ? 'active' : ''}
                onClick={() => setPeriod(p)}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <svg className="graph-svg" viewBox="0 0 640 190" preserveAspectRatio="none">
          <path d={graph.line} fill="none" stroke="#fff" strokeWidth="2" />

          {graph.pts.map((point, index) => (
            <circle
              key={index}
              cx={point[0].toFixed(1)}
              cy={point[1].toFixed(1)}
              r="3"
              fill="#fff"
            />
          ))}
        </svg>
      </div>

      <div className="grid-cards" style={{ marginBottom: 14 }}>
        <div className="mini-card">
          <div className="num">
            ${(analytics?.revenue_30d ?? 0).toLocaleString()}
          </div>
          <div className="lbl">Revenue (30d)</div>
        </div>

        <div className="mini-card">
          <div className="num">
            ${(analytics?.expenses_30d ?? 0).toLocaleString()}
          </div>
          <div className="lbl">Expenses (30d)</div>
        </div>

        <div className="mini-card">
          <div className="num">
            ${(analytics?.cac_30d ?? 0).toLocaleString()}
          </div>
          <div className="lbl">Customer acquisition cost</div>
        </div>

        <div className="mini-card">
          <div className="num">
            ${(analytics?.profit_30d ?? 0).toLocaleString()}
          </div>
          <div className="lbl">Profit (30d)</div>
        </div>
      </div>

      <div className="modal-card">
        <h4>Revenue split</h4>

        {Object.entries(analytics?.revenue_split ?? {}).map(
          ([key, value]) => (
            <div key={key} className="deep-link-row">
              <span>{revenueSplitLabels[key] ?? key}</span>
              <span style={{ color: 'var(--muted)' }}>{value}%</span>
            </div>
          )
        )}
      </div>

      <Modal show={addModal} onClose={() => setAddModal(false)}>
        <h3>Add transaction</h3>

        {transactionFields.map((field) => (
          <div key={field} className="field-row" style={{ marginBottom: 10 }}>
            <label style={{ textTransform: 'capitalize' }}>{field}</label>

            <input
              className="field-input"
              value={newTx[field]}
              onChange={(event) =>
                setNewTx((current) => ({
                  ...current,
                  [field]: event.target.value,
                }))
              }
              placeholder={
                field === 'type'
                  ? 'e.g. revenue_featuring_fee'
                  : field === 'amount'
                    ? '$0.00'
                    : ''
              }
            />
          </div>
        ))}

        <button
          className="btn btn-primary"
          onClick={handleSaveTransaction}
          disabled={saving}
        >
          {saving ? 'Saving…' : 'Save transaction'}
        </button>
      </Modal>
    </div>
  );
}