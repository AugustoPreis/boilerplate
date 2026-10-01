import { createFileRoute } from '@tanstack/react-router';

import { requirePermission } from '@core/auth/route-guards';

import { RoleNewPage } from '@features/roles';

export const Route = createFileRoute('/_authenticated/roles/new')({
  beforeLoad: requirePermission('roles', 'create'),
  component: RoleNewPage,
  staticData: { breadcrumb: 'breadcrumbs.rolesNew' },
});
