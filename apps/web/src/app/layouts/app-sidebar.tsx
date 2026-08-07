import type { ReactElement } from 'react';

import { Box, Container } from '@shared/ui/layout';

import { AppNav } from './app-nav';

export function AppSidebar(): ReactElement {
  return (
    <Box as="aside" className="hidden w-64 shrink-0 border-r border-border bg-background lg:block">
      <Container className="py-6">
        <AppNav />
      </Container>
    </Box>
  );
}
