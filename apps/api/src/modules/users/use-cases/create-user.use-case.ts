import { HttpStatus, Injectable } from '@nestjs/common';

import { AppException } from '@shared/exceptions';
import { HashService } from '@shared/services/hash.service';
import { UuidService } from '@shared/services/uuid.service';

import { CreateUserDto } from '../dtos/create-user.dto';
import { UserResponseDto } from '../dtos/user-response.dto';
import { UserStatus } from '../entities/user.entity';
import { UsersRepository } from '../repositories/users.repository';

@Injectable()
export class CreateUserUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly hashService: HashService,
    private readonly uuidService: UuidService,
  ) {}

  async execute(dto: CreateUserDto): Promise<UserResponseDto> {
    const email = dto.email.toLowerCase();

    const existing = await this.usersRepository.findByEmail(email);

    if (existing) {
      throw AppException.from('users.EMAIL_TAKEN', HttpStatus.CONFLICT, { args: { email } });
    }

    const passwordHash = await this.hashService.hash(dto.password);

    const user = await this.usersRepository.create({
      uuid: this.uuidService.generate(),
      email,
      name: dto.name,
      avatarUrl: dto.avatarUrl ?? null,
      passwordHash,
      status: UserStatus.ACTIVE,
    });

    return UserResponseDto.from(user);
  }
}
