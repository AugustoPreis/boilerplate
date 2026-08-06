import { RouterProvider } from '@tanstack/react-router';
import type { ReactElement } from 'react';

import { ThemeProvider } from './providers/theme.provider';
import { ThemedToaster } from './providers/themed-toaster';
import { router } from './router/router';

export function App(): ReactElement {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
      <ThemedToaster />
    </ThemeProvider>
  );
}
