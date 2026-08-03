import { HttpStatus, Injectable } from '@nestjs/common';

import { AppException } from '@shared/exceptions';
import { HashService } from '@shared/services/hash.service';
import { UuidService } from '@shared/services/uuid.service';

import { CreateUserDTO } from '../dtos/create-user.dto';
import { UserResponseDTO } from '../dtos/user-response.dto';
import { EUserStatus } from '../enums/user-status.enum';
import { UsersRepository } from '../repositories/users.repository';

@Injectable()
export class CreateUserUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly hashService: HashService,
    private readonly uuidService: UuidService,
  ) {}

  async execute(dto: CreateUserDTO): Promise<UserResponseDTO> {
    const email = dto.email.toLowerCase();

    const existing = await this.usersRepository.findByEmail(email);

    if (existing) {
      throw AppException.from('users.errors.emailTaken', HttpStatus.CONFLICT, { args: { email } });
    }

    const passwordHash = await this.hashService.hash(dto.password);

    const user = await this.usersRepository.create({
      uuid: this.uuidService.generate(),
      email,
      name: dto.name,
      avatarUrl: dto.avatarUrl ?? null,
      passwordHash,
      status: EUserStatus.ACTIVE,
    });

    return UserResponseDTO.from(user);
  }
}
