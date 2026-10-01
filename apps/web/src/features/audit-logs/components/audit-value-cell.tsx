import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import { Text } from '@shared/ui/typography';

import type { IAuditValueDisplay } from '../utils/audit-value-display.util';

export interface AuditValueCellProps {
  display: IAuditValueDisplay;
}

export function AuditValueCell({ display }: AuditValueCellProps): ReactElement {
  const { t } = useTranslation('auditLogs');

  if (display.kind === 'deleted') {
    return (
      <Text size="sm" tone="muted">
        {t('changes.deletedPlaceholder')}
      </Text>
    );
  }

  if (display.kind === 'empty') {
    return (
      <Text size="sm" tone="muted" className="italic">
        {t('changes.emptyPlaceholder')}
      </Text>
    );
  }

  return <Text size="sm">{display.text}</Text>;
}
