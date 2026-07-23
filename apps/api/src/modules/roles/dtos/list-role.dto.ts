import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

import { PaginationQueryDTO } from '@shared/dtos/pagination-query.dto';

export class ListRoleDTO extends PaginationQueryDTO {
  @ApiPropertyOptional({
    description: 'Search by role name or description',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
