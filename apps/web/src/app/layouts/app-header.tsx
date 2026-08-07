import { Link } from '@tanstack/react-router';
import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import { ThemeToggle } from '@app/providers/theme-toggle';

import { Box, Container, HStack } from '@shared/ui/layout';

import { AppBreadcrumbs } from './app-breadcrumbs';
import { AppMobileNav } from './app-mobile-nav';
import { AppUserMenu } from './app-user-menu';

export function AppHeader(): ReactElement {
  const { t } = useTranslation();

  return (
    <Box as="header" className="border-b border-border bg-background/95 backdrop-blur">
      <Container className="flex min-h-16 items-center justify-between gap-4 py-3">
        <HStack align="center" gap={3} className="min-w-0 flex-1">
          <AppMobileNav />
          <Link to="/" className="shrink-0 text-sm font-semibold text-foreground">
            {t('appName')}
          </Link>
          <AppBreadcrumbs />
        </HStack>

        <HStack align="center" gap={3}>
          <ThemeToggle />
          <AppUserMenu />
        </HStack>
      </Container>
    </Box>
  );
}
