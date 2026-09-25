import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, type ReactElement } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import type { RoleResponseDTO } from '@core/api/generated/boilerplateAPI.schemas';
import { mapAxiosErrorToAppError } from '@core/errors/error.mapper';
import { Button } from '@shared/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@shared/ui/dialog';
import { FormField } from '@shared/ui/form';
import { Input } from '@shared/ui/input';
import { Stack } from '@shared/ui/layout';

import { useCloneRoleMutation } from '../queries/roles.queries';
import { createRoleSchema, type CreateRoleFormValues } from '../schemas/create-role.schema';

export interface CloneRoleDialogProps {
  role: RoleResponseDTO | null;
  onOpenChange: (open: boolean) => void;
  onSuccess: (role: RoleResponseDTO) => void;
}

export function CloneRoleDialog({
  role,
  onOpenChange,
  onSuccess,
}: CloneRoleDialogProps): ReactElement {
  const { t } = useTranslation('roles');
  const cloneMutation = useCloneRoleMutation();

  const form = useForm<CreateRoleFormValues>({
    resolver: zodResolver(createRoleSchema),
    defaultValues: { name: '', description: '' },
  });

  useEffect(() => {
    if (role) {
      form.reset({ name: '', description: '' });
    }
  }, [role, form]);

  function handleSubmit(values: CreateRoleFormValues): void {
    if (!role) {
      return;
    }

    cloneMutation.mutate(
      { uuid: role.uuid, dto: values },
      {
        onSuccess: (clonedRole) => {
          toast.success(t('cloneDialog.success'));
          onSuccess(clonedRole);
        },
        onError: (error) => toast.error(mapAxiosErrorToAppError(error).message),
      },
    );
  }

  return (
    <Dialog open={Boolean(role)} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <DialogHeader>
            <DialogTitle>{t('cloneDialog.title')}</DialogTitle>
            <DialogDescription>
              {role ? t('cloneDialog.description', { name: role.name }) : null}
            </DialogDescription>
          </DialogHeader>

          <Stack gap={4} className="mt-4">
            <FormField
              control={form.control}
              name="name"
              label={t('cloneDialog.nameLabel')}
              render={(field) => <Input type="text" {...field} />}
            />

            <FormField
              control={form.control}
              name="description"
              label={t('cloneDialog.descriptionLabel')}
              render={(field) => <Input type="text" {...field} />}
            />
          </Stack>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={cloneMutation.isPending}
            >
              {t('cloneDialog.cancel')}
            </Button>
            <Button type="submit" disabled={cloneMutation.isPending}>
              {t('cloneDialog.confirm')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
