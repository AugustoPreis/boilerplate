import { RouterProvider } from '@tanstack/react-router';
import type { ReactElement } from 'react';
import { Toaster } from 'sonner';

import { useThemeMode } from './providers/theme-mode.context';
import { ThemeProvider } from './providers/theme.provider';
import { router } from './router/router';

export function App(): ReactElement {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
      <ThemedToaster />
    </ThemeProvider>
  );
}

function ThemedToaster(): ReactElement {
  const { resolvedMode } = useThemeMode();

  return <Toaster theme={resolvedMode} />;
}
