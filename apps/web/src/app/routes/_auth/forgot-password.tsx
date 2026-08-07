import { createFileRoute, redirect } from '@tanstack/react-router';

import { useAuthStore } from '@core/auth/auth.store';

import { ForgotPasswordPage } from '@features/auth';

export const Route = createFileRoute('/_auth/forgot-password')({
  beforeLoad: () => {
    if (useAuthStore.getState().status === 'authenticated') {
      throw redirect({ to: '/' });
    }
  },
  component: ForgotPasswordPage,
});
