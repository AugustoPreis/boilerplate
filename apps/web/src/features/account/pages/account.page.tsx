import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import { Box, Stack } from '@shared/ui/layout';
import { SectionHeading } from '@shared/ui/section-heading';
import { Heading, Text } from '@shared/ui/typography';

import { AvatarUploadCard } from '../components/avatar-upload-card';
import { ChangePasswordForm } from '../components/change-password-form';

export function AccountPage(): ReactElement {
  const { t } = useTranslation('account');

  return (
    <Stack gap={6}>
      <Stack gap={1}>
        <Heading level={1}>{t('title')}</Heading>
        <Text tone="muted">{t('subtitle')}</Text>
      </Stack>

      <Box className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
        <AvatarUploadCard />

        <Stack gap={8}>
          <Stack gap={4}>
            <SectionHeading
              title={t('password.sectionTitle')}
              description={t('password.sectionDescription')}
            />
            <ChangePasswordForm />
          </Stack>
        </Stack>
      </Box>
    </Stack>
  );
}
