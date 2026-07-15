import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';

import { ERoles } from '@shared/constants';
import { Roles } from '@shared/decorators/roles.decorator';
import { IPaginatedResult } from '@shared/interfaces';
import { ParseUuidPipe } from '@shared/pipes/parse-uuid.pipe';

import { AuditLogResponseDto } from '../dtos/audit-log-response.dto';
import { AuditLogsRepository } from '../repositories/audit-logs.repository';

class AuditLogQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  entityName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  action?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  perPage?: number = 50;
}

@ApiTags('Audit')
@ApiBearerAuth()
@Controller({ path: 'audit/logs', version: '1' })
export class AuditController {
  constructor(private readonly auditLogsRepository: AuditLogsRepository) {}

  @Get()
  @Roles(ERoles.ADMIN)
  @ApiOperation({ summary: 'List audit logs' })
  async findAll(@Query() query: AuditLogQueryDto): Promise<IPaginatedResult<AuditLogResponseDto>> {
    const result = await this.auditLogsRepository.search(query.page ?? 1, query.perPage ?? 50, {
      userId: query.userId,
      entityName: query.entityName,
      action: query.action,
      startDate: query.startDate,
      endDate: query.endDate,
    });

    return { ...result, data: result.data.map((e) => AuditLogResponseDto.from(e)) };
  }

  @Get(':uuid')
  @Roles(ERoles.ADMIN)
  @ApiOperation({ summary: 'Get audit log by UUID' })
  async findOne(@Param('uuid', ParseUuidPipe) uuid: string): Promise<AuditLogResponseDto | null> {
    const log = await this.auditLogsRepository.findByUuid(uuid);

    return log ? AuditLogResponseDto.from(log) : null;
  }
}
