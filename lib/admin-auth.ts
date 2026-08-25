import { admins, ROLE_PERMISSIONS, ROLE_SCOPE, ROLE_ROUTE_MAP, moduleDefs } from './admin-data';

type Admin = {
  id: string;
  name: string;
  role: string;
  email: string;
  status: string;
  lastLogin?: string;
  createdAt?: string;
  permissions?: string[];
};

type ResolvedAdmin = Admin & {
  permissions: string[];
  isMaster: boolean;
  homeRoute: string;
  scope: string;
};

let _currentAdmin: ResolvedAdmin | null = null;

export const authService = {
  loadCurrentAdmin(adminId?: string): ResolvedAdmin | null {
    const id =
      adminId ||
      (typeof window !== 'undefined'
        ? sessionStorage.getItem('adminSessionId') || 'ad1'
        : 'ad1');
    if (typeof window !== 'undefined') sessionStorage.setItem('adminSessionId', id);

    const admin = admins.find((a: Admin) => a.id === id && a.status === 'ACTIVE');
    if (!admin) return null;

    const scopePerms = (ROLE_PERMISSIONS as Record<string, string[]>)[admin.role] || [];
    const permissions =
      admin.role === 'MASTER_ADMIN' ? ['*'] : Array.from(new Set([...scopePerms]));

    _currentAdmin = Object.freeze({
      ...admin,
      permissions,
      isMaster: admin.role === 'MASTER_ADMIN',
      homeRoute: (ROLE_ROUTE_MAP as Record<string, string>)[admin.role] || '/admin/dashboard',
      scope: (ROLE_SCOPE as Record<string, string>)[admin.role] || admin.role.toLowerCase(),
    });

    return _currentAdmin;
  },

  getCurrentAdmin(): ResolvedAdmin | null {
    return _currentAdmin;
  },

  isMasterAdmin(admin?: ResolvedAdmin | null): boolean {
    const a = admin || _currentAdmin;
    return a?.isMaster === true || a?.role === 'MASTER_ADMIN';
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