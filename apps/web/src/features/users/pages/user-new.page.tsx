import { useNavigate } from '@tanstack/react-router';
import type { ReactElement } from 'react';

import type { UserResponseDTO } from '@core/api/generated/boilerplateAPI.schemas';
import { ROUTES } from '@shared/routes';

import { UserForm } from '../components/user-form';

export function UserNewPage(): ReactElement {
  const navigate = useNavigate();

  function goToList(): void {
    void navigate({ to: ROUTES.users.index });
  }

  function goToCreatedUser(user: UserResponseDTO): void {
    void navigate({ to: ROUTES.users.edit, params: { uuid: user.uuid } });
  }

  return <UserForm onSuccess={goToCreatedUser} onCancel={goToList} />;
}
