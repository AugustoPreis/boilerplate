import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from '@tanstack/react-router';
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

import { useLoginMutation } from '../queries/auth.queries';
import { loginSchema, type LoginFormValues } from '../schemas/login.schema';

export function LoginPage(): ReactElement {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const loginMutation = useLoginMutation();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  function onSubmit(values: LoginFormValues): void {
    loginMutation.mutate(values, {
      onSuccess: () => {
        toast.success(t('login.success'));
        void navigate({ to: '/' });
      },
      onError: (error) => {
        toast.error(mapAxiosErrorToAppError(error).message);
      },
    });
  }

  return (
    <Box as="main" className="flex min-h-screen items-center justify-center">
      <Stack gap={6} className="w-full max-w-sm">
        <Heading level={1}>{t('login.title')}</Heading>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Stack gap={4}>
            <FormField
              control={form.control}
              name="email"
              label={t('login.emailLabel')}
              render={(field) => <Input type="email" {...field} />}
            />
            <FormField
              control={form.control}
              name="password"
              label={t('login.passwordLabel')}
              render={(field) => <Input type="password" {...field} />}
            />
            <Button type="submit" disabled={loginMutation.isPending}>
              {t('login.submit')}
            </Button>
          </Stack>
        </form>
        <Link to="/forgot-password" className="text-sm underline">
          {t('login.forgotPasswordLink')}
        </Link>
      </Stack>
    </Box>
  );
}
