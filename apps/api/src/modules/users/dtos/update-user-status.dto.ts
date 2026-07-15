import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

import { EUserStatus } from '../enums/user-status.enum';

export class UpdateUserStatusDTO {
  @ApiProperty({ enum: EUserStatus })
  @IsEnum(EUserStatus)
  status!: EUserStatus;
}
