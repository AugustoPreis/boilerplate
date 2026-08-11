import { createFileRoute } from '@tanstack/react-router';
import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import { ComingSoon } from '@shared/ui/coming-soon';

export const Route = createFileRoute('/_authenticated/preferences')({
  component: PreferencesPage,
  staticData: { breadcrumb: 'breadcrumbs.preferences' },
});

function PreferencesPage(): ReactElement {
  const { t } = useTranslation();

  return (
    <ComingSoon
      title={t('pages.preferences.title')}
      description={t('pages.preferences.description')}
    />
  );
}
