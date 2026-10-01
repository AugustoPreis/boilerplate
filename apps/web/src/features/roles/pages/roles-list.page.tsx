import { DEFAULT_PAGE_SIZE } from '@boilerplate/shared';
import { Link, useNavigate } from '@tanstack/react-router';
import { Plus } from 'lucide-react';
import { useMemo, useState, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import type {
  RoleResponseDTO,
  RolesControllerFindAllV1Params,
} from '@core/api/generated/boilerplateAPI.schemas';
import { Can } from '@core/auth/can';
import { usePermissions } from '@core/auth/use-permissions.hook';
import { mapAxiosErrorToAppError } from '@core/errors/error.mapper';
import { useListQueryParams } from '@shared/hooks/use-list-query-params.hook';
import { ROUTES } from '@shared/routes';
import { Button } from '@shared/ui/button';
import { Input } from '@shared/ui/input';
import { Box, HStack, Stack } from '@shared/ui/layout';
import { Pagination } from '@shared/ui/pagination';
import { Heading } from '@shared/ui/typography';

import { DeleteRoleDialog } from '../components/delete-role-dialog';
import { RolesTable } from '../components/roles-table';
import {
  useCloneRoleMutation,
  useDeleteRoleMutation,
  useRolesQuery,
} from '../queries/roles.queries';

export type RolesFilterValues = { search: string };

export function RolesListPage(): ReactElement {
  const { t } = useTranslation('roles');
  const { hasPermission } = usePermissions();
  const navigate = useNavigate();

  const { page, setPage, filters, setFilter, debouncedFilters } =
    useListQueryParams<RolesFilterValues>({ search: '' });
  const [roleToDelete, setRoleToDelete] = useState<RoleResponseDTO | null>(null);

  const deleteMutation = useDeleteRoleMutation();
  const cloneMutation = useCloneRoleMutation();

  const canUpdate = hasPermission('roles:update');
  const canDelete = hasPermission('roles:delete');
  const canClone = hasPermission('roles:create');

  const params = useMemo<RolesControllerFindAllV1Params>(
    () => ({
      page,
      perPage: DEFAULT_PAGE_SIZE,
      search: debouncedFilters.search || undefined,
    }),
    [page, debouncedFilters],
  );

  const rolesQuery = useRolesQuery(params);
  const roles = rolesQuery.data?.data ?? [];
  const meta = rolesQuery.data?.meta;

  function handleClone(role: RoleResponseDTO): void {
    cloneMutation.mutate(
      {
        uuid: role.uuid,
        dto: {
          name: `${t('actions.clonePrefix')} ${role.name}`,
          description: role.description ?? undefined,
        },
      },
      {
        onSuccess: (clonedRole) => {
          toast.success(t('actions.cloneSuccess'));
          void navigate({ to: ROUTES.roles.edit, params: { uuid: clonedRole.uuid } });
        },
        onError: (error) => toast.error(mapAxiosErrorToAppError(error).message),
      },
    );
  }

  function handleConfirmDelete(): void {
    if (!roleToDelete) {
      return;
    }

    deleteMutation.mutate(roleToDelete.uuid, {
      onSuccess: () => {
        toast.success(t('deleteDialog.success'));
        setRoleToDelete(null);
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
        <Can permission="roles:create">
          <Button type="button" asChild>
            <Link to={ROUTES.roles.new}>
              <Plus size={16} aria-hidden="true" />
              {t('actions.create')}
            </Link>
          </Button>
        </Can>
      </HStack>

      <Box className="grid grid-cols-1 gap-2 sm:max-w-sm">
        <Input
          type="text"
          value={filters.search}
          onChange={(event) => setFilter('search', event.target.value)}
          placeholder={t('filters.searchPlaceholder')}
          aria-label={t('filters.searchPlaceholder')}
        />
      </Box>

      <RolesTable
        roles={roles}
        canUpdate={canUpdate}
        canDelete={canDelete}
        canClone={canClone}
        onDelete={setRoleToDelete}
        onClone={handleClone}
      />

      {meta ? <Pagination meta={meta} onPageChange={setPage} /> : null}

      <DeleteRoleDialog
        role={roleToDelete}
        onOpenChange={(open) => {
          if (!open) {
            setRoleToDelete(null);
          }
        }}
        onConfirm={handleConfirmDelete}
        isConfirming={deleteMutation.isPending}
      />
    </Stack>
  );
}
