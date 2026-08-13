import { createFileRoute } from '@tanstack/react-router';

import { requirePermission } from '@core/auth/route-guards';

import { UserNewPage } from '@features/users';

export const Route = createFileRoute('/_authenticated/users/new')({
  beforeLoad: requirePermission('users', 'create'),
  component: UserNewPage,
  staticData: { breadcrumb: 'breadcrumbs.usersNew' },
});
