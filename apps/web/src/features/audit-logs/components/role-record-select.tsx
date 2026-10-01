import { useMemo, useState, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import type { RoleResponseDTO } from '@core/api/generated/boilerplateAPI.schemas';
import { useDebounce } from '@shared/hooks/use-debounce.hook';
import { ApiSelect } from '@shared/ui/api-select';

import { useRoleOptionsQuery } from '@features/roles';

export interface RoleRecordSelectProps {
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  placeholder: string;
}

export function RoleRecordSelect({
  value,
  onChange,
  placeholder,
}: RoleRecordSelectProps): ReactElement {
  const { t } = useTranslation('auditLogs');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const rolesQuery = useRoleOptionsQuery(debouncedSearch || undefined);
  const [knownRoles, setKnownRoles] = useState<RoleResponseDTO[]>([]);

  const rolesData = rolesQuery.data?.data;
  const options = useMemo(() => rolesData ?? [], [rolesData]);

  const knownRolesByUuid = useMemo(() => {
    const map = new Map<string, RoleResponseDTO>();

    for (const role of [...knownRoles, ...options]) {
      map.set(role.uuid, role);
    }

    return map;
  }, [knownRoles, options]);

  const selectedRole = value ? knownRolesByUuid.get(value) : undefined;
  const roleOptions = options.map((role) => ({ value: role.uuid, label: role.name }));

  return (
    <ApiSelect
      value={value}
      onChange={(nextValue) => {
        onChange(nextValue);
        setKnownRoles(Array.from(knownRolesByUuid.values()));
      }}
      options={roleOptions}
      selectedOption={
        selectedRole ? { value: selectedRole.uuid, label: selectedRole.name } : undefined
      }
      onSearch={setSearch}
      isLoading={rolesQuery.isLoading}
      placeholder={placeholder}
      searchPlaceholder={t('filters.roleSearchPlaceholder')}
      emptyMessage={t('filters.noRolesFound')}
    />
  );
}
