import { ApiProperty } from '@nestjs/swagger';

import { IsEnum } from '@shared/validators';

import { EUserStatus } from '../enums/user-status.enum';

export class UpdateUserStatusDTO {
  @ApiProperty({ enum: EUserStatus })
  @IsEnum(EUserStatus)
  status!: EUserStatus;
}
