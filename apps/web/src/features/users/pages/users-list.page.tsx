import { DEFAULT_PAGE_SIZE } from '@boilerplate/shared';
import { Link } from '@tanstack/react-router';
import { Plus } from 'lucide-react';
import { useMemo, useState, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import type {
  UserResponseDTO,
  UsersControllerFindAllV1Params,
  UsersControllerFindAllV1Status,
} from '@core/api/generated/boilerplateAPI.schemas';
import { Can } from '@core/auth/can';
import { usePermissions } from '@core/auth/use-permissions.hook';
import { mapAxiosErrorToAppError } from '@core/errors/error.mapper';
import { useListQueryParams } from '@shared/hooks/use-list-query-params.hook';
import { ROUTES } from '@shared/routes';
import { Button } from '@shared/ui/button';
import { HStack, Stack } from '@shared/ui/layout';
import { Pagination } from '@shared/ui/pagination';
import { Heading } from '@shared/ui/typography';

import { DeleteUserDialog } from '../components/delete-user-dialog';
import { UsersFilterBar, type UsersFilterValues } from '../components/users-filter-bar';
import { UsersTable } from '../components/users-table';
import {
  useDeleteUserMutation,
  useUpdateUserStatusMutation,
  useUsersQuery,
} from '../queries/users.queries';

export function UsersListPage(): ReactElement {
  const { t } = useTranslation('users');
  const { hasPermission } = usePermissions();

  const { page, setPage, filters, setFilter, debouncedFilters } =
    useListQueryParams<UsersFilterValues>({
      search: '',
      status: undefined,
      roleUuid: undefined,
    });
  const [userToDelete, setUserToDelete] = useState<UserResponseDTO | null>(null);

  const statusMutation = useUpdateUserStatusMutation();
  const deleteMutation = useDeleteUserMutation();

  const canUpdate = hasPermission('users:update');
  const canDelete = hasPermission('users:delete');

  const params = useMemo<UsersControllerFindAllV1Params>(
    () => ({
      page,
      perPage: DEFAULT_PAGE_SIZE,
      search: debouncedFilters.search || undefined,
      status: debouncedFilters.status,
      roleUuid: debouncedFilters.roleUuid,
    }),
    [page, debouncedFilters],
  );

  const usersQuery = useUsersQuery(params);
  const users = usersQuery.data?.data ?? [];
  const meta = usersQuery.data?.meta;

  function handleToggleStatus(user: UserResponseDTO): void {
    const nextStatus: UsersControllerFindAllV1Status =
      user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

    statusMutation.mutate(
      { uuid: user.uuid, dto: { status: nextStatus } },
      {
        onSuccess: () => toast.success(t('table.statusUpdateSuccess')),
        onError: (error) => toast.error(mapAxiosErrorToAppError(error).message),
      },
    );
  }

  function handleConfirmDelete(): void {
    if (!userToDelete) {
      return;
    }

    deleteMutation.mutate(userToDelete.uuid, {
      onSuccess: () => {
        toast.success(t('deleteDialog.success'));
        setUserToDelete(null);
      },
      onError: (error) => {
        toast.error(mapAxiosErrorToAppError(error).message);
      },
    });
  }

  return (
    <Stack gap={6}>
      <HStack justify="between" align="center" wrap>
        <Heading level={1}>{t('title')}</Heading>
        <Can permission="users:create">
          <Button type="button" asChild>
            <Link to={ROUTES.users.new}>
              <Plus size={16} aria-hidden="true" />
              {t('actions.create')}
            </Link>
          </Button>
        </Can>
      </HStack>

      <UsersFilterBar filters={filters} onFilter={setFilter} />

      <UsersTable
        users={users}
        canUpdate={canUpdate}
        canDelete={canDelete}
        onDelete={setUserToDelete}
        onToggleStatus={handleToggleStatus}
      />

      {meta ? <Pagination meta={meta} onPageChange={setPage} /> : null}

      <DeleteUserDialog
        user={userToDelete}
        onOpenChange={(open) => {
          if (!open) {
            setUserToDelete(null);
          }
        }}
        onConfirm={handleConfirmDelete}
        isConfirming={deleteMutation.isPending}
      />
    </Stack>
  );
}
