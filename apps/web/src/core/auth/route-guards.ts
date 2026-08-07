import { redirect } from '@tanstack/react-router';

import { useAuthStore } from './auth.store';

export function requireAuth(): void {
  if (useAuthStore.getState().status !== 'authenticated') {
    throw redirect({ to: '/login' });
  }
}

export function requireGuest(): void {
  if (useAuthStore.getState().status === 'authenticated') {
    throw redirect({ to: '/' });
  }
}
