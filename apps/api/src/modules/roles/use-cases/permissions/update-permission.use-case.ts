import { HttpStatus, Injectable } from '@nestjs/common';

import { AppException } from '@shared/exceptions';

import { PermissionResponseDTO } from '../../dtos/permission-response.dto';
import { UpdatePermissionDTO } from '../../dtos/update-permission.dto';
import { PermissionsRepository } from '../../repositories/permissions.repository';

@Injectable()
export class UpdatePermissionUseCase {
  constructor(private readonly permissionsRepository: PermissionsRepository) {}

  async execute(uuid: string, dto: UpdatePermissionDTO): Promise<PermissionResponseDTO> {
    const permission = await this.permissionsRepository.findByUuid(uuid);

    if (!permission) {
      throw AppException.from('roles.permissionNotFoundByUuid', HttpStatus.NOT_FOUND);
    }

    if (dto.key && dto.key !== permission.key) {
      const existing = await this.permissionsRepository.findByKey(dto.key);

      if (existing) {
        throw AppException.from('roles.permissionKeyTaken', HttpStatus.CONFLICT, {
          args: { key: dto.key },
        });
      }
    }

    const updated = await this.permissionsRepository.update(permission.id, {
      key: dto.key,
      description: dto.description,
    });

    return PermissionResponseDTO.from(updated);
  }
}
