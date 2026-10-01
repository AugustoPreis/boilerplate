import { DEFAULT_PAGE_SIZE } from '@boilerplate/shared';
import { useMemo, useState, type ReactElement } from 'react';

import type {
  AuditControllerFindAllV1Params,
  AuditLogResponseDTO,
} from '@core/api/generated/boilerplateAPI.schemas';
import { Pagination } from '@shared/ui/pagination';

import { useAuditLogsQuery } from '../queries/audit-logs.queries';

import { AuditLogsTable } from './audit-logs-table';

export interface EntityAuditLogsProps {
  entityName: string;
  entityUuid: string;
}

// Shows only the audit trail for one specific record (newest first, the
// API's default order) — no filters, since the record is already fixed.
export function EntityAuditLogs({ entityName, entityUuid }: EntityAuditLogsProps): ReactElement {
  const [page, setPage] = useState(1);
  const [expandedUuids, setExpandedUuids] = useState<Set<string>>(new Set());

  const params = useMemo<AuditControllerFindAllV1Params>(
    () => ({ page, perPage: DEFAULT_PAGE_SIZE, entityName, entityUuid }),
    [page, entityName, entityUuid],
  );

  const auditLogsQuery = useAuditLogsQuery(params);
  const logs = auditLogsQuery.data?.data ?? [];
  const meta = auditLogsQuery.data?.meta;

  function toggleRow(log: AuditLogResponseDTO): void {
    setExpandedUuids((previous) => {
      const next = new Set(previous);

      if (next.has(log.uuid)) {
        next.delete(log.uuid);
      } else {
        next.add(log.uuid);
      }

      return next;
    });
  }

  return (
    <>
      <AuditLogsTable
        logs={logs}
        expandedUuids={expandedUuids}
        onToggle={toggleRow}
        showEntityColumns={false}
      />
      {meta ? <Pagination meta={meta} onPageChange={setPage} /> : null}
    </>
  );
}
