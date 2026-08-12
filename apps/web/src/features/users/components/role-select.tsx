import { useMemo, useState, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import type { RoleSummaryDTO } from '@core/api/generated/boilerplateAPI.schemas';
import { ApiSelect } from '@shared/ui/api-select';
import { MultiSelect } from '@shared/ui/multi-select';

import { useRoleOptions } from '../hooks/use-role-options.hook';

interface IRoleSelectSingleProps {
  multiple?: false;
  value?: string;
  onChange: (value: string | undefined) => void;
  initialRoles?: RoleSummaryDTO[];
  disabled?: boolean;
}

interface IRoleSelectMultipleProps {
  multiple: true;
  value: string[];
  onChange: (value: string[]) => void;
  initialRoles?: RoleSummaryDTO[];
  disabled?: boolean;
}

export type RoleSelectProps = IRoleSelectSingleProps | IRoleSelectMultipleProps;

export function RoleSelect(props: RoleSelectProps): ReactElement {
  const { t } = useTranslation('users');
  const { options, isLoading, setSearch } = useRoleOptions();
  const [knownRoles, setKnownRoles] = useState<RoleSummaryDTO[]>(props.initialRoles ?? []);

  // The selected role(s) (previous search page, or already assigned when
  // editing) can scroll out of the currently loaded `options` — keep every
  // role ever seen so its label always resolves.
  const knownRolesByUuid = useMemo(() => {
    const map = new Map<string, RoleSummaryDTO>();

    for (const role of [...knownRoles, ...options]) {
      map.set(role.uuid, role);
    }

    return map;
  }, [knownRoles, options]);

  const roleOptions = options.map((role) => ({ value: role.uuid, label: role.name }));

  if (props.multiple) {
    const selectedOptions = props.value
      .map((uuid) => knownRolesByUuid.get(uuid))
      .filter((role): role is RoleSummaryDTO => Boolean(role))
      .map((role) => ({ value: role.uuid, label: role.name }));

    return (
      <MultiSelect
        value={props.value}
        onChange={(nextValue) => {
          props.onChange(nextValue);
          setKnownRoles(Array.from(knownRolesByUuid.values()));
        }}
        options={roleOptions}
        selectedOptions={selectedOptions}
        onSearch={setSearch}
        isLoading={isLoading}
        disabled={props.disabled}
        placeholder={t('form.rolePlaceholder')}
        searchPlaceholder={t('form.rolesSearchPlaceholder')}
        emptyMessage={t('form.noRolesAvailable')}
      />
    );
  }

  const selectedRole = props.value ? knownRolesByUuid.get(props.value) : undefined;

  return (
    <ApiSelect
      value={props.value}
      onChange={(nextValue) => {
        props.onChange(nextValue);
        setKnownRoles(Array.from(knownRolesByUuid.values()));
      }}
      options={roleOptions}
      selectedOption={
        selectedRole ? { value: selectedRole.uuid, label: selectedRole.name } : undefined
      }
      onSearch={setSearch}
      isLoading={isLoading}
      disabled={props.disabled}
      placeholder={t('form.rolePlaceholder')}
      searchPlaceholder={t('form.rolesSearchPlaceholder')}
      emptyMessage={t('form.noRolesAvailable')}
    />
  );
}
