import { getAccessToken } from './admin-auth';

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

function qs(params: Record<string, string | number | undefined>): string {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== '');
  if (!entries.length) return '';
  return '?' + entries.map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`).join('&');
}

// ============================================================
// Shapes — /admin/databases/* responses are untyped ({}) in the
// OpenAPI spec. These match what the original mock UI expected;
// confirm field names against your actual backend response.
// ============================================================
export type DbUser = {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  pfp?: string;
};

export type DbUserSummary = {
  listings: number;
  active: number;
  featured: number;
  verified: number;
  acqRequests: number;
};

export type DbPartner = {
  id: string;
  company: string;
  location: string;
  founder: string;
  email: string;
  phone: string;
  website: string;
  members: Array<{ name: string; number: string; email: string }>;
};

export type DbAsset = {
  id: string;
  manufacturer: string;
  model: string;
  type: string;
  passengers: number;
  image?: string;
};

export type DbInventoryItem = {
  owner: string;
  asset: string;
  since: string;
  status: string;
};

export type DbOffMarketItem = {
  name: string;
  owner: string;
  ask: string;
  status: string;
};

function unwrapList<T>(data: any): T[] {
  return Array.isArray(data) ? data : (data?.results ?? data?.items ?? []);
}

export const databasesApi = {
  async listUsers(search = '', skip = 0, limit = 50): Promise<DbUser[]> {
    const res = await apiFetch(`/admin/databases/users${qs({ search, skip, limit })}`);
    return unwrapList<DbUser>(await res.json());
  },

  async getUserSummary(userId: string): Promise<DbUserSummary> {
    const res = await apiFetch(`/admin/databases/users/${userId}/summary`);
    return res.json();
  },

  async listPartners(search = '', skip = 0, limit = 50): Promise<DbPartner[]> {
    const res = await apiFetch(`/admin/databases/partners${qs({ search, skip, limit })}`);
    return unwrapList<DbPartner>(await res.json());
  },

  async addPartner(data: Record<string, any>): Promise<DbPartner> {
    const res = await apiFetch(`/admin/databases/partners`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async listAssets(search = '', skip = 0, limit = 50): Promise<DbAsset[]> {
    const res = await apiFetch(`/admin/databases/assets${qs({ search, skip, limit })}`);
    return unwrapList<DbAsset>(await res.json());
  },

  async editAsset(assetId: string, data: Record<string, any>): Promise<DbAsset> {
    const res = await apiFetch(`/admin/databases/assets/${assetId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async listInventory(skip = 0, limit = 50): Promise<DbInventoryItem[]> {
    const res = await apiFetch(`/admin/databases/inventory${qs({ skip, limit })}`);
    return unwrapList<DbInventoryItem>(await res.json());
  },

  async listOffMarket(skip = 0, limit = 50): Promise<DbOffMarketItem[]> {
    const res = await apiFetch(`/admin/databases/off-market${qs({ skip, limit })}`);
    return unwrapList<DbOffMarketItem>(await res.json());
  },
};