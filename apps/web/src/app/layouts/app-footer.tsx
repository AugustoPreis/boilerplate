import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import { Box, Container, HStack } from '@shared/ui/layout';
import { Text } from '@shared/ui/typography';

export function AppFooter(): ReactElement {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <Box as="footer" className="border-t border-border bg-background">
      <Container className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
        <Text size="sm" tone="muted">
          {t('footer.copyright', { year, appName: t('appName'), version: __APP_VERSION__ })}
        </Text>
        <HStack gap={4}>
          <Text size="sm" tone="muted">
            {t('footer.links.documentation')}
          </Text>
          <Text size="sm" tone="muted">
            {t('footer.links.support')}
          </Text>
          <Text size="sm" tone="muted">
            {t('footer.links.status')}
          </Text>
        </HStack>
      </Container>
    </Box>
  );
}
