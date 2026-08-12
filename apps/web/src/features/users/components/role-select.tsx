import { useMemo, useState, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import type { RoleSummaryDTO } from '@core/api/generated/boilerplateAPI.schemas';
import { ApiSelect } from '@shared/ui/api-select';

import { useRoleOptions } from '../hooks/use-role-options.hook';

export interface RoleSelectProps {
  value?: string;
  onChange: (value: string | undefined) => void;
  initialRole?: RoleSummaryDTO;
  disabled?: boolean;
}

export function RoleSelect({
  value,
  onChange,
  initialRole,
  disabled,
}: RoleSelectProps): ReactElement {
  const { t } = useTranslation('users');
  const { options, isLoading, setSearch } = useRoleOptions();
  const [knownRoles, setKnownRoles] = useState<RoleSummaryDTO[]>(initialRole ? [initialRole] : []);

  // The selected role (previous search page, or already assigned when
  // editing) can scroll out of the currently loaded `options` — keep every
  // role ever seen so its label always resolves.
  const knownRolesByUuid = useMemo(() => {
    const map = new Map<string, RoleSummaryDTO>();

    for (const role of [...knownRoles, ...options]) {
      map.set(role.uuid, role);
    }

    return map;
  }, [knownRoles, options]);

  const selectedRole = value ? knownRolesByUuid.get(value) : undefined;

  function handleChange(nextValue: string | undefined): void {
    onChange(nextValue);
    setKnownRoles(Array.from(knownRolesByUuid.values()));
  }

  return (
    <ApiSelect
      value={value}
      onChange={handleChange}
      options={options.map((role) => ({ value: role.uuid, label: role.name }))}
      selectedOption={
        selectedRole ? { value: selectedRole.uuid, label: selectedRole.name } : undefined
      }
      onSearch={setSearch}
      isLoading={isLoading}
      disabled={disabled}
      placeholder={t('form.rolePlaceholder')}
      searchPlaceholder={t('form.rolesSearchPlaceholder')}
      emptyMessage={t('form.noRolesAvailable')}
    />
  );
}
