import { createFileRoute } from '@tanstack/react-router';
import type { ReactElement } from 'react';

import { requirePermission } from '@core/auth/route-guards';

import { RoleEditPage } from '@features/roles';

export const Route = createFileRoute('/_authenticated/roles/$uuid')({
  beforeLoad: requirePermission('roles', 'read'),
  component: RoleEditRoute,
  staticData: { breadcrumb: 'breadcrumbs.rolesEdit' },
});

function RoleEditRoute(): ReactElement {
  const { uuid } = Route.useParams();

  return <RoleEditPage uuid={uuid} />;
}
