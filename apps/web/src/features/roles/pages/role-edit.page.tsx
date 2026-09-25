import { useNavigate } from '@tanstack/react-router';
import type { ReactElement } from 'react';

import { usePermissions } from '@core/auth/use-permissions.hook';
import { ROUTES } from '@shared/routes';

import { RoleFormState } from '../components/role-form-state';
import { useRoleQuery } from '../queries/roles.queries';

export interface RoleEditPageProps {
  uuid: string;
}

export function RoleEditPage({ uuid }: RoleEditPageProps): ReactElement {
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const roleQuery = useRoleQuery(uuid);
  const readOnly = !hasPermission('roles:update');

  function goToList(): void {
    void navigate({ to: ROUTES.roles.index });
  }

  // Editing stays on the same page — only creation redirects to the new record.
  function handleUpdated(): void {}

  return (
    <RoleFormState
      roleQuery={roleQuery}
      readOnly={readOnly}
      onSuccess={handleUpdated}
      onCancel={goToList}
    />
  );
}
