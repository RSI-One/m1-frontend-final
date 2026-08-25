import { admins, ROLE_PERMISSIONS, ROLE_SCOPE, ROLE_ROUTE_MAP, moduleDefs } from './admin-data';

let _currentAdmin = null;

export const authService = {
  loadCurrentAdmin(adminId) {
    const id = adminId || (typeof window !== 'undefined' ? (sessionStorage.getItem('adminSessionId') || 'ad1') : 'ad1');
    if (typeof window !== 'undefined') sessionStorage.setItem('adminSessionId', id);
    const admin = admins.find((a) => a.id === id && a.status === 'ACTIVE');
    if (!admin) return null;
    const scopePerms = ROLE_PERMISSIONS[admin.role] || [];
    const permissions = admin.role === 'MASTER_ADMIN' ? ['*'] : Array.from(new Set([...scopePerms]));
    _currentAdmin = Object.freeze({
      ...admin,
      permissions,
      isMaster: admin.role === 'MASTER_ADMIN',
      homeRoute: ROLE_ROUTE_MAP[admin.role] || '/admin/dashboard',
      scope: ROLE_SCOPE[admin.role] || admin.role.toLowerCase(),
    });
    return _currentAdmin;
  },
  getCurrentAdmin() { return _currentAdmin; },
  isMasterAdmin(admin) {
    const a = admin || _currentAdmin;
    return a?.isMaster === true || a?.role === 'MASTER_ADMIN';
  },
  hasPermission(permission, admin) {
    const a = admin || _currentAdmin;
    if (!a) return false;
    if (a.isMaster || a.permissions.includes('*')) return true;
    return a.permissions.includes(permission);
  },
  canAccessModule(moduleId, admin) {
    const a = admin || _currentAdmin;
    if (!a) return false;
    if (a.isMaster || a.permissions.includes('*')) return true;
    const module = moduleDefs.find((m) => m.id === moduleId);
    return !!module && this.hasPermission(module.requiredPermission, a);
  },
  getHomeRoute(admin) {
    const a = admin || _currentAdmin;
    return a?.homeRoute || '/admin/dashboard';
  },
};

export const authorizationService = {
  canAccessModule(moduleId, admin) {
    return authService.canAccessModule(moduleId, admin);
  },
  canAccessRoute(path, admin) {
    const a = admin || _currentAdmin;
    if (!a) return false;
    if (a.isMaster) return true;
    const ROUTES = {
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