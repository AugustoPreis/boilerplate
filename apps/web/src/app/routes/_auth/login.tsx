import { createFileRoute, redirect } from '@tanstack/react-router';

import { useAuthStore } from '@core/auth/auth.store';

import { LoginPage } from '@features/auth';

export const Route = createFileRoute('/_auth/login')({
  beforeLoad: () => {
    if (useAuthStore.getState().status === 'authenticated') {
      throw redirect({ to: '/' });
    }
  },
  component: LoginPage,
});
