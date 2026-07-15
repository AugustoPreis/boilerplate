import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { ROLE_ADMIN } from '@shared/constants';
import { Roles } from '@shared/decorators/roles.decorator';
import { ParseUuidPipe } from '@shared/pipes/parse-uuid.pipe';

import { AuditLogQueryDTO } from '../dtos/audit-log-query.dto';
import { AuditLogResponseDTO } from '../dtos/audit-log-response.dto';
import { FindAuditLogUseCase } from '../use-cases/find-audit-log.use-case';
import { ListAuditLogsUseCase } from '../use-cases/list-audit-logs.use-case';

@ApiTags('Audit')
@ApiBearerAuth()
@Roles(ROLE_ADMIN)
@Controller({ path: 'audit/logs', version: '1' })
export class AuditController {
  constructor(
    private readonly listAuditLogsUseCase: ListAuditLogsUseCase,
    private readonly findAuditLogUseCase: FindAuditLogUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List audit logs' })
  findAll(@Query() query: AuditLogQueryDTO): ReturnType<ListAuditLogsUseCase['execute']> {
    return this.listAuditLogsUseCase.execute(query);
  }

  @Get(':uuid')
  @ApiOperation({ summary: 'Get audit log by UUID' })
  findOne(@Param('uuid', ParseUuidPipe) uuid: string): Promise<AuditLogResponseDTO> {
    return this.findAuditLogUseCase.execute(uuid);
  }
}
