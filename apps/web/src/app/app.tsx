import { RouterProvider } from '@tanstack/react-router';
import type { ReactElement } from 'react';

import { I18nProvider } from './providers/i18n.provider';
import { QueryProvider } from './providers/query.provider';
import { registerRealAuthHandlers } from './providers/register-auth-handlers';
import { SessionGate } from './providers/session-gate';
import { ThemeProvider } from './providers/theme.provider';
import { ThemedToaster } from './providers/themed-toaster';
import { router } from './router/router';

registerRealAuthHandlers();

export function App(): ReactElement {
  return (
    <QueryProvider>
      <ThemeProvider>
        <I18nProvider>
          <SessionGate>
            <RouterProvider router={router} />
          </SessionGate>
          <ThemedToaster />
        </I18nProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}
