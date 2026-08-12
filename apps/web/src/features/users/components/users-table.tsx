import { Link } from '@tanstack/react-router';
import { Ban, CircleCheck, Eye, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import type { UserResponseDTO } from '@core/api/generated/boilerplateAPI.schemas';
import { ROUTES } from '@shared/routes';
import { Avatar, AvatarFallback } from '@shared/ui/avatar';
import { Badge } from '@shared/ui/badge';
import { Button } from '@shared/ui/button';
import { DataTable, type IDataTableColumn } from '@shared/ui/data-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@shared/ui/dropdown-menu';
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="ghost" size="icon" aria-label={t('table.openActions')}>
              <MoreVertical size={16} aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-fit min-w-40">
            <DropdownMenuItem asChild>
              <Link to={ROUTES.usersEdit} params={{ uuid: user.uuid }}>
                {canUpdate ? (
                  <Pencil size={14} aria-hidden="true" />
                ) : (
                  <Eye size={14} aria-hidden="true" />
                )}
                {canUpdate ? t('table.editAction') : t('table.viewAction')}
              </Link>
            </DropdownMenuItem>
            {canUpdate ? (
              <DropdownMenuItem onSelect={() => onToggleStatus(user)}>
                {user.status === 'ACTIVE' ? (
                  <Ban size={14} aria-hidden="true" />
                ) : (
                  <CircleCheck size={14} aria-hidden="true" />
                )}
                {user.status === 'ACTIVE' ? t('table.deactivateAction') : t('table.activateAction')}
              </DropdownMenuItem>
            ) : null}
            {canDelete ? (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={() => onDelete(user)}
                  className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                >
                  <Trash2 size={14} aria-hidden="true" />
                  {t('table.deleteAction')}
                </DropdownMenuItem>
              </>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
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
