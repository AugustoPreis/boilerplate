import { HttpStatus } from '@nestjs/common';
import { mockDeep } from 'jest-mock-extended';

import { StorageService } from '@core/storage/storage.service';

import { UserEntity } from '../../entities/user.entity';
import { UsersRepository } from '../../repositories/users.repository';
import { MAX_AVATAR_SIZE_BYTES } from '../../users.constants';
import { getAvatarStorageKey } from '../../utils/avatar-storage-key.util';
import { UploadUserAvatarUseCase } from '../upload-user-avatar.use-case';

describe('UploadUserAvatarUseCase', () => {
  const usersRepository = mockDeep<UsersRepository>();
  const storageService = mockDeep<StorageService>();

  const useCase = new UploadUserAvatarUseCase(usersRepository, storageService);

  const user = { id: 1, uuid: 'user-uuid', userRoles: [] } as unknown as UserEntity;

  const buildFile = (overrides: Partial<Express.Multer.File> = {}): Express.Multer.File =>
    ({
      mimetype: 'image/png',
      size: 1024,
      buffer: Buffer.from('avatar'),
      ...overrides,
    }) as Express.Multer.File;

  beforeEach(() => {
    jest.clearAllMocks();
    usersRepository.findByUuid.mockResolvedValue(user);
  });

  it('throws when the user does not exist', async () => {
    usersRepository.findByUuid.mockResolvedValue(null);

    await expect(useCase.execute('missing-uuid', buildFile())).rejects.toMatchObject({
      i18nKey: 'users.errors.notFound',
      status: HttpStatus.NOT_FOUND,
    });
  });

  it('throws when no file is provided', async () => {
    await expect(
      useCase.execute(user.uuid, undefined as unknown as Express.Multer.File),
    ).rejects.toMatchObject({
      i18nKey: 'users.errors.avatarRequired',
      status: HttpStatus.BAD_REQUEST,
    });
  });

  it('throws when the file mimetype is not a supported image type', async () => {
    const file = buildFile({ mimetype: 'application/pdf' });

    await expect(useCase.execute(user.uuid, file)).rejects.toMatchObject({
      i18nKey: 'users.errors.avatarInvalidType',
      status: HttpStatus.BAD_REQUEST,
    });
  });

  it('throws when the file exceeds the maximum allowed size', async () => {
    const file = buildFile({ size: MAX_AVATAR_SIZE_BYTES + 1 });

    await expect(useCase.execute(user.uuid, file)).rejects.toMatchObject({
      i18nKey: 'users.errors.avatarTooLarge',
      status: HttpStatus.PAYLOAD_TOO_LARGE,
    });
  });

  it('uploads the avatar and updates the user with the resulting url', async () => {
    const file = buildFile();
    const avatarUrl = 'https://cdn.example.com/users/avatars/user-uuid.png';
    const updated = { ...user, avatarUrl } as unknown as UserEntity;

    storageService.upload.mockResolvedValue(avatarUrl);
    usersRepository.update.mockResolvedValue(updated);

    const result = await useCase.execute(user.uuid, file);

    expect(storageService.upload).toHaveBeenCalledWith(
      getAvatarStorageKey(user.uuid, 'png'),
      file.buffer,
      file.mimetype,
    );
    expect(usersRepository.update).toHaveBeenCalledWith(user.id, { avatarUrl });
    expect(result.avatarUrl).toBe(avatarUrl);
  });
});
