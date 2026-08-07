import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from '@tanstack/react-router';
import type { ReactElement } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { mapAxiosErrorToAppError } from '@core/errors/error.mapper';
import { Button } from '@shared/ui/button';
import { FormField } from '@shared/ui/form';
import { Input } from '@shared/ui/input';
import { Box, Stack } from '@shared/ui/layout';
import { Heading } from '@shared/ui/typography';

import { useResetPasswordMutation } from '../queries/auth.queries';
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from '../schemas/reset-password.schema';

export interface ResetPasswordPageProps {
  token: string;
}

export function ResetPasswordPage({ token }: ResetPasswordPageProps): ReactElement {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const resetPasswordMutation = useResetPasswordMutation();

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: '', confirmNewPassword: '' },
  });

  function onSubmit(values: ResetPasswordFormValues): void {
    resetPasswordMutation.mutate(
      { ...values, token },
      {
        onSuccess: () => {
          toast.success(t('resetPassword.success'));
          void navigate({ to: '/login' });
        },
        onError: (error) => {
          toast.error(mapAxiosErrorToAppError(error).message);
        },
      },
    );
  }

  return (
    <Box as="main" className="flex min-h-screen items-center justify-center">
      <Stack gap={6} className="w-full max-w-sm">
        <Heading level={1}>{t('resetPassword.title')}</Heading>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Stack gap={4}>
            <FormField
              control={form.control}
              name="newPassword"
              label={t('resetPassword.newPasswordLabel')}
              render={(field) => <Input type="password" {...field} />}
            />
            <FormField
              control={form.control}
              name="confirmNewPassword"
              label={t('resetPassword.confirmNewPasswordLabel')}
              render={(field) => <Input type="password" {...field} />}
            />
            <Button type="submit" disabled={resetPasswordMutation.isPending}>
              {t('resetPassword.submit')}
            </Button>
          </Stack>
        </form>
      </Stack>
    </Box>
  );
}
