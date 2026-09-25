import { useNavigate } from '@tanstack/react-router';
import { Copy, Eye, Pencil, Trash2 } from 'lucide-react';
import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import type { RoleResponseDTO } from '@core/api/generated/boilerplateAPI.schemas';
import { ROUTES } from '@shared/routes';
import { Badge } from '@shared/ui/badge';
import { DataTable, type IDataTableColumn } from '@shared/ui/data-table';
import { EntityActionsMenu } from '@shared/ui/entity-actions-menu';
import { HStack } from '@shared/ui/layout';
import { Text } from '@shared/ui/typography';

export interface RolesTableProps {
  roles: RoleResponseDTO[];
  canUpdate: boolean;
  canDelete: boolean;
  canClone: boolean;
  onDelete: (role: RoleResponseDTO) => void;
  onClone: (role: RoleResponseDTO) => void;
}

export function RolesTable({
  roles,
  canUpdate,
  canDelete,
  canClone,
  onDelete,
  onClone,
}: RolesTableProps): ReactElement {
  const { t } = useTranslation('roles');
  const navigate = useNavigate();

  const columns: IDataTableColumn<RoleResponseDTO>[] = [
    {
      key: 'name',
      header: t('table.name'),
      cell: (role) => (
        <HStack gap={2} align="center">
          <Text weight="medium">{role.name}</Text>
          {role.isReserved ? <Badge variant="secondary">{t('table.reserved')}</Badge> : null}
        </HStack>
      ),
    },
    {
      key: 'description',
      header: t('table.description'),
      cell: (role) => (
        <Text size="sm" tone="muted">
          {role.description || t('table.noDescription')}
        </Text>
      ),
    },
    {
      key: 'permissions',
      header: t('table.permissions'),
      cell: (role) => t('table.permissionsCount', { count: role.permissions.length }),
    },
    {
      key: 'actions',
      header: t('table.actions'),
      cell: (role) => (
        <EntityActionsMenu
          triggerLabel={t('table.openActions')}
          actions={[
            {
              key: 'view-edit',
              label: canUpdate ? t('table.editAction') : t('table.viewAction'),
              icon: canUpdate ? Pencil : Eye,
              onSelect: () => {
                void navigate({ to: ROUTES.roles.edit, params: { uuid: role.uuid } });
              },
            },
            canClone && {
              key: 'clone',
              label: t('table.cloneAction'),
              icon: Copy,
              onSelect: () => onClone(role),
            },
            {
              key: 'delete',
              label: t('table.deleteAction'),
              icon: Trash2,
              variant: 'destructive' as const,
              separatorBefore: true,
              disabled: !canDelete || role.isReserved,
              onSelect: () => onDelete(role),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={roles}
      getRowKey={(role) => role.uuid}
      emptyMessage={
        <Text tone="muted" size="sm">
          {t('table.empty')}
        </Text>
      }
    />
  );
}
