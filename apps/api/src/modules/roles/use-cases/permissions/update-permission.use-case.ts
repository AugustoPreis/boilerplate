import { HttpStatus, Injectable } from '@nestjs/common';

import { AppException } from '@shared/exceptions';

import { PermissionResponseDto } from '../../dtos/permission-response.dto';
import { UpdatePermissionDto } from '../../dtos/update-permission.dto';
import { PermissionsRepository } from '../../repositories/permissions.repository';

@Injectable()
export class UpdatePermissionUseCase {
  constructor(private readonly permissionsRepository: PermissionsRepository) {}

  async execute(uuid: string, dto: UpdatePermissionDto): Promise<PermissionResponseDto> {
    const permission = await this.permissionsRepository.findByUuid(uuid);

    if (!permission) {
      throw AppException.from('roles.PERMISSION_NOT_FOUND_BY_UUID', HttpStatus.NOT_FOUND);
    }

    if (dto.key && dto.key !== permission.key) {
      const existing = await this.permissionsRepository.findByKey(dto.key);

      if (existing) {
        throw AppException.from('roles.PERMISSION_KEY_TAKEN', HttpStatus.CONFLICT, {
          args: { key: dto.key },
        });
      }
    }

    const updated = await this.permissionsRepository.update(permission.id, {
      key: dto.key,
      description: dto.description,
    });

    return PermissionResponseDto.from(updated);
  }
}
