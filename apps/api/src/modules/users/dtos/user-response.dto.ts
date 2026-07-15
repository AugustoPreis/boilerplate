import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { UserEntity } from '../entities/user.entity';
import { EUserStatus } from '../enums/user-status.enum';

export class UserResponseDTO {
  @ApiProperty()
  uuid!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  name!: string;

  @ApiPropertyOptional({ nullable: true })
  avatarUrl!: string | null;

  @ApiProperty({ enum: EUserStatus })
  status!: EUserStatus;

  @ApiProperty({ type: [String] })
  roles!: string[];

  @ApiProperty()
  createdAt!: Date;

  static from(entity: UserEntity): UserResponseDTO {
    const dto = new UserResponseDTO();

    dto.uuid = entity.uuid;
    dto.email = entity.email;
    dto.name = entity.name;
    dto.avatarUrl = entity.avatarUrl;
    dto.status = entity.status;
    dto.roles = entity.userRoles?.map((ur) => ur.role.name) ?? [];
    dto.createdAt = entity.createdAt;

    return dto;
  }
}
