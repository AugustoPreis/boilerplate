import { zodResolver } from '@hookform/resolvers/zod';
import { Check } from 'lucide-react';
import type { ReactElement } from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import type {
  PermissionResponseDTO,
  RoleResponseDTO,
} from '@core/api/generated/boilerplateAPI.schemas';
import { mapAxiosErrorToAppError } from '@core/errors/error.mapper';
import type { ApiError } from '@core/errors/error.types';
import { Button } from '@shared/ui/button';
import { FormPageHeader } from '@shared/ui/form-page-header';
import { Stack } from '@shared/ui/layout';

import {
  useCreateRoleMutation,
  usePermissionsQuery,
  useUpdateRoleMutation,
  useUpdateRolePermissionsMutation,
} from '../queries/roles.queries';
import { createRoleSchema, type CreateRoleFormValues } from '../schemas/create-role.schema';
import { permissionKey } from '../utils/permission-key.util';

import { RoleForm } from './role-form';
import { RolePermissionsMatrix } from './role-permissions-matrix';

export interface RoleEditorProps {
  role?: RoleResponseDTO;
  readOnly?: boolean;
  onSaved: (role: RoleResponseDTO) => void;
  onCancel: () => void;
}

export function RoleEditor({
  role,
  readOnly = false,
  onSaved,
  onCancel,
}: RoleEditorProps): ReactElement {
  const { t } = useTranslation('roles');
  const createMutation = useCreateRoleMutation();
  const updateMutation = useUpdateRoleMutation();
  const updatePermissionsMutation = useUpdateRolePermissionsMutation();
  const permissionsQuery = usePermissionsQuery();
  const isSaving =
    createMutation.isPending || updateMutation.isPending || updatePermissionsMutation.isPending;

  const form = useForm<CreateRoleFormValues>({
    resolver: zodResolver(createRoleSchema),
    defaultValues: {
      name: role?.name ?? '',
      description: role?.description ?? '',
    },
  });

  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(
    () =>
      new Set(
        (role?.permissions ?? []).map((permission) =>
          permissionKey(permission.resource, permission.action),
        ),
      ),
  );

  const allPermissions = permissionsQuery.data?.data ?? [];

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

  async function handleSubmit(values: CreateRoleFormValues): Promise<void> {
    let savedRole: RoleResponseDTO;

    try {
      savedRole = role
        ? await updateMutation.mutateAsync({ uuid: role.uuid, dto: values })
        : await createMutation.mutateAsync(values);
    } catch (error) {
      toast.error(mapAxiosErrorToAppError(error as ApiError).message);

      return;
    }

    const permissions = allPermissions
      .filter((permission) =>
        selectedKeys.has(permissionKey(permission.resource, permission.action)),
      )
      .map((permission) => ({ resource: permission.resource, action: permission.action }));

    try {
      await updatePermissionsMutation.mutateAsync({ uuid: savedRole.uuid, dto: { permissions } });
      toast.success(role ? t('form.updateSuccess') : t('form.createSuccess'));
    } catch (error) {
      toast.error(
        t('form.savedButPermissionsFailed', {
          reason: mapAxiosErrorToAppError(error as ApiError).message,
        }),
      );
    }

    onSaved(savedRole);
  }

  const title = role
    ? readOnly
      ? t('form.viewTitle')
      : t('form.editTitle')
    : t('form.createTitle');

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)}>
      <Stack gap={8}>
        <FormPageHeader
          title={title}
          backLabel={t('form.backToList')}
          onBack={onCancel}
          actions={
            <>
              <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
                {readOnly ? t('form.back') : t('form.cancel')}
              </Button>
              {readOnly ? null : (
                <Button type="submit" disabled={isSaving}>
                  <Check size={16} aria-hidden="true" />
                  {t('form.submit')}
                </Button>
              )}
            </>
          }
        />

        <RoleForm control={form.control} readOnly={readOnly} />

        <RolePermissionsMatrix
          selectedKeys={selectedKeys}
          onToggle={toggle}
          onToggleResource={toggleResource}
          readOnly={readOnly}
        />
      </Stack>
    </form>
  );
}
