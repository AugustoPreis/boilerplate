import type { ReactElement, ReactNode } from 'react';

import { Box, Container, Stack } from '@shared/ui/layout';

import { AppFooter } from './app-footer';
import { AppHeader } from './app-header';
import { AppSidebar } from './app-sidebar';

export interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps): ReactElement {
  return (
    <Box as="main" className="min-h-screen bg-background text-foreground">
      <Stack gap={0} className="min-h-screen">
        <AppHeader />

        <Box className="flex flex-1">
          <AppSidebar />

          <Box as="section" className="flex-1">
            <Container className="py-6 sm:py-8">{children}</Container>
          </Box>
        </Box>

        <AppFooter />
      </Stack>
    </Box>
  );
}
