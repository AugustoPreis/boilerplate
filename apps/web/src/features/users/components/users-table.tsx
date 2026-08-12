import { useNavigate } from '@tanstack/react-router';
import { Ban, CircleCheck, Eye, Pencil, Trash2 } from 'lucide-react';
import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import type { UserResponseDTO } from '@core/api/generated/boilerplateAPI.schemas';
import { ROUTES } from '@shared/routes';
import { Avatar, AvatarFallback } from '@shared/ui/avatar';
import { Badge } from '@shared/ui/badge';
import { DataTable, type IDataTableColumn } from '@shared/ui/data-table';
import { EntityActionsMenu } from '@shared/ui/entity-actions-menu';
import { HStack, Stack } from '@shared/ui/layout';
import { Text } from '@shared/ui/typography';
import { getInitials } from '@shared/utils/get-initials';

export type UserStatus = UserResponseDTO['status'];

const STATUS_BADGE_VARIANT: Record<UserStatus, 'success' | 'secondary' | 'warning'> = {
  ACTIVE: 'success',
  INACTIVE: 'secondary',
  PENDING: 'warning',
};

function formatCreatedAt(value: string): string {
  return new Date(value).toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

export interface UsersTableProps {
  users: UserResponseDTO[];
  canUpdate: boolean;
  canDelete: boolean;
  onDelete: (user: UserResponseDTO) => void;
  onToggleStatus: (user: UserResponseDTO) => void;
}

export function UsersTable({
  users,
  canUpdate,
  canDelete,
  onDelete,
  onToggleStatus,
}: UsersTableProps): ReactElement {
  const { t } = useTranslation('users');
  const navigate = useNavigate();

  const columns: IDataTableColumn<UserResponseDTO>[] = [
    {
      key: 'user',
      header: t('table.user'),
      cell: (user) => (
        <HStack gap={3} align="center">
          <Avatar>
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>
          <Stack gap={0}>
            <Text weight="medium">{user.name}</Text>
            <Text size="sm" tone="muted">
              {user.email}
            </Text>
          </Stack>
        </HStack>
      ),
    },
    {
      key: 'roles',
      header: t('table.roles'),
      cell: (user) =>
        user.roles.length === 0 ? (
          <Text tone="muted" size="sm">
            {t('table.noRoles')}
          </Text>
        ) : (
          <HStack gap={1} wrap>
            {user.roles.map((role) => (
              <Badge key={role.uuid} variant="secondary">
                {role.name}
              </Badge>
            ))}
          </HStack>
        ),
    },
    {
      key: 'status',
      header: t('table.status'),
      cell: (user) => (
        <Badge variant={STATUS_BADGE_VARIANT[user.status]}>{t(`status.${user.status}`)}</Badge>
      ),
    },
    {
      key: 'createdAt',
      header: t('table.createdAt'),
      cell: (user) => formatCreatedAt(user.createdAt),
    },
    {
      key: 'actions',
      header: t('table.actions'),
      cell: (user) => (
        <EntityActionsMenu
          triggerLabel={t('table.openActions')}
          actions={[
            {
              key: 'view-edit',
              label: canUpdate ? t('table.editAction') : t('table.viewAction'),
              icon: canUpdate ? Pencil : Eye,
              onSelect: () => {
                void navigate({ to: ROUTES.usersEdit, params: { uuid: user.uuid } });
              },
            },
            canUpdate && {
              key: 'toggle-status',
              label:
                user.status === 'ACTIVE' ? t('table.deactivateAction') : t('table.activateAction'),
              icon: user.status === 'ACTIVE' ? Ban : CircleCheck,
              onSelect: () => onToggleStatus(user),
            },
            canDelete && {
              key: 'delete',
              label: t('table.deleteAction'),
              icon: Trash2,
              variant: 'destructive',
              separatorBefore: true,
              onSelect: () => onDelete(user),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={users}
      getRowKey={(user) => user.uuid}
      emptyMessage={
        <Text tone="muted" size="sm">
          {t('table.empty')}
        </Text>
      }
    />
  );
}
