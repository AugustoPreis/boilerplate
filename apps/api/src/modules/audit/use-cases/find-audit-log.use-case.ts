import { HttpStatus, Injectable } from '@nestjs/common';

import { AppException } from '@shared/exceptions';

import { AuditLogResponseDTO } from '../dtos/audit-log-response.dto';
import { AuditLogsRepository } from '../repositories/audit-logs.repository';

@Injectable()
export class FindAuditLogUseCase {
  constructor(private readonly auditLogsRepository: AuditLogsRepository) {}

  async execute(uuid: string): Promise<AuditLogResponseDTO> {
    const log = await this.auditLogsRepository.findByUuid(uuid);

    if (!log) {
      throw AppException.from('audit.notFound', HttpStatus.NOT_FOUND);
    }

    return AuditLogResponseDTO.from(log);
  }
}
