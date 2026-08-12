import { useNavigate } from '@tanstack/react-router';
import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import { usePermissions } from '@core/auth/use-permissions.hook';
import { ROUTES } from '@shared/routes';
import { Text } from '@shared/ui/typography';

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
    return <Text tone="muted">{t('edit.loading')}</Text>;
  }

  if (userQuery.isError || !userQuery.data) {
    return <Text tone="muted">{t('edit.notFound')}</Text>;
  }

  return (
    <UserForm user={userQuery.data} readOnly={readOnly} onSuccess={goToList} onCancel={goToList} />
  );
}
