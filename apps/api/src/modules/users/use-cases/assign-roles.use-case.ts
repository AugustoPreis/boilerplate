import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { RequestContextService } from '@shared/context/request-context.service';
import { AppException } from '@shared/exceptions';

import { EAuditAction } from '@modules/audit/enums/audit-action.enum';
import { RecordAuditLogUseCase } from '@modules/audit/use-cases/record-audit-log.use-case';
import { RoleEntity } from '@modules/roles/entities/role.entity';

import { AssignRolesDTO } from '../dtos/assign-roles.dto';
import { UserResponseDTO } from '../dtos/user-response.dto';
import { UsersRepository } from '../repositories/users.repository';

@Injectable()
export class AssignRolesUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    @InjectRepository(RoleEntity)
    private readonly roleRepo: Repository<RoleEntity>,
    private readonly recordAuditLogUseCase: RecordAuditLogUseCase,
    private readonly requestContextService: RequestContextService,
  ) {}

  async execute(uuid: string, dto: AssignRolesDTO): Promise<UserResponseDTO> {
    const user = await this.usersRepository.findByUuid(uuid);

    if (!user) {
      throw AppException.from('users.errors.notFound', HttpStatus.NOT_FOUND);
    }

    const roles = await Promise.all(
      dto.roleUuids.map(async (roleUuid) => {
        const role = await this.roleRepo.findOne({ where: { uuid: roleUuid } });

        if (!role) {
          throw AppException.from('roles.errors.notFound', HttpStatus.NOT_FOUND, {
            args: { uuid: roleUuid },
          });
        }

        return role;
      }),
    );

    const previousRoleIds = user.userRoles.map((userRole) => userRole.roleId);

    await this.usersRepository.setRoles(
      user.id,
      roles.map((r) => r.id),
    );

    // `setRoles` writes directly to `user_roles` via its own repository,
    // never through `UserEntity.repo.save()`, so the TypeORM subscriber
    // driving the audit trail never observes it. Record the change
    // explicitly instead of relying on it.
    await this.recordAuditLogUseCase.execute({
      entityName: 'user',
      entityUuid: user.uuid,
      actorUuid: this.requestContextService.getActorUuid(),
      action: EAuditAction.UPDATED,
      before: { userRoles: previousRoleIds },
      after: { userRoles: roles.map((r) => r.id) },
    });

    const updated = await this.usersRepository.findByUuid(uuid);

    return UserResponseDTO.from(updated!);
  }
}
