import { ApiProperty } from '@nestjs/swagger';

import { DEFAULT_PAGE_SIZE } from '@shared/constants';

import { IPaginatedResult, IPaginationMeta } from '../interfaces';

export class PaginationMetaDTO implements IPaginationMeta {
  @ApiProperty()
  total: number = 0;

  @ApiProperty()
  page: number = 1;

  @ApiProperty()
  perPage: number = DEFAULT_PAGE_SIZE;

  @ApiProperty()
  lastPage: number = 1;
}

export class PaginatedResponseDTO<T> implements IPaginatedResult<T> {
  data: T[] = [];

  @ApiProperty({ type: PaginationMetaDTO })
  meta: PaginationMetaDTO = new PaginationMetaDTO();
}
