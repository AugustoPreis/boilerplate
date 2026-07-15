import { HttpStatus, Injectable } from '@nestjs/common';

import { AppException } from '@shared/exceptions';

import { UsersRepository } from '../../users/repositories/users.repository';
import { MeResponseDTO } from '../dtos/me-response.dto';

@Injectable()
export class GetMeUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(uuid: string): Promise<MeResponseDTO> {
    const user = await this.usersRepository.findByUuid(uuid);

    if (!user) {
      throw AppException.from('users.notFound', HttpStatus.NOT_FOUND);
    }

    return {
      uuid: user.uuid,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      status: user.status,
      roles: user.userRoles?.map((ur) => ur.role.name) ?? [],
    };
  }
}
