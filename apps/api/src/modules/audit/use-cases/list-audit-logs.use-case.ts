import { Injectable } from '@nestjs/common';

import { IPaginatedResult } from '@shared/interfaces';

import { AuditLogQueryDTO } from '../dtos/audit-log-query.dto';
import { AuditLogResponseDTO } from '../dtos/audit-log-response.dto';
import { AuditLogsRepository } from '../repositories/audit-logs.repository';

@Injectable()
export class ListAuditLogsUseCase {
  constructor(private readonly auditLogsRepository: AuditLogsRepository) {}

  async execute(query: AuditLogQueryDTO): Promise<IPaginatedResult<AuditLogResponseDTO>> {
    const result = await this.auditLogsRepository.search(query.page ?? 1, query.perPage ?? 50, {
      userId: query.userId,
      entityName: query.entityName,
      action: query.action,
      startDate: query.startDate,
      endDate: query.endDate,
    });

    return {
      data: result.data.map((e) => AuditLogResponseDTO.from(e)),
      meta: result.meta,
    };
  }
}
