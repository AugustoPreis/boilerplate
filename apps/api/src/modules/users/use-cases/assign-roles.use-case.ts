import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AppException } from '@shared/exceptions';

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
  ) {}

  async execute(uuid: string, dto: AssignRolesDTO): Promise<UserResponseDTO> {
    const user = await this.usersRepository.findByUuid(uuid);

    if (!user) {
      throw AppException.from('users.notFound', HttpStatus.NOT_FOUND);
    }

    const roles = await Promise.all(
      dto.roleUuids.map(async (roleUuid) => {
        const role = await this.roleRepo.findOne({ where: { uuid: roleUuid } });

        if (!role) {
          throw AppException.from('roles.notFound', HttpStatus.NOT_FOUND, {
            args: { uuid: roleUuid },
          });
        }

        return role;
      }),
    );

    await this.usersRepository.setRoles(
      user.id,
      roles.map((r) => r.id),
    );

    const updated = await this.usersRepository.findByUuid(uuid);

    return UserResponseDTO.from(updated!);
  }
}
