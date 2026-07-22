import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

import { PaginationQueryDTO } from '@shared/dtos/pagination-query.dto';

import { EAuditAction } from '../enums/audit-action.enum';

export class AuditLogQueryDTO extends PaginationQueryDTO {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  entityName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  entityUuid?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  actorUuid?: string;

  @ApiPropertyOptional({ enum: EAuditAction })
  @IsOptional()
  @IsEnum(EAuditAction)
  action?: EAuditAction;
}
