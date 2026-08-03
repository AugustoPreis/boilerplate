import { HttpStatus, Injectable } from '@nestjs/common';

import { AppException } from '@shared/exceptions';
import { HashService } from '@shared/services/hash.service';

import { UpdateUserPasswordDTO } from '../dtos/update-user-password.dto';
import { UsersRepository } from '../repositories/users.repository';

@Injectable()
export class UpdateUserPasswordUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly hashService: HashService,
  ) {}

  async execute(currentUserUuid: string, dto: UpdateUserPasswordDTO): Promise<void> {
    const user = await this.usersRepository.findByUuidWithPassword(currentUserUuid);

    if (!user) {
      throw AppException.from('users.errors.notFound', HttpStatus.NOT_FOUND);
    }

    this.ensureNewPasswordIsDifferent(dto);
    this.ensureNewPasswordMatchesConfirmation(dto);
    await this.ensureCurrentPasswordIsCorrect(dto, user.passwordHash);

    await this.usersRepository.update(user.id, {
      passwordHash: await this.hashService.hash(dto.newPassword),
    });
  }

  private ensureNewPasswordIsDifferent(dto: UpdateUserPasswordDTO): void {
    if (dto.currentPassword === dto.newPassword) {
      throw AppException.from('users.errors.passwordsMustBeDifferent', HttpStatus.BAD_REQUEST);
    }
  }

  private ensureNewPasswordMatchesConfirmation(dto: UpdateUserPasswordDTO): void {
    if (dto.newPassword !== dto.confirmNewPassword) {
      throw AppException.from('users.errors.passwordsMustMatch', HttpStatus.BAD_REQUEST);
    }
  }

  private async ensureCurrentPasswordIsCorrect(
    dto: UpdateUserPasswordDTO,
    passwordHash: string,
  ): Promise<void> {
    const isCurrentPasswordCorrect = await this.hashService.compare(
      dto.currentPassword,
      passwordHash,
    );

    if (!isCurrentPasswordCorrect) {
      throw AppException.from('users.errors.invalidCurrentPassword', HttpStatus.BAD_REQUEST);
    }
  }
}
