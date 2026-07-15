import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { RoleEntity } from '../entities/role.entity';

import { PermissionResponseDto } from './permission-response.dto';

export class RoleResponseDto {
  @ApiProperty()
  uuid!: string;

  @ApiProperty()
  name!: string;

  @ApiPropertyOptional({ nullable: true })
  description!: string | null;

  @ApiProperty({ type: [PermissionResponseDto] })
  permissions!: PermissionResponseDto[];

  static from(entity: RoleEntity): RoleResponseDto {
    const dto = new RoleResponseDto();

    dto.uuid = entity.uuid;
    dto.name = entity.name;
    dto.description = entity.description;
    dto.permissions = entity.permissions?.map((p) => PermissionResponseDto.from(p)) ?? [];

    return dto;
  }
}
