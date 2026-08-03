import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { UserEntity } from '../entities/user.entity';
import { EUserStatus } from '../enums/user-status.enum';

import { RoleSummaryDTO } from './role-summary.dto';

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

  @ApiProperty({ type: [RoleSummaryDTO] })
  roles!: RoleSummaryDTO[];

  @ApiProperty()
  createdAt!: Date;

  static from(entity: UserEntity): UserResponseDTO {
    const dto = new UserResponseDTO();

    dto.uuid = entity.uuid;
    dto.email = entity.email;
    dto.name = entity.name;
    dto.avatarUrl = entity.avatarUrl;
    dto.status = entity.status;
    dto.roles = entity.userRoles?.map((ur) => RoleSummaryDTO.from(ur.role)) ?? [];
    dto.createdAt = entity.createdAt;

    return dto;
  }
}
