import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional } from 'class-validator';

import { PaginationQueryDTO } from '@shared/dtos/pagination-query.dto';

import { EUserStatus } from '../enums/user-status.enum';

export class UserQueryDTO extends PaginationQueryDTO {
  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ enum: EUserStatus })
  @IsOptional()
  @IsEnum(EUserStatus)
  status?: EUserStatus;
}
