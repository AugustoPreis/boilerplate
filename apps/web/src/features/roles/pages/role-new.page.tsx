import { useNavigate } from '@tanstack/react-router';
import type { ReactElement } from 'react';

import type { RoleResponseDTO } from '@core/api/generated/boilerplateAPI.schemas';
import { ROUTES } from '@shared/routes';

import { RoleEditor } from '../components/role-editor';

export function RoleNewPage(): ReactElement {
  const navigate = useNavigate();

  function goToList(): void {
    void navigate({ to: ROUTES.roles.index });
  }

  function goToCreatedRole(role: RoleResponseDTO): void {
    void navigate({ to: ROUTES.roles.edit, params: { uuid: role.uuid } });
  }

  return <RoleEditor onSaved={goToCreatedRole} onCancel={goToList} />;
}
