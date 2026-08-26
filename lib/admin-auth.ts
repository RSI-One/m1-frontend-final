import { ROLE_PERMISSIONS, ROLE_SCOPE, ROLE_ROUTE_MAP, moduleDefs } from './admin-data';

// ============================================================
// CONFIG
// ============================================================
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? ''; // e.g. https://api.yourapp.com

// ============================================================
// TYPES
// ============================================================
type Admin = {
  id: string;
  name: string;
  role: string; // one of ROLE_PERMISSIONS keys e.g. 'MASTER_ADMIN', 'TECH_ADMIN'
  email: string;
  status: string;
  lastLogin?: string;
  createdAt?: string;
};

type ResolvedAdmin = Admin & {
  permissions: string[];
  isMaster: boolean;
  homeRoute: string;
  scope: string;
};

// Backend response shapes (trimmed to what we use) — see UserRead / UserAdminRead in OpenAPI spec
type UserReadResponse = {
  id: string;
  username: string;
  email: string;
  role: string; // 'general' | 'seller' | 'partner_member' | 'admin'
  status: string;
  created_at: string;
};

type UserAdminReadResponse = UserReadResponse & {
  admin_type?: string | null; // 'general' | 'customer_care' | 'bd' | 'executive' | 'tech'
  is_master_admin: boolean;
};

// ============================================================
// IN-MEMORY STATE
// (access token lives in memory only — never localStorage — the
//  refresh token is an httpOnly cookie the browser sends automatically)
// ============================================================
let _accessToken: string | null = null;
let _currentAdmin: ResolvedAdmin | null = null;
let _pendingLoginSessionId: string | null = null; // set after /auth/login, used by verify-pin

export function getAccessToken(): string | null {
  return _accessToken;
}

// ============================================================
// LOW-LEVEL FETCH HELPER
// ============================================================
async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  if (_accessToken) headers.set('Authorization', `Bearer ${_accessToken}`);

  return fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: 'include', // sends the httpOnly refresh-token cookie
  });
}

// ============================================================
// ROLE MAPPING
// Backend gives role='admin' + admin_type + is_master_admin.
// The rest of the app (ROLE_PERMISSIONS, ROLE_ROUTE_MAP, etc. in
// admin-data.ts) is keyed by strings like 'MASTER_ADMIN',
// 'TECH_ADMIN' — this maps backend -> those keys.
// ============================================================
function mapToRoleKey(user: UserAdminReadResponse): string {
  if (user.is_master_admin) return 'MASTER_ADMIN';
  switch (user.admin_type) {
    case 'general':
      return 'GENERAL_ADMIN';
    case 'customer_care':
      return 'CUSTOMER_CARE_ADMIN';
    case 'bd':
      return 'BD_ADMIN';
    case 'executive':
      return 'EXECUTIVE_ADMIN';
    case 'tech':
      return 'TECH_ADMIN';
    default:
      return 'GENERAL_ADMIN';
  }
}

function resolveAdmin(user: UserAdminReadResponse): ResolvedAdmin {
  const roleKey = mapToRoleKey(user);
  const scopePerms = (ROLE_PERMISSIONS as Record<string, string[]>)[roleKey] || [];
  const permissions = roleKey === 'MASTER_ADMIN' ? ['*'] : Array.from(new Set(scopePerms));

  return Object.freeze({
    id: user.id,
    name: user.username,
    email: user.email,
    status: user.status,
    createdAt: user.created_at,
    role: roleKey,
    permissions,
    isMaster: roleKey === 'MASTER_ADMIN',
    homeRoute: (ROLE_ROUTE_MAP as Record<string, string>)[roleKey] || '/admin/dashboard',
    scope: (ROLE_SCOPE as Record<string, string>)[roleKey] || roleKey.toLowerCase(),
  });
}

// ============================================================
// AUTH SERVICE
// ============================================================
export const authService = {
  /**
   * Step 1 of login: email + password.
   * Backend returns { session_id, requires_pin, pin_length } and
   * (per your PIN flow) emails/texts a PIN. Call verifyPin() next.
   */
  async login(email: string, password: string): Promise<{ requiresPin: boolean; pinLength: number }> {
    const res = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.detail ?? 'Invalid email or password');
    }
    const data: { session_id: string; requires_pin: boolean; pin_length: number } = await res.json();
    _pendingLoginSessionId = data.session_id;
    return { requiresPin: data.requires_pin, pinLength: data.pin_length };
  },

  /**
   * Step 2 of login: the PIN sent to the admin.
   * NOTE: /auth/login/verify-pin's request body isn't documented in the
   * OpenAPI spec. Sending { session_id, pin } here — adjust the field
   * names to match your actual FastAPI route if it expects something
   * different (e.g. reading session_id from a cookie instead).
   */
  async verifyPin(pin: string): Promise<ResolvedAdmin> {
    if (!_pendingLoginSessionId) {
      throw new Error('No login session in progress — call login() first.');
    }

    const res = await apiFetch('/auth/login/verify-pin', {
      method: 'POST',
      body: JSON.stringify({ session_id: _pendingLoginSessionId, pin }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.detail ?? 'Incorrect or expired PIN');
    }

    _pendingLoginSessionId = null;

    // At this point the backend should have set the refresh-token
    // httpOnly cookie. Immediately silent-refresh to get an access
    // token, then load full admin profile.
    const admin = await authService.loadCurrentAdmin();
    if (!admin) throw new Error('Login succeeded but session could not be established.');
    return admin;
  },

  /**
   * Silent session check — call this once on app/admin-panel load.
   * Tries to use the httpOnly refresh-token cookie to get a fresh
   * access token, then fetches the admin's profile. Returns null if
   * there is no valid session (caller should redirect to login).
   */
  async loadCurrentAdmin(): Promise<ResolvedAdmin | null> {
    // 1) refresh access token from the httpOnly cookie
    const refreshRes = await apiFetch('/auth/refresh', { method: 'POST' });
    if (!refreshRes.ok) {
      _currentAdmin = null;
      _accessToken = null;
      return null;
    }
    const refreshData: { access_token: string } = await refreshRes.json();
    _accessToken = refreshData.access_token;

    // 2) confirm identity + base role
    const meRes = await apiFetch('/auth/me');
    if (!meRes.ok) {
      _currentAdmin = null;
      return null;
    }
    const me: UserReadResponse = await meRes.json();

    if (me.role !== 'admin') {
      // logged in, but not an admin account — not allowed in this panel
      _currentAdmin = null;
      return null;
    }

    // 3) get admin-specific fields (admin_type, is_master_admin) by
    //    searching the admin-portal list for this user's own email
    const adminsRes = await apiFetch(`/admin-portal/admins`);
    if (!adminsRes.ok) {
      _currentAdmin = null;
      return null;
    }
    const allAdmins: UserAdminReadResponse[] = await adminsRes.json();
    const self = allAdmins.find((a) => a.id === me.id);
    if (!self) {
      _currentAdmin = null;
      return null;
    }

    _currentAdmin = resolveAdmin(self);
    return _currentAdmin;
  },

  getCurrentAdmin(): ResolvedAdmin | null {
    return _currentAdmin;
  },

  async logout(): Promise<void> {
    await apiFetch('/auth/logout', { method: 'POST' }).catch(() => {});
    _currentAdmin = null;
    _accessToken = null;
  },

  isMasterAdmin(admin?: ResolvedAdmin | null): boolean {
    const a = admin || _currentAdmin;
    return a?.isMaster === true;
  },

  hasPermission(permission: string, admin?: ResolvedAdmin | null): boolean {
    const a = admin || _currentAdmin;
    if (!a) return false;
    if (a.isMaster || a.permissions.includes('*')) return true;
    return a.permissions.includes(permission);
  },

  canAccessModule(moduleId: string, admin?: ResolvedAdmin | null): boolean {
    const a = admin || _currentAdmin;
    if (!a) return false;
    if (a.isMaster || a.permissions.includes('*')) return true;
    const module = moduleDefs.find((m: { id: string }) => m.id === moduleId);
    return !!module && this.hasPermission((module as any).requiredPermission, a);
  },

  getHomeRoute(admin?: ResolvedAdmin | null): string {
    const a = admin || _currentAdmin;
    return a?.homeRoute || '/admin/dashboard';
  },
};

// ============================================================
// AUTHORIZATION SERVICE (unchanged logic, now backed by real data)
// ============================================================
export const authorizationService = {
  canAccessModule(moduleId: string, admin?: ResolvedAdmin | null): boolean {
    return authService.canAccessModule(moduleId, admin);
  },

  canAccessRoute(path: string, admin?: ResolvedAdmin | null): boolean {
    const a = admin || _currentAdmin;
    if (!a) return false;
    if (a.isMaster) return true;

    const ROUTES: Record<string, string[]> = {
      '/admin/dashboard': ['MASTER_ADMIN'],
      '/admin/general': ['GENERAL_ADMIN'],
      '/admin/customer-care': ['CUSTOMER_CARE_ADMIN'],
      '/admin/bd': ['BD_ADMIN'],
      '/admin/executive': ['EXECUTIVE_ADMIN'],
      '/admin/tech': ['TECH_ADMIN'],
      '/admin/admin-management': ['MASTER_ADMIN'],
    };

    const allowed = ROUTES[path];
    if (!allowed) return false;
    return allowed.includes(a.role);
  },
};