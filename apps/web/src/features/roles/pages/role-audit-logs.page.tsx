import { useNavigate } from '@tanstack/react-router';
import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import { ROUTES } from '@shared/routes';
import { FormPageHeader } from '@shared/ui/form-page-header';
import { Stack } from '@shared/ui/layout';

import { EntityAuditLogs } from '@features/audit-logs';

export interface RoleAuditLogsPageProps {
  uuid: string;
}

export function RoleAuditLogsPage({ uuid }: RoleAuditLogsPageProps): ReactElement {
  const { t } = useTranslation('roles');
  const navigate = useNavigate();

  function goToList(): void {
    void navigate({ to: ROUTES.roles.index });
  }

  return (
    <Stack gap={6}>
      <FormPageHeader
        title={t('auditLogsPage.title')}
        backLabel={t('form.backToList')}
        onBack={goToList}
      />
      <EntityAuditLogs entityName="role" entityUuid={uuid} />
    </Stack>
  );
}
