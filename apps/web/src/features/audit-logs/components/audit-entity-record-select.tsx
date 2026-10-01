import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import { RoleRecordSelect } from './role-record-select';
import { UserRecordSelect } from './user-record-select';

export interface AuditEntityRecordSelectProps {
  entityName: string | undefined;
  value: string | undefined;
  onChange: (value: string | undefined) => void;
}

// No picker for "permission" (no good search identity: just resource+action)
// or when no entity type is selected yet (we wouldn't know which list to
// search). Clearing the entity type also clears this filter's value — see
// the page component.
export function AuditEntityRecordSelect({
  entityName,
  value,
  onChange,
}: AuditEntityRecordSelectProps): ReactElement | null {
  const { t } = useTranslation('auditLogs');

  if (entityName === 'user') {
    return (
      <UserRecordSelect
        value={value}
        onChange={onChange}
        placeholder={t('filters.entityRecordPlaceholder')}
      />
    );
  }

  if (entityName === 'role') {
    return (
      <RoleRecordSelect
        value={value}
        onChange={onChange}
        placeholder={t('filters.entityRecordPlaceholder')}
      />
    );
  }

  return null;
}
