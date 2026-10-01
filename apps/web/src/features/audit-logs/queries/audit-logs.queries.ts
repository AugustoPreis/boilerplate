import { keepPreviousData, useQuery, type UseQueryResult } from '@tanstack/react-query';

import type {
  AuditControllerFindAllV1200,
  AuditControllerFindAllV1Params,
} from '@core/api/generated/boilerplateAPI.schemas';
import type { ApiError } from '@core/errors/error.types';

import * as auditLogsService from '../services/audit-logs.service';

export const auditLogsQueryKeys = {
  all: ['audit-logs'] as const,
  list: (params: AuditControllerFindAllV1Params) =>
    [...auditLogsQueryKeys.all, 'list', params] as const,
};

export function useAuditLogsQuery(
  params: AuditControllerFindAllV1Params,
): UseQueryResult<AuditControllerFindAllV1200, ApiError> {
  return useQuery({
    queryKey: auditLogsQueryKeys.list(params),
    queryFn: () => auditLogsService.listAuditLogs(params),
    placeholderData: keepPreviousData,
  });
}
