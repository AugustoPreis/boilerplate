import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { IPaginatedResult } from '@shared/interfaces';
import { buildPaginatedResult, buildSkip } from '@shared/utils/pagination.util';

import { PermissionEntity } from '../entities/permission.entity';
import { RoleEntity } from '../entities/role.entity';

@Injectable()
export class RolesRepository {
  constructor(
    @InjectRepository(RoleEntity)
    private readonly repo: Repository<RoleEntity>,
    @InjectRepository(PermissionEntity)
    private readonly permRepo: Repository<PermissionEntity>,
  ) {}

  findById(id: number): Promise<RoleEntity | null> {
    return this.repo.findOne({ where: { id } });
  }

  findByUuid(uuid: string): Promise<RoleEntity | null> {
    return this.repo.findOne({ where: { uuid } });
  }

  findByName(name: string): Promise<RoleEntity | null> {
    return this.repo.findOne({ where: { name } });
  }

  async findAll(page: number, perPage: number): Promise<IPaginatedResult<RoleEntity>> {
    const [data, total] = await this.repo.findAndCount({
      skip: buildSkip(page, perPage),
      take: perPage,
      order: { name: 'ASC' },
    });

    return buildPaginatedResult(data, total, page, perPage);
  }

  create(data: Partial<RoleEntity>): Promise<RoleEntity> {
    const entity = this.repo.create({ ...data, permissions: [] });

    return this.repo.save(entity);
  }

  async update(id: number, data: Partial<RoleEntity>): Promise<RoleEntity> {
    await this.repo.update(id, data);

    return this.repo.findOneOrFail({ where: { id } });
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }

  async setPermissions(roleId: number, permissionIds: number[]): Promise<void> {
    const role = await this.repo.findOneOrFail({ where: { id: roleId } });

    role.permissions = permissionIds.length
      ? await this.permRepo.findBy({ id: In(permissionIds) })
      : [];

    await this.repo.save(role);
  }
}
