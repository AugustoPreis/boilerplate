import { createFileRoute } from '@tanstack/react-router';

import { requirePermission } from '@core/auth/route-guards';

import { RolesListPage } from '@features/roles';

export const Route = createFileRoute('/_authenticated/roles/')({
  beforeLoad: requirePermission('roles', 'read'),
  component: RolesListPage,
  staticData: { breadcrumb: 'breadcrumbs.roles' },
});
