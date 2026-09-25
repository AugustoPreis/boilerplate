import { zodResolver } from '@hookform/resolvers/zod';
import { Check } from 'lucide-react';
import type { ReactElement } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import type { RoleResponseDTO } from '@core/api/generated/boilerplateAPI.schemas';
import { mapAxiosErrorToAppError } from '@core/errors/error.mapper';
import { Button } from '@shared/ui/button';
import { FormField } from '@shared/ui/form';
import { FormPageHeader } from '@shared/ui/form-page-header';
import { Input } from '@shared/ui/input';
import { Stack } from '@shared/ui/layout';
import { SectionHeading } from '@shared/ui/section-heading';
import { Textarea } from '@shared/ui/textarea';

import { useCreateRoleMutation, useUpdateRoleMutation } from '../queries/roles.queries';
import { createRoleSchema, type CreateRoleFormValues } from '../schemas/create-role.schema';

export interface RoleFormProps {
  role?: RoleResponseDTO;
  readOnly?: boolean;
  onSuccess: (role: RoleResponseDTO) => void;
  onCancel: () => void;
}

export function RoleForm({
  role,
  readOnly = false,
  onSuccess,
  onCancel,
}: RoleFormProps): ReactElement {
  const { t } = useTranslation('roles');
  const createMutation = useCreateRoleMutation();
  const updateMutation = useUpdateRoleMutation();
  const isSaving = createMutation.isPending || updateMutation.isPending;

  const form = useForm<CreateRoleFormValues>({
    resolver: zodResolver(createRoleSchema),
    defaultValues: {
      name: role?.name ?? '',
      description: role?.description ?? '',
    },
  });

  function handleSubmit(values: CreateRoleFormValues): void {
    if (role) {
      updateMutation.mutate(
        { uuid: role.uuid, dto: values },
        {
          onSuccess: (updatedRole) => {
            toast.success(t('form.updateSuccess'));
            onSuccess(updatedRole);
          },
          onError: (error) => toast.error(mapAxiosErrorToAppError(error).message),
        },
      );

      return;
    }

    createMutation.mutate(values, {
      onSuccess: (createdRole) => {
        toast.success(t('form.createSuccess'));
        onSuccess(createdRole);
      },
      onError: (error) => toast.error(mapAxiosErrorToAppError(error).message),
    });
  }

  const title = role
    ? readOnly
      ? t('form.viewTitle')
      : t('form.editTitle')
    : t('form.createTitle');

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)}>
      <Stack gap={6}>
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

        <Stack gap={4}>
          <SectionHeading
            title={t('form.identificationTitle')}
            description={t('form.identificationDescription')}
          />

          <FormField
            control={form.control}
            name="name"
            label={t('form.nameLabel')}
            render={(field) => <Input type="text" maxLength={100} disabled={readOnly} {...field} />}
          />

          <FormField
            control={form.control}
            name="description"
            label={t('form.descriptionLabel')}
            render={(field) => <Textarea disabled={readOnly} {...field} />}
          />
        </Stack>
      </Stack>
    </form>
  );
}
