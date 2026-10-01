import { MAX_PAGE_SIZE } from '@boilerplate/shared';
import { useState } from 'react';

import type { UserResponseDTO } from '@core/api/generated/boilerplateAPI.schemas';
import { useDebounce } from '@shared/hooks/use-debounce.hook';

import { useUsersQuery } from '@features/users';

export interface IUseUserOptions {
  options: UserResponseDTO[];
  isLoading: boolean;
  search: string;
  setSearch: (search: string) => void;
}

// Feeds user pickers (audit log actor/entity filters) — fetches one large
// page filtered by `search`, mirroring `useRoleOptions` in `features/users`.
export function useUserOptions(): IUseUserOptions {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);

  const usersQuery = useUsersQuery({
    perPage: MAX_PAGE_SIZE,
    search: debouncedSearch || undefined,
  });

  return {
    options: usersQuery.data?.data ?? [],
    isLoading: usersQuery.isLoading,
    search,
    setSearch,
  };
}
