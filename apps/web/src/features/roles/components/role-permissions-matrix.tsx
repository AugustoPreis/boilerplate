import type { TFunction } from 'i18next';
import { Check } from 'lucide-react';
import { useMemo, useState, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import type {
  PermissionResponseDTO,
  RoleResponseDTO,
} from '@core/api/generated/boilerplateAPI.schemas';
import { mapAxiosErrorToAppError } from '@core/errors/error.mapper';
import { Button } from '@shared/ui/button';
import { Checkbox } from '@shared/ui/checkbox';
import { HStack, Stack } from '@shared/ui/layout';
import { LoadingState } from '@shared/ui/loading-state';
import { SectionHeading } from '@shared/ui/section-heading';
import { Text } from '@shared/ui/typography';

import { usePermissionsQuery, useUpdateRolePermissionsMutation } from '../queries/roles.queries';

export interface RolePermissionsMatrixProps {
  role: RoleResponseDTO;
  readOnly?: boolean;
}

function permissionKey(resource: string, action: string): string {
  return `${resource}:${action}`;
}

function translateResource(t: TFunction, resource: string): string {
  return t(`permissionsMatrix.resources.${resource}`, { defaultValue: resource });
}

function translateAction(t: TFunction, action: string): string {
  return t(`permissionsMatrix.actions.${action}`, { defaultValue: action });
}

function groupByResource(
  permissions: PermissionResponseDTO[],
): Map<string, PermissionResponseDTO[]> {
  const groups = new Map<string, PermissionResponseDTO[]>();

  for (const permission of permissions) {
    const group = groups.get(permission.resource) ?? [];

    group.push(permission);
    groups.set(permission.resource, group);
  }

  return groups;
}

export function RolePermissionsMatrix({
  role,
  readOnly = false,
}: RolePermissionsMatrixProps): ReactElement {
  const { t } = useTranslation('roles');
  const permissionsQuery = usePermissionsQuery();
  const updatePermissionsMutation = useUpdateRolePermissionsMutation();

  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(
    () =>
      new Set(
        role.permissions.map((permission) => permissionKey(permission.resource, permission.action)),
      ),
  );

  const permissionsData = permissionsQuery.data?.data;
  const allPermissions = useMemo(() => permissionsData ?? [], [permissionsData]);
  const groupedPermissions = useMemo(() => groupByResource(allPermissions), [allPermissions]);

  function toggle(resource: string, action: string): void {
    const key = permissionKey(resource, action);

    setSelectedKeys((previous) => {
      const next = new Set(previous);

      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }

      return next;
    });
  }

  function toggleResource(resource: string, permissions: PermissionResponseDTO[]): void {
    const keys = permissions.map((permission) => permissionKey(resource, permission.action));
    const allSelected = keys.every((key) => selectedKeys.has(key));

    setSelectedKeys((previous) => {
      const next = new Set(previous);

      for (const key of keys) {
        if (allSelected) {
          next.delete(key);
        } else {
          next.add(key);
        }
      }

      return next;
    });
  }

  function handleSave(): void {
    const permissions = allPermissions
      .filter((permission) =>
        selectedKeys.has(permissionKey(permission.resource, permission.action)),
      )
      .map((permission) => ({ resource: permission.resource, action: permission.action }));

    updatePermissionsMutation.mutate(
      { uuid: role.uuid, dto: { permissions } },
      {
        onSuccess: () => toast.success(t('permissionsMatrix.updateSuccess')),
        onError: (error) => toast.error(mapAxiosErrorToAppError(error).message),
      },
    );
  }

  if (permissionsQuery.isLoading) {
    return <LoadingState message={t('permissionsMatrix.loading')} />;
  }

  return (
    <Stack gap={4}>
      <HStack justify="between" align="start" wrap gap={4}>
        <SectionHeading
          title={t('permissionsMatrix.title')}
          description={t('permissionsMatrix.description')}
        />

        {readOnly ? null : (
          <Button type="button" onClick={handleSave} disabled={updatePermissionsMutation.isPending}>
            <Check size={16} aria-hidden="true" />
            {t('permissionsMatrix.submit')}
          </Button>
        )}
      </HStack>

      {groupedPermissions.size === 0 ? (
        <Text tone="muted" size="sm">
          {t('permissionsMatrix.empty')}
        </Text>
      ) : (
        <Stack gap={6}>
          {Array.from(groupedPermissions.entries()).map(([resource, permissions]) => {
            const keys = permissions.map((permission) =>
              permissionKey(resource, permission.action),
            );
            const allSelected = keys.every((key) => selectedKeys.has(key));

            return (
              <Stack key={resource} gap={3} className="rounded-lg border border-border p-4">
                <HStack justify="between" align="center" wrap gap={2}>
                  <Text weight="medium">{translateResource(t, resource)}</Text>
                  {readOnly ? null : (
                    <HStack gap={2} align="center">
                      <Checkbox
                        id={`resource-${resource}`}
                        checked={allSelected}
                        onCheckedChange={() => toggleResource(resource, permissions)}
                      />
                      <label htmlFor={`resource-${resource}`}>
                        <Text size="sm" tone="muted">
                          {t('permissionsMatrix.selectAllInResource')}
                        </Text>
                      </label>
                    </HStack>
                  )}
                </HStack>

                <HStack gap={4} wrap>
                  {permissions.map((permission) => {
                    const key = permissionKey(resource, permission.action);

                    return (
                      <HStack key={permission.uuid} gap={2} align="center">
                        <Checkbox
                          id={`permission-${permission.uuid}`}
                          checked={selectedKeys.has(key)}
                          disabled={readOnly}
                          onCheckedChange={() => toggle(resource, permission.action)}
                        />
                        <label htmlFor={`permission-${permission.uuid}`}>
                          <Text size="sm">{translateAction(t, permission.action)}</Text>
                        </label>
                      </HStack>
                    );
                  })}
                </HStack>
              </Stack>
            );
          })}
        </Stack>
      )}
    </Stack>
  );
}
