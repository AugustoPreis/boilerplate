import { HttpStatus } from '@nestjs/common';
import { mockDeep } from 'jest-mock-extended';

import { RoleEntity } from '@modules/roles/entities/role.entity';

import { createMockRepository } from '../../../../../test/support/mock-repository';
import { AssignRolesDTO } from '../../dtos/assign-roles.dto';
import { UserEntity } from '../../entities/user.entity';
import { UsersRepository } from '../../repositories/users.repository';
import { AssignRolesUseCase } from '../assign-roles.use-case';

describe('AssignRolesUseCase', () => {
  const usersRepository = mockDeep<UsersRepository>();
  const roleRepo = createMockRepository<RoleEntity>();

  const useCase = new AssignRolesUseCase(usersRepository, roleRepo);

  const user = { id: 1, uuid: 'user-uuid', userRoles: [] } as unknown as UserEntity;
  const role = { id: 10, uuid: 'role-uuid' } as RoleEntity;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('throws when the user does not exist', async () => {
    usersRepository.findByUuid.mockResolvedValue(null);

    await expect(useCase.execute('missing-uuid', { roleUuids: [] })).rejects.toMatchObject({
      i18nKey: 'users.errors.notFound',
      status: HttpStatus.NOT_FOUND,
    });
  });

  it('throws when a role uuid does not exist', async () => {
    usersRepository.findByUuid.mockResolvedValue(user);
    roleRepo.findOne.mockResolvedValue(null);

    const dto: AssignRolesDTO = { roleUuids: ['missing-role'] };

    await expect(useCase.execute(user.uuid, dto)).rejects.toMatchObject({
      i18nKey: 'roles.errors.notFound',
      status: HttpStatus.NOT_FOUND,
    });
  });

  it('replaces the user roles and returns the updated user', async () => {
    const updated = { ...user, userRoles: [{ role }] } as unknown as UserEntity;

    usersRepository.findByUuid.mockResolvedValueOnce(user).mockResolvedValueOnce(updated);
    roleRepo.findOne.mockResolvedValue(role);

    const dto: AssignRolesDTO = { roleUuids: [role.uuid] };

    const result = await useCase.execute(user.uuid, dto);

    expect(usersRepository.setRoles).toHaveBeenCalledWith(user.id, [role.id]);
    expect(result.uuid).toBe(updated.uuid);
  });
});
