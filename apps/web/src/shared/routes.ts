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
  },
} as const;
