import { HttpStatus, Injectable } from '@nestjs/common';

import { AppException } from '@shared/exceptions';

import { RoleResponseDto } from '../../dtos/role-response.dto';
import { RolesRepository } from '../../repositories/roles.repository';

@Injectable()
export class FindRoleUseCase {
  constructor(private readonly rolesRepository: RolesRepository) {}

  async execute(uuid: string): Promise<RoleResponseDto> {
    const role = await this.rolesRepository.findByUuid(uuid);

    if (!role) {
      throw AppException.from('roles.NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    return RoleResponseDto.from(role);
  }
}
