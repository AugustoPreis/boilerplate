import { HttpStatus, Injectable } from '@nestjs/common';

import { AppException } from '@shared/exceptions';
import { UuidService } from '@shared/services/uuid.service';

import { CreatePermissionDTO } from '../../dtos/create-permission.dto';
import { PermissionResponseDTO } from '../../dtos/permission-response.dto';
import { PermissionsRepository } from '../../repositories/permissions.repository';

@Injectable()
export class CreatePermissionUseCase {
  constructor(
    private readonly permissionsRepository: PermissionsRepository,
    private readonly uuidService: UuidService,
  ) {}

  async execute(dto: CreatePermissionDTO): Promise<PermissionResponseDTO> {
    const existing = await this.permissionsRepository.findByKey(dto.key);

    if (existing) {
      throw AppException.from('roles.permissionKeyTaken', HttpStatus.CONFLICT, {
        args: { key: dto.key },
      });
    }

    const permission = await this.permissionsRepository.create({
      uuid: this.uuidService.generate(),
      key: dto.key,
      description: dto.description ?? null,
    });

    return PermissionResponseDTO.from(permission);
  }
}
