import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { PermissionEntity } from '../entities/permission.entity';

export class PermissionResponseDTO {
  @ApiProperty()
  uuid!: string;

  @ApiProperty()
  key!: string;

  @ApiPropertyOptional({ nullable: true })
  description!: string | null;

  static from(entity: PermissionEntity): PermissionResponseDTO {
    const dto = new PermissionResponseDTO();

    dto.uuid = entity.uuid;
    dto.key = entity.key;
    dto.description = entity.description;

    return dto;
  }
}
