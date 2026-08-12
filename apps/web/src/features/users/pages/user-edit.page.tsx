import { useNavigate } from '@tanstack/react-router';
import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import { usePermissions } from '@core/auth/use-permissions.hook';
import { ROUTES } from '@shared/routes';
import { LoadingState } from '@shared/ui/loading-state';
import { NotFoundState } from '@shared/ui/not-found-state';

import { UserForm } from '../components/user-form';
import { useUserQuery } from '../queries/users.queries';

export interface UserEditPageProps {
  uuid: string;
}

export function UserEditPage({ uuid }: UserEditPageProps): ReactElement {
  const { t } = useTranslation('users');
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const userQuery = useUserQuery(uuid);
  const readOnly = !hasPermission('users:update');

  function goToList(): void {
    void navigate({ to: ROUTES.users });
  }

  if (userQuery.isLoading) {
    return <LoadingState message={t('edit.loading')} />;
  }

  if (userQuery.isError || !userQuery.data) {
    return <NotFoundState message={t('edit.notFound')} />;
  }

  return (
    <UserForm user={userQuery.data} readOnly={readOnly} onSuccess={goToList} onCancel={goToList} />
  );
}
