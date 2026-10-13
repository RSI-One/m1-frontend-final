import { getAccessToken } from './admin-auth';

function getApiBase(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL;
  if (envUrl) return envUrl.replace(/\/$/, '');
  if (typeof window !== 'undefined') return '/backend';
  return 'http://127.0.0.1:8000';
}

function unwrapData<T = any>(payload: any): T {
  if (payload && typeof payload === 'object' && 'data' in payload && payload.data !== undefined && 'success' in payload) {
    return payload.data as T;
  }
  return payload as T;
}

async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  const token = getAccessToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const base = getApiBase();
  let url = path;
  if (!url.startsWith('http')) {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    url = base && cleanPath.startsWith(base) ? cleanPath : `${base}${cleanPath}`;
  }

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.detail ?? err?.message ?? `Request failed: ${res.status}`);
  }

  // some endpoints (204) have no body
  if (res.status === 204) return res as any;
  return res;
}


export type AcquisitionListItem = {
  id: string;
  asset?: string; // e.g. "Gulfstream G650"
  buyer?: string;
  seller?: string;
  stage?: number; 
  status?: string; // 'active' | 'cancelled' | 'completed'
};

export type AcquisitionDetail = AcquisitionListItem & {
  [key: string]: any; // stage-specific data lives under generic keys
};


const toStageNumber = (stageIdx: number) => stageIdx + 1;

export const acquisitionsApi = {
  async list(status?: 'active' | 'cancelled' | 'completed'): Promise<AcquisitionListItem[]> {
    const qs = status ? `?status=${status}` : '';
    const res = await apiFetch(`/admin/acquisitions${qs}`);
    const raw = await res.json();
    const data = unwrapData(raw);
    return Array.isArray(data) ? data : (data?.results ?? []);
  },

  async get(acquisitionId: string): Promise<AcquisitionDetail> {
    const res = await apiFetch(`/admin/acquisitions/${acquisitionId}`);
    return unwrapData<AcquisitionDetail>(await res.json());
  },

  async getStage(acquisitionId: string, stageIdx: number): Promise<Record<string, any>> {
    const res = await apiFetch(
      `/admin/acquisitions/${acquisitionId}/stage/${toStageNumber(stageIdx)}`
    );
    return unwrapData<Record<string, any>>(await res.json());
  },

  async saveNextStep(acquisitionId: string, stageIdx: number, data: Record<string, any>) {
    const res = await apiFetch(
      `/admin/acquisitions/${acquisitionId}/stage/${toStageNumber(stageIdx)}/next-step`,
      { method: 'PATCH', body: JSON.stringify({ data }) }
    );
    return unwrapData(await res.json());
  },

  async publishUpdate(acquisitionId: string, stageIdx: number, data: Record<string, any>) {
    const res = await apiFetch(
      `/admin/acquisitions/${acquisitionId}/stage/${toStageNumber(stageIdx)}/update`,
      { method: 'PATCH', body: JSON.stringify({ data }) }
    );
    return unwrapData(await res.json());
  },

  async getMeetings(acquisitionId: string) {
    const res = await apiFetch(`/admin/acquisitions/${acquisitionId}/meetings`);
    return unwrapData(await res.json());
  },

  /** Stage 0 ("Coordinated Meeting") has its own dedicated endpoint. */
  async addMeeting(
    acquisitionId: string,
    payload: { meeting_time: string; m1_agent_name: string; notes?: string }
  ) {
    const res = await apiFetch(`/admin/acquisitions/${acquisitionId}/meetings`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return unwrapData(await res.json());
  },

  async cancel(acquisitionId: string, reason: string) {
    const res = await apiFetch(`/admin/acquisitions/${acquisitionId}/cancel`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    });
    return unwrapData(await res.json());
  },

  async linkInventory(acquisitionId: string, inventoryId: string) {
    const res = await apiFetch(`/admin/acquisitions/${acquisitionId}/link-inventory`, {
      method: 'PATCH',
      body: JSON.stringify({ inventory_id: inventoryId }),
    });
    return unwrapData(await res.json());
  },
};