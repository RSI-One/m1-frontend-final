import { apiGet, apiPost } from './client';

export type Period = 'weekly' | 'monthly' | 'yearly';

export type FinanceTransactionType =
  | 'expense'
  | 'customer_acquisition_cost'
  | 'refund'
  | 'escrow'
  | 'revenue_platform_fee'
  | 'revenue_featuring_fee'
  | 'revenue_verification_fee'
  | 'revenue_monthly_retainer'
  | 'revenue_partner_registration_fee';

export type FinanceTransaction = {
  id: string;
  transaction_type: FinanceTransactionType;
  amount: number;
  transaction_date: string;
  platform?: string | null;
  description?: string | null;
  counterparty_to?: string | null;
  counterparty_from?: string | null;
  counterparty_account_number?: string | null;
  source?: string;
};

export type FinanceHistoryResponse = {
  count: number;
  results: FinanceTransaction[];
};

export type FinanceAnalytics = {
  period: Period;
  revenue_series: number[];
  revenue_labels: string[];
  revenue_30d: number;
  expenses_30d: number;
  cac_30d: number;
  profit_30d: number;
  revenue_split: Record<string, number>;
};

export type AddTransactionPayload = {
  transaction_type: FinanceTransactionType;
  amount: number;
  transaction_date: string;
  platform?: string;
  description?: string;
  counterparty_to?: string;
  counterparty_from?: string;
  counterparty_account_number?: string;
  receipt_url?: string;
};

export async function getFinanceAnalytics(
  period: Period
): Promise<FinanceAnalytics> {
  return apiGet(`/admin/finance/analytics?period=${period}`);
}

export async function getFinanceHistory(
  limit = 50,
  offset = 0,
  source?: 'stripe_auto' | 'admin_manual' | 'wire_transfer'
): Promise<FinanceHistoryResponse> {
  const q = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
    ...(source ? { source } : {}),
  });
  return apiGet(`/admin/finance/history?${q.toString()}`);
}

export async function addFinanceTransaction(
  payload: AddTransactionPayload
) {
  return apiPost('/admin/finance/add', payload);
}

export async function getFinanceDetail(transactionId: string) {
  return apiGet(`/admin/finance/${transactionId}`);
}

export async function reconcileFinance(limit = 100) {
  return apiGet(`/admin/finance/reconcile?limit=${limit}`);
}