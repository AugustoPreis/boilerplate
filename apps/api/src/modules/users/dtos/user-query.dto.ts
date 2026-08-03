import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

import { PaginationQueryDTO } from '@shared/dtos/pagination-query.dto';
import { IsEmail, IsEnum, IsUUID } from '@shared/validators';

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

  @ApiPropertyOptional({ description: 'Filter by an assigned role UUID' })
  @IsOptional()
  @IsUUID()
  roleUuid?: string;
}
