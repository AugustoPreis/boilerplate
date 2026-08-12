import { useState } from 'react';

import type { RoleResponseDTO } from '@core/api/generated/boilerplateAPI.schemas';
import { useDebounce } from '@shared/hooks/use-debounce.hook';

import { useRolesOptionsQuery } from '../queries/users.queries';

export interface IUseRoleOptions {
  options: RoleResponseDTO[];
  isLoading: boolean;
  search: string;
  setSearch: (search: string) => void;
}

export function useRoleOptions(): IUseRoleOptions {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);

  const rolesQuery = useRolesOptionsQuery(debouncedSearch || undefined);

  return {
    options: rolesQuery.data?.data ?? [],
    isLoading: rolesQuery.isLoading,
    search,
    setSearch,
  };
}
