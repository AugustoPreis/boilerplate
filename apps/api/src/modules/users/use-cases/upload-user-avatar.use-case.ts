import { HttpStatus, Injectable } from '@nestjs/common';

import { StorageService } from '@core/storage/storage.service';

import { AppException } from '@shared/exceptions';
import { getExtensionFromMimeType } from '@shared/utils/mime-type.util';

import { UserResponseDTO } from '../dtos/user-response.dto';
import { UsersRepository } from '../repositories/users.repository';
import { MAX_AVATAR_SIZE_BYTES } from '../users.constants';
import { getAvatarStorageKey } from '../utils/avatar-storage-key.util';

@Injectable()
export class UploadUserAvatarUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly storageService: StorageService,
  ) {}

  async execute(uuid: string, file: Express.Multer.File): Promise<UserResponseDTO> {
    const user = await this.usersRepository.findByUuid(uuid);

    if (!user) {
      throw AppException.from('users.errors.notFound', HttpStatus.NOT_FOUND);
    }

    if (!file) {
      throw AppException.from('users.errors.avatarRequired', HttpStatus.BAD_REQUEST);
    }

    const extension = this.ensureFileTypeIsSupported(file);
    this.ensureFileIsNotTooLarge(file);

    // Deterministic key: the next upload from the same user overwrites the
    // previous object, so there's no orphaned avatar to clean up later.
    const key = getAvatarStorageKey(user.uuid, extension);

    const avatarUrl = await this.storageService.upload(key, file.buffer, file.mimetype);

    const updated = await this.usersRepository.update(user.id, { avatarUrl });

    return UserResponseDTO.from(updated);
  }

  private ensureFileTypeIsSupported(file: Express.Multer.File): string {
    const extension = getExtensionFromMimeType(file.mimetype);

    if (!extension) {
      throw AppException.from('users.errors.avatarInvalidType', HttpStatus.BAD_REQUEST);
    }

    return extension;
  }

  private ensureFileIsNotTooLarge(file: Express.Multer.File): void {
    if (file.size > MAX_AVATAR_SIZE_BYTES) {
      throw AppException.from('users.errors.avatarTooLarge', HttpStatus.PAYLOAD_TOO_LARGE);
    }
  }
}
