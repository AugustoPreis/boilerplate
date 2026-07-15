import { Injectable } from '@nestjs/common';

import { IPaginatedResult } from '@shared/interfaces';

import { PermissionResponseDTO } from '../../dtos/permission-response.dto';
import { PermissionsRepository } from '../../repositories/permissions.repository';

@Injectable()
export class ListPermissionsUseCase {
  constructor(private readonly permissionsRepository: PermissionsRepository) {}

  async execute(page: number, perPage: number): Promise<IPaginatedResult<PermissionResponseDTO>> {
    const result = await this.permissionsRepository.findAll(page, perPage);

    return {
      data: result.data.map((p) => PermissionResponseDTO.from(p)),
      meta: result.meta,
    };
  }
}
