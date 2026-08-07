import { useNavigate } from '@tanstack/react-router';
import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@shared/ui/button';

import { useLogoutMutation } from '../queries/auth.queries';

export function LogoutButton(): ReactElement {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const logoutMutation = useLogoutMutation();

  function handleLogout(): void {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        void navigate({ to: '/login' });
      },
    });
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleLogout}
      disabled={logoutMutation.isPending}
    >
      {t('logout')}
    </Button>
  );
}
