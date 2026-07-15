import { HttpStatus, Injectable } from '@nestjs/common';

import { AppException } from '@shared/exceptions';

import { PermissionResponseDto } from '../../dtos/permission-response.dto';
import { PermissionsRepository } from '../../repositories/permissions.repository';

@Injectable()
export class FindPermissionUseCase {
  constructor(private readonly permissionsRepository: PermissionsRepository) {}

  async execute(uuid: string): Promise<PermissionResponseDto> {
    const permission = await this.permissionsRepository.findByUuid(uuid);

    if (!permission) {
      throw AppException.from('roles.PERMISSION_NOT_FOUND_BY_UUID', HttpStatus.NOT_FOUND);
    }

    return PermissionResponseDto.from(permission);
  }
}
