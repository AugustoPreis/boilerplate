import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import { Stack } from '@shared/ui/layout';
import { Heading } from '@shared/ui/typography';

import { AvatarUploadCard } from '../components/avatar-upload-card';
import { ChangePasswordForm } from '../components/change-password-form';

export function AccountPage(): ReactElement {
  const { t } = useTranslation('account');

  return (
    <Stack gap={8}>
      <Heading level={1}>{t('title')}</Heading>

      <Stack gap={4} className="max-w-md rounded-lg border border-border p-6">
        <Heading level={2}>{t('avatar.sectionTitle')}</Heading>
        <AvatarUploadCard />
      </Stack>

      <Stack gap={4} className="max-w-md rounded-lg border border-border p-6">
        <Heading level={2}>{t('password.sectionTitle')}</Heading>
        <ChangePasswordForm />
      </Stack>
    </Stack>
  );
}
