import { Injectable } from '@nestjs/common';

import { IPaginatedResult } from '@shared/interfaces';

import { UserQueryDto } from '../dtos/user-query.dto';
import { UserResponseDto } from '../dtos/user-response.dto';
import { UsersRepository } from '../repositories/users.repository';

@Injectable()
export class ListUsersUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(query: UserQueryDto): Promise<IPaginatedResult<UserResponseDto>> {
    const result = await this.usersRepository.search(query.page, query.perPage, {
      email: query.email,
      status: query.status,
    });

    return { data: result.data.map((u) => UserResponseDto.from(u)), meta: result.meta };
  }
}
