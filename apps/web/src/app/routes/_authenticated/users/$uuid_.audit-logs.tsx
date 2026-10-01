import { createFileRoute } from '@tanstack/react-router';
import type { ReactElement } from 'react';

import { requirePermission } from '@core/auth/route-guards';

import { UserAuditLogsPage } from '@features/users';

export const Route = createFileRoute('/_authenticated/users/$uuid_/audit-logs')({
  beforeLoad: requirePermission('audit', 'read'),
  component: UserAuditLogsRoute,
  staticData: { breadcrumb: 'breadcrumbs.usersAuditLogs' },
});

function UserAuditLogsRoute(): ReactElement {
  const { uuid } = Route.useParams();

  return <UserAuditLogsPage uuid={uuid} />;
}
