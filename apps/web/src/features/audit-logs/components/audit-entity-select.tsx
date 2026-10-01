import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shared/ui/select';

const ENTITY_OPTIONS = ['user', 'role', 'permission'] as const;
const ALL_VALUE = 'ALL';

export interface AuditEntitySelectProps {
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  disabled?: boolean;
}

export function AuditEntitySelect({
  value,
  onChange,
  disabled,
}: AuditEntitySelectProps): ReactElement {
  const { t } = useTranslation('auditLogs');

  function handleValueChange(nextValue: string): void {
    if (!nextValue) {
      return;
    }

    onChange(nextValue === ALL_VALUE ? undefined : nextValue);
  }

  return (
    <Select value={value ?? ALL_VALUE} onValueChange={handleValueChange} disabled={disabled}>
      <SelectTrigger aria-label={t('filters.entityLabel')} className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL_VALUE}>{t('filters.allEntities')}</SelectItem>
        {ENTITY_OPTIONS.map((entity) => (
          <SelectItem key={entity} value={entity}>
            {t(`entities.${entity}`)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
