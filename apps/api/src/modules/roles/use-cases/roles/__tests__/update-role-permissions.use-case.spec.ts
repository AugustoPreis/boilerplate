import { HttpStatus } from '@nestjs/common';
import { mockDeep } from 'jest-mock-extended';

import { RequestContextService } from '@shared/context/request-context.service';

import { RecordAuditLogUseCase } from '@modules/audit/use-cases/record-audit-log.use-case';

import { PermissionEntity } from '../../../entities/permission.entity';
import { RoleEntity } from '../../../entities/role.entity';
import { PermissionsRepository } from '../../../repositories/permissions.repository';
import { RolesRepository } from '../../../repositories/roles.repository';
import { UpdateRolePermissionsUseCase } from '../update-role-permissions.use-case';

describe('UpdateRolePermissionsUseCase', () => {
  const rolesRepository = mockDeep<RolesRepository>();
  const permissionsRepository = mockDeep<PermissionsRepository>();
  const recordAuditLogUseCase = mockDeep<RecordAuditLogUseCase>();
  const requestContextService = mockDeep<RequestContextService>();

  const useCase = new UpdateRolePermissionsUseCase(
    rolesRepository,
    permissionsRepository,
    recordAuditLogUseCase,
    requestContextService,
  );

  const role = { id: 1, uuid: 'role-uuid', permissions: [] } as unknown as RoleEntity;

  beforeEach(() => {
    jest.clearAllMocks();
    rolesRepository.findByUuid.mockResolvedValue(role);
    requestContextService.getActorUuid.mockReturnValue('actor-uuid');
  });

  it('throws when the role does not exist', async () => {
    rolesRepository.findByUuid.mockResolvedValue(null);

    await expect(useCase.execute('missing-uuid', { permissions: [] })).rejects.toMatchObject({
      i18nKey: 'roles.errors.notFound',
      status: HttpStatus.NOT_FOUND,
    });
  });

  it('throws when some requested permission pairs cannot be found', async () => {
    const found = [{ id: 1, resource: 'users', action: 'read' } as PermissionEntity];

    permissionsRepository.findByResourceActionPairs.mockResolvedValue(found);

    await expect(
      useCase.execute(role.uuid, {
        permissions: [
          { resource: 'users', action: 'read' },
          { resource: 'users', action: 'delete' },
        ],
      }),
    ).rejects.toMatchObject({
      i18nKey: 'roles.errors.permissionNotFound',
      status: HttpStatus.NOT_FOUND,
      args: { pairs: 'users:delete' },
    });
    expect(rolesRepository.setPermissions).not.toHaveBeenCalled();
  });

  it('sets the resolved permissions and returns the updated role', async () => {
    const permissions = [{ id: 1, resource: 'users', action: 'read' } as PermissionEntity];
    const updated = { ...role, permissions };

    permissionsRepository.findByResourceActionPairs.mockResolvedValue(permissions);
    rolesRepository.findByUuid.mockResolvedValueOnce(role).mockResolvedValueOnce(updated);

    const result = await useCase.execute(role.uuid, {
      permissions: [{ resource: 'users', action: 'read' }],
    });

    expect(rolesRepository.setPermissions).toHaveBeenCalledWith(role.id, [permissions[0].id]);
    expect(result.permissions).toHaveLength(1);
  });

  it('records the permission change explicitly, since the subscriber never observes it', async () => {
    const existingPermission = { id: 2, resource: 'roles', action: 'read' } as PermissionEntity;
    const roleWithPermission = { ...role, permissions: [existingPermission] };
    const newPermissions = [{ id: 1, resource: 'users', action: 'read' } as PermissionEntity];

    rolesRepository.findByUuid.mockResolvedValueOnce(roleWithPermission).mockResolvedValueOnce({
      ...role,
      permissions: newPermissions,
    });
    permissionsRepository.findByResourceActionPairs.mockResolvedValue(newPermissions);

    await useCase.execute(role.uuid, { permissions: [{ resource: 'users', action: 'read' }] });

    expect(recordAuditLogUseCase.execute).toHaveBeenCalledWith({
      entityName: 'role',
      entityUuid: role.uuid,
      actorUuid: 'actor-uuid',
      action: 'UPDATED',
      before: { permissions: [existingPermission.id] },
      after: { permissions: [newPermissions[0].id] },
    });
  });
});
