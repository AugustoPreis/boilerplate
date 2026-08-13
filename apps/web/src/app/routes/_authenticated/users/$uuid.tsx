import { createFileRoute } from '@tanstack/react-router';
import type { ReactElement } from 'react';

import { requirePermission } from '@core/auth/route-guards';

import { UserEditPage } from '@features/users';

export const Route = createFileRoute('/_authenticated/users/$uuid')({
  beforeLoad: requirePermission('users', 'read'),
  component: UserEditRoute,
  staticData: { breadcrumb: 'breadcrumbs.usersEdit' },
});

function UserEditRoute(): ReactElement {
  const { uuid } = Route.useParams();

  return <UserEditPage uuid={uuid} />;
}
