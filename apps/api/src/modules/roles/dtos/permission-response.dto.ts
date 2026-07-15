import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { PermissionEntity } from '../entities/permission.entity';

export class PermissionResponseDto {
  @ApiProperty()
  uuid!: string;

  @ApiProperty()
  key!: string;

  @ApiPropertyOptional({ nullable: true })
  description!: string | null;

  static from(entity: PermissionEntity): PermissionResponseDto {
    const dto = new PermissionResponseDto();

    dto.uuid = entity.uuid;
    dto.key = entity.key;
    dto.description = entity.description;

    return dto;
  }
}
