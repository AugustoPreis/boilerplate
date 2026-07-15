import { ROLE_ADMIN } from '@boilerplate/shared';
import { HttpStatus, Injectable } from '@nestjs/common';

import { AppException } from '@shared/exceptions';

import { RolesRepository } from '../../repositories/roles.repository';

@Injectable()
export class DeleteRoleUseCase {
  constructor(private readonly rolesRepository: RolesRepository) {}

  async execute(uuid: string): Promise<void> {
    const role = await this.rolesRepository.findByUuid(uuid);

    if (!role) {
      throw AppException.from('roles.NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    if (role.name === ROLE_ADMIN) {
      throw AppException.from('roles.CANNOT_DELETE_RESERVED', HttpStatus.FORBIDDEN);
    }

    await this.rolesRepository.delete(role.id);
  }
}
