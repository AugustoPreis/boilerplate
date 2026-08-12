import { zodResolver } from '@hookform/resolvers/zod';
import { Check } from 'lucide-react';
import type { ReactElement } from 'react';
import { useForm, useWatch, type Resolver } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import type { UserResponseDTO } from '@core/api/generated/boilerplateAPI.schemas';
import { mapAxiosErrorToAppError } from '@core/errors/error.mapper';
import { Avatar, AvatarFallback } from '@shared/ui/avatar';
import { Badge } from '@shared/ui/badge';
import { Button } from '@shared/ui/button';
import { FormField } from '@shared/ui/form';
import { FormPageHeader } from '@shared/ui/form-page-header';
import { Input } from '@shared/ui/input';
import { Box, Stack } from '@shared/ui/layout';
import { PasswordInput } from '@shared/ui/password-input';
import { SectionHeading } from '@shared/ui/section-heading';
import { SummaryCard } from '@shared/ui/summary-card';
import { Text } from '@shared/ui/typography';
import { getInitials } from '@shared/utils/get-initials';

import { useRoleOptions } from '../hooks/use-role-options.hook';
import { useCreateUserMutation, useUpdateUserMutation } from '../queries/users.queries';
import { createUserSchema } from '../schemas/create-user.schema';
import { updateUserSchema } from '../schemas/update-user.schema';

import { RoleSelect } from './role-select';

export interface UserFormProps {
  user?: UserResponseDTO;
  readOnly?: boolean;
  onSuccess: () => void;
  onCancel: () => void;
}

// Superset of both create/update payloads — password fields only exist (and
// are validated) by `createUserSchema`, but the form needs a single
// field-value type to stay usable by `FormField` regardless of which mode
// is active.
interface IUserFormValues {
  email: string;
  name: string;
  password?: string;
  confirmPassword?: string;
  roleUuid?: string;
}

export function UserForm({
  user,
  readOnly = false,
  onSuccess,
  onCancel,
}: UserFormProps): ReactElement {
  const { t } = useTranslation('users');
  const createMutation = useCreateUserMutation();
  const updateMutation = useUpdateUserMutation();
  const isSaving = createMutation.isPending || updateMutation.isPending;

  // The resolver's inferred type comes from whichever schema is active
  // (create vs update), so it's cast once to the shared form-value shape —
  // both schemas' outputs are structurally assignable to it.
  const resolver = zodResolver(
    user ? updateUserSchema : createUserSchema,
  ) as unknown as Resolver<IUserFormValues>;

  const form = useForm<IUserFormValues>({
    resolver,
    defaultValues: user
      ? { email: user.email, name: user.name, roleUuid: user.roles[0]?.uuid }
      : { email: '', name: '', password: '', confirmPassword: '', roleUuid: undefined },
  });

  const roleUuid = useWatch({ control: form.control, name: 'roleUuid' });
  const nameValue = useWatch({ control: form.control, name: 'name' });
  const { options: roleOptions } = useRoleOptions();
  const selectedRoleName = [...roleOptions, ...(user?.roles ?? [])].find(
    (role) => role.uuid === roleUuid,
  )?.name;
  const currentStatus = user?.status ?? 'ACTIVE';

  function handleSubmit(values: IUserFormValues): void {
    if (user) {
      updateMutation.mutate(
        {
          uuid: user.uuid,
          dto: {
            email: values.email,
            name: values.name,
            roleUuids: values.roleUuid ? [values.roleUuid] : [],
          },
        },
        {
          onSuccess: () => {
            toast.success(t('form.updateSuccess'));
            onSuccess();
          },
          onError: (error) => toast.error(mapAxiosErrorToAppError(error).message),
        },
      );

      return;
    }

    createMutation.mutate(
      {
        email: values.email,
        name: values.name,
        password: values.password ?? '',
        roleUuids: values.roleUuid ? [values.roleUuid] : [],
      },
      {
        onSuccess: () => {
          toast.success(t('form.createSuccess'));
          onSuccess();
        },
        onError: (error) => toast.error(mapAxiosErrorToAppError(error).message),
      },
    );
  }

  const title = user
    ? readOnly
      ? t('form.viewTitle')
      : t('form.editTitle')
    : t('form.createTitle');
  const subtitle = user ? t('form.editSubtitle') : t('form.createSubtitle');

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)}>
      <Stack gap={6}>
        <FormPageHeader
          title={title}
          subtitle={subtitle}
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

        <Box className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
          <Stack gap={6}>
            <Stack
              gap={3}
              align="center"
              className="rounded-lg border border-border p-4 text-center"
            >
              <Avatar className="size-20">
                <AvatarFallback className="text-lg">
                  {getInitials(user?.name || nameValue || '?')}
                </AvatarFallback>
              </Avatar>
              <Stack gap={1}>
                <Text weight="medium">{t('form.avatarTitle')}</Text>
                <Text size="sm" tone="muted">
                  {t('form.avatarHint')}
                </Text>
              </Stack>
            </Stack>

            <SummaryCard
              title={t('form.summaryTitle')}
              rows={[
                {
                  key: 'status',
                  label: t('form.summaryStatus'),
                  value: (
                    <Badge variant={currentStatus === 'ACTIVE' ? 'success' : 'secondary'}>
                      {t(`status.${currentStatus}`)}
                    </Badge>
                  ),
                },
                {
                  key: 'role',
                  label: t('form.summaryRole'),
                  value: selectedRoleName ?? t('form.summaryNoRole'),
                },
                ...(user
                  ? [
                      {
                        key: 'createdAt',
                        label: t('form.summaryCreatedAt'),
                        value: new Date(user.createdAt).toLocaleDateString('pt-BR'),
                      },
                    ]
                  : []),
              ]}
              footnote={user ? undefined : t('form.summaryCreateNote')}
            />
          </Stack>

          <Stack gap={8}>
            <Stack gap={4}>
              <SectionHeading
                title={t('form.identificationTitle')}
                description={t('form.identificationDescription')}
              />

              <Box className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  label={t('form.nameLabel')}
                  render={(field) => <Input type="text" disabled={readOnly} {...field} />}
                />

                <Stack gap={2}>
                  <FormField
                    control={form.control}
                    name="email"
                    label={t('form.emailLabel')}
                    render={(field) => <Input type="email" disabled={readOnly} {...field} />}
                  />
                  <Text size="sm" tone="muted">
                    {t('form.emailHint')}
                  </Text>
                </Stack>
              </Box>
            </Stack>

            {user ? null : (
              <Stack gap={4}>
                <SectionHeading
                  title={t('form.credentialsTitle')}
                  description={t('form.credentialsDescription')}
                />

                <Box className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Stack gap={2}>
                    <FormField
                      control={form.control}
                      name="password"
                      label={t('form.passwordLabel')}
                      render={(field) => <PasswordInput {...field} />}
                    />

                    <Text size="sm" tone="muted">
                      {t('form.passwordHint')}
                    </Text>
                  </Stack>

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    label={t('form.confirmPasswordLabel')}
                    render={(field) => <PasswordInput {...field} />}
                  />
                </Box>
              </Stack>
            )}

            <Stack gap={4}>
              <SectionHeading
                title={t('form.permissionsTitle')}
                description={t('form.permissionsDescription')}
              />

              <Box className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="roleUuid"
                  label={t('form.roleLabel')}
                  render={(field) => (
                    <RoleSelect
                      value={field.value}
                      onChange={field.onChange}
                      initialRoles={user?.roles}
                      disabled={readOnly}
                    />
                  )}
                />
              </Box>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </form>
  );
}
