import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { RoleEntity } from '@modules/roles/entities/role.entity';

import { UserEntity, UserStatus } from '../entities/user.entity';
import { UsersRepository } from '../repositories/users.repository';

import { AssignRolesUseCase } from './assign-roles.use-case';

const mockUser = (): UserEntity =>
  ({
    id: 1,
    uuid: 'user-uuid',
    email: 'jane@example.com',
    name: 'Jane Doe',
    status: UserStatus.ACTIVE,
    userRoles: [{ role: { name: 'editor' } }],
  }) as unknown as UserEntity;

const mockRole = (uuid: string, id: number): RoleEntity => ({
  id,
  uuid,
  name: `role-${id}`,
  description: null,
  permissions: [],
});

describe('AssignRolesUseCase', () => {
  let useCase: AssignRolesUseCase;
  let usersRepository: jest.Mocked<Pick<UsersRepository, 'findByUuid' | 'setRoles'>>;
  let roleRepo: jest.Mocked<Pick<Repository<RoleEntity>, 'findOne'>>;

  beforeEach(async () => {
    usersRepository = { findByUuid: jest.fn(), setRoles: jest.fn().mockResolvedValue(undefined) };
    roleRepo = { findOne: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssignRolesUseCase,
        { provide: UsersRepository, useValue: usersRepository },
        { provide: getRepositoryToken(RoleEntity), useValue: roleRepo },
      ],
    }).compile();

    useCase = module.get(AssignRolesUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should throw NOT_FOUND when user does not exist', async () => {
    usersRepository.findByUuid.mockResolvedValue(null);

    await expect(useCase.execute('missing-uuid', { roleUuids: [] })).rejects.toMatchObject({
      status: HttpStatus.NOT_FOUND,
    });
  });

  it('should throw NOT_FOUND when a role does not exist', async () => {
    usersRepository.findByUuid.mockResolvedValue(mockUser());
    roleRepo.findOne.mockResolvedValue(null);

    await expect(useCase.execute('user-uuid', { roleUuids: ['role-uuid'] })).rejects.toMatchObject({
      status: HttpStatus.NOT_FOUND,
    });
  });

  it('should replace the user roles with the resolved role ids', async () => {
    usersRepository.findByUuid.mockResolvedValueOnce(mockUser()).mockResolvedValueOnce(mockUser());
    roleRepo.findOne.mockResolvedValue(mockRole('role-uuid', 7));

    await useCase.execute('user-uuid', { roleUuids: ['role-uuid'] });

    expect(usersRepository.setRoles).toHaveBeenCalledWith(1, [7]);
  });
});
