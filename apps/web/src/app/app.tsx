import { RouterProvider } from '@tanstack/react-router';
import type { ReactElement } from 'react';

import { router } from './router/router';

export function App(): ReactElement {
  return <RouterProvider router={router} />;
}
