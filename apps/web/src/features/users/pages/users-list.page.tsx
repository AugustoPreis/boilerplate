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
import { ConfirmDialog } from '@shared/ui/confirm-dialog';
import { Input } from '@shared/ui/input';
import { Box, HStack, Stack } from '@shared/ui/layout';
import { Pagination } from '@shared/ui/pagination';
import { Heading } from '@shared/ui/typography';

import { RoleSelect } from '../components/role-select';
import { UserStatusSelect } from '../components/user-status-select';
import { UsersTable } from '../components/users-table';
import {
  useDeleteUserMutation,
  useUpdateUserStatusMutation,
  useUsersQuery,
} from '../queries/users.queries';

type UsersFilters = {
  search: string;
  status: UsersControllerFindAllV1Status | undefined;
  roleUuid: string | undefined;
};

export function UsersListPage(): ReactElement {
  const { t } = useTranslation('users');
  const { hasPermission } = usePermissions();

  const { page, setPage, filters, setFilter, debouncedFilters } = useListQueryParams<UsersFilters>({
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
            <Link to={ROUTES.usersNew}>
              <Plus size={16} aria-hidden="true" />
              {t('actions.create')}
            </Link>
          </Button>
        </Can>
      </HStack>

      <Box className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        <Input
          type="text"
          value={filters.search}
          onChange={(event) => setFilter('search', event.target.value)}
          placeholder={t('filters.searchPlaceholder')}
          aria-label={t('filters.searchPlaceholder')}
        />
        <UserStatusSelect value={filters.status} onChange={(value) => setFilter('status', value)} />
        <RoleSelect value={filters.roleUuid} onChange={(value) => setFilter('roleUuid', value)} />
      </Box>

      <UsersTable
        users={users}
        canUpdate={canUpdate}
        canDelete={canDelete}
        onDelete={setUserToDelete}
        onToggleStatus={handleToggleStatus}
      />

      {meta ? <Pagination meta={meta} onPageChange={setPage} /> : null}

      <ConfirmDialog
        open={Boolean(userToDelete)}
        onOpenChange={(open) => {
          if (!open) {
            setUserToDelete(null);
          }
        }}
        title={t('deleteDialog.title')}
        description={
          userToDelete ? t('deleteDialog.description', { name: userToDelete.name }) : null
        }
        confirmLabel={t('deleteDialog.confirm')}
        cancelLabel={t('deleteDialog.cancel')}
        onConfirm={handleConfirmDelete}
        isConfirming={deleteMutation.isPending}
        variant="destructive"
      />
    </Stack>
  );
}
