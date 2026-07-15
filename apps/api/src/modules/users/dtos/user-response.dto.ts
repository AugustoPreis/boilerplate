import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { UserEntity, UserStatus } from '../entities/user.entity';

export class UserResponseDto {
  @ApiProperty()
  uuid!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  name!: string;

  @ApiPropertyOptional({ nullable: true })
  avatarUrl!: string | null;

  @ApiProperty({ enum: UserStatus })
  status!: UserStatus;

  @ApiProperty({ type: [String] })
  roles!: string[];

  @ApiProperty()
  createdAt!: Date;

  static from(entity: UserEntity): UserResponseDto {
    const dto = new UserResponseDto();

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
