export const ROUTES: Record<string, string> = {
  home: '/',
  login: '/login',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  account: '/account',
  preferences: '/preferences',
  settings: '/settings',
  users: '/users',
  usersNew: '/users/new',
  usersEdit: '/users/$uuid',
} as const;
