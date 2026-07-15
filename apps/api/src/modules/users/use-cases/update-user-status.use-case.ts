import { HttpStatus, Injectable } from '@nestjs/common';

import { AppException } from '@shared/exceptions';

import { UpdateUserStatusDto } from '../dtos/update-user-status.dto';
import { UserResponseDto } from '../dtos/user-response.dto';
import { UsersRepository } from '../repositories/users.repository';

@Injectable()
export class UpdateUserStatusUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(uuid: string, dto: UpdateUserStatusDto): Promise<UserResponseDto> {
    const user = await this.usersRepository.findByUuid(uuid);

    if (!user) {
      throw AppException.from('users.NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    const updated = await this.usersRepository.update(user.id, { status: dto.status });

    return UserResponseDto.from(updated);
  }
}
