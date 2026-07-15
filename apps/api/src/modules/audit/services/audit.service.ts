import { Injectable, Logger } from '@nestjs/common';

import { UuidService } from '@shared/services/uuid.service';

import { AuditLogsRepository } from '../repositories/audit-logs.repository';

const SENSITIVE_FIELDS = new Set(['passwordHash', 'password', 'token', 'refreshToken', 'secret']);

export interface IAuditLogPayload {
  userId?: string | null;
  action: string;
  entityName: string;
  entityId?: string | null;
  oldData?: Record<string, unknown> | null;
  newData?: Record<string, unknown> | null;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    private readonly auditLogsRepository: AuditLogsRepository,
    private readonly uuidService: UuidService,
  ) {}

  async log(payload: IAuditLogPayload): Promise<void> {
    try {
      await this.auditLogsRepository.create({
        uuid: this.uuidService.generate(),
        userId: payload.userId ?? null,
        action: payload.action,
        entityName: payload.entityName,
        entityId: payload.entityId ?? null,
        oldData: payload.oldData ? this.sanitize(payload.oldData) : null,
        newData: payload.newData ? this.sanitize(payload.newData) : null,
      });
    } catch (err) {
      this.logger.error('Failed to write audit log', err);
    }
  }

  diffData(
    oldObj: Record<string, unknown>,
    newObj: Record<string, unknown>,
  ): { oldData: Record<string, unknown>; newData: Record<string, unknown> } {
    const oldDiff: Record<string, unknown> = {};
    const newDiff: Record<string, unknown> = {};

    const allKeys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);

    for (const key of allKeys) {
      if (JSON.stringify(oldObj[key]) !== JSON.stringify(newObj[key])) {
        oldDiff[key] = oldObj[key];
        newDiff[key] = newObj[key];
      }
    }

    return { oldData: oldDiff, newData: newDiff };
  }

  extractEntityData(response: unknown): Record<string, unknown> | null {
    if (!this.isObject(response)) return null;

    if ('data' in response && this.isObject(response.data) && 'uuid' in response.data) {
      return response.data;
    }

    if ('uuid' in response) {
      return response;
    }

    return null;
  }

  extractEntityName(url: string): string {
    const match = url.match(/\/api\/v\d+\/([^/?\s]+)/);

    return match ? match[1] : 'unknown';
  }

  extractEntityId(response: unknown): string | null {
    if (
      this.isObject(response) &&
      'data' in response &&
      this.isObject(response.data) &&
      'uuid' in response.data
    ) {
      return (response.data.uuid as string) ?? null;
    }

    if (this.isObject(response) && 'uuid' in response) {
      return (response.uuid as string) ?? null;
    }

    return null;
  }

  private sanitize(data: Record<string, unknown>): Record<string, unknown> {
    return Object.fromEntries(Object.entries(data).filter(([key]) => !SENSITIVE_FIELDS.has(key)));
  }

  private isObject(value: unknown): value is Record<string, unknown> {
    return !!value && typeof value === 'object' && !Array.isArray(value);
  }
}
