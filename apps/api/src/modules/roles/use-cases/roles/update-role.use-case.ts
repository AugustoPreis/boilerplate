import { HttpStatus, Injectable } from '@nestjs/common';

import { AppException } from '@shared/exceptions';

import { RoleResponseDto } from '../../dtos/role-response.dto';
import { UpdateRoleDto } from '../../dtos/update-role.dto';
import { RolesRepository } from '../../repositories/roles.repository';

@Injectable()
export class UpdateRoleUseCase {
  constructor(private readonly rolesRepository: RolesRepository) {}

  async execute(uuid: string, dto: UpdateRoleDto): Promise<RoleResponseDto> {
    const role = await this.rolesRepository.findByUuid(uuid);

    if (!role) {
      throw AppException.from('roles.NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    if (dto.name && dto.name !== role.name) {
      const existing = await this.rolesRepository.findByName(dto.name);

      if (existing) {
        throw AppException.from('roles.NAME_TAKEN', HttpStatus.CONFLICT, {
          args: { name: dto.name },
        });
      }
    }

    const updated = await this.rolesRepository.update(role.id, {
      name: dto.name,
      description: dto.description,
    });

    return RoleResponseDto.from(updated);
  }
}
