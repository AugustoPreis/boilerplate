import { createFileRoute } from '@tanstack/react-router';
import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import { AppLayout } from '@app/layouts/app-layout';
import { ComingSoon } from '@app/layouts/coming-soon';

import { requireAuth } from '@core/auth/route-guards';

export const Route = createFileRoute('/settings')({
  beforeLoad: requireAuth,
  component: SettingsPage,
  staticData: { breadcrumb: 'breadcrumbs.settings' },
});

function SettingsPage(): ReactElement {
  const { t } = useTranslation();

  return (
    <AppLayout>
      <ComingSoon title={t('pages.settings.title')} description={t('pages.settings.description')} />
    </AppLayout>
  );
}
