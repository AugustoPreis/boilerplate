import { HttpStatus, Injectable } from '@nestjs/common';

import { AppException } from '@shared/exceptions';

import { UserResponseDto } from '../dtos/user-response.dto';
import { UsersRepository } from '../repositories/users.repository';

@Injectable()
export class FindUserUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(uuid: string): Promise<UserResponseDto> {
    const user = await this.usersRepository.findByUuid(uuid);

    if (!user) {
      throw AppException.from('users.NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    return UserResponseDto.from(user);
  }
}
