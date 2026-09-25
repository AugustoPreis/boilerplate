import type { ReactElement } from 'react';
import type { Control } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { FormField } from '@shared/ui/form';
import { Input } from '@shared/ui/input';
import { Stack } from '@shared/ui/layout';
import { SectionHeading } from '@shared/ui/section-heading';
import { Textarea } from '@shared/ui/textarea';

import type { CreateRoleFormValues } from '../schemas/create-role.schema';

export interface RoleFormProps {
  control: Control<CreateRoleFormValues>;
  readOnly?: boolean;
}

export function RoleForm({ control, readOnly = false }: RoleFormProps): ReactElement {
  const { t } = useTranslation('roles');

  return (
    <Stack gap={4}>
      <SectionHeading
        title={t('form.identificationTitle')}
        description={t('form.identificationDescription')}
      />

      <FormField
        control={control}
        name="name"
        label={t('form.nameLabel')}
        render={(field) => <Input type="text" maxLength={100} disabled={readOnly} {...field} />}
      />

      <FormField
        control={control}
        name="description"
        label={t('form.descriptionLabel')}
        render={(field) => <Textarea disabled={readOnly} {...field} />}
      />
    </Stack>
  );
}
