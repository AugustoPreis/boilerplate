import { zodResolver } from '@hookform/resolvers/zod';
import type { ReactElement } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { mapAxiosErrorToAppError } from '@core/errors/error.mapper';
import { Button } from '@shared/ui/button';
import { FormField } from '@shared/ui/form';
import { Input } from '@shared/ui/input';
import { Stack } from '@shared/ui/layout';

import { useUpdatePasswordMutation } from '../queries/account.queries';
import {
  updatePasswordSchema,
  type UpdatePasswordFormValues,
} from '../schemas/update-password.schema';

export function ChangePasswordForm(): ReactElement {
  const { t } = useTranslation('account');
  const updatePasswordMutation = useUpdatePasswordMutation();

  const form = useForm<UpdatePasswordFormValues>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmNewPassword: '' },
  });

  function onSubmit(values: UpdatePasswordFormValues): void {
    updatePasswordMutation.mutate(values, {
      onSuccess: () => {
        toast.success(t('password.success'));
        form.reset();
      },
      onError: (error) => {
        toast.error(mapAxiosErrorToAppError(error).message);
      },
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Stack gap={4}>
        <FormField
          control={form.control}
          name="currentPassword"
          label={t('password.currentLabel')}
          render={(field) => <Input type="password" {...field} />}
        />

        <FormField
          control={form.control}
          name="newPassword"
          label={t('password.newLabel')}
          render={(field) => <Input type="password" {...field} />}
        />

        <FormField
          control={form.control}
          name="confirmNewPassword"
          label={t('password.confirmLabel')}
          render={(field) => <Input type="password" {...field} />}
        />

        <Button type="submit" disabled={updatePasswordMutation.isPending} className="self-start">
          {t('password.submit')}
        </Button>
      </Stack>
    </form>
  );
}
