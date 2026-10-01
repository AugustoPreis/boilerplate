import { getAuditLogs } from '@core/api/generated/audit-logs/audit-logs';
import type {
  AuditControllerFindAllV1200,
  AuditControllerFindAllV1Params,
} from '@core/api/generated/boilerplateAPI.schemas';

const auditLogs = getAuditLogs();

export function listAuditLogs(
  params?: AuditControllerFindAllV1Params,
): Promise<AuditControllerFindAllV1200> {
  return auditLogs.auditControllerFindAllV1(params);
}
