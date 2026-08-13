import { createFileRoute } from '@tanstack/react-router';

import { requirePermission } from '@core/auth/route-guards';

import { UsersListPage } from '@features/users';

export const Route = createFileRoute('/_authenticated/users/')({
  beforeLoad: requirePermission('users', 'read'),
  component: UsersListPage,
  staticData: { breadcrumb: 'breadcrumbs.users' },
});
