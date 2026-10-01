import { createFileRoute } from '@tanstack/react-router';

import { requirePermission } from '@core/auth/route-guards';

import { AuditLogsListPage } from '@features/audit-logs';

export const Route = createFileRoute('/_authenticated/audit-logs/')({
  beforeLoad: requirePermission('audit', 'read'),
  component: AuditLogsListPage,
  staticData: { breadcrumb: 'breadcrumbs.auditLogs' },
});
