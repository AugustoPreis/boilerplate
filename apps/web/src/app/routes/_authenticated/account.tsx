import { createFileRoute } from '@tanstack/react-router';
import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import { ComingSoon } from '@shared/ui/coming-soon';

export const Route = createFileRoute('/_authenticated/account')({
  component: AccountPage,
  staticData: { breadcrumb: 'breadcrumbs.account' },
});

function AccountPage(): ReactElement {
  const { t } = useTranslation();

  return (
    <ComingSoon title={t('pages.account.title')} description={t('pages.account.description')} />
  );
}
