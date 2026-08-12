import { useMemo, useState, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import type { RoleSummaryDTO } from '@core/api/generated/boilerplateAPI.schemas';
import { MultiSelect } from '@shared/ui/multi-select';

import { useRoleOptions } from '../hooks/use-role-options.hook';

export interface RoleMultiSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  initialRoles?: RoleSummaryDTO[];
  disabled?: boolean;
}

export function RoleMultiSelect({
  value,
  onChange,
  initialRoles = [],
  disabled,
}: RoleMultiSelectProps): ReactElement {
  const { t } = useTranslation('users');
  const { options, isLoading, setSearch } = useRoleOptions();
  const [knownRoles, setKnownRoles] = useState<RoleSummaryDTO[]>(initialRoles);

  // Roles selected in a previous search page (or already assigned when
  // editing) can scroll out of the currently loaded `options` — keep every
  // role the user has ever seen selected so its label always resolves.
  const knownRolesByUuid = useMemo(() => {
    const map = new Map<string, RoleSummaryDTO>();

    for (const role of [...knownRoles, ...options]) {
      map.set(role.uuid, role);
    }

    return map;
  }, [knownRoles, options]);

  const selectedOptions = value
    .map((uuid) => knownRolesByUuid.get(uuid))
    .filter((role): role is RoleSummaryDTO => Boolean(role))
    .map((role) => ({ value: role.uuid, label: role.name }));

  function handleChange(nextValue: string[]): void {
    onChange(nextValue);
    setKnownRoles(Array.from(knownRolesByUuid.values()));
  }

  return (
    <MultiSelect
      value={value}
      onChange={handleChange}
      options={options.map((role) => ({ value: role.uuid, label: role.name }))}
      selectedOptions={selectedOptions}
      onSearch={setSearch}
      isLoading={isLoading}
      disabled={disabled}
      placeholder={t('form.rolePlaceholder')}
      searchPlaceholder={t('form.rolesSearchPlaceholder')}
      emptyMessage={t('form.noRolesAvailable')}
    />
  );
}
