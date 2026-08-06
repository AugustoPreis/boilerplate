import { HttpStatus } from '@nestjs/common';
import { mockDeep } from 'jest-mock-extended';

import { UpdateUserStatusDTO } from '../../dtos/update-user-status.dto';
import { UserEntity } from '../../entities/user.entity';
import { EUserStatus } from '../../enums/user-status.enum';
import { UsersRepository } from '../../repositories/users.repository';
import { UpdateUserStatusUseCase } from '../update-user-status.use-case';

describe('UpdateUserStatusUseCase', () => {
  const usersRepository = mockDeep<UsersRepository>();
  const useCase = new UpdateUserStatusUseCase(usersRepository);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('throws when the user does not exist', async () => {
    usersRepository.findByUuid.mockResolvedValue(null);

    await expect(
      useCase.execute('missing-uuid', { status: EUserStatus.INACTIVE }),
    ).rejects.toMatchObject({
      i18nKey: 'users.errors.notFound',
      status: HttpStatus.NOT_FOUND,
    });
  });

  it('updates the user status', async () => {
    const user = { id: 1, uuid: 'user-uuid', userRoles: [] } as unknown as UserEntity;
    const updated = { ...user, status: EUserStatus.INACTIVE };
    const dto: UpdateUserStatusDTO = { status: EUserStatus.INACTIVE };

    usersRepository.findByUuid.mockResolvedValue(user);
    usersRepository.update.mockResolvedValue(updated);

    const result = await useCase.execute(user.uuid, dto);

    expect(usersRepository.update).toHaveBeenCalledWith(user.id, { status: dto.status });
    expect(result.status).toBe(EUserStatus.INACTIVE);
  });
});
