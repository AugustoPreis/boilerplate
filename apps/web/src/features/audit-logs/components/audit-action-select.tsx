import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import type { AuditControllerFindAllV1Action } from '@core/api/generated/boilerplateAPI.schemas';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shared/ui/select';

const ACTION_OPTIONS: AuditControllerFindAllV1Action[] = ['CREATED', 'UPDATED', 'DELETED'];
const ALL_VALUE = 'ALL';

export interface AuditActionSelectProps {
  value: AuditControllerFindAllV1Action | undefined;
  onChange: (value: AuditControllerFindAllV1Action | undefined) => void;
  disabled?: boolean;
}

export function AuditActionSelect({
  value,
  onChange,
  disabled,
}: AuditActionSelectProps): ReactElement {
  const { t } = useTranslation('auditLogs');

  function handleValueChange(nextValue: string): void {
    if (!nextValue) {
      return;
    }

    onChange(nextValue === ALL_VALUE ? undefined : (nextValue as AuditControllerFindAllV1Action));
  }

  return (
    <Select value={value ?? ALL_VALUE} onValueChange={handleValueChange} disabled={disabled}>
      <SelectTrigger aria-label={t('filters.actionLabel')} className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL_VALUE}>{t('filters.allActions')}</SelectItem>
        {ACTION_OPTIONS.map((action) => (
          <SelectItem key={action} value={action}>
            {t(`actionLabels.${action}`)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
