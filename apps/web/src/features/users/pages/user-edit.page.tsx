import { useNavigate } from '@tanstack/react-router';
import type { ReactElement } from 'react';

import { usePermissions } from '@core/auth/use-permissions.hook';
import { ROUTES } from '@shared/routes';

import { UserFormState } from '../components/user-form-state';
import { useUserQuery } from '../queries/users.queries';

export interface UserEditPageProps {
  uuid: string;
}

export function UserEditPage({ uuid }: UserEditPageProps): ReactElement {
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const userQuery = useUserQuery(uuid);
  const readOnly = !hasPermission('users:update');

  function goToList(): void {
    void navigate({ to: ROUTES.users.index });
  }

  // Editing stays on the same page — only creation redirects to the new record.
  function handleUpdated(): void {}

  return (
    <UserFormState
      userQuery={userQuery}
      readOnly={readOnly}
      onSuccess={handleUpdated}
      onCancel={goToList}
    />
  );
}
