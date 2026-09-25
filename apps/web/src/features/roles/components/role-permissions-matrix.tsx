import type { TFunction } from 'i18next';
import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import type { PermissionResponseDTO } from '@core/api/generated/boilerplateAPI.schemas';
import { Checkbox } from '@shared/ui/checkbox';
import { HStack, Stack } from '@shared/ui/layout';
import { LoadingState } from '@shared/ui/loading-state';
import { SectionHeading } from '@shared/ui/section-heading';
import { Text } from '@shared/ui/typography';

import { usePermissionsQuery } from '../queries/roles.queries';
import { permissionKey } from '../utils/permission-key.util';

export interface RolePermissionsMatrixProps {
  selectedKeys: Set<string>;
  onToggle: (resource: string, action: string) => void;
  onToggleResource: (resource: string, permissions: PermissionResponseDTO[]) => void;
  readOnly?: boolean;
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
  selectedKeys,
  onToggle,
  onToggleResource,
  readOnly = false,
}: RolePermissionsMatrixProps): ReactElement {
  const { t } = useTranslation('roles');
  const permissionsQuery = usePermissionsQuery();

  const allPermissions = permissionsQuery.data?.data ?? [];
  const groupedPermissions = groupByResource(allPermissions);

  if (permissionsQuery.isLoading) {
    return <LoadingState message={t('permissionsMatrix.loading')} />;
  }

  return (
    <Stack gap={4}>
      <SectionHeading
        title={t('permissionsMatrix.title')}
        description={t('permissionsMatrix.description')}
      />

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
                        onCheckedChange={() => onToggleResource(resource, permissions)}
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
                          onCheckedChange={() => onToggle(resource, permission.action)}
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
