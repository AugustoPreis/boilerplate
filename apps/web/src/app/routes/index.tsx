import { createFileRoute } from '@tanstack/react-router';
import { Moon, Sun } from 'lucide-react';
import type { ReactElement } from 'react';

import { useThemeMode } from '@app/providers/theme-mode.context';

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

function ThemeToggle(): ReactElement {
  const { resolvedMode, setMode } = useThemeMode();

  return (
    <button
      type="button"
      onClick={() => setMode(resolvedMode === 'dark' ? 'light' : 'dark')}
      className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm"
    >
      {resolvedMode === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
      {resolvedMode === 'dark' ? 'Light mode' : 'Dark mode'}
    </button>
  );
}
