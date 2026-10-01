import { DEFAULT_PAGE_SIZE } from '@boilerplate/shared';
import { useMemo, useState, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import type {
  AuditControllerFindAllV1Action,
  AuditControllerFindAllV1Params,
  AuditLogResponseDTO,
} from '@core/api/generated/boilerplateAPI.schemas';
import { useListQueryParams } from '@shared/hooks/use-list-query-params.hook';
import { Input } from '@shared/ui/input';
import { Box, Stack } from '@shared/ui/layout';
import { Pagination } from '@shared/ui/pagination';
import { Heading } from '@shared/ui/typography';

import { AuditActionSelect } from '../components/audit-action-select';
import { AuditEntitySelect } from '../components/audit-entity-select';
import { AuditLogsTable } from '../components/audit-logs-table';
import { useAuditLogsQuery } from '../queries/audit-logs.queries';

export type AuditLogsFilterValues = {
  entityName: string | undefined;
  entityUuid: string;
  actorUuid: string;
  action: AuditControllerFindAllV1Action | undefined;
};

export function AuditLogsListPage(): ReactElement {
  const { t } = useTranslation('auditLogs');

  const { page, setPage, filters, setFilter, debouncedFilters } =
    useListQueryParams<AuditLogsFilterValues>({
      entityName: undefined,
      entityUuid: '',
      actorUuid: '',
      action: undefined,
    });
  const [expandedUuids, setExpandedUuids] = useState<Set<string>>(new Set());

  const params = useMemo<AuditControllerFindAllV1Params>(
    () => ({
      page,
      perPage: DEFAULT_PAGE_SIZE,
      entityName: debouncedFilters.entityName,
      entityUuid: debouncedFilters.entityUuid.trim() || undefined,
      actorUuid: debouncedFilters.actorUuid.trim() || undefined,
      action: debouncedFilters.action,
    }),
    [page, debouncedFilters],
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
    <Stack gap={6}>
      <Heading level={1}>{t('title')}</Heading>

      <Box className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <AuditEntitySelect
          value={filters.entityName}
          onChange={(value) => setFilter('entityName', value)}
        />
        <AuditActionSelect
          value={filters.action}
          onChange={(value) => setFilter('action', value)}
        />
        <Input
          type="text"
          value={filters.entityUuid}
          onChange={(event) => setFilter('entityUuid', event.target.value)}
          placeholder={t('filters.entityUuidPlaceholder')}
          aria-label={t('filters.entityUuidPlaceholder')}
        />
        <Input
          type="text"
          value={filters.actorUuid}
          onChange={(event) => setFilter('actorUuid', event.target.value)}
          placeholder={t('filters.actorUuidPlaceholder')}
          aria-label={t('filters.actorUuidPlaceholder')}
        />
      </Box>

      <AuditLogsTable logs={logs} expandedUuids={expandedUuids} onToggle={toggleRow} />

      {meta ? <Pagination meta={meta} onPageChange={setPage} /> : null}
    </Stack>
  );
}
