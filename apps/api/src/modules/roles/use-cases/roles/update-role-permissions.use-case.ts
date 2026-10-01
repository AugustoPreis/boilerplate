import { HttpStatus, Injectable } from '@nestjs/common';

import { RequestContextService } from '@shared/context/request-context.service';
import { AppException } from '@shared/exceptions';

import { EAuditAction } from '@modules/audit/enums/audit-action.enum';
import { RecordAuditLogUseCase } from '@modules/audit/use-cases/record-audit-log.use-case';

import { RoleResponseDTO } from '../../dtos/role-response.dto';
import { UpdateRolePermissionsDTO } from '../../dtos/update-role-permissions.dto';
import { PermissionsRepository } from '../../repositories/permissions.repository';
import { RolesRepository } from '../../repositories/roles.repository';

@Injectable()
export class UpdateRolePermissionsUseCase {
  constructor(
    private readonly rolesRepository: RolesRepository,
    private readonly permissionsRepository: PermissionsRepository,
    private readonly recordAuditLogUseCase: RecordAuditLogUseCase,
    private readonly requestContextService: RequestContextService,
  ) {}

  async execute(roleUuid: string, dto: UpdateRolePermissionsDTO): Promise<RoleResponseDTO> {
    const role = await this.rolesRepository.findByUuid(roleUuid);

    if (!role) {
      throw AppException.from('roles.errors.notFound', HttpStatus.NOT_FOUND);
    }

    const permissions = await this.permissionsRepository.findByResourceActionPairs(dto.permissions);

    if (permissions.length !== dto.permissions.length) {
      const found = new Set(permissions.map((p) => `${p.resource}:${p.action}`));
      const missing = dto.permissions
        .filter((pair) => !found.has(`${pair.resource}:${pair.action}`))
        .map((pair) => `${pair.resource}:${pair.action}`);

      throw AppException.from('roles.errors.permissionNotFound', HttpStatus.NOT_FOUND, {
        args: { pairs: missing.join(', ') },
      });
    }

    const previousPermissionIds = role.permissions.map((permission) => permission.id);

    await this.rolesRepository.setPermissions(
      role.id,
      permissions.map((p) => p.id),
    );

    // `setPermissions` only writes to the `role_permissions` join table, so
    // the TypeORM subscriber driving the audit trail never observes it (it
    // only fires on `RoleEntity.repo.save()` calls that also change a scalar
    // column). Record the change explicitly instead of relying on it.
    await this.recordAuditLogUseCase.execute({
      entityName: 'role',
      entityUuid: role.uuid,
      actorUuid: this.requestContextService.getActorUuid(),
      action: EAuditAction.UPDATED,
      before: { permissions: previousPermissionIds },
      after: { permissions: permissions.map((p) => p.id) },
    });

    const updated = await this.rolesRepository.findByUuid(roleUuid);

    return RoleResponseDTO.from(updated!);
  }
}
