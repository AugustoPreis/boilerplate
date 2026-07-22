import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { IPaginatedResult } from '@shared/interfaces';
import { assignDefined } from '@shared/utils/object.util';
import { buildPaginatedResult, buildSkip } from '@shared/utils/pagination.util';

import { PermissionEntity } from '../entities/permission.entity';

@Injectable()
export class PermissionsRepository {
  constructor(
    @InjectRepository(PermissionEntity)
    private readonly repo: Repository<PermissionEntity>,
  ) {}

  findById(id: number): Promise<PermissionEntity | null> {
    return this.repo.findOne({ where: { id } });
  }

  findByUuid(uuid: string): Promise<PermissionEntity | null> {
    return this.repo.findOne({ where: { uuid } });
  }

  findByKey(key: string): Promise<PermissionEntity | null> {
    return this.repo.findOne({ where: { key } });
  }

  findByKeys(keys: string[]): Promise<PermissionEntity[]> {
    if (!keys.length) return Promise.resolve([]);

    return this.repo.findBy({ key: In(keys) });
  }

  /**
   * Used by `PermissionsRelationResolver` to resolve the audit engine's
   * normalized `permissions` array (numeric `id`s) into full entities.
   */
  findByIds(ids: number[]): Promise<PermissionEntity[]> {
    if (!ids.length) return Promise.resolve([]);

    return this.repo.findBy({ id: In(ids) });
  }

  async findAll(page: number, perPage: number): Promise<IPaginatedResult<PermissionEntity>> {
    const [data, total] = await this.repo.findAndCount({
      skip: buildSkip(page, perPage),
      take: perPage,
      order: { key: 'ASC' },
    });

    return buildPaginatedResult(data, total, page, perPage);
  }

  create(data: Partial<PermissionEntity>): Promise<PermissionEntity> {
    const entity = this.repo.create(data);

    return this.repo.save(entity);
  }

  async update(id: number, data: Partial<PermissionEntity>): Promise<PermissionEntity> {
    const entity = await this.repo.findOneOrFail({ where: { id } });

    assignDefined(entity, data);

    // `save()` (not `update()`) so the TypeORM subscriber driving the audit
    // trail gets a populated `event.databaseEntity` — `repo.update()` never
    // loads a "before" state.
    return this.repo.save(entity);
  }

  async delete(id: number): Promise<void> {
    const entity = await this.repo.findOneBy({ id });

    if (!entity) {
      return;
    }

    // `remove()` (not `delete()`) for the same subscriber reason as
    // `update()` above.
    await this.repo.remove(entity);
  }
}
