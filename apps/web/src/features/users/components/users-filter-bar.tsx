import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import type { UsersControllerFindAllV1Status } from '@core/api/generated/boilerplateAPI.schemas';
import { Input } from '@shared/ui/input';
import { Box } from '@shared/ui/layout';

import { RoleSelect } from './role-select';
import { UserStatusSelect } from './user-status-select';

export type UsersFilterValues = {
  search: string;
  status: UsersControllerFindAllV1Status | undefined;
  roleUuid: string | undefined;
};

export interface UsersFilterBarProps {
  filters: UsersFilterValues;
  onFilter: <K extends keyof UsersFilterValues>(key: K, value: UsersFilterValues[K]) => void;
}

export function UsersFilterBar({ filters, onFilter }: UsersFilterBarProps): ReactElement {
  const { t } = useTranslation('users');

  return (
    <Box className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
      <Input
        type="text"
        value={filters.search}
        onChange={(event) => onFilter('search', event.target.value)}
        placeholder={t('filters.searchPlaceholder')}
        aria-label={t('filters.searchPlaceholder')}
      />
      <UserStatusSelect value={filters.status} onChange={(value) => onFilter('status', value)} />
      <RoleSelect value={filters.roleUuid} onChange={(value) => onFilter('roleUuid', value)} />
    </Box>
  );
}
