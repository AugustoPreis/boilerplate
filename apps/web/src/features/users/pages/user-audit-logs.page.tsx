import { useNavigate } from '@tanstack/react-router';
import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import { ROUTES } from '@shared/routes';
import { FormPageHeader } from '@shared/ui/form-page-header';
import { Stack } from '@shared/ui/layout';

import { EntityAuditLogs } from '@features/audit-logs';

export interface UserAuditLogsPageProps {
  uuid: string;
}

export function UserAuditLogsPage({ uuid }: UserAuditLogsPageProps): ReactElement {
  const { t } = useTranslation('users');
  const navigate = useNavigate();

  function goToList(): void {
    void navigate({ to: ROUTES.users.index });
  }

  return (
    <Stack gap={6}>
      <FormPageHeader
        title={t('auditLogsPage.title')}
        backLabel={t('form.backToList')}
        onBack={goToList}
      />
      <EntityAuditLogs entityName="user" entityUuid={uuid} />
    </Stack>
  );
}
