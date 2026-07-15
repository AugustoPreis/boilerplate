import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { AuditLogEntity } from '../entities/audit-log.entity';

export class AuditLogResponseDto {
  @ApiProperty()
  uuid!: string;

  @ApiPropertyOptional({ nullable: true })
  userId!: string | null;

  @ApiProperty()
  action!: string;

  @ApiProperty()
  entityName!: string;

  @ApiPropertyOptional({ nullable: true })
  entityId!: string | null;

  @ApiPropertyOptional({ nullable: true })
  oldData!: Record<string, unknown> | null;

  @ApiPropertyOptional({ nullable: true })
  newData!: Record<string, unknown> | null;

  @ApiProperty()
  createdAt!: Date;

  static from(entity: AuditLogEntity): AuditLogResponseDto {
    const dto = new AuditLogResponseDto();

    dto.uuid = entity.uuid;
    dto.userId = entity.userId;
    dto.action = entity.action;
    dto.entityName = entity.entityName;
    dto.entityId = entity.entityId;
    dto.oldData = entity.oldData;
    dto.newData = entity.newData;
    dto.createdAt = entity.createdAt;

    return dto;
  }
}
