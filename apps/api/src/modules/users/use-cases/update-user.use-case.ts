import { HttpStatus, Injectable } from '@nestjs/common';

import { AppException } from '@shared/exceptions';

import { UpdateUserDto } from '../dtos/update-user.dto';
import { UserResponseDto } from '../dtos/user-response.dto';
import { UsersRepository } from '../repositories/users.repository';

@Injectable()
export class UpdateUserUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(uuid: string, dto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.usersRepository.findByUuid(uuid);

    if (!user) {
      throw AppException.from('users.NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    if (dto.email && dto.email.toLowerCase() !== user.email) {
      const existing = await this.usersRepository.findByEmail(dto.email.toLowerCase());

      if (existing) {
        throw AppException.from('users.EMAIL_TAKEN', HttpStatus.CONFLICT, {
          args: { email: dto.email },
        });
      }
    }

    const updated = await this.usersRepository.update(user.id, {
      email: dto.email?.toLowerCase(),
      name: dto.name,
      avatarUrl: dto.avatarUrl,
    });

    return UserResponseDto.from(updated);
  }
}
