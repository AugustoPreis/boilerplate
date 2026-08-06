import { createFileRoute } from '@tanstack/react-router';
import type { ReactElement } from 'react';

import { ThemeToggle } from '@app/providers/theme-toggle';

import { Box, Stack } from '@shared/ui/layout';
import { Heading, Text } from '@shared/ui/typography';

export const Route = createFileRoute('/')({
  component: HomePage,
});

function HomePage(): ReactElement {
  return (
    <Box as="main" className="flex min-h-screen items-center justify-center">
      <Stack align="center" gap={4}>
        <Heading level={1}>Boilerplate</Heading>
        <Text tone="muted">Vite + React + TanStack Router + Tailwind v4</Text>
        <ThemeToggle />
      </Stack>
    </Box>
  );
}
