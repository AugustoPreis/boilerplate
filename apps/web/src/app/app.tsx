import { RouterProvider } from '@tanstack/react-router';
import type { ReactElement } from 'react';

import { I18nProvider } from './providers/i18n.provider';
import { ThemeProvider } from './providers/theme.provider';
import { ThemedToaster } from './providers/themed-toaster';
import { router } from './router/router';

export function App(): ReactElement {
  return (
    <ThemeProvider>
      <I18nProvider>
        <RouterProvider router={router} />
        <ThemedToaster />
      </I18nProvider>
    </ThemeProvider>
  );
}
