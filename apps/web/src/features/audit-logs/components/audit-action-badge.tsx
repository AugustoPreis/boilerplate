import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import type { AuditLogResponseDTOAction } from '@core/api/generated/boilerplateAPI.schemas';
import { Badge, type BadgeProps } from '@shared/ui/badge';

const ACTION_VARIANTS: Record<AuditLogResponseDTOAction, BadgeProps['variant']> = {
  CREATED: 'success',
  UPDATED: 'warning',
  DELETED: 'destructive',
};

export interface AuditActionBadgeProps {
  action: AuditLogResponseDTOAction;
}

export function AuditActionBadge({ action }: AuditActionBadgeProps): ReactElement {
  const { t } = useTranslation('auditLogs');

  return <Badge variant={ACTION_VARIANTS[action]}>{t(`actionLabels.${action}`)}</Badge>;
}
