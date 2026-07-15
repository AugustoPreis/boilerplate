import { Injectable } from '@nestjs/common';

import { IPaginatedResult } from '@shared/interfaces';

import { RoleResponseDTO } from '../../dtos/role-response.dto';
import { RolesRepository } from '../../repositories/roles.repository';

@Injectable()
export class ListRolesUseCase {
  constructor(private readonly rolesRepository: RolesRepository) {}

  async execute(page: number, perPage: number): Promise<IPaginatedResult<RoleResponseDTO>> {
    const result = await this.rolesRepository.findAll(page, perPage);

    return {
      data: result.data.map((r) => RoleResponseDTO.from(r)),
      meta: result.meta,
    };
  }
}
