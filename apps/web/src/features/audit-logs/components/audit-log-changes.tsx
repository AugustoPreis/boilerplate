import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import type { AuditLogResponseDTO } from '@core/api/generated/boilerplateAPI.schemas';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@shared/ui/table';
import { Text } from '@shared/ui/typography';

import { getNewValueDisplay, getOldValueDisplay } from '../utils/audit-value-display.util';

import { AuditValueCell } from './audit-value-cell';

export interface AuditLogChangesProps {
  log: AuditLogResponseDTO;
}

export function AuditLogChanges({ log }: AuditLogChangesProps): ReactElement {
  const { t } = useTranslation('auditLogs');

  if (log.changes.length === 0) {
    return (
      <Text size="sm" tone="muted">
        {t('changes.empty')}
      </Text>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t('changes.field')}</TableHead>
          <TableHead>{t('changes.oldValue')}</TableHead>
          <TableHead>{t('changes.newValue')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {log.changes.map((change) => (
          <TableRow key={change.field}>
            <TableCell>
              <Text size="sm" weight="medium">
                {change.label}
              </Text>
            </TableCell>
            <TableCell>
              <AuditValueCell display={getOldValueDisplay(log.action, change.old)} />
            </TableCell>
            <TableCell>
              <AuditValueCell display={getNewValueDisplay(log.action, change.new)} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
