import { createFileRoute } from '@tanstack/react-router';
import type { ReactElement } from 'react';

import { Container } from '@shared/ui/layout';

import { AccountPage } from '@features/account';

export const Route = createFileRoute('/_authenticated/account')({
  component: AccountRoute,
  staticData: { breadcrumb: 'breadcrumbs.account' },
});

function AccountRoute(): ReactElement {
  return (
    <Container>
      <AccountPage />
    </Container>
  );
}
