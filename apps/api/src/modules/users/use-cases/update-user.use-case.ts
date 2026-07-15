import { HttpStatus, Injectable } from '@nestjs/common';

import { AppException } from '@shared/exceptions';

import { UpdateUserDTO } from '../dtos/update-user.dto';
import { UserResponseDTO } from '../dtos/user-response.dto';
import { UsersRepository } from '../repositories/users.repository';

@Injectable()
export class UpdateUserUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(uuid: string, dto: UpdateUserDTO): Promise<UserResponseDTO> {
    const user = await this.usersRepository.findByUuid(uuid);

    if (!user) {
      throw AppException.from('users.notFound', HttpStatus.NOT_FOUND);
    }

    if (dto.email && dto.email.toLowerCase() !== user.email) {
      const existing = await this.usersRepository.findByEmail(dto.email.toLowerCase());

      if (existing) {
        throw AppException.from('users.emailTaken', HttpStatus.CONFLICT, {
          args: { email: dto.email },
        });
      }
    }

    const updated = await this.usersRepository.update(user.id, {
      email: dto.email?.toLowerCase(),
      name: dto.name,
      avatarUrl: dto.avatarUrl,
    });

    return UserResponseDTO.from(updated);
  }
}
