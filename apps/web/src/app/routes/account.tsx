import { createFileRoute } from '@tanstack/react-router';
import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import { AppLayout } from '@app/layouts/app-layout';
import { ComingSoon } from '@app/layouts/coming-soon';

import { requireAuth } from '@core/auth/route-guards';

export const Route = createFileRoute('/account')({
  beforeLoad: requireAuth,
  component: AccountPage,
  staticData: { breadcrumb: 'breadcrumbs.account' },
});

function AccountPage(): ReactElement {
  const { t } = useTranslation();

  return (
    <AppLayout>
      <ComingSoon title={t('pages.account.title')} description={t('pages.account.description')} />
    </AppLayout>
  );
}
