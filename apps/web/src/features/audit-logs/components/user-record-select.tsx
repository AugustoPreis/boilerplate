import { useMemo, useState, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import type { UserResponseDTO } from '@core/api/generated/boilerplateAPI.schemas';
import { ApiSelect } from '@shared/ui/api-select';

import { useUserOptions } from '../hooks/use-user-options.hook';

export interface UserRecordSelectProps {
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  placeholder: string;
}

export function UserRecordSelect({
  value,
  onChange,
  placeholder,
}: UserRecordSelectProps): ReactElement {
  const { t } = useTranslation('auditLogs');
  const { options, isLoading, setSearch } = useUserOptions();
  const [knownUsers, setKnownUsers] = useState<UserResponseDTO[]>([]);

  const knownUsersByUuid = useMemo(() => {
    const map = new Map<string, UserResponseDTO>();

    for (const user of [...knownUsers, ...options]) {
      map.set(user.uuid, user);
    }

    return map;
  }, [knownUsers, options]);

  const selectedUser = value ? knownUsersByUuid.get(value) : undefined;
  const userOptions = options.map((user) => ({
    value: user.uuid,
    label: `${user.name} (${user.email})`,
  }));

  return (
    <ApiSelect
      value={value}
      onChange={(nextValue) => {
        onChange(nextValue);
        setKnownUsers(Array.from(knownUsersByUuid.values()));
      }}
      options={userOptions}
      selectedOption={
        selectedUser
          ? { value: selectedUser.uuid, label: `${selectedUser.name} (${selectedUser.email})` }
          : undefined
      }
      onSearch={setSearch}
      isLoading={isLoading}
      placeholder={placeholder}
      searchPlaceholder={t('filters.userSearchPlaceholder')}
      emptyMessage={t('filters.noUsersFound')}
    />
  );
}
