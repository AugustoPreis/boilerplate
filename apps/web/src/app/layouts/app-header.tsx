import type { ReactElement } from 'react';

import { ThemeToggle } from '@app/providers/theme-toggle';

import { Box, Container, HStack } from '@shared/ui/layout';

import { AppBreadcrumbs } from './app-breadcrumbs';
import { AppMobileNav } from './app-mobile-nav';
import { AppUserMenu } from './app-user-menu';

export function AppHeader(): ReactElement {
  return (
    <Box as="header" className="border-b border-border bg-background/95 backdrop-blur">
      <Container className="flex min-h-16 items-center justify-between gap-4 py-3">
        <HStack align="center" gap={3} className="min-w-0 flex-1">
          <AppMobileNav />
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
