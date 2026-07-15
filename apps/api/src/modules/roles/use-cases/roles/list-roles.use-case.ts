import { Injectable } from '@nestjs/common';

import { IPaginatedResult } from '@shared/interfaces';

import { RoleResponseDto } from '../../dtos/role-response.dto';
import { RolesRepository } from '../../repositories/roles.repository';

@Injectable()
export class ListRolesUseCase {
  constructor(private readonly rolesRepository: RolesRepository) {}

  async execute(page: number, perPage: number): Promise<IPaginatedResult<RoleResponseDto>> {
    const result = await this.rolesRepository.findAll(page, perPage);

    return { data: result.data.map((r) => RoleResponseDto.from(r)), meta: result.meta };
  }
}
