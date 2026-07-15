import { HttpStatus, Injectable } from '@nestjs/common';

import { AppException } from '@shared/exceptions';
import { UuidService } from '@shared/services/uuid.service';

import { CreatePermissionDto } from '../../dtos/create-permission.dto';
import { PermissionResponseDto } from '../../dtos/permission-response.dto';
import { PermissionsRepository } from '../../repositories/permissions.repository';

@Injectable()
export class CreatePermissionUseCase {
  constructor(
    private readonly permissionsRepository: PermissionsRepository,
    private readonly uuidService: UuidService,
  ) {}

  async execute(dto: CreatePermissionDto): Promise<PermissionResponseDto> {
    const existing = await this.permissionsRepository.findByKey(dto.key);

    if (existing) {
      throw AppException.from('roles.PERMISSION_KEY_TAKEN', HttpStatus.CONFLICT, {
        args: { key: dto.key },
      });
    }

    const permission = await this.permissionsRepository.create({
      uuid: this.uuidService.generate(),
      key: dto.key,
      description: dto.description ?? null,
    });

    return PermissionResponseDto.from(permission);
  }
}
