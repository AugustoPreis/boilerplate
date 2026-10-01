export const ROUTES = {
  home: '/',
  login: '/login',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  account: '/account',
  preferences: '/preferences',
  settings: '/settings',
  users: {
    index: '/users',
    new: '/users/new',
    edit: '/users/$uuid',
    auditLogs: '/users/$uuid/audit-logs',
  },
  roles: {
    index: '/roles',
    new: '/roles/new',
    edit: '/roles/$uuid',
    auditLogs: '/roles/$uuid/audit-logs',
  },
  auditLogs: {
    index: '/audit-logs',
  },
} as const;
