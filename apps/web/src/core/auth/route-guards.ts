import { redirect } from '@tanstack/react-router';

import { ROUTES } from '@shared/routes';

import { useAuthStore } from './auth.store';

export function requireAuth(): void {
  if (useAuthStore.getState().status !== 'authenticated') {
    throw redirect({ to: ROUTES.login });
  }
}

export function requireGuest(): void {
  if (useAuthStore.getState().status === 'authenticated') {
    throw redirect({ to: ROUTES.home });
  }
}
