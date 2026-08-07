import { createFileRoute, redirect } from '@tanstack/react-router';
import type { ReactElement } from 'react';
import { z } from 'zod';

import { useAuthStore } from '@core/auth/auth.store';

import { ResetPasswordPage } from '@features/auth';

const resetPasswordSearchSchema = z.object({
  token: z.string(),
});

export const Route = createFileRoute('/_auth/reset-password')({
  validateSearch: resetPasswordSearchSchema,
  beforeLoad: () => {
    if (useAuthStore.getState().status === 'authenticated') {
      throw redirect({ to: '/' });
    }
  },
  component: RouteComponent,
});

function RouteComponent(): ReactElement {
  const { token } = Route.useSearch();

  return <ResetPasswordPage token={token} />;
}
