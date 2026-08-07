import { createFileRoute } from '@tanstack/react-router';
import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import { ThemeToggle } from '@app/providers/theme-toggle';

import { requireAuth } from '@core/auth/route-guards';
import { Box, Stack } from '@shared/ui/layout';
import { Heading, Text } from '@shared/ui/typography';

import { LogoutButton } from '@features/auth';

export const Route = createFileRoute('/')({
  beforeLoad: requireAuth,
  component: HomePage,
});

function HomePage(): ReactElement {
  const { t } = useTranslation();

  return (
    <Box as="main" className="flex min-h-screen items-center justify-center">
      <Stack align="center" gap={4}>
        <Heading level={1}>{t('appName')}</Heading>
        <Text tone="muted">{t('stackTagline')}</Text>
        <ThemeToggle />
        <LogoutButton />
      </Stack>
    </Box>
  );
}
