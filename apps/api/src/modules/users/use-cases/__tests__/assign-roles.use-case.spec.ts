import { HttpStatus } from '@nestjs/common';
import { mockDeep } from 'jest-mock-extended';

import { RequestContextService } from '@shared/context/request-context.service';

import { RecordAuditLogUseCase } from '@modules/audit/use-cases/record-audit-log.use-case';
import { RoleEntity } from '@modules/roles/entities/role.entity';

import { createMockRepository } from '../../../../../test/support/mock-repository';
import { AssignRolesDTO } from '../../dtos/assign-roles.dto';
import { UserEntity } from '../../entities/user.entity';
import { UsersRepository } from '../../repositories/users.repository';
import { AssignRolesUseCase } from '../assign-roles.use-case';

describe('AssignRolesUseCase', () => {
  const usersRepository = mockDeep<UsersRepository>();
  const roleRepo = createMockRepository<RoleEntity>();
  const recordAuditLogUseCase = mockDeep<RecordAuditLogUseCase>();
  const requestContextService = mockDeep<RequestContextService>();

  const useCase = new AssignRolesUseCase(
    usersRepository,
    roleRepo,
    recordAuditLogUseCase,
    requestContextService,
  );

  const user = { id: 1, uuid: 'user-uuid', userRoles: [] } as unknown as UserEntity;
  const role = { id: 10, uuid: 'role-uuid' } as RoleEntity;

  beforeEach(() => {
    jest.clearAllMocks();
    requestContextService.getActorUuid.mockReturnValue('actor-uuid');
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

  it('records the role change explicitly, since the subscriber never observes it', async () => {
    const existingRole = { id: 5, uuid: 'existing-role-uuid' } as RoleEntity;
    const userWithRole = {
      ...user,
      userRoles: [{ roleId: existingRole.id }],
    } as unknown as UserEntity;
    const updated = { ...user, userRoles: [{ role }] } as unknown as UserEntity;

    usersRepository.findByUuid.mockResolvedValueOnce(userWithRole).mockResolvedValueOnce(updated);
    roleRepo.findOne.mockResolvedValue(role);

    await useCase.execute(user.uuid, { roleUuids: [role.uuid] });

    expect(recordAuditLogUseCase.execute).toHaveBeenCalledWith({
      entityName: 'user',
      entityUuid: user.uuid,
      actorUuid: 'actor-uuid',
      action: 'UPDATED',
      before: { userRoles: [existingRole.id] },
      after: { userRoles: [role.id] },
    });
  });
});
