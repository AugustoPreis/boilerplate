import { useNavigate } from '@tanstack/react-router';
import type { ReactElement } from 'react';

import { ROUTES } from '@shared/routes';

import { UserForm } from '../components/user-form';

export function UserNewPage(): ReactElement {
  const navigate = useNavigate();

  function goToList(): void {
    void navigate({ to: ROUTES.users });
  }

  return <UserForm onSuccess={goToList} onCancel={goToList} />;
}
