import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import type { UsersControllerFindAllV1Status } from '@core/api/generated/boilerplateAPI.schemas';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shared/ui/select';

const STATUS_OPTIONS: UsersControllerFindAllV1Status[] = ['ACTIVE', 'INACTIVE', 'PENDING'];
const ALL_VALUE = 'ALL';

export interface UserStatusSelectProps {
  value: UsersControllerFindAllV1Status | undefined;
  onChange: (value: UsersControllerFindAllV1Status | undefined) => void;
  disabled?: boolean;
}

export function UserStatusSelect({
  value,
  onChange,
  disabled,
}: UserStatusSelectProps): ReactElement {
  const { t } = useTranslation('users');

  function handleValueChange(nextValue: string): void {
    if (!nextValue) {
      return;
    }

    onChange(nextValue === ALL_VALUE ? undefined : (nextValue as UsersControllerFindAllV1Status));
  }

  return (
    <Select value={value ?? ALL_VALUE} onValueChange={handleValueChange} disabled={disabled}>
      <SelectTrigger aria-label={t('filters.statusLabel')} className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL_VALUE}>{t('filters.allStatuses')}</SelectItem>
        {STATUS_OPTIONS.map((status) => (
          <SelectItem key={status} value={status}>
            {t(`status.${status}`)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
