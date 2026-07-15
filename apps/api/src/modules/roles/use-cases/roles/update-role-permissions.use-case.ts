import { HttpStatus, Injectable } from '@nestjs/common';

import { AppException } from '@shared/exceptions';

import { RoleResponseDto } from '../../dtos/role-response.dto';
import { UpdateRolePermissionsDto } from '../../dtos/update-role-permissions.dto';
import { PermissionsRepository } from '../../repositories/permissions.repository';
import { RolesRepository } from '../../repositories/roles.repository';

@Injectable()
export class UpdateRolePermissionsUseCase {
  constructor(
    private readonly rolesRepository: RolesRepository,
    private readonly permissionsRepository: PermissionsRepository,
  ) {}

  async execute(roleUuid: string, dto: UpdateRolePermissionsDto): Promise<RoleResponseDto> {
    const role = await this.rolesRepository.findByUuid(roleUuid);

    if (!role) {
      throw AppException.from('roles.NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    const permissions = await this.permissionsRepository.findByKeys(dto.permissionKeys);

    if (permissions.length !== dto.permissionKeys.length) {
      const found = new Set(permissions.map((p) => p.key));
      const missing = dto.permissionKeys.filter((key) => !found.has(key));

      throw AppException.from('roles.PERMISSION_NOT_FOUND', HttpStatus.NOT_FOUND, {
        args: { keys: missing.join(', ') },
      });
    }

    await this.rolesRepository.setPermissions(
      role.id,
      permissions.map((p) => p.id),
    );

    const updated = await this.rolesRepository.findByUuid(roleUuid);

    return RoleResponseDto.from(updated!);
  }
}
