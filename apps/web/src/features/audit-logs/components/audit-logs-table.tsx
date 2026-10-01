import { ChevronDown, ChevronRight } from 'lucide-react';
import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import type { AuditLogResponseDTO } from '@core/api/generated/boilerplateAPI.schemas';
import { Button } from '@shared/ui/button';
import { DataTable, type IDataTableColumn } from '@shared/ui/data-table';
import { Text } from '@shared/ui/typography';
import { formatDateTime } from '@shared/utils/format-date-time';

import { AuditActionBadge } from './audit-action-badge';
import { AuditLogChanges } from './audit-log-changes';

export interface AuditLogsTableProps {
  logs: AuditLogResponseDTO[];
  expandedUuids: Set<string>;
  onToggle: (log: AuditLogResponseDTO) => void;
}

export function AuditLogsTable({
  logs,
  expandedUuids,
  onToggle,
}: AuditLogsTableProps): ReactElement {
  const { t } = useTranslation('auditLogs');

  const columns: IDataTableColumn<AuditLogResponseDTO>[] = [
    {
      key: 'expand',
      header: '',
      className: 'w-10',
      cell: (log) => {
        const expanded = expandedUuids.has(log.uuid);

        return (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={expanded ? t('table.collapseRow') : t('table.expandRow')}
            aria-expanded={expanded}
            onClick={() => onToggle(log)}
          >
            {expanded ? (
              <ChevronDown size={16} aria-hidden="true" />
            ) : (
              <ChevronRight size={16} aria-hidden="true" />
            )}
          </Button>
        );
      },
    },
    {
      key: 'entity',
      header: t('table.entity'),
      cell: (log) => <Text weight="medium">{log.entityLabel}</Text>,
    },
    {
      key: 'action',
      header: t('table.action'),
      cell: (log) => <AuditActionBadge action={log.action} />,
    },
    {
      key: 'entityUuid',
      header: t('table.entityUuid'),
      cell: (log) => (
        <Text size="sm" tone="muted" className="font-mono">
          {log.entityUuid}
        </Text>
      ),
    },
    {
      key: 'actor',
      header: t('table.actor'),
      cell: (log) => (
        <Text size="sm" tone="muted" className="font-mono">
          {log.actorUuid ?? t('table.actorSystem')}
        </Text>
      ),
    },
    {
      key: 'createdAt',
      header: t('table.createdAt'),
      cell: (log) => (
        <Text size="sm" tone="muted">
          {formatDateTime(log.createdAt)}
        </Text>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={logs}
      getRowKey={(log) => log.uuid}
      emptyMessage={
        <Text tone="muted" size="sm">
          {t('table.empty')}
        </Text>
      }
      isRowExpanded={(log) => expandedUuids.has(log.uuid)}
      renderExpandedRow={(log) => <AuditLogChanges log={log} />}
    />
  );
}
