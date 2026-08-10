import { createFileRoute } from '@tanstack/react-router';
import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import { AppLayout } from '@app/layouts/app-layout';
import { ComingSoon } from '@app/layouts/coming-soon';

import { requireAuth } from '@core/auth/route-guards';

export const Route = createFileRoute('/preferences')({
  beforeLoad: requireAuth,
  component: PreferencesPage,
  staticData: { breadcrumb: 'breadcrumbs.preferences' },
});

function PreferencesPage(): ReactElement {
  const { t } = useTranslation();

  return (
    <AppLayout>
      <ComingSoon
        title={t('pages.preferences.title')}
        description={t('pages.preferences.description')}
      />
    </AppLayout>
  );
}
