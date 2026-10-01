import { createFileRoute } from '@tanstack/react-router';
import type { ReactElement } from 'react';

import { requirePermission } from '@core/auth/route-guards';

import { RoleAuditLogsPage } from '@features/roles';

export const Route = createFileRoute('/_authenticated/roles/$uuid_/audit-logs')({
  beforeLoad: requirePermission('audit', 'read'),
  component: RoleAuditLogsRoute,
  staticData: { breadcrumb: 'breadcrumbs.rolesAuditLogs' },
});

function RoleAuditLogsRoute(): ReactElement {
  const { uuid } = Route.useParams();

  return <RoleAuditLogsPage uuid={uuid} />;
}
