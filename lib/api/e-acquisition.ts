import { getAccessToken } from '../admin-auth';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '';

async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  const token = getAccessToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.detail ?? `Request failed: ${res.status}`);
  }
  if (res.status === 204) return res as any;
  return res;
}



export type RawLead = {
  id: string;
  full_name?: string;
  name?: string;
  email?: string;
  business_email?: string;
  phone_number?: string;
  location?: string;
  plane_type?: string;
  selected_aircraft_model?: string;
  passengers_count?: number;
  required_passenger_qty?: number;
  budget_min?: number;
  budget_max?: number;
  range_from_city?: string;
  range_to_city?: string;
  usage_hours_per_year?: number;
  model_year_min?: number;
  acquisition_urgency?: string;
  other_jet_suggestions?: string[];
  m1_suggested_asset_ids?: string[];
  created_at?: string;
  [key: string]: any;
};

export type Lead = {
  id: string;
  name: string;
  model: string;
  pax: number | string;
  phone: string;
  email: string;
  bizEmail: string;
  location: string;
  suggestions: string[];
  answers: string[];
};

function mapLead(raw: RawLead): Lead {
  return {
    id: raw.id,
    name: raw.full_name ?? raw.name ?? '—',
    model: raw.plane_type ?? raw.selected_aircraft_model ?? '—',
    pax: raw.passengers_count ?? raw.required_passenger_qty ?? '—',
    phone: raw.phone_number ?? '—',
    email: raw.email ?? '—',
    bizEmail: raw.business_email ?? '—',
    location: raw.location ?? '—',
    suggestions: raw.other_jet_suggestions ?? raw.m1_suggested_asset_ids ?? [],
    answers: [
      raw.plane_type && `Aircraft type: ${raw.plane_type}`,
      (raw.budget_min || raw.budget_max) &&
        `Budget: ${raw.budget_min ?? '?'} – ${raw.budget_max ?? '?'}`,
      (raw.range_from_city || raw.range_to_city) &&
        `Route: ${raw.range_from_city ?? '?'} → ${raw.range_to_city ?? '?'}`,
      raw.usage_hours_per_year && `Usage: ${raw.usage_hours_per_year} hrs/yr`,
      raw.passengers_count && `Passengers: ${raw.passengers_count}`,
      raw.model_year_min && `Min model year: ${raw.model_year_min}`,
      raw.acquisition_urgency && `Urgency: ${raw.acquisition_urgency}`,
    ].filter(Boolean) as string[],
  };
}

export type WallRow = {
  partner: string;
  hours: string | number;
};

export type EfficiencyResult = {
  id: string;
  req: string;
  latency: string;
  status: 'OK' | 'Retry';
};

// ---- API

export const eAcquisitionApi = {
  async listLeads(limit = 50, offset = 0): Promise<Lead[]> {
    const res = await apiFetch(`/admin/e-acquisition/leads?limit=${limit}&offset=${offset}`);
    const data = await res.json();
    const rows: RawLead[] = Array.isArray(data) ? data : (data?.results ?? data?.leads ?? []);
    return rows.map(mapLead);
  },

  async getLead(leadId: string): Promise<Lead> {
    const res = await apiFetch(`/admin/e-acquisition/leads/${leadId}`);
    const data = await res.json();
    return mapLead(data);
  },

  async getWallStats(): Promise<WallRow[]> {
    const res = await apiFetch('/admin/e-acquisition/m1-wall/stats');
    const data = await res.json();
    const rows = Array.isArray(data) ? data : (data?.results ?? data?.partners ?? []);
    return rows.map((r: any) => ({
      partner: r.partner ?? r.organization_name ?? r.name ?? '—',
      hours: r.hours ?? r.usage_hours ?? r.total_hours ?? '—',
    }));
  },

  async runEfficiencyTest(concurrentRequests = 10): Promise<EfficiencyResult[]> {
    const res = await apiFetch('/admin/e-acquisition/efficiency/run-test', {
      method: 'POST',
      body: JSON.stringify({ concurrent_requests: concurrentRequests }),
    });
    const data = await res.json();
    const rows = Array.isArray(data) ? data : (data?.results ?? []);
    return rows.map((r: any, i: number) => ({
      id: String(r.id ?? i),
      req: r.request ?? r.req ?? `Request #${i + 1}`,
      latency: r.latency ?? (r.latency_ms ? `${r.latency_ms}ms` : '—'),
      status: (r.status ?? (r.ok ? 'OK' : 'Retry')) as 'OK' | 'Retry',
    }));
  },
};